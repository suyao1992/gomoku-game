/**
 * RobustMatchmaking.js - 万全的匹配系统
 * 
 * 核心机制：
 * 1. 心跳机制 - 每5秒更新活跃时间
 * 2. 短超时 - 15秒未心跳视为掉线
 * 3. 状态确认 - 匹配前验证对方仍在搜索
 * 4. 页面可见性 - 页面隐藏时退出队列（预约模式除外）
 * 5. 唯一会话ID - 防止重复匹配
 * 6. 实时监听 - 被匹配时立即响应
 * 7. 渐进式提示 - 优化等待体验
 * 8. 预约匹配 - 玩家可去做其他事
 */

const RobustMatchmaking = {
    // 配置
    HEARTBEAT_INTERVAL: 5000,  // 5秒心跳 (降低写入频率)
    STALE_THRESHOLD: 15000,    // 15秒超时 (适配心跳间隔)
    POLL_INTERVAL: 3000,       // 3秒轮询 (主动寻找降频)
    MAX_SEARCH_TIME: 60000,    // 60秒最大搜索时间
    RESERVATION_TIMEOUT: 300000, // 预约超时：5分钟

    // 状态
    isSearching: false,
    heartbeatTimer: null,
    pollTimer: null,
    searchStartTime: null,
    sessionId: null,
    playerId: null,

    // 实时监听相关
    resultListener: null,

    // 预约模式相关
    reservationMode: false,
    reservationTimeout: null,

    // Firebase引用
    db: null,
    queueRef: null,
    resultsRef: null,
    roomsRef: null,

    // 回调
    onMatchFound: null,
    onMatchFailed: null,
    onStatusUpdate: null,

    // 获取唯一的玩家ID
    getPlayerId() {
        const urlParams = new URLSearchParams(window.location.search);
        const testId = urlParams.get('testPlayer');
        if (testId) return testId;

        let id = localStorage.getItem('gomoku_robust_player_id');
        if (!id) {
            id = 'RP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('gomoku_robust_player_id', id);
        }
        return id;
    },

    // 生成唯一会话ID
    generateSessionId() {
        return 'S_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    },

    // 初始化
    async init() {
        if (!window.firebase || !firebase.database) {
            console.error('[RobustMatch] Firebase not ready');
            return false;
        }

        this.db = firebase.database();
        this.queueRef = this.db.ref('robustMatchQueue');
        this.resultsRef = this.db.ref('robustMatchResults');
        this.roomsRef = this.db.ref('rooms');
        this.playerId = this.getPlayerId();

        // 邀请相关
        this.invitesRef = this.db.ref('robustMatchInvites');
        this.declinedRef = this.db.ref('robustMatchDeclined');

        // 监听页面可见性变化
        this.setupVisibilityListener();

        // 清理自己的旧数据
        await this.cleanupMyData();

        // 🔔 自动开始监听邀请（任何在线玩家都可能收到邀请）
        this.startInviteListener();

        console.log('[RobustMatch] Initialized, playerId:', this.playerId);
        return true;
    },

    // 当进入大厅时调用，开始监听邀请
    startInviteListener() {
        if (!this.db) return;

        // 🔑 关键修复：邀请必须使用 Network.myPlayerId
        // 因为在线列表 /online 用的也是这个 ID
        const invitePlayerId = window.Network?.myPlayerId;
        if (!invitePlayerId) {
            console.warn('[RobustMatch] Cannot start invite listener: Network.myPlayerId not ready');
            return;
        }

        if (this.inviteListener) return; // 已在监听

        // 确保 invitesRef 已初始化
        if (!this.invitesRef) {
            this.invitesRef = this.db.ref('robustMatchInvites');
        }

        // 保存用于清理和其他操作
        this._invitePlayerId = invitePlayerId;

        console.log('[RobustMatch] Starting invite listener for:', invitePlayerId);

        this.inviteListener = this.invitesRef.child(invitePlayerId).on('value', (snap) => {
            const invite = snap.val();
            if (!invite) return;

            // 检查邀请是否过期（7秒内有效）
            if (Date.now() - invite.timestamp > 7000) {
                this.invitesRef.child(invitePlayerId).remove();
                return;
            }

            // 显示邀请弹窗
            if (window.MultiplayerUI) {
                MultiplayerUI.showGameInvite(invite);
            }
        });
    },

    // 停止监听邀请
    stopInviteListener() {
        if (this.inviteListener && this.invitesRef && this._invitePlayerId) {
            this.invitesRef.child(this._invitePlayerId).off('value', this.inviteListener);
            this.inviteListener = null;
            console.log('[RobustMatch] Invite listener stopped');
        }
    },

    // 接受邀请 - 加入邀请者的房间并同步动画
    async acceptInvite(invite) {
        console.log('[RobustMatch] Accepting invite from:', invite.inviterId);

        // 删除邀请
        const invitePlayerId = window.Network?.myPlayerId || this._invitePlayerId;
        if (this.invitesRef) {
            await this.invitesRef.child(invitePlayerId).remove().catch(() => { });
        }

        // 显示匹配界面
        if (window.MultiplayerUI) {
            MultiplayerUI.showQuantumSearch();
        }

        try {
            // 🔑 直接使用邀请中的房间号
            const roomCode = invite.roomCode;

            if (!roomCode) {
                console.warn('[RobustMatch] No roomCode in invite, starting normal match');
                if (window.RobustMatchmakingUI) {
                    RobustMatchmakingUI.startMatch();
                }
                return;
            }

            console.log('[RobustMatch] Joining inviter room:', roomCode);

            // 加入房间
            const roomRef = this.db.ref('rooms').child(roomCode);
            const myId = Network.myPlayerId;
            const myName = localStorage.getItem('gomoku_player_name') || '玩家';
            const myAvatar = window.AvatarSystem ? AvatarSystem.getCurrent().emoji : '🎮';
            const myElo = window.PlayerStats ? PlayerStats.data.competitive.elo : 1000;

            await roomRef.child('players').child(myId).set({
                name: myName,
                avatar: myAvatar,
                elo: myElo,
                color: 'white',  // 被邀请者执白
                ready: true,
                confirmed: true  // 直接写入确认状态
            });

            // 写入自己的匹配结果
            await this.db.ref('robustMatchResults').child(myId).set({
                matchedWith: invite.inviterId,
                roomCode: roomCode,
                color: 'white',
                timestamp: Date.now()
            });

            // 获取邀请者信息
            const opponentInfo = {
                name: invite.inviterName || '对手',
                avatar: invite.inviterAvatar || '🎮',
                elo: invite.inviterElo || 1000
            };

            // 设置游戏状态
            if (window.MultiplayerUI) {
                MultiplayerUI.gameState.opponentInfo = opponentInfo;
                MultiplayerUI.gameState.myColor = 'white';
                MultiplayerUI.gameState.currentTurn = 'black';
                MultiplayerUI.gameState.roomCode = roomCode;
                MultiplayerUI.gameState.myInfo = {
                    name: myName,
                    avatar: myAvatar,
                    elo: myElo
                };

                // 显示等待同步UI，监听双方确认
                MultiplayerUI.showSyncWaitingForAnimation(roomCode, opponentInfo, 'white');
            }

            // 设置网络连接
            if (window.Network && Network.roomsRef) {
                Network.currentRoom = roomCode;
                Network.currentRoomRef = Network.roomsRef.child(roomCode);
                Network.myColor = 'white';
                Network.startRoomListeners();
            }

        } catch (e) {
            console.error('[RobustMatch] Accept invite failed:', e);
            // 降级到普通匹配
            if (window.RobustMatchmakingUI) {
                RobustMatchmakingUI.startMatch();
            }
        }
    },

    // 拒绝邀请
    async declineInvite() {
        console.log('[RobustMatch] Declining invite');

        // 删除邀请
        await this.invitesRef.child(this.playerId).remove();

        // 记录拒绝，5分钟内不再打扰
        await this.declinedRef.child(this.playerId).set({
            timestamp: Date.now()
        });
    },

    // 监听页面可见性
    setupVisibilityListener() {
        document.addEventListener('visibilitychange', () => {
            // 预约模式下不取消搜索（允许玩家去其他页面）
            if (document.hidden && this.isSearching && !this.reservationMode) {
                console.log('[RobustMatch] Page hidden, cancelling search');
                this.cancelSearch();
            }
        });

        // 页面关闭前清理
        window.addEventListener('beforeunload', () => {
            if (this.isSearching) {
                this.cleanupMyData();
            }
        });
    },

    // 清理自己的数据
    async cleanupMyData() {
        try {
            // 添加 null 检查防止错误
            if (this.queueRef && this.playerId) {
                await this.queueRef.child(this.playerId).remove();
            }
            if (this.resultsRef && this.playerId) {
                await this.resultsRef.child(this.playerId).remove();
            }
        } catch (e) {
            console.warn('[RobustMatch] Cleanup failed:', e);
        }
    },

    // 清理所有过期队列数据
    async cleanupStaleQueue() {
        try {
            const snapshot = await this.queueRef.once('value');
            const queue = snapshot.val() || {};
            const now = Date.now();

            for (const [pid, pdata] of Object.entries(queue)) {
                // 跳过自己
                if (pid === this.playerId) continue;

                // 清理心跳超时的
                if (!pdata.heartbeat || (now - pdata.heartbeat) > this.STALE_THRESHOLD) {
                    console.log('[RobustMatch] Removing stale player:', pid);
                    await this.queueRef.child(pid).remove();
                }
            }
        } catch (e) {
            console.warn('[RobustMatch] Stale cleanup failed:', e);
        }
    },

    // 开始搜索
    async startSearch(onMatchFound, onMatchFailed, onStatusUpdate) {
        console.log('[RobustMatch] Starting search...');

        if (this.isSearching) {
            console.warn('[RobustMatch] Already searching');
            return false;
        }

        if (!this.db) {
            await this.init();
        }

        this.onMatchFound = onMatchFound;
        this.onMatchFailed = onMatchFailed;
        this.onStatusUpdate = onStatusUpdate;
        this.isSearching = true;
        this.searchStartTime = Date.now();
        this.sessionId = this.generateSessionId();
        this.skipList = {}; // 重置跳过列表
        this.reservationMode = false; // 重置预约模式

        // 清理旧数据
        await this.cleanupMyData();

        // 清理所有过期队列数据（激进清理）
        await this.cleanupStaleQueue();

        // 加入队列
        const playerData = {
            name: localStorage.getItem('gomoku_player_name') || '玩家',
            elo: window.PlayerStats ? PlayerStats.data.competitive.elo : 1000,
            avatar: window.AvatarSystem ? AvatarSystem.getCurrent().emoji : '🎮',
            status: 'searching',
            heartbeat: Date.now(),
            sessionId: this.sessionId,
            joinedAt: firebase.database.ServerValue.TIMESTAMP
        };

        await this.queueRef.child(this.playerId).set(playerData);

        // 设置断线自动移除
        this.queueRef.child(this.playerId).onDisconnect().remove();

        // 启动心跳
        this.startHeartbeat();

        // 🚀 启动实时监听器（被匹配时立即响应）
        this.startResultListener();

        // 启动搜索轮询（主动寻找对手）
        this.startSearchPolling();

        console.log('[RobustMatch] Search started, sessionId:', this.sessionId);
        return true;
    },

    // 心跳更新
    startHeartbeat() {
        this.heartbeatTimer = setInterval(async () => {
            if (!this.isSearching) {
                this.stopHeartbeat();
                return;
            }

            try {
                await this.queueRef.child(this.playerId).update({
                    heartbeat: Date.now()
                });
            } catch (e) {
                console.warn('[RobustMatch] Heartbeat failed:', e);
            }
        }, this.HEARTBEAT_INTERVAL);
    },

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    },

    // 🚀 实时监听匹配结果（被匹配时立即响应）
    startResultListener() {
        if (!this.resultsRef || !this.playerId) return;

        console.log('[RobustMatch] Result listener started');

        this.resultListener = this.resultsRef.child(this.playerId).on('value', async (snap) => {
            const result = snap.val();

            // 验证是否是有效的匹配结果
            if (result && result.roomCode && result.sessionId === this.sessionId) {
                console.log('[RobustMatch] 🎯 Matched via listener!', result.roomCode);
                await this.joinAsGuest(result.roomCode);
            }
        });
    },

    // 停止实时监听器
    stopResultListener() {
        if (this.resultListener && this.resultsRef && this.playerId) {
            this.resultsRef.child(this.playerId).off('value', this.resultListener);
            this.resultListener = null;
            console.log('[RobustMatch] Result listener stopped');
        }
    },

    // 搜索轮询（只负责主动寻找对手，被匹配由监听器处理）
    startSearchPolling() {
        this.pollTimer = setInterval(async () => {
            if (!this.isSearching) {
                this.stopPolling();
                return;
            }

            // 预约模式下不超时（有单独的超时机制）
            if (!this.reservationMode) {
                // 检查超时
                if (Date.now() - this.searchStartTime > this.MAX_SEARCH_TIME) {
                    console.log('[RobustMatch] Search timeout');
                    this.cancelSearch();
                    if (this.onMatchFailed) this.onMatchFailed('匹配超时');
                    return;
                }
            }

            try {
                // 🚀 获取队列人数并通知 UI
                const queueSnap = await this.queueRef.once('value');
                const queueCount = queueSnap.numChildren();
                const otherPlayersCount = Math.max(0, queueCount - 1); // 减去自己

                // 通知 UI 更新在线人数和加速模式
                if (window.MultiplayerUI && MultiplayerUI.phase === 'matching') {
                    MultiplayerUI.updateQueueInfo(otherPlayersCount);
                }

                // 检查自己的队列状态是否已被改为matching（对方正在创建房间）
                const myQueueSnap = await this.queueRef.child(this.playerId).once('value');
                const myQueue = myQueueSnap.val();
                if (myQueue && myQueue.status === 'matching') {
                    console.log('[RobustMatch] I am being matched by:', myQueue.matchedBy);
                    // 等待对方创建房间，不要去找其他对手
                    return;
                }

                // 主动寻找对手
                await this.findOpponent();

            } catch (e) {
                console.error('[RobustMatch] Poll error:', e);
            }
        }, this.POLL_INTERVAL);
    },

    stopPolling() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
    },

    // 寻找对手
    async findOpponent() {
        const queueSnap = await this.queueRef.once('value');
        const queue = queueSnap.val() || {};
        const now = Date.now();

        // 初始化跳过列表（失败过的对手暂时不再尝试）
        if (!this.skipList) this.skipList = {};

        for (const [pid, pdata] of Object.entries(queue)) {
            // 跳过自己
            if (pid === this.playerId) continue;

            // 必须是 "searching" 状态
            if (pdata.status !== 'searching') continue;

            // 心跳必须在阈值内
            if (!pdata.heartbeat || (now - pdata.heartbeat) > this.STALE_THRESHOLD) {
                console.log('[RobustMatch] Skipping stale player:', pid);
                // 清理过期数据
                this.queueRef.child(pid).remove();
                continue;
            }

            // 跳过最近失败过的对手（5秒内）
            if (this.skipList[pid] && (now - this.skipList[pid]) < 5000) {
                continue;
            }

            // ⚡ 关键：只有 ID 较小的玩家主动发起匹配，避免双向竞争
            if (this.playerId > pid) {
                console.log('[RobustMatch] Waiting for opponent to initiate (my ID is larger)');
                return; // 等待对方来匹配我
            }

            // 找到有效对手！尝试匹配
            console.log('[RobustMatch] Found valid opponent, initiating match:', pid);
            const success = await this.tryMatch(pid, pdata);
            if (success) {
                this.skipList = {}; // 成功后清空跳过列表
                return;
            } else {
                // 失败后记录，避免立即重试
                this.skipList[pid] = now;
            }
        }
    },

    // 尝试匹配（简化版 - 不使用事务）
    async tryMatch(opponentId, opponentData) {
        try {
            const opponentRef = this.queueRef.child(opponentId);

            // 步骤1: 再次读取对方当前状态（确保最新）
            const currentSnap = await opponentRef.once('value');
            const current = currentSnap.val();

            console.log('[RobustMatch] Opponent current state:', JSON.stringify(current));

            if (!current) {
                console.log('[RobustMatch] Opponent no longer in queue');
                return false;
            }

            if (current.status !== 'searching') {
                console.log('[RobustMatch] Opponent not searching, status:', current.status);
                return false;
            }

            // 步骤2: 尝试更新对方状态为 matching
            // 使用 update 并设置我的 ID 作为 matchedBy
            await opponentRef.update({
                status: 'matching',
                matchedBy: this.playerId
            });

            // 步骤3: 再次验证 - 确认是我匹配的
            const verifySnap = await opponentRef.once('value');
            const verified = verifySnap.val();

            if (!verified || verified.matchedBy !== this.playerId) {
                console.log('[RobustMatch] Verification failed - someone else matched first');
                return false;
            }

            console.log('[RobustMatch] Successfully claimed opponent');

            // 步骤4: 创建房间
            await this.createMatchedRoom(opponentId, opponentData);
            return true;

        } catch (e) {
            console.error('[RobustMatch] Match attempt failed:', e);
            return false;
        }
    },

    // 创建匹配房间
    async createMatchedRoom(opponentId, opponentData) {
        const roomCode = this.generateRoomCode();
        const myName = localStorage.getItem('gomoku_player_name') || '玩家';
        const myElo = window.PlayerStats ? PlayerStats.data.competitive.elo : 1000;
        const myAvatar = window.AvatarSystem ? AvatarSystem.getCurrent().emoji : '🎮';

        console.log('[RobustMatch] Creating room:', roomCode);

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
                    avatar: myAvatar,
                    color: 'black',
                    ready: true,
                    connected: true
                },
                [opponentId]: {
                    id: opponentId,
                    name: opponentData.name || '对手',
                    elo: opponentData.elo || 1000,
                    avatar: opponentData.avatar || '❓',
                    color: 'white',
                    ready: true,
                    connected: false
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

        // 通知对方
        await this.resultsRef.child(opponentId).set({
            roomCode: roomCode,
            matchedBy: this.playerId,
            sessionId: opponentData.sessionId,
            timestamp: Date.now()
        });

        // 清理队列
        await this.queueRef.child(this.playerId).remove();
        await this.queueRef.child(opponentId).remove();

        // 停止搜索
        this.stopSearch();

        // 设置Network状态并通知
        this.setupNetwork(roomCode, true, 'black');

        if (this.onMatchFound) {
            this.onMatchFound(roomCode, 'black');
        }
    },

    // 作为房客加入
    async joinAsGuest(roomCode) {
        console.log('[RobustMatch] Joining as guest:', roomCode);

        try {
            // 🔥 关键检查：验证房间是否有效（存在、未结束、没有赢家）
            const roomSnap = await this.roomsRef.child(roomCode).once('value');
            const roomData = roomSnap.val();

            if (!roomData) {
                console.warn('[RobustMatch] Room does not exist:', roomCode);
                await this.cleanupMyData();
                return;
            }

            if (roomData.status === 'finished' || roomData.game?.winner) {
                console.warn('[RobustMatch] Room is already finished:', roomCode);
                // 清理这个废弃的房间
                await this.roomsRef.child(roomCode).remove();
                await this.cleanupMyData();
                return;
            }

            // 更新连接状态和真实ELO
            const myElo = window.PlayerStats ? PlayerStats.data.competitive.elo : 1000;
            const myName = localStorage.getItem('gomoku_player_name') || '玩家';
            const myAvatar = window.AvatarSystem ? AvatarSystem.getCurrent().emoji : '🎮';
            await this.roomsRef.child(roomCode).child('players').child(this.playerId).update({
                connected: true,
                elo: myElo,
                name: myName,
                avatar: myAvatar
            });

            // 清理队列数据
            await this.cleanupMyData();

            // 停止搜索
            this.stopSearch();

            // 设置Network状态
            this.setupNetwork(roomCode, false, 'white');

            if (this.onMatchFound) {
                this.onMatchFound(roomCode, 'white');
            }
        } catch (e) {
            console.error('[RobustMatch] Join failed:', e);
            await this.cleanupMyData();
        }
    },

    // 设置Network模块
    setupNetwork(roomCode, isHost, color) {
        if (!window.Network) return;

        Network.currentRoom = roomCode;
        Network.currentRoomRef = Network.roomsRef.child(roomCode);
        Network.isHost = isHost;
        Network.myColor = color;
        Network.myPlayerId = this.playerId;
        Network.isMatchmaking = false;

        // 🔥 关键：先设置请求回调，再启动监听器
        this.setupRequestCallbacks();

        Network.stopRoomListeners();
        Network.startRoomListeners();
        Network.setupDisconnectHandler();
    },

    // 设置悔棋/求和请求回调
    setupRequestCallbacks() {
        if (!window.Network) return;

        // 收到悔棋请求
        Network.onUndoRequest = (request) => {
            console.log('[RobustMatch] 收到悔棋请求:', request);
            if (window.MultiplayerUI) {
                MultiplayerUI.showUndoRequestModal(request);
            }
        };

        // 收到求和请求
        Network.onDrawRequest = (request) => {
            console.log('[RobustMatch] 收到求和请求:', request);
            if (window.MultiplayerUI) {
                MultiplayerUI.showDrawRequestModal(request);
            }
        };
    },

    // 停止搜索（内部）
    stopSearch() {
        this.isSearching = false;
        this.stopHeartbeat();
        this.stopPolling();
        this.stopResultListener(); // 🚀 停止实时监听器
    },

    // 取消搜索（用户主动）
    async cancelSearch() {
        console.log('[RobustMatch] Cancelling search');
        this.stopSearch();

        // 清理预约模式
        if (this.reservationTimeout) {
            clearTimeout(this.reservationTimeout);
            this.reservationTimeout = null;
        }
        this.reservationMode = false;

        // 隐藏预约指示器
        if (window.MultiplayerUI) {
            MultiplayerUI.hideReservationIndicator();
        }

        await this.cleanupMyData();
    },

    // 进入预约模式
    async enterReservationMode() {
        if (!this.isSearching) return;

        this.reservationMode = true;
        this.invitedPlayers = {}; // 已邀请的玩家列表
        this.currentInviteTarget = null; // 当前邀请目标
        this.inviteQueue = []; // 待邀请队列
        console.log('[RobustMatch] Entered reservation mode');

        // 🔑 预先创建房间，以便被邀请者加入
        try {
            const roomCode = this.generateRoomCode();
            const myId = Network.myPlayerId;
            const myName = localStorage.getItem('gomoku_player_name') || '玩家';
            const myAvatar = window.AvatarSystem ? AvatarSystem.getCurrent().emoji : '🎮';
            const myElo = window.PlayerStats ? PlayerStats.data.competitive.elo : 1000;

            // 创建房间 - 包含完整的 game 数据
            await this.db.ref('rooms').child(roomCode).set({
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                status: 'waiting',
                players: {
                    [myId]: {
                        name: myName,
                        avatar: myAvatar,
                        elo: myElo,
                        color: 'black',  // 预约方执黑
                        ready: true,
                        isHost: true,
                        connected: true,
                        lastActive: firebase.database.ServerValue.TIMESTAMP
                    }
                },
                // 🔥 必须包含 game 数据，否则游戏无法正常运行
                game: {
                    board: this.createEmptyBoard(),
                    currentTurn: 'black',
                    moves: [],
                    winner: null,
                    startTime: null
                }
            });

            // 写入匹配结果，以便被邀请者能找到房间
            await this.db.ref('robustMatchResults').child(myId).set({
                roomCode: roomCode,
                color: 'black',
                timestamp: Date.now()
            });

            this.reservationRoomCode = roomCode;
            console.log('[RobustMatch] Reservation room created:', roomCode);

            // 🔥 监听房间，当有人加入时触发匹配成功
            const roomPlayersRef = this.db.ref('rooms').child(roomCode).child('players');
            this.reservationRoomListener = roomPlayersRef.on('child_added', async (snap) => {
                const joinedId = snap.key;
                if (joinedId === myId) return; // 跳过自己

                const playerData = snap.val();
                console.log('[RobustMatch] Player joined reservation room:', joinedId, playerData);

                // 停止监听和邀请流程
                roomPlayersRef.off('child_added', this.reservationRoomListener);
                this.stopInviteMonitor();

                // 保存对手信息
                const opponentInfo = {
                    name: playerData.name || '对手',
                    avatar: playerData.avatar || '🎮',
                    elo: playerData.elo || 1000
                };

                // 设置游戏状态
                if (window.MultiplayerUI) {
                    MultiplayerUI.gameState.opponentInfo = opponentInfo;
                    MultiplayerUI.gameState.myColor = 'black';
                    MultiplayerUI.gameState.currentTurn = 'black';
                    MultiplayerUI.gameState.roomCode = roomCode;
                    MultiplayerUI.gameState.myInfo = {
                        name: myName,
                        avatar: myAvatar,
                        elo: myElo
                    };

                    // 🔥 立即禁用预约模式，防止 onMatchSuccess 再次触发通知
                    this.reservationMode = false;
                    this.stopSearch();

                    // 显示匹配成功通知（仍在匹配界面上）
                    MultiplayerUI.showReservationMatchNotification(opponentInfo);
                }

                // ⚠️ 不在这里设置 Network.setupRoomListeners
                // 游戏启动应该在 setupAnimationWatcher 中完成
            });
        } catch (e) {
            console.error('[RobustMatch] Failed to create reservation room:', e);
        }

        // 设置预约超时
        this.reservationTimeout = setTimeout(() => {
            console.log('[RobustMatch] Reservation timeout');
            this.cancelSearch();
            if (this.onMatchFailed) this.onMatchFailed('预约超时');
        }, this.RESERVATION_TIMEOUT);

        // 5秒后开始邀请流程
        this.inviteStartDelay = setTimeout(() => {
            this.startSequentialInvites();
        }, 5000);

        // 更新 UI
        if (window.MultiplayerUI) {
            MultiplayerUI.showReservationUI();
        }
    },

    // 开始按顺序邀请
    async startSequentialInvites() {
        if (!this.db || !this.reservationMode) return;

        this.invitesRef = this.db.ref('robustMatchInvites');
        this.declinedRef = this.db.ref('robustMatchDeclined');
        this.settingsRef = this.db.ref('settings');
        this.onlineRef = this.db.ref('online');

        console.log('[RobustMatch] Starting sequential invites');

        // 获取可邀请的玩家列表
        await this.refreshInviteQueue();

        // 开始邀请第一个
        this.inviteNextPlayer();

        // 监听新上线玩家
        this.onlineListener = this.onlineRef.on('child_added', async (snap) => {
            if (!this.reservationMode) return;

            const playerId = snap.key;
            const playerData = snap.val();

            // 检查是否可以加入队列
            if (await this.canInvitePlayer(playerId, playerData)) {
                this.inviteQueue.push({ id: playerId, ...playerData });
                console.log('[RobustMatch] New player added to queue:', playerId);
            }
        });
    },

    // 刷新邀请队列
    async refreshInviteQueue() {
        try {
            const onlineSnap = await this.onlineRef.once('value');
            const onlinePlayers = onlineSnap.val() || {};

            // 转换为数组并按上线时间排序
            const playerList = [];
            for (const [id, data] of Object.entries(onlinePlayers)) {
                if (await this.canInvitePlayer(id, data)) {
                    playerList.push({ id, ...data });
                }
            }

            // 按 lastActive 时间排序（早的优先）
            playerList.sort((a, b) => (a.lastActive || 0) - (b.lastActive || 0));

            this.inviteQueue = playerList;
            console.log('[RobustMatch] Invite queue refreshed:', this.inviteQueue.length, 'players');
        } catch (e) {
            console.warn('[RobustMatch] Failed to refresh queue:', e);
            this.inviteQueue = [];
        }
    },

    // 检查玩家是否可以被邀请
    async canInvitePlayer(playerId, playerData) {
        // 跳过自己（使用 Network.myPlayerId，因为在线列表用的也是这个 ID）
        const myOnlineId = window.Network?.myPlayerId;
        if (playerId === myOnlineId) return false;

        // 已邀请过
        if (this.invitedPlayers[playerId]) return false;

        // 检查玩家状态：只邀请空闲/PVE/故事模式的玩家
        const status = playerData?.status || 'idle';
        if (['matching', 'playing', 'room'].includes(status)) {
            return false;
        }

        try {
            // 检查是否设置了免打扰
            const settingsSnap = await this.settingsRef.child(playerId).once('value');
            const settings = settingsSnap.val();
            if (settings?.inviteDisabled) {
                console.log('[RobustMatch] Player has invites disabled:', playerId);
                return false;
            }

            // 检查是否在冷却期
            const declinedSnap = await this.declinedRef.child(playerId).once('value');
            const declined = declinedSnap.val();
            if (declined && Date.now() - declined.timestamp < 5 * 60 * 1000) {
                console.log('[RobustMatch] Player in cooldown:', playerId);
                return false;
            }
        } catch (e) {
            console.warn('[RobustMatch] Check failed for:', playerId, e);
        }

        return true;
    },

    // 邀请下一个玩家
    inviteNextPlayer() {
        if (!this.reservationMode) return;

        // 清除上一个邀请的超时
        if (this.inviteTimeout) {
            clearTimeout(this.inviteTimeout);
            this.inviteTimeout = null;
        }

        // 获取下一个目标
        while (this.inviteQueue.length > 0) {
            const target = this.inviteQueue.shift();
            if (!this.invitedPlayers[target.id]) {
                this.sendInviteToPlayer(target);
                return;
            }
        }

        console.log('[RobustMatch] No more players to invite, waiting for new players...');
    },

    // 发送邀请给指定玩家
    async sendInviteToPlayer(target) {
        if (!this.reservationMode) return;

        this.currentInviteTarget = target.id;
        this.invitedPlayers[target.id] = true;

        console.log('[RobustMatch] Sending invite to:', target.id, target.name || '');

        // 🔑 使用 Network.myPlayerId，与在线列表和房间创建一致
        const myOnlineId = window.Network?.myPlayerId;

        const inviteData = {
            inviterId: myOnlineId,  // 使用在线列表 ID
            inviterName: localStorage.getItem('gomoku_player_name') || '玩家',
            inviterAvatar: window.AvatarSystem ? AvatarSystem.getCurrent().emoji : '🎮',
            inviterElo: window.PlayerStats ? PlayerStats.data.competitive.elo : 1000,
            timestamp: Date.now(),
            roomCode: this.reservationRoomCode  // 直接传递房间号
        };

        try {
            await this.invitesRef.child(target.id).set(inviteData);

            // 7秒超时，换下一个
            this.inviteTimeout = setTimeout(() => {
                console.log('[RobustMatch] Invite timeout for:', target.id);
                // 删除超时的邀请
                this.invitesRef.child(target.id).remove().catch(() => { });
                // 邀请下一个
                this.inviteNextPlayer();
            }, 7000);

        } catch (e) {
            console.warn('[RobustMatch] Failed to send invite:', e);
            this.inviteNextPlayer();
        }
    },

    // 处理邀请被接受
    onInviteAccepted(playerId) {
        console.log('[RobustMatch] Invite accepted by:', playerId);

        // 清除超时
        if (this.inviteTimeout) {
            clearTimeout(this.inviteTimeout);
            this.inviteTimeout = null;
        }

        // 删除邀请
        if (this.invitesRef) {
            this.invitesRef.child(playerId).remove().catch(() => { });
        }

        // 停止邀请流程（匹配将通过正常流程完成）
        this.stopInviteMonitor();
    },

    // 处理邀请被拒绝
    onInviteDeclined(playerId) {
        console.log('[RobustMatch] Invite declined by:', playerId);

        // 清除超时
        if (this.inviteTimeout) {
            clearTimeout(this.inviteTimeout);
            this.inviteTimeout = null;
        }

        // 邀请下一个
        this.inviteNextPlayer();
    },

    // 停止邀请监听
    stopInviteMonitor() {
        if (this.inviteStartDelay) {
            clearTimeout(this.inviteStartDelay);
            this.inviteStartDelay = null;
        }
        if (this.inviteTimeout) {
            clearTimeout(this.inviteTimeout);
            this.inviteTimeout = null;
        }
        if (this.onlineListener && this.onlineRef) {
            this.onlineRef.off('child_added', this.onlineListener);
            this.onlineListener = null;
        }
        this.currentInviteTarget = null;
        this.inviteQueue = [];
    },

    // 取消预约
    cancelReservation(reason = '已取消') {
        this.stopInviteMonitor();
        this.cancelSearch();
        if (window.UI) {
            UI.showToast(reason, 'info');
        }
    },

    // 工具函数
    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    createEmptyBoard() {
        return Array(15).fill(null).map(() => Array(15).fill(0));
    },

    debug() {
        console.log('=== RobustMatchmaking Debug ===');
        console.log('playerId:', this.playerId);
        console.log('sessionId:', this.sessionId);
        console.log('isSearching:', this.isSearching);
        console.log('searchStartTime:', this.searchStartTime);
        console.log('heartbeatTimer:', !!this.heartbeatTimer);
        console.log('pollTimer:', !!this.pollTimer);
        console.log('================================');
    }
};

