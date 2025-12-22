// ========== World Leaderboard Module (Final Refactor) ==========

const Leaderboard = {
    db: null,
    isInitialized: false,
    cachedLeaderboard: [],
    currentTab: 'all', // 'all', 'daily', 'hourly'

    // Firebase Initialization
    init() {
        try {
            if (typeof firebase !== 'undefined' && !this.isInitialized) {
                if (firebase.apps.length > 0) {
                    this.db = firebase.database();
                    this.isInitialized = true;
                    console.log('[Leaderboard] Firebase initialized');
                }
            }
        } catch (e) {
            console.error('[Leaderboard] Init failed:', e);
        }
    },

    // Get Player ID
    getPlayerId() {
        let id = localStorage.getItem('gomoku_user_id');
        if (!id) id = localStorage.getItem('gomoku_player_id');
        if (!id) {
            id = Math.floor(100000 + Math.random() * 900000).toString();
            localStorage.setItem('gomoku_user_id', id);
        }
        return id;
    },

    // Explicit Score Submission
    async submitScore() {
        if (!this.isInitialized || !this.db) return false;

        const stats = window.PlayerStats?.data;
        if (!stats) return false;

        const playerId = this.getPlayerId();
        const competitive = stats.competitive || { elo: 1000 };
        const onlineStats = stats.stats.online || { wins: 0, losses: 0, draws: 0 };

        const totalMatches = onlineStats.wins + onlineStats.losses + (onlineStats.draws || 0);
        const winRate = totalMatches > 0 ? Math.round((onlineStats.wins / totalMatches) * 100) : 0;

        const entry = {
            id: playerId,
            name: stats.playerName || Localization.get('mp.player'),
            avatar: window.AvatarSystem?.getCurrent().emoji || '😐',
            elo: competitive.elo || 1000,
            winRate: winRate,
            totalGames: totalMatches,
            lastUpdated: firebase.database.ServerValue.TIMESTAMP
        };

        try {
            await this.db.ref('leaderboard/' + playerId).set(entry);

            // Refresh local list if open
            const modal = document.getElementById('leaderboard-modal');
            if (modal && !modal.classList.contains('hidden')) {
                setTimeout(() => this.refresh(), 500);
            }
            return true;
        } catch (e) {
            console.error('[Leaderboard] Submit failed:', e);
            if (e.code === 'PERMISSION_DENIED') {
                alert(Localization.get('leaderboard.sync_failed'));
            }
            return false;
        }
    },

    // Fetch Logic with Time Filter
    async fetchLeaderboard() {
        if (!this.isInitialized || !this.db) return this.cachedLeaderboard;

        try {
            // Fetch more entries (100) to ensure we have enough after filtering
            const snapshot = await this.db.ref('leaderboard')
                .orderByChild('elo')
                .limitToLast(100)
                .once('value');

            const val = snapshot.val();
            if (!val) return [];

            let list = Object.values(val);
            const now = Date.now();

            // Filter based on tab
            if (this.currentTab === 'daily') {
                const oneDay = 24 * 60 * 60 * 1000;
                list = list.filter(p => (now - (p.lastUpdated || 0)) < oneDay);
            } else if (this.currentTab === 'hourly') {
                const oneHour = 60 * 60 * 1000;
                list = list.filter(p => (now - (p.lastUpdated || 0)) < oneHour);
            }

            // Client-side Sort
            if (this.currentTab === 'hourly') {
                // Hourly: Sort by WinRate first (Hot Streak), then ELO
                list.sort((a, b) => {
                    const wrA = a.winRate || 0;
                    const wrB = b.winRate || 0;
                    if (wrA !== wrB) return wrB - wrA;
                    return (b.elo || 1000) - (a.elo || 1000);
                });
            } else {
                // Default/Daily: Sort by ELO
                list.sort((a, b) => {
                    const eloA = a.elo || 1000;
                    const eloB = b.elo || 1000;
                    if (eloA !== eloB) return eloB - eloA;
                    return (b.winRate || 0) - (a.winRate || 0);
                });
            }

            // Take top 10
            this.cachedLeaderboard = list.slice(0, 10);
            return this.cachedLeaderboard;

        } catch (e) {
            console.error('[Leaderboard] Fetch error:', e);
            return this.cachedLeaderboard;
        }
    },

    // Switch Tab
    switchTab(tab) {
        this.currentTab = tab;

        // Update UI Tabs
        document.querySelectorAll('.lb-tab').forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.lb-tab[data-tab="${tab}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Update Subtitle
        const subtitle = document.querySelector('.leaderboard-subtitle');
        if (subtitle && window.Localization) {
            if (tab === 'hourly') subtitle.textContent = Localization.t('leaderboard.tab.hourly'); // Simplified, or specific key
            else if (tab === 'daily') subtitle.textContent = Localization.t('leaderboard.tab.daily');
            else subtitle.textContent = Localization.t('leaderboard.tab.all');

            // Add suffix? "TOP 10..."
            // Let's just key it: "TOP 10 Players" etc.
            // Simplified for now: just keep "Top 10" or use generic title.
            // The Localization file has "leaderboard.tab.all".
        }

        this.refresh();
    },

    // Helper: Get Rank Name
    getRankName(elo) {
        if (elo >= 2000) return Localization.get('rank.title.king');
        if (elo >= 1800) return Localization.get('rank.title.star');
        if (elo >= 1600) return Localization.get('rank.title.diamond');
        if (elo >= 1400) return Localization.get('rank.title.platinum');
        if (elo >= 1200) return Localization.get('rank.title.gold');
        if (elo >= 1000) return Localization.get('rank.title.silver');
        return Localization.get('rank.title.bronze');
    },

    // Helper: Get Rank Icon/Color
    getRankMeta(elo) {
        if (elo >= 2000) return { icon: '👑', color: '#ffb700' };
        if (elo >= 1800) return { icon: '💎', color: '#e91e63' };
        if (elo >= 1600) return { icon: '✨', color: '#9c27b0' };
        if (elo >= 1400) return { icon: '🏆', color: '#00bcd4' };
        if (elo >= 1200) return { icon: '🥇', color: '#ffc107' };
        if (elo >= 1000) return { icon: '🥈', color: '#9e9e9e' };
        return { icon: '🥉', color: '#795548' };
    },

    // Backward Compatibility Alias
    uploadStats() {
        return this.submitScore();
    },

    // UI: Open Modal
    async openModal() {
        const modal = document.getElementById('leaderboard-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.switchTab('all'); // Default to All Time
            // Try to submit score first
            await this.submitScore();
        }
    },

    // UI: Close Modal
    closeModal() {
        const modal = document.getElementById('leaderboard-modal');
        if (modal) modal.classList.add('hidden');
    },

    // UI: Refresh List
    async refresh() {
        this.renderLoading();
        const data = await this.fetchLeaderboard();
        this.render(data);
    },

    // UI: Join (Force Submit)
    async joinLeaderboard() {
        const btn = document.querySelector('.leaderboard-empty button');
        if (btn) btn.textContent = Localization.get('leaderboard.joining');

        await this.submitScore();
        await this.refresh();
    },

    renderLoading() {
        const list = document.getElementById('leaderboard-list');
        if (list) list.innerHTML = `<div class="leaderboard-loading">${Localization.get('leaderboard.syncing')}</div>`;
    },

    render(data) {
        const list = document.getElementById('leaderboard-list');
        if (!list) return;

        if (!data || data.length === 0) {
            list.innerHTML = `
                <div class="leaderboard-empty">
                    <p>${Localization.get('leaderboard.empty')}</p>
                    <button class="btn-small" onclick="Leaderboard.joinLeaderboard()">${Localization.get('leaderboard.join_btn')}</button>
                    ${this.currentTab !== 'all' ? `<p style="font-size:12px; margin-top:5px">${Localization.get('leaderboard.empty_hint')}</p>` : ''}
                </div>`;
            return;
        }

        const myId = this.getPlayerId();

        list.innerHTML = data.map((p, i) => {
            const rank = i + 1;
            const isMe = String(p.id) === String(myId);
            const rankClass = rank <= 3 ? `rank-${rank}` : '';
            const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;

            const elo = p.elo || 1000;
            const meta = this.getRankMeta(elo);

            return `
                <div class="leaderboard-item ${rankClass} ${isMe ? 'is-me' : ''}">
                    <div class="lb-rank">${rankIcon}</div>
                    <div class="lb-player">
                        <div class="lb-name">
                            ${p.avatar || '😐'} ${p.name || Localization.get('mp.player')} 
                            ${isMe ? `<span class="me-tag">${Localization.get('leaderboard.me')}</span>` : ''}
                        </div>
                        <div class="lb-tier" style="color:${meta.color}">${meta.icon} ELO ${elo}</div>
                    </div>
                    <div class="lb-stats">
                        <div class="lb-winrate">${Localization.get('leaderboard.winrate')} ${p.winRate || 0}%</div>
                        <div class="lb-games">${Localization.get('leaderboard.matches', { COUNT: p.totalGames || 0 })}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    bindEvents() {
        // Tab Clicks
        document.querySelectorAll('.lb-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        const openBtn = document.getElementById('leaderboard-btn');
        if (openBtn) openBtn.addEventListener('click', () => this.openModal());

        const closeBtn = document.getElementById('leaderboard-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
        const refreshBtn = document.getElementById('leaderboard-refresh-btn');
        if (refreshBtn) refreshBtn.addEventListener('click', () => this.refresh());
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        Leaderboard.init();
        Leaderboard.bindEvents();
    }, 1000);
});

window.Leaderboard = Leaderboard;
