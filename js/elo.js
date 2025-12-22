// elo.js - ELO 积分系统逻辑
// ==========================================

const EloSystem = {
    K_FACTOR: 32,
    INITIAL_RATING: 1000,

    // 计算预期胜率
    getExpectedScore(ratingA, ratingB) {
        return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    },

    // 计算新积分
    calculateNewRating(currentRating, actualScore, expectedScore, totalMatches = 0) {
        // 针对前 10 场评估赛，使用更激进的 K 值
        let k = this.K_FACTOR;
        if (totalMatches < 10) {
            k = 64; // 加倍波动，快速定级
        }

        const change = Math.round(k * (actualScore - expectedScore));
        const newRating = currentRating + change;

        return {
            newRating: Math.max(100, newRating), // 最低 100 分
            change
        };
    },

    // 获取等级名称 (Localized)
    getRank(rating) {
        if (rating < 1200) return { id: 'bronze', name: Localization.get('rank.title.bronze'), icon: '🥉', color: '#cd7f32' };
        if (rating < 1500) return { id: 'silver', name: Localization.get('rank.title.silver'), icon: '🥈', color: '#c0c0c0' };
        if (rating < 1800) return { id: 'gold', name: Localization.get('rank.title.gold'), icon: '🥇', color: '#ffd700' };
        if (rating < 2100) return { id: 'platinum', name: Localization.get('rank.title.platinum'), icon: '💎', color: '#e5e4e2' };
        return { id: 'master', name: Localization.get('rank.title.king'), icon: '👑', color: '#ff4500' };
    },

    // 获取下一级进度
    getNextRank(rating) {
        const rank = this.getRank(rating);
        if (rating < 1200) return { currentRank: rank.name, progress: rating, total: 1200, nextRankName: Localization.get('rank.title.silver') };
        if (rating < 1500) return { currentRank: rank.name, progress: rating, total: 1500, nextRankName: Localization.get('rank.title.gold') };
        if (rating < 1800) return { currentRank: rank.name, progress: rating, total: 1800, nextRankName: Localization.get('rank.title.platinum') };
        if (rating < 2100) return { currentRank: rank.name, progress: rating, total: 2100, nextRankName: Localization.get('rank.title.king') };

        // 王者以上
        return { currentRank: rank.name, progress: rating, total: rating + 100, nextRankName: Localization.get('rank.title.unknown') };
    }
};

window.EloSystem = EloSystem;
