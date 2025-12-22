/**
 * 游戏分析埋点模块
 * 用于收集游戏使用数据
 */

const GameAnalytics = (function () {
    // API 基址
    const API_BASE = 'https://gomoku-community-api.suyao1992.workers.dev';

    // 状态
    let visitorId = null;
    let sessionId = null;
    let currentGameId = null;
    let gameStartTime = null;
    let initialized = false;

    /**
     * 初始化
     */
    function init() {
        if (initialized) return;
        initialized = true;

        // 获取或生成访客ID
        visitorId = localStorage.getItem('ga_visitor_id');
        if (!visitorId) {
            visitorId = 'v_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('ga_visitor_id', visitorId);
        }

        // 生成会话ID (每次打开页面新的)
        sessionId = 's_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

        // 自动记录访问
        trackVisit();

        console.log('[Analytics] Initialized');
    }

    /**
     * 获取设备信息
     */
    function getDeviceInfo() {
        const ua = navigator.userAgent;

        // 设备类型
        let deviceType = 'desktop';
        if (/Mobile|Android|iPhone|iPad/i.test(ua)) {
            deviceType = /iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile';
        }

        // 浏览器
        let browser = 'unknown';
        if (/Chrome/i.test(ua) && !/Edge|Edg/i.test(ua)) browser = 'Chrome';
        else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
        else if (/Firefox/i.test(ua)) browser = 'Firefox';
        else if (/Edge|Edg/i.test(ua)) browser = 'Edge';
        else if (/MSIE|Trident/i.test(ua)) browser = 'IE';

        // 操作系统
        let os = 'unknown';
        if (/Windows/i.test(ua)) os = 'Windows';
        else if (/Mac OS X/i.test(ua)) os = 'macOS';
        else if (/Android/i.test(ua)) os = 'Android';
        else if (/iPhone|iPad/i.test(ua)) os = 'iOS';
        else if (/Linux/i.test(ua)) os = 'Linux';

        return {
            deviceType,
            browser,
            os,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height
        };
    }

    /**
     * 发送数据 (使用 sendBeacon 不阻塞页面)
     */
    function send(endpoint, data) {
        const payload = JSON.stringify({
            visitorId,
            sessionId,
            ...data
        });

        try {
            if (navigator.sendBeacon) {
                navigator.sendBeacon(`${API_BASE}${endpoint}`, new Blob([payload], { type: 'application/json' }));
            } else {
                // 降级方案
                fetch(`${API_BASE}${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                    keepalive: true
                }).catch(() => { });
            }
        } catch (e) {
            console.warn('[Analytics] Send failed:', e);
        }
    }

    /**
     * 记录页面访问
     */
    function trackVisit(page = 'home') {
        const deviceInfo = getDeviceInfo();
        send('/api/analytics/visit', {
            page,
            referrer: document.referrer || null,
            ...deviceInfo
        });
    }

    /**
     * 记录游戏开始
     * @param {string} mode - 游戏模式: pve, pvp, online, quick_match
     * @param {string} subMode - 子模式: easy, medium, hard, expert 等
     */
    function trackGameStart(mode, subMode = null) {
        gameStartTime = Date.now();

        fetch(`${API_BASE}/api/analytics/game/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                visitorId,
                sessionId,
                mode,
                subMode
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    currentGameId = data.data.gameId;
                    console.log('[Analytics] Game started:', currentGameId);
                }
            })
            .catch(() => { });

        return mode; // 返回 mode 以便链式调用
    }

    /**
     * 记录游戏结束
     * @param {string} result - 结果: win, lose, draw, abandoned
     * @param {string} winner - 胜者: black, white, none
     * @param {number} movesCount - 步数
     */
    function trackGameEnd(result, winner = null, movesCount = 0) {
        if (!currentGameId) return;

        const duration = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0;

        send('/api/analytics/game/end', {
            gameId: currentGameId,
            result,
            winner,
            movesCount,
            duration
        });

        console.log('[Analytics] Game ended:', result, 'duration:', duration + 's');

        // 重置
        currentGameId = null;
        gameStartTime = null;
    }

    /**
     * 记录功能事件
     * @param {string} eventName - 事件名称
     * @param {object} eventData - 附加数据
     */
    function trackEvent(eventName, eventData = null) {
        send('/api/analytics/event', {
            eventType: 'feature',
            eventName,
            eventData
        });
    }

    /**
     * 记录点击事件
     */
    function trackClick(elementName) {
        send('/api/analytics/event', {
            eventType: 'click',
            eventName: elementName
        });
    }

    /**
     * 记录错误
     */
    function trackError(errorMessage, errorStack = null) {
        send('/api/analytics/event', {
            eventType: 'error',
            eventName: 'js_error',
            eventData: { message: errorMessage, stack: errorStack }
        });
    }

    // ==================== 公开 API ====================

    return {
        init,
        trackVisit,
        trackGameStart,
        trackGameEnd,
        trackEvent,
        trackClick,
        trackError,
        // 便捷方法
        getVisitorId: () => visitorId,
        getSessionId: () => sessionId,
        getCurrentGameId: () => currentGameId
    };
})();

// 导出到全局
window.GameAnalytics = GameAnalytics;

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    GameAnalytics.init();
});

// 捕获全局错误
window.addEventListener('error', (e) => {
    GameAnalytics.trackError(e.message, e.error?.stack);
});
