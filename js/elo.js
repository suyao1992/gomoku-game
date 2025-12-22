/**
 * Elo Rating System Implementation
 * 基于标准的 Elo 评级算法，用于计算联机对战的积分变动。
 */

const EloSystem = {
    // 初始分
    INITIAL_RATING: 1000,

    // K值配置：决定分数变动的幅度
    // 新手保护期（前10场）波动较大，之后趋于稳定
    K_FACTOR: {
        PROvisional: 32, // < 10 games
        ESTABLISHED: 24  // >= 10 games
    },

    /**
     * 计算预期胜率
     * @param {number} ratingA 玩家A的积分
     * @param {number} ratingB 玩家B的积分
     * @returns {number} 玩家A的预期胜率 (0-1)
     */
    getExpectedScore(ratingA, ratingB) {
        return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    },

    /**
     * 计算新积分
     * @param {number} currentRating 当前积分
     * @param {number} actualScore 实际得分 (胜=1, 平=0.5, 负=0)
     * @param {number} expectedScore 预期胜率
     * @param {number} gamesPlayed 已进行的场次数 (用于确定K值)
     * @returns {object} { newRating, change }
     */
    calculateNewRating(currentRating, actualScore, expectedScore, gamesPlayed) {
        let k = this.K_FACTOR.ESTABLISHED;

        if (gamesPlayed < 10) {
            k = this.K_FACTOR.PROvisional;
        }

        const change = Math.round(k * (actualScore - expectedScore));
        const newRating = currentRating + change;

        return {
            newRating: Math.max(0, newRating), // 积分不能为负
            change: change
        };
    },

    /**
     * 获取段位信息
     * @param {number} rating 积分
     * @returns {object} 段位名称和图标
     */
    getRank(rating) {
        if (rating < 1200) return { id: 'bronze', name: '青铜', icon: '🥉', color: '#cd7f32' };
        if (rating < 1500) return { id: 'silver', name: '白银', icon: '🥈', color: '#c0c0c0' };
        if (rating < 1800) return { id: 'gold', name: '黄金', icon: '🥇', color: '#ffd700' };
        if (rating < 2100) return { id: 'platinum', name: '铂金', icon: '💎', color: '#e5e4e2' };
        return { id: 'master', name: '王者', icon: '👑', color: '#ff4500' };
    },
    /**
     * 获取段位进度信息 (适配 UI 显示)
     * @param {number} rating 当前积分
     * @returns {object} { currentRank, progress, total, nextRankName }
     */
    getNextRank(rating) {
        const rank = this.getRank(rating);

        if (rating < 1200) return { currentRank: rank.name, progress: rating, total: 1200, nextRankName: '白银' };
        if (rating < 1500) return { currentRank: rank.name, progress: rating, total: 1500, nextRankName: '黄金' };
        if (rating < 1800) return { currentRank: rank.name, progress: rating, total: 1800, nextRankName: '铂金' };
        if (rating < 2100) return { currentRank: rank.name, progress: rating, total: 2100, nextRankName: '王者' };

        // 王者以上 (无尽模式)
        return { currentRank: rank.name, progress: rating, total: rating + 100, nextRankName: '传奇' };
    }
};

// 导出
window.EloSystem = EloSystem;
