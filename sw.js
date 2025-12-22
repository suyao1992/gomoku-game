// Service Worker for 五子棋遇！ PWA
// 🔥 每次发布时更新此时间戳，触发 SW 更新
const SW_VERSION = '2024-12-19-0313';
const CACHE_NAME = `gomoku-cache-${SW_VERSION}`;
const OFFLINE_URL = '/offline.html';

// 需要缓存的核心资源
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/css/base.css',
    '/css/animations.css',
    '/css/responsive.css',
    '/css/multiplayer-ui.css',
    '/favicon.svg',
    '/manifest.json'
];

// JavaScript文件
const JS_ASSETS = [
    '/js/game.js',
    '/js/board.js',
    '/js/ai.js',
    '/js/audio.js',
    '/js/ui.js',
    '/js/network.js',
    '/js/firebaseConfig.js',
    '/js/localization.js',
    '/js/playerStats.js',
    '/js/leaderboard.js',
    '/js/onboarding.js'
];

// 图片资源 (按需缓存)
const IMAGE_ASSETS = [
    '/assets/images/bg.webp',
    '/assets/images/char_idle.webp',
    '/assets/images/ico.webp'
];

// 音频资源 (按需缓存)
const AUDIO_ASSETS = [
    '/assets/audio/bgm.mp3',
    '/assets/audio/place.mp3',
    '/assets/audio/win.mp3'
];

// 安装事件 - 缓存核心资源
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching core assets');
                // 先缓存核心资源，失败不阻塞安装
                return cache.addAll(CORE_ASSETS).catch(err => {
                    console.warn('[SW] Some core assets failed to cache:', err);
                });
            })
            .then(() => {
                // 跳过等待，立即激活
                return self.skipWaiting();
            })
    );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // 立即接管所有页面
            return self.clients.claim();
        })
    );
});

// 监听来自客户端的消息（用于手动触发更新）
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] Received SKIP_WAITING, activating new SW');
        self.skipWaiting();
    }
});

// 请求拦截 - 网络优先，失败回退缓存
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // 只处理同源请求
    if (url.origin !== location.origin) {
        return;
    }

    // 跳过非GET请求
    if (request.method !== 'GET') {
        return;
    }

    // Firebase API请求不缓存
    if (url.hostname.includes('firebase') || url.hostname.includes('gstatic')) {
        return;
    }

    event.respondWith(
        // 网络优先策略
        fetch(request)
            .then((response) => {
                // 请求成功，更新缓存
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // 网络失败，尝试从缓存获取
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    // 如果是导航请求且没有缓存，返回离线页面
                    if (request.mode === 'navigate') {
                        return caches.match(OFFLINE_URL);
                    }

                    // 返回一个空响应
                    return new Response('', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
    );
});

// 后台同步 (未来可用于离线操作同步)
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
});

// 推送通知 (未来可扩展)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || '有新消息',
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            vibrate: [100, 50, 100],
            data: {
                url: data.url || '/'
            }
        };

        event.waitUntil(
            self.registration.showNotification(data.title || '五子棋遇！', options)
        );
    }
});

// 点击通知
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});

console.log('[SW] Service Worker loaded');
