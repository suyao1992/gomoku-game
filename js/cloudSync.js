// ========== 云端存档同步模块 ==========
// 使用与排行榜相同的 Firebase 配置

const CloudSync = {
    DEBUG: false,  // 生产环境设为 false
    SYNC_DEBOUNCE_MS: 3000,  // 防抖延迟
    syncTimeout: null,
    lastSyncTime: 0,

    // 调试日志
    log(...args) {
        if (this.DEBUG) console.log('[CloudSync]', ...args);
    },

    // 获取 Firebase 数据库引用
    getDb() {
        if (window.Leaderboard && window.Leaderboard.db) {
            return window.Leaderboard.db;
        }
        return null;
    },

    // 获取玩家ID
    getPlayerId() {
        return window.Leaderboard?.getPlayerId() || null;
    },

    // 上传玩家完整数据到云端
    async uploadPlayerData() {
        const db = this.getDb();
        const playerId = this.getPlayerId();

        if (!db || !playerId) {
            console.warn('[CloudSync] Firebase not ready');
            return false;
        }

        try {
            const playerStats = window.PlayerStats?.data;
            const storyProgress = window.getStoryProgress?.() || { lastMission: 1 };
            const playerName = window.Onboarding?.getPlayerName() || '玩家';

            const cloudData = {
                name: playerName,
                stats: playerStats?.stats || {},
                storyProgress: storyProgress.lastMission || 1,
                totalGames: playerStats?.totalGames || 0,
                lastPlayed: playerStats?.lastPlayed || null,
                lastSync: Date.now()
            };

            await db.ref('playerData/' + playerId).set(cloudData);
            this.lastSyncTime = Date.now();
            this.log('Data uploaded:', cloudData);
            return true;
        } catch (e) {
            console.error('[CloudSync] Upload failed:', e);
            return false;
        }
    },

    // 从云端下载并恢复玩家数据
    async downloadPlayerData() {
        const db = this.getDb();
        const playerId = this.getPlayerId();

        if (!db || !playerId) {
            console.warn('[CloudSync] Firebase not ready');
            return null;
        }

        try {
            const snapshot = await db.ref('playerData/' + playerId).once('value');
            const cloudData = snapshot.val();

            if (cloudData) {
                this.log('Data downloaded:', cloudData);
                return cloudData;
            }
            return null;
        } catch (e) {
            console.error('[CloudSync] Download failed:', e);
            return null;
        }
    },

    // 尝试恢复云端数据到本地
    async restoreFromCloud() {
        const cloudData = await this.downloadPlayerData();
        if (!cloudData) {
            this.log('No cloud data found');
            return false;
        }

        // 检查云端数据是否比本地新或更完整
        const localStats = window.PlayerStats?.data;
        const localGames = localStats?.totalGames || 0;
        const cloudGames = cloudData.totalGames || 0;

        // 如果云端有更多游戏记录，则恢复
        if (cloudGames > localGames) {
            this.log(`Cloud has more data (${cloudGames} vs ${localGames}), restoring...`);

            // 恢复玩家名
            if (cloudData.name && window.Onboarding) {
                window.Onboarding.playerName = cloudData.name;
                localStorage.setItem(window.Onboarding.STORAGE_KEY, cloudData.name);
            }

            // 恢复战绩统计
            if (cloudData.stats && window.PlayerStats) {
                window.PlayerStats.data.stats = cloudData.stats;
                window.PlayerStats.data.totalGames = cloudData.totalGames;
                window.PlayerStats.data.lastPlayed = cloudData.lastPlayed;
                window.PlayerStats.data.playerName = cloudData.name;
                window.PlayerStats.save();
            }

            // 恢复故事进度
            if (cloudData.storyProgress && window.setStoryProgress) {
                window.setStoryProgress(cloudData.storyProgress);
            }

            this.log('Data restored from cloud!');
            return true;
        }

        this.log('Local data is newer or equal, no restore needed');
        return false;
    },

    // 防抖同步（游戏结束后调用）
    queueSync() {
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout);
        }
        this.syncTimeout = setTimeout(() => {
            this.uploadPlayerData();
        }, this.SYNC_DEBOUNCE_MS);
    },

    // 立即同步
    async syncNow() {
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout);
            this.syncTimeout = null;
        }
        return await this.uploadPlayerData();
    },

    // 初始化：尝试从云端恢复数据
    async init() {
        // 等待 Firebase 初始化
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (!this.getDb()) {
            console.warn('[CloudSync] Firebase not available, cloud sync disabled');
            return;
        }

        this.log('Initialized, checking cloud data...');

        // 尝试恢复云端数据
        const restored = await this.restoreFromCloud();
        if (restored) {
            // 刷新UI
            window.PlayerStats?.updateStatsUI?.();
        }
    }
};

// 页面加载后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，等待其他模块
    setTimeout(() => {
        CloudSync.init();
    }, 2000);
});

// 导出
window.CloudSync = CloudSync;
