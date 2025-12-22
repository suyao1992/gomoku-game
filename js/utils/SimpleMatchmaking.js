/**
 * SimpleMatchmaking.js - 完全重写的简化匹配系统
 * 
 * 解决问题：
 * 1. 自己和自己匹配
 * 2. 旧数据混乱
 * 3. 匹配后另一方不显示
 * 
 * 设计原则：
 * - 简单可靠
 * - 严格的玩家ID验证
 * - 清理旧数据
 * - 双向通知
 */

const SimpleMatchmaking = {
    isSearching: false,
    searchInterval: null,
    currentMatchId: null,
    pollingInterval: null,

    // 获取唯一的玩家ID（使用URL参数或生成新的）
    getPlayerId() {
        const urlParams = new URLSearchParams(window.location.search);
        const testId = urlParams.get('testPlayer');
        if (testId) {
            return testId;
        }

        // 使用localStorage中的ID，如果没有则生成
        let id = localStorage.getItem('gomoku_matchmaking_id');
        if (!id) {
            id = 'P' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('gomoku_matchmaking_id', id);
        }
        return id;
    },

    // 初始化
    async init() {
        console.log('[SimpleMatchmaking] Initializing...');

        if (!window.firebase || !firebase.database) {
            console.error('[SimpleMatchmaking] Firebase not ready');
            return false;
        }

        this.db = firebase.database();
        this.matchQueueRef = this.db.ref('simpleMatchQueue');
        this.matchResultsRef = this.db.ref('matchResults');
        this.roomsRef = this.db.ref('rooms');
        this.playerId = this.getPlayerId();

        // 清理自己的旧匹配数据
        await this.cleanupOldData();

        console.log('[SimpleMatchmaking] Ready, playerId:', this.playerId);
        return true;
    },

    // 清理旧数据
    async cleanupOldData() {
        try {
            // 从匹配队列移除自己
            await this.matchQueueRef.child(this.playerId).remove();
            // 清理自己的匹配结果
            await this.matchResultsRef.child(this.playerId).remove();
            console.log('[SimpleMatchmaking] Old data cleaned');
        } catch (e) {
            console.warn('[SimpleMatchmaking] Cleanup failed:', e);
        }
    },

    // 开始匹配
    async startMatching(onMatchFound, onMatchFailed) {
        console.log('[SimpleMatchmaking] Starting match...');

        if (this.isSearching) {
            console.warn('[SimpleMatchmaking] Already searching');
            return;
        }

        if (!this.db) {
            await this.init();
        }

        this.isSearching = true;

        const playerName = localStorage.getItem('gomoku_player_name') || '玩家';
        const playerElo = parseInt(localStorage.getItem('gomoku_elo') || '1000');

        // 先清理旧数据
        await this.cleanupOldData();

        try {
            // 检查是否有等待的玩家
            const queueSnapshot = await this.matchQueueRef.once('value');
            const queue = queueSnapshot.val() || {};

            // 寻找对手（严格排除自己）
            let opponent = null;
            for (const [pid, pdata] of Object.entries(queue)) {
                // 严格检查：ID不同 且 时间戳在60秒内
                if (pid !== this.playerId &&
                    pdata.timestamp &&
                    Date.now() - pdata.timestamp < 60000) {
                    opponent = { id: pid, ...pdata };
                    break;
                }
            }

            if (opponent) {
                // 找到对手，创建房间
                console.log('[SimpleMatchmaking] Found opponent:', opponent.id);
                await this.createMatchRoom(opponent, playerName, playerElo, onMatchFound);
            } else {
                // 没有对手，加入队列等待
                console.log('[SimpleMatchmaking] No opponent found, joining queue');
                await this.joinQueue(playerName, playerElo, onMatchFound, onMatchFailed);
            }

        } catch (error) {
            console.error('[SimpleMatchmaking] Error:', error);
            this.isSearching = false;
            if (onMatchFailed) onMatchFailed(error.message);
        }
    },

    // 加入等待队列
    async joinQueue(playerName, playerElo, onMatchFound, onMatchFailed) {
        // 写入队列
        await this.matchQueueRef.child(this.playerId).set({
            name: playerName,
            elo: playerElo,
            timestamp: Date.now(),
            avatar: window.AvatarSystem ? AvatarSystem.getCurrent().emoji : '🎮'
        });

        // 设置断线自动移除
        this.matchQueueRef.child(this.playerId).onDisconnect().remove();

        // 开始监听匹配结果
        this.startPolling(onMatchFound, onMatchFailed);
    },

    // 轮询检查匹配结果
    startPolling(onMatchFound, onMatchFailed) {
        console.log('[SimpleMatchmaking] Starting polling for match result');

        let pollCount = 0;
        const maxPolls = 30; // 60秒超时 (每2秒一次)

        this.pollingInterval = setInterval(async () => {
            pollCount++;

            if (pollCount > maxPolls) {
                // 超时
                this.cancelMatching();
                if (onMatchFailed) onMatchFailed('匹配超时');
                return;
            }

            try {
                // 检查是否被匹配
                const resultSnapshot = await this.matchResultsRef.child(this.playerId).once('value');
                const result = resultSnapshot.val();

                if (result && result.roomCode) {
                    console.log('[SimpleMatchmaking] Match found via polling:', result.roomCode);

                    // 清除轮询
                    this.stopPolling();

                    // 加入房间
                    await this.joinMatchRoom(result.roomCode, onMatchFound);
                }
            } catch (e) {
                console.error('[SimpleMatchmaking] Poll error:', e);
            }
        }, 2000);
    },

    // 停止轮询
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    },

    // 创建匹配房间（主动匹配方调用）
    async createMatchRoom(opponent, myName, myElo, onMatchFound) {
        const roomCode = this.generateRoomCode();

        console.log('[SimpleMatchmaking] Creating room:', roomCode);

        // 创建房间数据
        const roomData = {
            code: roomCode,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            status: 'playing',
            matchmaking: true,
            players: {
                [this.playerId]: {
                    id: this.playerId,
                    name: myName,
                    elo: myElo,
                    color: 'black',
                    ready: true,
                    connected: true,
                    avatar: window.AvatarSystem ? AvatarSystem.getCurrent().emoji : '🎮'
                },
                [opponent.id]: {
                    id: opponent.id,
                    name: opponent.name,
                    elo: opponent.elo || 1000,
                    color: 'white',
                    ready: true,
                    connected: false, // 等待加入
                    avatar: opponent.avatar || '❓'
                }
            },
            game: {
                board: this.createEmptyBoard(),
                currentTurn: 'black',
                moves: [],
                winner: null,
                startTime: firebase.database.ServerValue.TIMESTAMP
            }
        };

        // 写入房间
        await this.roomsRef.child(roomCode).set(roomData);

        // 通知对手匹配结果
        await this.matchResultsRef.child(opponent.id).set({
            roomCode: roomCode,
            opponentId: this.playerId,
            opponentName: myName,
            timestamp: Date.now()
        });

        // 从队列移除双方
        await this.matchQueueRef.child(this.playerId).remove();
        await this.matchQueueRef.child(opponent.id).remove();

        // 设置Network状态
        this.setupNetworkState(roomCode, true, 'black');

        this.isSearching = false;

        console.log('[SimpleMatchmaking] Room created, notifying game');

        if (onMatchFound) {
            onMatchFound(roomCode, 'black');
        }
    },

    // 加入匹配房间（被匹配方调用）
    async joinMatchRoom(roomCode, onMatchFound) {
        console.log('[SimpleMatchmaking] Joining room:', roomCode);

        try {
            // 更新自己的连接状态
            await this.roomsRef.child(roomCode).child('players').child(this.playerId).update({
                connected: true
            });

            // 清理匹配数据
            await this.cleanupMatchingData();

            // 设置Network状态
            this.setupNetworkState(roomCode, false, 'white');

            this.isSearching = false;

            if (onMatchFound) {
                onMatchFound(roomCode, 'white');
            }
        } catch (e) {
            console.error('[SimpleMatchmaking] Join room error:', e);
        }
    },

    // 设置Network模块状态
    setupNetworkState(roomCode, isHost, color) {
        if (!window.Network) return;

        Network.currentRoom = roomCode;
        Network.currentRoomRef = Network.roomsRef.child(roomCode);
        Network.isHost = isHost;
        Network.myColor = color;
        Network.myPlayerId = this.playerId;
        Network.isMatchmaking = false;

        // 清理旧监听器
        Network.stopRoomListeners();

        // 启动新监听器
        Network.startRoomListeners();
        Network.setupDisconnectHandler();

        console.log('[SimpleMatchmaking] Network state configured');
    },

    // 清理匹配数据
    async cleanupMatchingData() {
        await this.matchQueueRef.child(this.playerId).remove();
        await this.matchResultsRef.child(this.playerId).remove();
    },

    // 取消匹配
    async cancelMatching() {
        console.log('[SimpleMatchmaking] Cancelling match');

        this.stopPolling();
        await this.cleanupMatchingData();

        this.isSearching = false;
    },

    // 生成房间码
    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    // 创建空棋盘
    createEmptyBoard() {
        return Array(15).fill(null).map(() => Array(15).fill(0));
    },

    // 调试
    debug() {
        console.log('=== SimpleMatchmaking Debug ===');
        console.log('playerId:', this.playerId);
        console.log('isSearching:', this.isSearching);
        console.log('pollingInterval:', this.pollingInterval);
        console.log('Network.myPlayerId:', Network?.myPlayerId);
        console.log('Network.currentRoom:', Network?.currentRoom);
        console.log('================================');
    }
};