// 覆盖快速匹配按钮 - 集成MultiplayerUI
const RobustMatchmakingUI = {
    timerInterval: null,
    timerSeconds: 0,

    init() {
        const btn = document.getElementById('quick-match-btn');
        if (!btn) return;

        const newBtn = btn.cloneNode(true);
        btn.parentNode?.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', () => this.startMatch());

        const cancelBtn = document.getElementById('cancel-match-btn');
        if (cancelBtn) {
            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode?.replaceChild(newCancelBtn, cancelBtn);
            newCancelBtn.addEventListener('click', () => this.cancelMatch());
        }

        console.log('[RobustMatchUI] Buttons initialized');
    },

    async startMatch() {
        console.log('[RobustMatchUI] Starting match with quantum search UI');

        // 显示匹配界面 - 使用MultiplayerUI的量子搜索
        if (window.MultiplayerUI) {
            MultiplayerUI.showQuantumSearch();
        } else {
            // 降级：使用原来的界面
            document.getElementById('matchmaking-modal')?.classList.remove('hidden');
        }

        // 计时器
        this.timerSeconds = 0;
        const updateTimer = () => {
            this.timerSeconds++;
            const timerEl = document.getElementById('quantum-timer') || document.getElementById('matchmaking-timer');
            if (timerEl) {
                const min = Math.floor(this.timerSeconds / 60).toString().padStart(2, '0');
                const sec = (this.timerSeconds % 60).toString().padStart(2, '0');
                timerEl.textContent = `${min}:${sec}`;
            }
            // 更新进度条
            const progressBar = document.querySelector('.quantum-progress-bar');
            if (progressBar) {
                const progress = Math.min(30 + (this.timerSeconds * 2), 95);
                progressBar.style.width = `${progress}%`;
            }
        };
        this.timerInterval = setInterval(updateTimer, 1000);

        // 使用 RobustMatchmaking 核心逻辑
        try {
            // 设置游戏监听器
            if (window.game) {
                game.setupOnlineGameListeners();
            }

            const success = await RobustMatchmaking.startSearch(
                // onMatchFound
                (roomCode, color) => {
                    this.stopTimer();
                    console.log('[RobustMatchUI] Match found via Robust:', roomCode);
                    this.onMatchSuccess(roomCode, color);
                },
                // onMatchFailed
                (error) => {
                    this.stopTimer();
                    console.error('[RobustMatchUI] Match failed:', error);
                    document.getElementById('matchmaking-modal')?.classList.add('hidden');
                    document.getElementById('main-menu')?.classList.remove('hidden');
                    if (window.UI) UI.showToast(error || '匹配失败', 'error');
                },
                // onStatusUpdate
                (status) => {
                    console.log('[RobustMatchUI] Status:', status);
                }
            );

            if (!success) {
                this.stopTimer();
                if (window.UI) UI.showToast('无法启动匹配', 'error');
            }
        } catch (e) {
            this.stopTimer();
            console.error('[RobustMatchUI] Match error:', e);
            document.getElementById('matchmaking-modal')?.classList.add('hidden');
            document.getElementById('main-menu')?.classList.remove('hidden');
            if (window.UI) UI.showToast('匹配系统异常', 'error');
        }
    },

    // 匹配成功后的动画流程
    async onMatchSuccess(roomCode, color) {
        console.log('[RobustMatchUI] Match success! Room:', roomCode, 'Color:', color);

        // 获取房间数据以显示对手信息
        const roomSnap = await firebase.database().ref('rooms').child(roomCode).once('value');
        const roomData = roomSnap.val();

        let opponentInfo = { name: '对手', avatar: '🎮', elo: 1000 };

        if (roomData && roomData.players) {
            const myId = Network.myPlayerId;
            for (const [pid, pdata] of Object.entries(roomData.players)) {
                if (pid !== myId) {
                    opponentInfo = {
                        name: pdata.name || '对手',
                        avatar: pdata.avatar || '🎮',
                        elo: pdata.elo || 1000
                    };
                    break;
                }
            }
        }

        if (window.MultiplayerUI) {
            // 设置游戏状态
            MultiplayerUI.gameState.opponentInfo = opponentInfo;
            MultiplayerUI.gameState.myColor = color;
            MultiplayerUI.gameState.currentTurn = 'black';

            // 🔥 设置我的信息（确保ELO正确显示）
            MultiplayerUI.gameState.myInfo = {
                name: localStorage.getItem('gomoku_player_name') || '玩家',
                avatar: window.AvatarSystem ? AvatarSystem.getCurrent().emoji : '🎮',
                elo: window.PlayerStats ? PlayerStats.data.competitive.elo : 1000
            };

            // 保存房间信息供后续使用
            MultiplayerUI.gameState.roomCode = roomCode;

            // 🚀 预约模式下：显示通知让预约方确认
            if (window.RobustMatchmaking && RobustMatchmaking.reservationMode) {
                console.log('[RobustMatchUI] Reservation mode - showing notification');
                // 清除预约超时
                if (RobustMatchmaking.reservationTimeout) {
                    clearTimeout(RobustMatchmaking.reservationTimeout);
                    RobustMatchmaking.reservationTimeout = null;
                }
                RobustMatchmaking.reservationMode = false;
                RobustMatchmaking.stopInviteMonitor();

                // 显示匹配成功通知
                MultiplayerUI.showReservationMatchNotification(opponentInfo);
                return;
            }

            // ✅ 快速匹配 / 被邀请方接受：直接进入动画流程
            console.log('[RobustMatchUI] Quick match - starting animation directly');
            MultiplayerUI.showFateWheel(opponentInfo);
            this.setupAnimationWatcher(roomCode, color);
        } else {
            // 降级：直接开始游戏
            document.getElementById('matchmaking-modal')?.classList.add('hidden');
            this.startGame(roomCode, color);
        }
    },

    // 监听动画完成后开始游戏
    setupAnimationWatcher(roomCode, color) {
        const checkGameStart = setInterval(() => {
            if (window.MultiplayerUI && MultiplayerUI.phase === 'playing') {
                clearInterval(checkGameStart);
                this.startGame(roomCode, color);
            }
        }, 100);

        // 超时保护
        setTimeout(() => {
            clearInterval(checkGameStart);
            if (window.MultiplayerUI && MultiplayerUI.phase !== 'playing') {
                console.warn('[RobustMatchUI] Animation timeout, force starting game');
                this.startGame(roomCode, color);
            }
        }, 10000);
    },

    // 开始游戏
    async startGame(roomCode, color) {
        console.log('[RobustMatchUI] Starting game, room:', roomCode);

        document.getElementById('matchmaking-modal')?.classList.add('hidden');

        // 🔥 确保网络连接已设置
        if (window.Network && Network.roomsRef) {
            Network.currentRoom = roomCode;
            Network.currentRoomRef = Network.roomsRef.child(roomCode);
            Network.myColor = color;
            Network.startRoomListeners();
        }

        if (window.game) {
            game.setupOnlineGameListeners();
            game.startOnlineGame();
        }

        // 注意：enterGamePhase 已由 MultiplayerUI.showCountdown 结束时自动调用
        // 这里不需要再次调用，否则会重复隐藏/显示 UI 元素
    },

    async cancelMatch() {
        console.log('[RobustMatchUI] Cancelling match');
        this.stopTimer();
        await RobustMatchmaking.cancelSearch();
        document.getElementById('matchmaking-modal')?.classList.add('hidden');
        document.getElementById('main-menu')?.classList.remove('hidden');

        if (window.MultiplayerUI) {
            MultiplayerUI.cleanup();
        }
    },

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
};

// 初始化 - 页面加载后自动初始化匹配系统
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
        // 初始化 UI 按钮
        RobustMatchmakingUI.init();

        // 🔔 自动初始化匹配系统，以便接收邀请
        // 即使玩家不点击匹配，也能收到其他玩家的邀请
        await RobustMatchmaking.init();

        console.log('[RobustMatchmaking] System ready, invite listener active');
    }, 2000);
});

window.RobustMatchmaking = RobustMatchmaking;
window.RobustMatchmakingUI = RobustMatchmakingUI;
