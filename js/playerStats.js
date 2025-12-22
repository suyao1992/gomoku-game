// ========== 玩家战绩统计模块 ==========

const PlayerStats = {
    STORAGE_KEY: 'gomoku_player_stats',

    // 段位配置
    RANKS: [
        { id: 'unranked', name: '尚未取得', icon: '🎯', minStory: 0 },
        { id: 'bronze', name: '铜阶棋士', icon: '🥉', minStory: 1 },
        { id: 'silver', name: '银阶棋士', icon: '🥈', minStory: 3 },
        { id: 'gold', name: '金阶棋士', icon: '🥇', minStory: 5 },
        { id: 'platinum', name: '铂金棋士', icon: '💎', minStory: 7 },
        { id: 'master', name: '大师棋士', icon: '👑', minStory: 10 }
    ],

    // 默认数据结构
    defaultData: {
        playerName: '玩家',
        // 基础统计
        stats: {
            pve: { wins: 0, losses: 0, draws: 0 },
            online: { wins: 0, losses: 0, draws: 0 },
            story: { wins: 0, losses: 0, draws: 0 },
            eve: { wins: 0, losses: 0, draws: 0 }
        },
        // 传奇之路 (Story Track)
        storyProgress: 0,

        // 竞技巅峰 (Competitive Track)
        competitive: {
            elo: 1000,
            highestElo: 1000,
            matches: 0,
            currentStreak: 0,
            maxStreak: 0,
            placementGamesLeft: 10 //定级赛剩余场次
        },
        matchHistory: [], // 最近10场对战记录

        totalGames: 0,
        lastPlayed: null,
        createdAt: null
    },

    data: null,

    // 初始化
    init() {
        this.load();
        // 同步玩家姓名
        const name = window.Onboarding?.getPlayerName();
        if (name && name !== this.data.playerName) {
            this.data.playerName = name;
            this.save();
        }
        console.log('[PlayerStats] Initialized:', this.data);
    },

    // 从 localStorage 加载
    load() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.data = { ...this.defaultData, ...parsed };

                // 数据迁移：确保 competitive 对象存在
                if (!this.data.competitive) {
                    this.data.competitive = { ...this.defaultData.competitive };
                }
                // 确保 stats 对象完整
                if (!this.data.stats.online) {
                    this.data.stats.online = { wins: 0, losses: 0, draws: 0 };
                }
            } else {
                this.data = { ...this.defaultData, createdAt: new Date().toISOString() };
            }
        } catch (e) {
            console.warn('[PlayerStats] Failed to load:', e);
            this.data = { ...this.defaultData, createdAt: new Date().toISOString() };
        }
    },

    // 保存到 localStorage
    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.warn('[PlayerStats] Failed to save:', e);
        }
    },

    // 记录游戏结果
    recordResult(mode, result) {
        // mode: 'pve', 'online', 'story', 'eve'
        // result: 'win', 'lose', 'draw'
        if (!this.data.stats[mode]) {
            this.data.stats[mode] = { wins: 0, losses: 0, draws: 0 };
        }

        switch (result) {
            case 'win':
                this.data.stats[mode].wins++;
                break;
            case 'lose':
                this.data.stats[mode].losses++;
                break;
            case 'draw':
                this.data.stats[mode].draws++;
                break;
        }

        this.data.totalGames++;
        this.data.lastPlayed = new Date().toISOString();
        this.save(); // save is called here, but updateElo will also save.

        // Sync to leaderboard
        if (window.Leaderboard) {
            window.Leaderboard.submitScore();
        }

        // 触发云端同步（防抖）
        if (window.CloudSync) {
            window.CloudSync.queueSync();
        }

        // 📊 游戏分析埋点
        if (window.GameAnalytics) {
            GameAnalytics.trackGameEnd(result, null, 0);
        }

        console.log(`[PlayerStats] Recorded ${result} in ${mode}. Total: ${this.data.totalGames}`);
    },

    // 更新 Elo 积分 (仅联机模式调用)
    updateElo(result, opponentElo = 1000) {
        if (!window.EloSystem) return;

        const myElo = this.data.competitive.elo;
        let actualScore = 0.5; // draw
        if (result === 'win') actualScore = 1;
        if (result === 'lose') actualScore = 0;

        const expectedScore = EloSystem.getExpectedScore(myElo, opponentElo);
        const { newRating, change } = EloSystem.calculateNewRating(
            myElo,
            actualScore,
            expectedScore,
            this.data.competitive.matches
        );

        // Update Streak
        if (result === 'win') {
            this.data.competitive.currentStreak = (this.data.competitive.currentStreak || 0) + 1;
            if (this.data.competitive.currentStreak > (this.data.competitive.maxStreak || 0)) {
                this.data.competitive.maxStreak = this.data.competitive.currentStreak;
            }
        } else {
            this.data.competitive.currentStreak = 0;
        }

        // 更新数据
        this.data.competitive.elo = newRating;
        if (newRating > this.data.competitive.highestElo) {
            this.data.competitive.highestElo = newRating;
        }
        this.data.competitive.matches++;
        if (this.data.competitive.placementGamesLeft > 0) {
            this.data.competitive.placementGamesLeft--;
        }

        // 记录历史
        this.data.matchHistory.unshift({
            date: new Date().toISOString(),
            opponentElo: opponentElo,
            result: result,
            eloChange: change,
            eloAfter: newRating
        });

        // 保留最近 50 场
        if (this.data.matchHistory.length > 50) {
            this.data.matchHistory.pop();
        }

        this.save();

        // Auto-upload to Leaderboard
        // Auto-upload to Leaderboard
        if (window.Leaderboard) {
            window.Leaderboard.submitScore();
        }

        return { newRating, change };
    },

    // 渲染折线图
    renderEloChart() {
        const canvas = document.getElementById('elo-chart-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.parentElement.offsetWidth;
        const height = canvas.height = canvas.parentElement.offsetHeight;

        // 清空画布
        ctx.clearRect(0, 0, width, height);

        // 准备数据 (最近20场，按时间正序)
        const history = [...this.data.matchHistory].reverse();
        if (history.length < 2) {
            // 数据不足显示提示
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('暂无足够数据', width / 2, height / 2);
            return;
        }

        // 提取 Elo 数据
        const dataPoints = history.map(h => h.eloAfter);
        // 添加当前 Elo 作为最后一个点 (如果 history 中没有最新的) 
        // 实际上 history 已经有了，不需要额外添加 unless we want real-time update visual

        const maxElo = Math.max(...dataPoints, this.data.competitive.elo) + 50;
        const minElo = Math.min(...dataPoints, this.data.competitive.elo) - 50;
        const range = maxElo - minElo;

        // 绘图参数
        const padding = { top: 20, right: 10, bottom: 20, left: 10 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // 坐标转换函数
        const getX = (index) => padding.left + (index / (dataPoints.length - 1)) * chartWidth;
        const getY = (elo) => height - padding.bottom - ((elo - minElo) / range) * chartHeight;

        // 1. 绘制渐变填充
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0.0)');

        ctx.beginPath();
        ctx.moveTo(getX(0), getY(dataPoints[0]));
        for (let i = 0; i < dataPoints.length; i++) {
            // 平滑曲线 (简单贝塞尔 or 直线? 贝塞尔好看点但复杂，这里用简单的直线先，看起来更准确)
            // 或者用 catmull-rom
            ctx.lineTo(getX(i), getY(dataPoints[i]));
        }
        ctx.lineTo(getX(dataPoints.length - 1), height - padding.bottom);
        ctx.lineTo(getX(0), height - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // 2. 绘制折线
        ctx.beginPath();
        ctx.moveTo(getX(0), getY(dataPoints[0]));
        for (let i = 1; i < dataPoints.length; i++) {
            // 简单平滑算法：取中点作为控制点 (Quadratic Curve)
            const x1 = getX(i - 1);
            const y1 = getY(dataPoints[i - 1]);
            const x2 = getX(i);
            const y2 = getY(dataPoints[i]);

            // 为了更平滑，这里仅仅画直线，因为点少可能会很尖锐。
            // 简单的直线对于 Elo 变化其实最清晰。
            ctx.lineTo(x2, y2);
        }
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // 3. 绘制数据点和数值
        ctx.textAlign = 'center';
        ctx.font = '10px Arial';

        dataPoints.forEach((elo, i) => {
            const x = getX(i);
            const y = getY(elo);

            // Draw point
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();

            // Draw text for: First, Last, Max, Min, or every 5th point
            // Note: maxElo and minElo here are the chart's max/min, not necessarily the data's exact max/min.
            // We need to find the actual max/min from dataPoints for accurate labeling.
            const actualMaxElo = Math.max(...dataPoints);
            const actualMinElo = Math.min(...dataPoints);

            const isMaxPoint = elo === actualMaxElo && dataPoints.indexOf(elo) === i; // Check for first occurrence if duplicates
            const isMinPoint = elo === actualMinElo && dataPoints.indexOf(elo) === i;
            const isFirst = i === 0;
            const isLast = i === dataPoints.length - 1;

            // 稀疏显示逻辑：如果是最后一点，或者极值点，或者是间隔点
            if (isLast || isFirst || isMaxPoint || isMinPoint || (dataPoints.length < 10) || (i % 5 === 0 && dataPoints.length > 10)) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                // Draw text above the point
                ctx.fillText(elo, x, y - 8);
            }
        });
    },

    // 更新故事进度
    updateStoryProgress(missionId) {
        if (missionId > this.data.storyProgress) {
            this.data.storyProgress = missionId;
            this.save();
        }
    },

    // 计算胜率
    getWinRate(mode) {
        const stats = this.data.stats[mode];
        if (!stats) return 0;
        const total = stats.wins + stats.losses + stats.draws;
        if (total === 0) return 0;
        return Math.round((stats.wins / total) * 100);
    },

    // 获取模式场次
    getModeGames(mode) {
        const stats = this.data.stats[mode];
        if (!stats) return 0;
        return stats.wins + stats.losses + stats.draws;
    },

    // 获取总胜率
    getTotalWinRate() {
        let totalWins = 0;
        let totalGames = 0;
        for (const mode of ['pve', 'online', 'story']) {
            const stats = this.data.stats[mode];
            if (stats) {
                totalWins += stats.wins;
                totalGames += stats.wins + stats.losses + stats.draws;
            }
        }
        if (totalGames === 0) return 0;
        return Math.round((totalWins / totalGames) * 100);
    },

    // 获取故事段位 (Story Rank)
    getRank() {
        const progress = this.data.storyProgress || 0;
        let currentRank = this.RANKS[0];
        for (const rank of this.RANKS) {
            if (progress >= rank.minStory) {
                currentRank = rank;
            }
        }
        return currentRank;
    },

    // 获取竞技段位 (Competitive Rank)
    getCompetitiveRank() {
        if (!window.EloSystem) return { name: '未知', icon: '❓', color: '#999' };
        return EloSystem.getRank(this.data.competitive.elo);
    },

    // 获取下一故事段位
    getNextRank() {
        const current = this.getRank();
        const currentIndex = this.RANKS.findIndex(r => r.id === current.id);
        if (currentIndex < this.RANKS.length - 1) {
            return this.RANKS[currentIndex + 1];
        }
        return null;
    },

    // 获取汇总数据
    getSummary() {
        // 始终从 Onboarding 获取最新玩家名
        const playerName = window.Onboarding?.getPlayerName() || this.data.playerName || '玩家';

        // 同步更新本地数据
        if (playerName !== this.data.playerName) {
            this.data.playerName = playerName;
            this.save();
        }

        return {
            playerName: playerName,
            rank: this.getRank(),
            nextRank: this.getNextRank(),
            totalGames: this.data.totalGames,
            totalWinRate: this.getTotalWinRate(),
            storyProgress: this.data.storyProgress,
            modes: {
                pve: {
                    ...this.data.stats.pve,
                    winRate: this.getWinRate('pve'),
                    games: this.getModeGames('pve')
                },
                online: {
                    ...this.data.stats.online,
                    winRate: this.getWinRate('online'),
                    games: this.getModeGames('online')
                },
                story: {
                    ...this.data.stats.story,
                    winRate: this.getWinRate('story'),
                    games: this.getModeGames('story')
                }
            },
            lastPlayed: this.data.lastPlayed
        };
    },

    // 重置统计
    reset() {
        this.data = { ...this.defaultData, createdAt: new Date().toISOString() };
        this.save();
    },

    // ========== UI 控制方法 ==========

    // 打开统计弹窗
    openStatsModal() {
        const modal = document.getElementById('stats-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.updateStatsUI();
        }
    },

    // 关闭统计弹窗
    closeStatsModal() {
        const modal = document.getElementById('stats-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    // 更新统计UI
    updateStatsUI() {
        const summary = this.getSummary();
        const elo = this.data.competitive.elo || 1000;

        // Rank Info (Synced with Main Menu & Leaderboard)
        let rankName = '倔强青铜';
        let rankIcon = '🥉';
        let rankColor = '#cd7f32';

        if (window.Leaderboard && Leaderboard.getRankName && Leaderboard.getRankMeta) {
            rankName = Leaderboard.getRankName(elo);
            const meta = Leaderboard.getRankMeta(elo);
            rankIcon = meta.icon;
            rankColor = meta.color;
        } else if (window.EloSystem) {
            // Fallback to EloSystem if Leaderboard is missing (Legacy)
            const r = EloSystem.getRank(elo);
            rankName = r.name;
            rankIcon = r.icon;
            rankColor = r.color;
        }

        // 1. Profile Header
        this.updateElement('stats-player-avatar', AvatarSystem.getCurrent().emoji);
        this.updateElement('stats-player-name', summary.playerName);

        // Rank Info Update
        this.updateElement('stats-rank-icon', rankIcon);

        const rankNameEl = document.getElementById('stats-rank-name');
        if (rankNameEl) {
            rankNameEl.textContent = rankName;
            rankNameEl.style.color = rankColor;
        }

        // Rank Progress
        const nextRank = EloSystem.getNextRank(this.data.competitive.elo);
        let progressPercent = 0;
        let rankText = `${this.data.competitive.elo}`;

        if (nextRank) {
            progressPercent = (this.data.competitive.elo / nextRank.total) * 100; // Simplified progress
            // Better progress: (current - prev_max) / (target - prev_max) ?
            // EloSystem.nextRank returns {progress: rating, total: target}.
            // Let's just use rating / total for now or safe approx.
            // Actually EloSystem.getNextRank returns progress = rating.
            // So percentage = (nextRank.progress / nextRank.total) * 100.
            progressPercent = (nextRank.progress / nextRank.total) * 100;
            rankText = `${this.data.competitive.elo} / ${nextRank.total}`;
        } else {
            progressPercent = 100;
            rankText = `${this.data.competitive.elo} (MAX)`;
        }

        const rankBar = document.getElementById('stats-rank-bar');
        if (rankBar) rankBar.style.width = `${progressPercent}%`;
        this.updateElement('stats-rank-val', rankText);

        // 2. Win Rate Chart (Online Win Rate)
        const winRate = summary.modes.online.winRate;
        this.updateElement('stats-winrate-text', `${winRate}%`);

        // Update Circular Chart stroke-dasharray (value, 100)
        const circle = document.querySelector('#stats-winrate-chart .circle');
        if (circle) {
            // stroke-dasharray="current, 100"
            circle.setAttribute('stroke-dasharray', `${winRate}, 100`);
            // Color based on winrate
            if (winRate >= 60) circle.style.stroke = '#22c55e'; // Green
            else if (winRate >= 50) circle.style.stroke = '#6366f1'; // Indigo
            else circle.style.stroke = '#ef4444'; // Red
        }

        // 3. Total Games
        this.updateElement('stats-total-games', summary.modes.online.games); // Use Online games for main stat or totalGames? User image says "Total Games", likely online matches. Let's use summary.modes.online.games to be consistent with "Competitive" vibe, or summary.totalGames. Let's use Online Games for now as it pairs with Rank.
        // ACTUALLY: User image has "Total Rounds" and "Win Rate". Usually matches.
        this.updateElement('stats-total-games', this.data.competitive.matches || 0);

        // 4. Max Streak
        const maxStreak = this.data.competitive.maxStreak || 0;
        this.updateElement('stats-max-streak', maxStreak);

        // 5. Total Wins (MVP)
        this.updateElement('stats-total-wins', summary.modes.online.wins);

        // 6. Settings Toggles State REMOVED (Moved to UI.js Settings Modal)

        // Always sync main menu avatar/name
        this.updateMainMenuAvatar();

        // Update User ID Display
        const userId = localStorage.getItem('gomoku_user_id') || '---';
        this.updateElement('stats-user-id', userId);

        // Render ELO Chart
        this.renderEloChart();
    },

    // 辅助方法：安全更新元素文本
    updateElement(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    },

    // 绑定UI事件
    bindUIEvents() {
        // 打开按钮 - Main Menu
        const statsBtn = document.getElementById('stats-btn');
        if (statsBtn) {
            statsBtn.addEventListener('click', () => this.openStatsModal());
        }

        // 关闭按钮
        const closeBtn = document.getElementById('stats-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeStatsModal());
        }

        // Avatar Click -> Edit
        const avatar = document.getElementById('stats-player-avatar');
        // Already handled by onclick in HTML or bind here?
        // HTML has onclick="PlayerStats.showAvatarSelector()", so we good.
        // But let's keep it clean.

        // Rename Button
        const renameBtn = document.getElementById('stats-rename-btn');
        if (renameBtn) {
            // Note: HTML id changed to stats-rename-btn
            renameBtn.addEventListener('click', () => this.showRenameForm());
        }

        // Rename logic
        const confirmBtn = document.getElementById('rename-confirm-btn');
        if (confirmBtn) confirmBtn.addEventListener('click', () => this.confirmRename());
        const cancelBtn = document.getElementById('rename-cancel-btn');
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideRenameForm());

        // 回车确认
        const renameInput = document.getElementById('rename-input');
        if (renameInput) {
            renameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.confirmRename();
            });
        }
    },

    // 显示改名表单
    showRenameForm() {
        const form = document.getElementById('rename-form');
        const input = document.getElementById('rename-input');
        if (form && input) {
            form.classList.remove('hidden');
            input.value = this.data.playerName;
            input.focus();
            input.select();
        }
    },

    // 隐藏改名表单
    hideRenameForm() {
        const form = document.getElementById('rename-form');
        if (form) {
            form.classList.add('hidden');
        }
    },

    // 确认改名
    confirmRename() {
        const input = document.getElementById('rename-input');
        if (!input) return;

        const newName = input.value.trim();
        if (newName && newName.length > 0) {
            // 更新 PlayerStats
            this.data.playerName = newName;
            this.save();

            // 同步更新 Onboarding
            if (window.Onboarding) {
                Onboarding.playerName = newName;
                localStorage.setItem(Onboarding.STORAGE_KEY, newName);
            }

            // 刷新UI
            this.updateStatsUI();
            this.updateMainMenuAvatar(); // Sync to main menu
            this.hideRenameForm();

            console.log('[PlayerStats] Renamed to:', newName);
        }
    },

    // 显示头像选择器
    showAvatarSelector() {
        const panel = document.getElementById('stats-avatar-selector');
        const grid = document.getElementById('stats-avatar-grid');

        if (!panel || !grid || !window.AvatarSystem) return;

        // 渲染头像网格
        const currentAvatar = AvatarSystem.getCurrent();
        grid.innerHTML = AvatarSystem.presets.map(avatar => `
            <div class="avatar-option ${avatar.id === currentAvatar.id ? 'selected' : ''}" 
                 data-avatar-id="${avatar.id}"
                 title="${avatar.name}">
                <span class="avatar-emoji">${avatar.emoji}</span>
            </div>
        `).join('');

        // 绑定点击事件
        grid.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                const avatarId = parseInt(option.dataset.avatarId);
                AvatarSystem.save(avatarId);

                // 更新选中状态
                grid.querySelectorAll('.avatar-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');

                // 更新大头像显示
                this.updateStatsUI();

                // 同步更新主菜单头像
                this.updateMainMenuAvatar();
            });
        });

        panel.classList.remove('hidden');
    },

    // 同步主菜单头像和名字
    updateMainMenuAvatar() {
        // 更新头像
        if (window.AvatarSystem) {
            const avatar = AvatarSystem.getCurrent();
            const menuAvatar = document.getElementById('menu-user-avatar');
            if (menuAvatar) {
                menuAvatar.textContent = avatar.emoji;
            }
        }

        // 更新名字
        const playerName = window.Onboarding?.getPlayerName() || this.data?.playerName || '玩家';
        const menuName = document.getElementById('menu-user-name');
        if (menuName) {
            menuName.textContent = playerName;
        }

        // NEW: 更新主页段位显示 (Update Rank Status in Main Menu)
        const rankStatus = document.querySelector('.user-rank-status');
        if (rankStatus) {
            const elo = this.data.competitive.elo || 1000;

            // Get Meta (Name, Icon, Color)
            let rankName = '倔强青铜';
            let rankIcon = '🥉';
            let rankColor = '#cd7f32';

            if (window.Leaderboard && Leaderboard.getRankName && Leaderboard.getRankMeta) {
                rankName = Leaderboard.getRankName(elo);
                const meta = Leaderboard.getRankMeta(elo);
                rankIcon = meta.icon;
                rankColor = meta.color;
            } else {
                // Fallback local logic
                if (elo >= 2000) { rankName = '最强王者'; rankIcon = '👑'; rankColor = '#ffb700'; }
                else if (elo >= 1800) { rankName = '至尊星耀'; rankIcon = '💎'; rankColor = '#e91e63'; }
                else if (elo >= 1600) { rankName = '永恒钻石'; rankIcon = '✨'; rankColor = '#9c27b0'; }
                else if (elo >= 1400) { rankName = '尊贵铂金'; rankIcon = '🏆'; rankColor = '#00bcd4'; }
                else if (elo >= 1200) { rankName = '荣耀黄金'; rankIcon = '🥇'; rankColor = '#ffc107'; }
                else if (elo >= 1000) { rankName = '秩序白银'; rankIcon = '🥈'; rankColor = '#9e9e9e'; }
            }

            // Update Display
            rankStatus.innerHTML = `<span style="margin-right:4px">${rankIcon}</span> <span style="color:${rankColor}">${rankName}</span> <span style="font-size:0.9em; opacity:0.8; margin-left:4px">(${elo})</span>`;
        }
    },

    // 隐藏头像选择器
    hideAvatarSelector() {
        const panel = document.getElementById('stats-avatar-selector');
        if (panel) {
            panel.classList.add('hidden');
        }
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    PlayerStats.init();
    PlayerStats.bindUIEvents();
    PlayerStats.updateMainMenuAvatar(); // Sync avatar/rank to main menu
});

// 导出
window.PlayerStats = PlayerStats;