// 替换原有的匹配系统入口
const MatchmakingOverride = {
    init() {
        // 替换快速匹配按钮事件
        const btn = document.getElementById('quick-match-btn');
        if (!btn) return;

        const newBtn = btn.cloneNode(true);
        btn.parentNode?.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', async () => {
            console.log('[MatchmakingOverride] Quick match clicked');

            // 显示匹配弹窗
            document.getElementById('matchmaking-modal')?.classList.remove('hidden');
            document.getElementById('matchmaking-timer')?.textContent && (document.getElementById('matchmaking-timer').textContent = '00:00');

            // 开始计时显示
            let seconds = 0;
            const timerEl = document.getElementById('matchmaking-timer');
            const timerInterval = setInterval(() => {
                seconds++;
                if (timerEl) {
                    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
                    const sec = (seconds % 60).toString().padStart(2, '0');
                    timerEl.textContent = `${min}:${sec}`;
                }
            }, 1000);

            // 启动匹配
            await SimpleMatchmaking.init();
            await SimpleMatchmaking.startMatching(
                // 匹配成功
                (roomCode, color) => {
                    clearInterval(timerInterval);
                    document.getElementById('matchmaking-modal')?.classList.add('hidden');

                    // 设置游戏监听器并开始
                    if (window.game) {
                        game.setupOnlineGameListeners();
                        game.startOnlineGame();
                    }
                },
                // 匹配失败
                (error) => {
                    clearInterval(timerInterval);
                    document.getElementById('matchmaking-modal')?.classList.add('hidden');
                    document.getElementById('main-menu')?.classList.remove('hidden');
                    alert('匹配失败: ' + error);
                }
            );
        });

        // 替换取消按钮
        const cancelBtn = document.getElementById('cancel-match-btn');
        if (cancelBtn) {
            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode?.replaceChild(newCancelBtn, cancelBtn);

            newCancelBtn.addEventListener('click', async () => {
                await SimpleMatchmaking.cancelMatching();
                document.getElementById('matchmaking-modal')?.classList.add('hidden');
                document.getElementById('main-menu')?.classList.remove('hidden');
            });
        }

        console.log('[MatchmakingOverride] Quick match buttons replaced');
    }
};

// 初始化 - 禁用：SimpleMatchmaking不应该绑定quick-match-btn
// 快速匹配由RobustMatchmaking处理，SimpleMatchmaking仅用于房间模式
// document.addEventListener('DOMContentLoaded', () => {
//     setTimeout(() => {
//         MatchmakingOverride.init();
//         console.log('[SimpleMatchmaking] System ready');
//     }, 2000);
// });

window.SimpleMatchmaking = SimpleMatchmaking;
