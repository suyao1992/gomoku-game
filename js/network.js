/**
 * network.js - 联机对战网络模块
 * 基于 Firebase Realtime Database 实现
 */

const Network = {
    // ============ 状态变量 ============
    currentRoom: null,
    currentRoomRef: null,
    myPlayerId: null,
    myColor: null,
    isHost: false,
    myName: null,         // 我的名字
    opponentName: null,   // 对手名字
    opponentId: null,     // 对手ID
    listeners: {},
    connected: false,     // 是否已连接到Firebase

    // Firebase引用
    db: null,
    roomsRef: null,

    // ============ 性能优化缓存 ============
    _boardCache: null,     // normalizeBoard 结果缓存
    _boardCacheKey: null,  // 缓存键(用于判断是否需要重新转换)

    // ============ 辅助函数 ============
    /**
     * 将Firebase返回的对象格式棋盘转换为二维数组
     * Firebase存储数组时可能返回对象格式 {0: {...}, 1: {...}, ...}
     * @param {Object|Array} boardData - Firebase返回的棋盘数据
     * @param {number} size - 棋盘大小，默认15
     * @returns {Array} 二维数组格式的棋盘
     */
    normalizeBoard(boardData, size = 15) {
        // 性能优化：使用简单的缓存键判断是否需要重新转换
        const cacheKey = JSON.stringify(boardData);
        if (this._boardCacheKey === cacheKey && this._boardCache) {
            return this._boardCache;
        }

        let result;

        // 如果已经是数组，直接返回
        if (Array.isArray(boardData)) {
            result = boardData;
        }
        // 如果是对象，转换为数组
        else if (boardData && typeof boardData === 'object') {
            const board = [];
            for (let i = 0; i < size; i++) {
                if (boardData[i] !== undefined) {
                    // 行数据也可能是对象
                    if (Array.isArray(boardData[i])) {
                        board.push([...boardData[i]]);
                    } else if (typeof boardData[i] === 'object') {
                        const row = [];
                        for (let j = 0; j < size; j++) {
                            row.push(boardData[i][j] !== undefined ? boardData[i][j] : 0);
                        }
                        board.push(row);
                    } else {
                        board.push(new Array(size).fill(0));
                    }
                } else {
                    board.push(new Array(size).fill(0));
                }
            }
            result = board;
        }
        // 如果是null或undefined，返回空棋盘
        else {
            result = Array(size).fill(null).map(() => Array(size).fill(0));
        }

        // 缓存结果
        this._boardCache = result;
        this._boardCacheKey = cacheKey;

        return result;
    },

    // ============ 初始化 ============
    /**
     * 连接到Firebase服务器 (init的别名，供外部调用)
     */
    connect() {
        return this.init();
    },

    init() {
        // 如果已经初始化过，直接返回
        if (this.db && this.connected) {
            console.log('[Network] Already initialized');
            return true;
        }

        if (!firebase || !firebase.database) {
            console.error('Firebase not initialized');
            this.connected = false;
            return false;
        }

        this.db = firebase.database();
        this.roomsRef = this.db.ref('rooms');

        // 生成或获取玩家ID
        this.myPlayerId = this.getOrCreatePlayerId();

        // Firebase 数据库已初始化，设置连接状态为 true
        // 网络操作将通过 try/catch 处理实际的连接错误
        this.connected = true;
        console.log('[Network] Database initialized, connected = true');

        // 维护在线状态（异步，用于UI显示和在线人数）
        try {
            const onlineRef = this.db.ref('online');
            const myPresenceRef = onlineRef.child(this.myPlayerId);
            const connectedRef = this.db.ref('.info/connected');

            connectedRef.on('value', (snap) => {
                if (snap.val() === true) {
                    console.log('[Network] Firebase connection confirmed');
                    // 掉线自动移除
                    myPresenceRef.onDisconnect().remove();
                    // 上线记录 (New: Object structure)
                    this.updatePlayerStatus('idle');
                } else {
                    console.log('[Network] Firebase connection pending or lost');
                }
            });

            // 监听在线总人数及状态分布 (Modified with cleanup)
            onlineRef.on('value', (snap) => {
                const players = snap.val() || {};
                const stats = {
                    total: 0,
                    playing: 0,
                    story: 0
                };

                const now = Date.now();
                const staleThreshold = 120000; // 2分钟未活跃视为掉线

                Object.entries(players).forEach(([pid, p]) => {
                    // 兼容旧数据 (timestamp number)
                    if (typeof p === 'object') {
                        // 检查是否过期（2分钟未活跃）
                        if (p.lastActive && (now - p.lastActive) > staleThreshold) {
                            // 清理过期数据
                            onlineRef.child(pid).remove();
                            return;
                        }
                        stats.total++;
                        if (p.status === 'playing') stats.playing++;
                        if (p.status === 'story') stats.story++;
                    } else if (typeof p === 'number') {
                        // 旧格式：直接是时间戳
                        if ((now - p) > staleThreshold) {
                            onlineRef.child(pid).remove();
                            return;
                        }
                        stats.total++;
                    }
                });

                if (this.onOnlineCountUpdate) {
                    this.onOnlineCountUpdate(stats);
                }
            });
        } catch (e) {
            console.warn('Presence system init failed:', e);
        }

        console.log('Network module initialized, playerId:', this.myPlayerId);
        return true;
    },

    /**
     * 更新玩家当前状态
     * @param {string} status 'idle' | 'playing' | 'story' | 'pve' | 'matching' | 'room' | 'culture'
     */
    async updatePlayerStatus(status) {
        if (!this.db || !this.myPlayerId) return;

        // 保存本地状态供 MultiplayerUI 使用
        this._currentStatus = status;

        try {
            const onlineRef = this.db.ref('online').child(this.myPlayerId);
            await onlineRef.update({
                lastActive: firebase.database.ServerValue.TIMESTAMP,
                status: status
            });
        } catch (e) {
            console.warn('Update status failed:', e);
        }
    },

    /**
     * 清理所有房间数据（用于修复旧数据格式）
     */
    async clearAllRooms() {
        if (!this.db) {
            console.error('Database not initialized');
            return false;
        }

        try {
            await this.db.ref('rooms').remove();
            await this.db.ref('matchmaking').remove();
            console.log('✅ 所有房间数据已清理');
            alert('已清理所有房间数据，请刷新页面后创建新房间');
            return true;
        } catch (error) {
            console.error('清理失败:', error);
            return false;
        }
    },

    /**
     * 清理当前会话状态（加入新房间前必须调用）
     * 重要：解决监听器冲突和状态残留问题
     */
    cleanupSession() {
        console.log('[Network] 清理会话状态...');

        // 1. 停止所有监听器
        this.stopRoomListeners();
        this.stopMatchmakingListener();

        // 2. 清除匹配状态
        if (this.matchmakingTimeout) {
            clearTimeout(this.matchmakingTimeout);
            this.matchmakingTimeout = null;
        }
        this.isMatchmaking = false;

        // 🔥 关键：清除回调函数，防止残留触发
        this.onMatchFound = null;
        this.onRoomUpdate = null;
        this.onGameUpdate = null;
        this.onPlayersUpdate = null;
        this.onOpponentLeft = null;

        // 3. 重置房间相关状态
        this.currentRoom = null;
        this.currentRoomRef = null;
        this.myColor = null;
        this.isHost = false;
        this.opponentName = null;
        this.opponentId = null;
        this.opponentAvatar = null;  // 新增：清理对手头像
        this.opponentElo = null;      // 新增：清理对手ELO

        // 4. 清空监听器对象
        this.listeners = {};

        // 5. 清理再来一局相关状态（防止状态残留）
        // 注意：不清理 myName/myAvatar，因为这些是玩家自己的数据

        console.log('[Network] 会话状态已清理完成');
    },

    // 获取或创建玩家ID
    // 使用 localStorage 存储永久数字ID
    getOrCreatePlayerId() {
        let playerId = localStorage.getItem('gomoku_user_id');
        if (!playerId) {
            // 使用加密安全的随机数生成器
            playerId = window.SecurityUtils ?
                SecurityUtils.generateSecureRandomId() :
                Math.floor(100000 + Math.random() * 900000).toString();
            localStorage.setItem('gomoku_user_id', playerId);
        }
        return playerId;
    },

    // ============ 房间操作 ============

    /**
     * 生成6位房间码
     */
    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除容易混淆的字符
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    /**
     * 创建房间
     * @returns {Promise<{success: boolean, roomCode: string, error?: string}>}
     */
    async createRoom() {
        // 重要：先清理之前的会话状态
        this.cleanupSession();

        try {
            const roomCode = this.generateRoomCode();
            const playerName = localStorage.getItem('gomoku_player_name') || '玩家';

            const roomData = {
                code: roomCode,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                status: 'waiting', // waiting | playing | finished
                hostId: this.myPlayerId,
                players: {
                    [this.myPlayerId]: {
                        id: this.myPlayerId,
                        name: playerName,
                        avatar: window.AvatarSystem ? AvatarSystem.getCurrent().emoji : '🎮',
                        elo: window.PlayerStats ? PlayerStats.data.competitive.elo : 1000,
                        ready: false,
                        color: 'black', // 房主执黑
                        connected: true,
                        lastActive: firebase.database.ServerValue.TIMESTAMP
                    }
                },
                game: {
                    board: this.createEmptyBoard(),
                    currentTurn: 'black',
                    moves: [],
                    winner: null,
                    startTime: null
                }
            };

            // 写入数据库
            await this.roomsRef.child(roomCode).set(roomData);

            // 设置当前房间
            this.currentRoom = roomCode;
            this.currentRoomRef = this.roomsRef.child(roomCode);
            this.isHost = true;
            this.myColor = 'black';

            // 开始监听房间变化
            this.startRoomListeners();

            // 设置断线检测
            this.setupDisconnectHandler();

            console.log('Room created:', roomCode);
            return { success: true, roomCode };

        } catch (error) {
            console.error('Create room error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * 加入房间
     * @param {string} roomCode 
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async joinRoom(roomCode) {
        // 重要：先清理之前的会话状态
        this.cleanupSession();

        try {
            roomCode = roomCode.toUpperCase().trim();

            // 检查房间是否存在
            const roomSnapshot = await this.roomsRef.child(roomCode).once('value');
            const roomData = roomSnapshot.val();

            if (!roomData) {
                return { success: false, error: '房间不存在' };
            }

            // 检查房间人数或重连
            const players = roomData.players || {};
            const isReconnecting = players[this.myPlayerId] !== undefined;

            // 注意：不再检测同名在线冲突，因为用户要求永久身份ID。
            // 如果两个标签页ID相同，将视为同一玩家在两处操作（或重连）。
            // 测试P1 vs P2需要使用不同浏览器或隐私模式。

            const playerCount = Object.keys(players).length;

            if (!isReconnecting) {
                if (roomData.status !== 'waiting') {
                    return { success: false, error: '房间已开始游戏' };
                }
                if (playerCount >= 2) {
                    return { success: false, error: '房间已满' };
                }
            }

            // 加入或更新房间状态
            const playerName = localStorage.getItem('gomoku_player_name') || '玩家';

            if (isReconnecting) {
                // 重连：更新在线状态
                await this.roomsRef.child(roomCode).child('players').child(this.myPlayerId).update({
                    connected: true,
                    lastActive: firebase.database.ServerValue.TIMESTAMP
                });

                // 恢复之前的颜色
                this.myColor = players[this.myPlayerId].color;
                this.isHost = (players[this.myPlayerId].color === 'black'); // 假设房主总是黑棋，或者需要更严谨的房主判定

                // 更严谨的房主判定：如果是第一个进入的玩家
                const playerIds = Object.keys(players).sort();
                if (playerIds[0] === this.myPlayerId) {
                    this.isHost = true;
                }

                console.log('Reconnected to room:', roomCode, 'Color:', this.myColor);
            } else {
                // 新加入
                await this.roomsRef.child(roomCode).child('players').child(this.myPlayerId).set({
                    id: this.myPlayerId,
                    name: playerName,
                    avatar: window.AvatarSystem ? AvatarSystem.getCurrent().emoji : '🎮',
                    elo: window.PlayerStats ? PlayerStats.data.competitive.elo : 1000,
                    ready: false,
                    color: 'white', // 加入者执白
                    connected: true,
                    lastActive: firebase.database.ServerValue.TIMESTAMP
                });
                this.myColor = 'white';
                this.isHost = false;
            }

            // 设置当前房间
            this.currentRoom = roomCode;
            this.currentRoomRef = this.roomsRef.child(roomCode);

            // 开始监听房间变化
            this.startRoomListeners();

            // 设置断线检测
            this.setupDisconnectHandler();

            console.log(isReconnecting ? 'Rejoined room:' : 'Joined room:', roomCode);
            return { success: true, reconnected: isReconnecting };

        } catch (error) {
            console.error('Join room error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * 离开房间
     */
    async leaveRoom(forceDelete = false) {
        if (!this.currentRoom) return;

        // 埋点
        if (window.GameAnalytics) {
            GameAnalytics.trackEvent('multiplayer_leave', {
                roomCode: this.currentRoom,
                isHost: this.isHost
            });
        }

        const roomRef = this.currentRoomRef;
        const roomCode = this.currentRoom;

        try {
            // 🔥 关键：停止所有监听器（包括匹配监听器）
            this.stopRoomListeners();
            this.stopMatchmakingListener();

            // 注意：不清除回调函数，因为下一局游戏可能复用
            this.isMatchmaking = false;

            // 获取房间状态
            const roomSnapshot = await roomRef.once('value');
            const roomData = roomSnapshot.val();

            if (roomData) {
                // 从房间中移除玩家
                await roomRef.child('players').child(this.myPlayerId).remove();

                // 重新获取房间数据查看剩余玩家
                const updatedSnapshot = await roomRef.once('value');
                const updatedData = updatedSnapshot.val();

                // 决定是否删除房间
                let shouldDelete = forceDelete;

                if (updatedData) {
                    const players = updatedData.players || {};
                    const playerCount = Object.keys(players).length;

                    // 删除条件：
                    // 1. 强制删除
                    // 2. 没有玩家了
                    // 3. 游戏已结束（finished状态）
                    if (playerCount === 0 || updatedData.status === 'finished') {
                        shouldDelete = true;
                    }
                }

                if (shouldDelete) {
                    await roomRef.remove();
                    console.log('[Network] Room deleted:', roomCode);
                }
            }

            // 重置状态
            this.currentRoom = null;
            this.currentRoomRef = null;
            this.isHost = false;
            this.myColor = null;
            this.opponentId = null;
            this.opponentName = null;

            console.log('[Network] Left room:', roomCode);

        } catch (error) {
            console.error('Leave room error:', error);
            // 即使出错也要重置状态
            this.currentRoom = null;
            this.currentRoomRef = null;
            this.isHost = false;
            this.myColor = null;
            this.onMatchFound = null;
            this.isMatchmaking = false;
        }
    },

    // ============ 游戏操作 ============

    /**
     * 设置准备状态
     */
    async setReady(ready) {
        if (!this.currentRoomRef) return;

        await this.currentRoomRef
            .child('players')
            .child(this.myPlayerId)
            .child('ready')
            .set(ready);
    },

    /**
     * 开始游戏 (由房主调用)
     */
    async startGame() {
        if (!this.currentRoomRef || !this.isHost) return;

        await this.currentRoomRef.update({
            status: 'playing',
            'game/startTime': firebase.database.ServerValue.TIMESTAMP
        });
    },

    /**
     * 落子
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {object} timeStats - 时间状态 {p1Time, p2Time, moveTime}
     */
    async makeMove(x, y, timeStats = null) {
        if (!this.currentRoomRef) return { success: false };

        try {
            // 获取当前游戏状态
            const gameSnapshot = await this.currentRoomRef.child('game').once('value');
            const gameData = gameSnapshot.val();

            if (!gameData) {
                return { success: false, error: '游戏数据不存在' };
            }

            // 将棋盘数据标准化为二维数组（Firebase可能返回对象格式）
            const board = this.normalizeBoard(gameData.board);

            // 验证是否轮到自己
            if (gameData.currentTurn !== this.myColor) {
                return { success: false, error: '不是你的回合' };
            }

            // 验证位置是否为空 (注意: 使用 board[x][y] 与 game.js 一致)
            if (board[x] && board[x][y] !== 0) {
                return { success: false, error: '该位置已有棋子' };
            }

            // 更新棋盘
            const pieceValue = this.myColor === 'black' ? 1 : 2;

            // 先在本地更新棋盘副本用于胜负检测
            const boardCopy = board.map(row => [...row]);
            boardCopy[x][y] = pieceValue;

            const updateData = {
                [`board/${x}/${y}`]: pieceValue,
                currentTurn: this.myColor === 'black' ? 'white' : 'black'
            };

            // 如果提供了时间数据，也一起更新
            if (timeStats) {
                updateData.p1Time = timeStats.p1Time;
                updateData.p2Time = timeStats.p2Time;
                updateData.moveTime = timeStats.moveTime; // 重置或更新
            }

            await this.currentRoomRef.child('game').update(updateData);

            // 添加到移动记录
            await this.currentRoomRef.child('game/moves').push({
                x, y,
                color: this.myColor,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });

            // 检测五连胜负
            const winner = this.checkWinAt(boardCopy, x, y, pieceValue);
            if (winner) {
                await this.setWinner(this.myColor);
            }

            return { success: true };

        } catch (error) {
            console.error('Make move error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * 检测指定位置是否形成五连
     * @param {Array} board - 棋盘状态
     * @param {number} x - 落子x坐标
     * @param {number} y - 落子y坐标  
     * @param {number} player - 玩家 (1=黑, 2=白)
     * @returns {boolean} 是否获胜
     */
    checkWinAt(board, x, y, player) {
        const directions = [
            [1, 0],   // 水平
            [0, 1],   // 垂直
            [1, 1],   // 对角线 \
            [1, -1]   // 对角线 /
        ];

        for (const [dx, dy] of directions) {
            let count = 1;

            // 正方向计数 (使用 board[nx][ny] 与 game.js 一致)
            for (let i = 1; i < 5; i++) {
                const nx = x + dx * i;
                const ny = y + dy * i;
                if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board[nx][ny] === player) {
                    count++;
                } else {
                    break;
                }
            }

            // 反方向计数
            for (let i = 1; i < 5; i++) {
                const nx = x - dx * i;
                const ny = y - dy * i;
                if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board[nx][ny] === player) {
                    count++;
                } else {
                    break;
                }
            }

            if (count >= 5) {
                return true;
            }
        }

        return false;
    },

    /**
     * 设置胜者
     */
    async setWinner(winner) {
        if (!this.currentRoomRef) return;

        await this.currentRoomRef.update({
            status: 'finished',
            'game/winner': winner
        });
    },

    /**
     * 认输
     */
    async surrender() {
        // 埋点
        if (window.GameAnalytics) {
            GameAnalytics.trackEvent('multiplayer_surrender', {
                roomCode: this.currentRoom
            });
        }

        const winner = this.myColor === 'black' ? 'white' : 'black';
        await this.setWinner(winner);
    },

    /**
     * 重新开始 (由房主调用)
     */
    async restartGame() {
        if (!this.currentRoomRef || !this.isHost) return;

        await this.currentRoomRef.child('game').set({
            board: this.createEmptyBoard(),
            currentTurn: 'black',
            moves: [],
            winner: null,
            startTime: firebase.database.ServerValue.TIMESTAMP
        });

        await this.currentRoomRef.update({
            status: 'playing'
        });

        // 重置准备状态
        const playersSnapshot = await this.currentRoomRef.child('players').once('value');
        const players = playersSnapshot.val() || {};

        for (const playerId of Object.keys(players)) {
            await this.currentRoomRef.child('players').child(playerId).child('ready').set(false);
        }
    },

    // ============ 再来一局系统 ============

    /**
     * 发送再来一局请求
     */
    async requestRematch() {
        if (!this.currentRoomRef) return { success: false, error: '未在房间中' };

        // 埋点
        if (window.GameAnalytics) {
            GameAnalytics.trackEvent('multiplayer_rematch_request', {
                roomCode: this.currentRoom
            });
        }

        try {
            await this.currentRoomRef.child('rematchRequest').set({
                from: this.myPlayerId,
                fromName: this.myName || '玩家',
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                status: 'pending'
            });

            console.log('Rematch request sent');
            return { success: true };
        } catch (error) {
            console.error('Request rematch error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * 响应再来一局请求
     * @param {boolean} accept - 是否接受
     */
    async respondRematch(accept) {
        if (!this.currentRoomRef) return;

        // 埋点
        if (window.GameAnalytics) {
            GameAnalytics.trackEvent('multiplayer_rematch_response', {
                roomCode: this.currentRoom,
                accepted: accept
            });
        }

        try {
            if (accept) {
                // 接受：更新状态并由发起方重开游戏
                await this.currentRoomRef.child('rematchRequest/status').set('accepted');

                // 稍等一下让对方收到通知，然后重置游戏
                setTimeout(async () => {
                    // 重置游戏（任一方都可以调用）
                    await this.currentRoomRef.child('game').set({
                        board: this.createEmptyBoard(),
                        currentTurn: 'black',
                        moves: [],
                        winner: null,
                        startTime: firebase.database.ServerValue.TIMESTAMP
                    });

                    await this.currentRoomRef.update({
                        status: 'playing'
                    });

                    // 重置准备状态
                    const playersSnapshot = await this.currentRoomRef.child('players').once('value');
                    const players = playersSnapshot.val() || {};
                    for (const playerId of Object.keys(players)) {
                        await this.currentRoomRef.child('players').child(playerId).child('ready').set(false);
                    }

                    // 清除请求
                    await this.currentRoomRef.child('rematchRequest').remove();
                }, 500);
            } else {
                // 拒绝：更新状态
                await this.currentRoomRef.child('rematchRequest/status').set('rejected');

                // 延迟清除请求
                setTimeout(async () => {
                    await this.currentRoomRef.child('rematchRequest').remove();
                }, 2000);
            }
        } catch (error) {
            console.error('Respond rematch error:', error);
        }
    },

    /**
     * 清除再来一局请求
     */
    async clearRematchRequest() {
        if (!this.currentRoomRef) return;
        await this.currentRoomRef.child('rematchRequest').remove();
    },

    async sendMessage(msgId) {
        if (!this.currentRoomRef) return;

        // 埋点
        if (window.GameAnalytics) {
            GameAnalytics.trackEvent('multiplayer_chat', {
                roomCode: this.currentRoom,
                messageId: msgId
            });
        }

        // 限制消息频率（可选，这里简单实现）
        const msg = {
            sender: this.myPlayerId,
            id: msgId,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };

        // 使用 messages 列表
        await this.currentRoomRef.child('messages').push(msg);
    },

    // ============ 监听器 ============

    startRoomListeners() {
        if (!this.currentRoomRef) {
            console.error('[Network] startRoomListeners: currentRoomRef is null!');
            return;
        }

        // 防御性清理：先停止任何现有监听器
        if (Object.keys(this.listeners).length > 0) {
            console.log('[Network] 清理旧监听器');
            this.stopRoomListeners();
        }

        console.log('[Network] 启动房间监听器, 房间:', this.currentRoom);

        // 监听房间状态变化
        this.listeners.room = this.currentRoomRef.on('value', (snapshot) => {
            const data = snapshot.val();
            console.log('[Network] 房间监听器触发, status:', data?.status, 'onRoomUpdate回调:', !!this.onRoomUpdate);
            if (data && this.onRoomUpdate) {
                this.onRoomUpdate(data);
            } else if (data && !this.onRoomUpdate) {
                console.warn('[Network] ⚠️ onRoomUpdate 回调未设置！房间状态:', data.status);
            }
        });

        // 监听玩家变化
        this.listeners.players = this.currentRoomRef.child('players').on('value', (snapshot) => {
            const players = snapshot.val();
            console.log('[Network] Players update:', players, 'myOpponentId:', this.opponentId);

            if (players) {
                const playerIds = Object.keys(players);
                const playerCount = playerIds.length;

                // 保存之前的对手信息
                const previousOpponentId = this.opponentId;
                const previousOpponentName = this.opponentName;

                // 提取并保存玩家名字
                let foundOpponent = false;
                playerIds.forEach(id => {
                    if (id === this.myPlayerId) {
                        this.myName = players[id].name || '玩家';
                        // 优先使用网络数据，如果丢失则尝试读取本地存储，最后使用默认值
                        const netAvatar = players[id].avatar;
                        const localAvatar = window.AvatarSystem ? window.AvatarSystem.getCurrent().emoji : null;
                        this.myAvatar = netAvatar || localAvatar || '🎮';

                        // 如果网络数据丢失但本地有，尝试修复网络数据 (静默修复)
                        if (!netAvatar && localAvatar && this.currentRoomRef) {
                            this.currentRoomRef.child(`players/${id}/avatar`).set(localAvatar).catch(() => { });
                        }
                    } else {
                        this.opponentId = id;
                        this.opponentName = players[id].name || '对手';
                        this.opponentAvatar = players[id].avatar || '❓';
                        this.opponentElo = players[id].elo || 1000;
                        foundOpponent = true;
                    }
                });

                // 检测对手是否离开（之前有对手，现在没有了）
                if (previousOpponentId && !foundOpponent && playerCount === 1) {
                    console.log('[Network] Opponent left the room:', previousOpponentName);
                    this.opponentId = null;
                    this.opponentName = null;
                    if (this.onOpponentLeft) {
                        this.onOpponentLeft(previousOpponentName);
                    }
                    // 对手离开后不要继续触发onPlayersUpdate，避免触发倒计时等逻辑
                    return;
                }

                if (this.onPlayersUpdate) {
                    this.onPlayersUpdate(players);
                }
            } else {
                // players 为空 - 所有玩家都已离开或房间已删除
                console.log('[Network] Players is null, opponent may have left');
                if (this.opponentId && this.onOpponentLeft) {
                    const name = this.opponentName || '对手';
                    this.opponentId = null;
                    this.opponentName = null;
                    this.onOpponentLeft(name);
                }
            }
        });

        // 监听游戏状态变化
        this.listeners.game = this.currentRoomRef.child('game').on('value', (snapshot) => {
            const game = snapshot.val();
            console.log('[Network] 游戏监听器触发, game存在:', !!game, ', onGameUpdate存在:', !!this.onGameUpdate);
            if (game && this.onGameUpdate) {
                this.onGameUpdate(game);
            }
            // 注意：回调为 null 时不报错，可能是监听器先于回调设置启动，稍后会被设置
        });

        // 监听消息
        this.listeners.messages = this.currentRoomRef.child('messages').limitToLast(1).on('child_added', (snapshot) => {
            const msg = snapshot.val();
            if (msg && this.onMessage) {
                this.onMessage(msg);
            }
        });

        // 监听再来一局请求
        this.listeners.rematch = this.currentRoomRef.child('rematchRequest').on('value', (snapshot) => {
            const request = snapshot.val();
            if (!request) return;

            // 如果是别人发起的请求且状态是pending，通知本地
            if (request.from !== this.myPlayerId && request.status === 'pending') {
                if (this.onRematchRequest) {
                    this.onRematchRequest(request.fromName || '对手');
                }
            }

            // 如果是自己发起的请求，监听状态变化
            if (request.from === this.myPlayerId) {
                if (request.status === 'accepted' && this.onRematchResponse) {
                    this.onRematchResponse(true);
                } else if (request.status === 'rejected' && this.onRematchResponse) {
                    this.onRematchResponse(false);
                }
            }
        });

        // 监听悔棋/求和请求
        this.listeners.requests = this.currentRoomRef.child('requests').on('value', (snapshot) => {
            const requests = snapshot.val();
            if (!requests) return;

            // 处理悔棋请求（使用时间戳防止重复处理）
            if (requests.undo && requests.undo.from !== this.myPlayerId) {
                const undoTimestamp = requests.undo.timestamp;
                if (undoTimestamp !== this._lastProcessedUndoTimestamp) {
                    this._lastProcessedUndoTimestamp = undoTimestamp;
                    console.log('[Network] 收到悔棋请求:', requests.undo);
                    if (this.onUndoRequest) {
                        this.onUndoRequest(requests.undo);
                    }
                }
            }

            // 处理求和请求（使用时间戳防止重复处理）
            if (requests.draw && requests.draw.from !== this.myPlayerId) {
                const drawTimestamp = requests.draw.timestamp;
                if (drawTimestamp !== this._lastProcessedDrawTimestamp) {
                    this._lastProcessedDrawTimestamp = drawTimestamp;
                    console.log('[Network] 收到求和请求:', requests.draw);
                    if (this.onDrawRequest) {
                        this.onDrawRequest(requests.draw);
                    }
                }
            }
        });
    },

    stopRoomListeners() {
        if (this.currentRoomRef) {
            this.currentRoomRef.off('value', this.listeners.room);
            this.currentRoomRef.child('players').off('value', this.listeners.players);
            this.currentRoomRef.child('game').off('value', this.listeners.game);
            this.currentRoomRef.child('messages').off('child_added', this.listeners.messages);
            this.currentRoomRef.child('rematchRequest').off('value', this.listeners.rematch);
            this.currentRoomRef.child('requests').off('value', this.listeners.requests);
        }
        this.listeners = {};
    },

    onRoomUpdate: null,
    onPlayersUpdate: null,
    onGameUpdate: null,
    onMessage: null,
    onOnlineCountUpdate: null,
    onOpponentLeft: null,
    onRematchRequest: null,   // 对方发起再来一局请求
    onRematchResponse: null,  // 再来一局请求被响应
    onUndoRequest: null,      // 对方发起悔棋请求
    onDrawRequest: null,      // 对方发起求和请求

    // ============ 辅助函数 ============

    createEmptyBoard() {
        const board = [];
        for (let i = 0; i < 15; i++) {
            board.push(new Array(15).fill(0));
        }
        return board;
    },

    setupDisconnectHandler() {
        if (!this.currentRoomRef) return;

        const playerRef = this.currentRoomRef.child('players').child(this.myPlayerId);

        // 当断开连接时，标记为下线但不移除（防止网络波动导致数据丢失）
        playerRef.onDisconnect().update({
            connected: false,
            lastActive: firebase.database.ServerValue.TIMESTAMP
        });

        console.log('[Network] Disconnect handler set up for player:', this.myPlayerId);
    },

    // 更新活跃时间 (心跳)
    async updateHeartbeat() {
        if (!this.currentRoomRef) return;

        await this.currentRoomRef
            .child('players')
            .child(this.myPlayerId)
            .child('lastActive')
            .set(firebase.database.ServerValue.TIMESTAMP);
    },

    /**
     * 获取对手信息
     */
    getOpponent(players) {
        if (!players) return null;

        for (const [id, player] of Object.entries(players)) {
            if (id !== this.myPlayerId) {
                return player;
            }
        }
        return null;
    },

    // ============ 匹配系统 ============

    matchmakingRef: null,
    matchmakingListener: null,
    isMatchmaking: false,
    matchmakingTimeout: null,

    /**
     * 加入匹配队列
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async joinMatchmaking() {
        // 重要：先清理之前的会话状态
        this.cleanupSession();

        if (!this.db) return { success: false, error: '网络未初始化' };
        if (this.isMatchmaking) return { success: false, error: '已在匹配中' };

        try {
            const playerName = localStorage.getItem('gomoku_player_name') || '玩家';
            const elo = parseInt(localStorage.getItem('gomoku_elo') || '1000');

            this.matchmakingRef = this.db.ref('matchmaking');

            // 先检查是否有可匹配的玩家
            const queueSnapshot = await this.matchmakingRef.once('value');
            const queue = queueSnapshot.val() || {};

            // 寻找可匹配的对手（ELO差距在200以内）
            let matchedPlayer = null;
            for (const [playerId, playerData] of Object.entries(queue)) {
                if (playerId !== this.myPlayerId) {
                    const eloDiff = Math.abs(playerData.elo - elo);
                    if (eloDiff <= 300) {  // 允许300分差距
                        matchedPlayer = { id: playerId, ...playerData };
                        break;
                    }
                }
            }

            if (matchedPlayer) {
                // 找到对手，创建房间
                return await this.createMatchedRoom(matchedPlayer);
            }

            // 没有找到对手，加入队列等待
            await this.matchmakingRef.child(this.myPlayerId).set({
                name: playerName,
                elo: elo,
                joinedAt: firebase.database.ServerValue.TIMESTAMP
            });

            // 设置断线自动移除
            this.matchmakingRef.child(this.myPlayerId).onDisconnect().remove();

            this.isMatchmaking = true;

            // 监听队列变化（等待被匹配）
            this.startMatchmakingListener();

            // 设置超时（60秒）
            this.matchmakingTimeout = setTimeout(() => {
                this.cancelMatchmaking();
                if (this.onMatchmakingTimeout) {
                    this.onMatchmakingTimeout();
                }
            }, 60000);

            console.log('Joined matchmaking queue');
            return { success: true, waiting: true };

        } catch (error) {
            console.error('Join matchmaking error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * 创建匹配房间（当找到对手时）
     */
    async createMatchedRoom(opponent) {
        try {
            // 从队列中移除双方
            await this.matchmakingRef.child(this.myPlayerId).remove();
            await this.matchmakingRef.child(opponent.id).remove();

            // 创建房间
            const roomCode = this.generateRoomCode();
            const playerName = localStorage.getItem('gomoku_player_name') || '玩家';

            const roomData = {
                code: roomCode,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                status: 'playing',  // 直接开始
                hostId: this.myPlayerId,
                matchmaking: true,  // 标记为匹配房间
                players: {
                    [this.myPlayerId]: {
                        id: this.myPlayerId,
                        name: playerName,
                        ready: true,
                        color: 'black',
                        connected: true,
                        lastActive: firebase.database.ServerValue.TIMESTAMP
                    },
                    [opponent.id]: {
                        id: opponent.id,
                        name: opponent.name,
                        ready: true,
                        color: 'white',
                        connected: true,
                        lastActive: firebase.database.ServerValue.TIMESTAMP
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

            await this.roomsRef.child(roomCode).set(roomData);

            // 设置当前房间状态
            this.currentRoom = roomCode;
            this.currentRoomRef = this.roomsRef.child(roomCode);
            this.isHost = true;
            this.myColor = 'black';
            this.isMatchmaking = false;

            console.log('Match found! Room created:', roomCode);

            // 🔥 关键修复：先调用 onMatchFound 让游戏设置回调
            // 然后再启动监听器，否则监听器触发时回调还没设置
            if (this.onMatchFound) {
                this.onMatchFound(roomCode);
            }

            // 现在可以安全启动监听器，回调已经设置好了
            this.startRoomListeners();
            this.setupDisconnectHandler();

            return { success: true, roomCode, matched: true };

        } catch (error) {
            console.error('Create matched room error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * 监听匹配队列（等待被邀请加入房间）
     */
    startMatchmakingListener() {
        if (!this.matchmakingRef) return;

        // 监听是否有人创建了包含我的房间
        this.matchmakingListener = this.roomsRef.on('child_added', async (snapshot) => {
            if (!this.isMatchmaking) return;

            const roomData = snapshot.val();
            if (roomData && roomData.matchmaking &&
                roomData.players && roomData.players[this.myPlayerId]) {
                // 找到包含我的匹配房间
                const roomCode = snapshot.key;

                // 加入这个房间
                this.currentRoom = roomCode;
                this.currentRoomRef = this.roomsRef.child(roomCode);
                this.isHost = false;
                this.myColor = 'white';
                this.isMatchmaking = false;

                // 清除超时
                if (this.matchmakingTimeout) {
                    clearTimeout(this.matchmakingTimeout);
                    this.matchmakingTimeout = null;
                }

                // 停止监听匹配
                this.stopMatchmakingListener();

                // 清理旧房间的监听器（如果有的话）
                this.stopRoomListeners();

                console.log('Match found! Joined room:', roomCode);

                // 🔥 关键修复：先调用 onMatchFound 让游戏设置回调
                if (this.onMatchFound) {
                    this.onMatchFound(roomCode);
                }

                // 现在可以安全启动监听器
                console.log('[Network] 为匹配房间设置监听器:', roomCode);
                this.startRoomListeners();
                this.setupDisconnectHandler();
            }
        });
    },

    stopMatchmakingListener() {
        if (this.roomsRef && this.matchmakingListener) {
            this.roomsRef.off('child_added', this.matchmakingListener);
            this.matchmakingListener = null;
        }
    },

    /**
     * 取消匹配
     */
    async cancelMatchmaking() {
        if (!this.isMatchmaking) return;

        try {
            // 从队列移除
            if (this.matchmakingRef) {
                await this.matchmakingRef.child(this.myPlayerId).remove();
            }

            // 清除超时
            if (this.matchmakingTimeout) {
                clearTimeout(this.matchmakingTimeout);
                this.matchmakingTimeout = null;
            }

            // 停止监听
            this.stopMatchmakingListener();

            this.isMatchmaking = false;
            console.log('Matchmaking cancelled');

        } catch (error) {
            console.error('Cancel matchmaking error:', error);
        }
    },

    // 回调函数
    onMatchFound: null,
    onMatchmakingTimeout: null,

    // ============ 观战系统 ============

    spectatorRoomRef: null,
    isSpectating: false,
    spectatorListeners: {},

    // 获取所有正在进行的对局
    async getActiveGames() {
        try {
            const snapshot = await this.db.ref('rooms')
                .orderByChild('status')
                .equalTo('playing')
                .once('value');

            const games = [];
            const now = Date.now();
            const timeLimit = 30 * 60 * 1000; // 30分钟

            snapshot.forEach(child => {
                const room = child.val();
                const roomCode = child.key;
                const players = room.players || {};
                const playerList = Object.values(players);
                const gameData = room.game || {};

                // Time filter: Only show games started within 30 minutes
                const startTime = gameData.startTime || room.createdAt || 0;
                const timeDiff = now - startTime;
                const STALE_THRESHOLD = 10 * 60 * 1000; // 10 minutes inactivity (increased)
                const NEW_ROOM_GRACE = 2 * 60 * 1000;   // 2 min grace for newly created rooms

                // Check for stale room (all players inactive for 10 min)
                let isAlive = false;
                let activePlayerCount = 0;

                // If room was created <2 min ago, consider it alive regardless
                if (timeDiff < NEW_ROOM_GRACE) {
                    isAlive = true;
                } else {
                    for (const p of playerList) {
                        // Check lastActive if available, otherwise use room creation time
                        const lastActive = p.lastActive || startTime;
                        if (now - lastActive < STALE_THRESHOLD) {
                            isAlive = true;
                            activePlayerCount++;
                        }
                    }
                }

                // If room is too old (>30m) OR no active players (>10m) -> Remove it
                if (timeDiff > timeLimit || !isAlive) {
                    console.log(`Removing stale game: ${roomCode}, age: ${Math.floor(timeDiff / 60000)}m, active: ${activePlayerCount}`);
                    // Proactive cleanup
                    this.db.ref(`rooms/${roomCode}`).remove().catch(e => console.error('Cleanup failed:', e));
                    return;
                }

                // Calculate moves
                const moveCount = gameData.board ?
                    gameData.board.flat().filter(cell => cell !== 0).length : 0;

                // Ensure at least 2 players
                if (playerList.length >= 2) {
                    games.push({
                        roomCode,
                        player1: playerList[0] || { name: 'Player 1', elo: 1000, avatar: '⚫' },
                        player2: playerList[1] || { name: 'Player 2', elo: 1000, avatar: '⚪' },
                        moveCount,
                        spectatorCount: room.spectatorCount || 0,
                        currentTurn: gameData.currentTurn || 'black',
                        startTime: startTime
                    });
                }
            });

            console.log(`Found ${games.length} active games`);
            return games;
        } catch (error) {
            console.error('Get active games error:', error);
            return [];
        }
    },

    // 加入观战
    async joinAsSpectator(roomCode) {
        try {
            const roomRef = this.db.ref(`rooms/${roomCode}`);
            const snapshot = await roomRef.once('value');

            if (!snapshot.exists()) {
                return { success: false, error: '房间不存在' };
            }

            const room = snapshot.val();

            if (room.status !== 'playing') {
                return { success: false, error: '对局尚未开始或已结束' };
            }

            // 检查观战人数限制
            const spectatorCount = room.spectatorCount || 0;
            if (spectatorCount >= 20) {
                return { success: false, error: '观战人数已满 (最多20人)' };
            }

            // 生成观战者ID
            const spectatorId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

            // 添加到观战者列表
            await roomRef.child(`spectators/${spectatorId}`).set({
                name: '观众',
                joinedAt: Date.now()
            });

            // 更新观战人数
            await roomRef.child('spectatorCount').transaction(count => (count || 0) + 1);

            // 保存状态
            this.spectatorRoomRef = roomRef;
            this.isSpectating = true;
            this.currentRoom = roomCode;
            this._spectatorId = spectatorId;


            // 开始监听
            this.startSpectatorListeners();

            // 设置断开时自动离开
            roomRef.child(`spectators/${spectatorId}`).onDisconnect().remove();
            // Firebase的onDisconnect不支持transaction，所以断线时人数由leaveSpectator处理
            // 或者使用Cloud Functions来维护计数器

            console.log('Joined as spectator:', roomCode);
            return { success: true, roomData: room };

        } catch (error) {
            console.error('Join as spectator error:', error);
            return { success: false, error: error.message };
        }
    },

    // 离开观战
    async leaveSpectator() {
        if (!this.isSpectating || !this.spectatorRoomRef) return;

        try {
            // 移除观战者
            if (this._spectatorId) {
                await this.spectatorRoomRef.child(`spectators/${this._spectatorId}`).remove();
            }

            // 更新观战人数
            await this.spectatorRoomRef.child('spectatorCount').transaction(count => Math.max(0, (count || 1) - 1));

            // 停止监听
            this.stopSpectatorListeners();

            // 重置状态
            this.spectatorRoomRef = null;
            this.isSpectating = false;
            this.currentRoom = null;
            this._spectatorId = null;

            console.log('Left spectator mode');

        } catch (error) {
            console.error('Leave spectator error:', error);
        }
    },

    // 开始观战监听
    startSpectatorListeners() {
        if (!this.spectatorRoomRef) return;

        // 监听游戏状态
        this.spectatorListeners.game = this.spectatorRoomRef.on('value', snapshot => {
            const room = snapshot.val();
            if (!room) {
                // 房间被删除
                if (this.onSpectatorGameEnd) {
                    this.onSpectatorGameEnd('房间已关闭');
                }
                this.leaveSpectator();
                return;
            }

            if (this.onSpectatorUpdate) {
                this.onSpectatorUpdate(room);
            }

            // 检测游戏结束
            if (room.status === 'finished' || room.winner) {
                if (this.onSpectatorGameEnd) {
                    this.onSpectatorGameEnd(room.winner ? `${room.winner} 获胜` : '对局结束');
                }
            }
        });

        // 监听消息 (只读)
        this.spectatorListeners.messages = this.spectatorRoomRef.child('messages').limitToLast(1).on('child_added', snapshot => {
            const msg = snapshot.val();
            if (msg && this.onMessage) {
                this.onMessage(msg);
            }
        });
    },

    // 停止观战监听
    stopSpectatorListeners() {
        if (this.spectatorRoomRef && this.spectatorListeners.game) {
            this.spectatorRoomRef.off('value', this.spectatorListeners.game);
        }
        this.spectatorListeners = {};
    },

    // 观战回调
    onSpectatorUpdate: null,
    onSpectatorGameEnd: null
};

// 导出到全局
window.Network = Network;
