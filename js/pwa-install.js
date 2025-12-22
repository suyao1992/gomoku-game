/**
 * PWA Install Prompt Logic
 * Handles native install prompt for Android/PC and manual guide for iOS
 */

const PWAInstall = {
    deferredPrompt: null,
    hasShownPrompt: false,

    init() {
        // Prevent default install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            console.log('[PWA] beforeinstallprompt fired');

            // Check if we should show the prompt (e.g. not standalone, first visit)
            if (!this.isStandalone() && !this.hasSeenPrompt()) {
                this.showInstallPrompt();
            }
        });

        // Detect iOS for manual guide
        if (this.isIOS() && !this.isStandalone() && !this.hasSeenPrompt()) {
            // Wait a bit before showing to not be annoying
            setTimeout(() => {
                this.showIOSGuide();
            }, 3000);
        }

        // Bind clicks
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.addEventListener('click', () => this.handleInstallClick());
        }

        const dismissBtn = document.getElementById('pwa-dismiss-btn');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => this.dismissPrompt());
        }

        const iosDismissBtn = document.getElementById('pwa-ios-dismiss-btn');
        if (iosDismissBtn) {
            iosDismissBtn.addEventListener('click', () => this.dismissPrompt());
        }
    },

    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    },

    isStandalone() {
        return (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone === true);
    },

    hasSeenPrompt() {
        // Don't show if user dismissed it recently (e.g. within 7 days)
        const lastDismiss = localStorage.getItem('pwa_prompt_dismissed');
        if (lastDismiss) {
            const daysSince = (Date.now() - parseInt(lastDismiss)) / (1000 * 60 * 60 * 24);
            return daysSince < 7;
        }
        return false;
    },

    showInstallPrompt() {
        if (this.hasShownPrompt) return;

        const modal = document.getElementById('pwa-install-modal');
        const actionArea = document.getElementById('pwa-install-action');
        const iosGuide = document.getElementById('pwa-ios-guide');

        if (modal && actionArea) {
            modal.classList.remove('hidden');
            actionArea.classList.remove('hidden');
            if (iosGuide) iosGuide.classList.add('hidden');

            // Add animation class
            const content = modal.querySelector('.modal-content');
            if (content) content.classList.add('slide-up');

            this.hasShownPrompt = true;
        }
    },

    showIOSGuide() {
        if (this.hasShownPrompt) return;

        const modal = document.getElementById('pwa-install-modal');
        const actionArea = document.getElementById('pwa-install-action');
        const iosGuide = document.getElementById('pwa-ios-guide');

        if (modal && iosGuide) {
            modal.classList.remove('hidden');
            if (actionArea) actionArea.classList.add('hidden');
            iosGuide.classList.remove('hidden');

            // Add animation class
            const content = modal.querySelector('.modal-content');
            if (content) content.classList.add('slide-up');

            this.hasShownPrompt = true;
        }
    },

    async handleInstallClick() {
        if (!this.deferredPrompt) return;

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`[PWA] User response: ${outcome}`);

        this.deferredPrompt = null;
        this.closeModal();

        if (outcome === 'accepted') {
            // User accepted, no need to track dismiss
        } else {
            this.dismissPrompt();
        }
    },

    dismissPrompt() {
        this.closeModal();
        localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    },

    closeModal() {
        const modal = document.getElementById('pwa-install-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    // 从设置界面触发安装
    triggerInstall() {
        // 已经是独立模式（已安装）
        if (this.isStandalone()) {
            this.showToast('✅ 已安装到桌面！');
            return;
        }

        // Android/PC - 有原生安装提示
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            this.deferredPrompt.userChoice.then(({ outcome }) => {
                console.log(`[PWA] User response: ${outcome}`);
                if (outcome === 'accepted') {
                    this.showToast('🎉 安装成功！');
                }
                this.deferredPrompt = null;
            });
            return;
        }

        // iOS - 显示手动安装引导
        if (this.isIOS()) {
            this.showIOSGuide();
            return;
        }

        // Other cases - may already be installed or browser doesn't support
        this.showToast(Localization.get('pwa.add_to_homescreen'));
    },

    // 显示简单提示
    showToast(message) {
        const toast = document.createElement('div');
        toast.innerHTML = `
            <div style="
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            ">${message}</div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    PWAInstall.init();
});

// ============ Service Worker 更新检测 ============
const SWUpdater = {
    init() {
        if (!('serviceWorker' in navigator)) return;

        // 注册 Service Worker
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('[SWUpdater] SW registered');

            // 检查更新（每次页面加载时）
            registration.update();

            // 监听新 SW 安装
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('[SWUpdater] New SW installing...');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // 新版本已安装，提示用户刷新
                        console.log('[SWUpdater] New version available!');
                        this.showUpdateNotification();
                    }
                });
            });
        }).catch(err => {
            console.error('[SWUpdater] SW registration failed:', err);
        });

        // 监听 SW 控制权变化（用户点击刷新后）
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) return;
            refreshing = true;
            window.location.reload();
        });
    },

    showUpdateNotification() {
        // 创建更新提示
        const toast = document.createElement('div');
        toast.id = 'sw-update-toast';
        toast.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 16px;
                font-size: 14px;
                animation: slideUp 0.3s ease;
            ">
                <span>🎉 发现新版本！</span>
                <button id="sw-update-btn" style="
                    background: white;
                    color: #667eea;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                ">立即更新</button>
            </div>
        `;
        document.body.appendChild(toast);

        // 点击更新按钮
        document.getElementById('sw-update-btn').addEventListener('click', () => {
            // 通知 SW 跳过等待
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            }
            // 直接刷新
            window.location.reload();
        });
    }
};

// 初始化更新检测
document.addEventListener('DOMContentLoaded', () => {
    SWUpdater.init();
});
