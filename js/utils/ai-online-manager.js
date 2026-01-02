/**
 * AI在线状态管理器
 * 从Cloudflare Workers获取AI在线数量并缓存
 */
window.AIOnlineManager = {
    aiOnlineCount: 0,
    lastFetchTime: 0,
    CACHE_DURATION: 60000, // 缓存60秒
    WORKER_URL: 'https://gomoku-ai-matcher.suyao1992.workers.dev/admin/status',

    /**
     * 获取AI在线数量(带缓存)
     */
    async getAIOnlineCount() {
        const now = Date.now();

        // 如果缓存有效,直接返回
        if (now - this.lastFetchTime < this.CACHE_DURATION) {
            return this.aiOnlineCount;
        }

        try {
            const response = await fetch(this.WORKER_URL, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                console.warn('[AIOnlineManager] Failed to fetch AI status:', response.status);
                return this.aiOnlineCount; // 返回缓存值
            }

            const data = await response.json();
            this.aiOnlineCount = data.onlineAIs || 0;
            this.lastFetchTime = now;

            console.log('[AIOnlineManager] Updated AI count:', this.aiOnlineCount);
            return this.aiOnlineCount;

        } catch (error) {
            console.warn('[AIOnlineManager] Error fetching AI count:', error);
            return this.aiOnlineCount; // 返回缓存值
        }
    },

    /**
     * 重置缓存(强制下次重新获取)
     */
    resetCache() {
        this.lastFetchTime = 0;
    }
};

console.log('[AIOnlineManager] Module loaded');
