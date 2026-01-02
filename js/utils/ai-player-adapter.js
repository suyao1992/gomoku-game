/**
 * ai-player-adapter.js - 客户端AI适配器
 * 在浏览器中运行,驱动AI落子逻辑
 */

window.AIPlayerAdapter = {
    // AI对局相关状态
    activeAI: null,
    aiEngine: null,
    gameWatcher: null,
    undoRequestWatcher: null, // 悔棋请求监听器
    rematchRequestWatcher: null, // 再来一局请求监听器
    currentRoomCode: null,
    isProcessing: false,
    lastAIConfig: null,  // 保存AI配置用于再战
    lastRoomCode: null,  // 保存房间号

    /**
     * 初始化AI适配器
     * @param {Object} aiConfig - 从Workers返回的AI配置
     * @param {string} roomCode - 房间代码
     */
    async init(aiConfig, roomCode) {
        if (!aiConfig || !aiConfig._isAI) {
            return; // 不是AI对手,直接返回
        }

        console.log('[AIAdapter] Initializing AI player:', aiConfig.nickname);

        // 🔧 关键修复:先清理旧的监听器!
        if (this.gameWatcher && this.currentRoomCode) {
            console.log('[AIAdapter] Cleaning up old watcher for room:', this.currentRoomCode);
            try {
                const oldRoomRef = window.Network.roomsRef.child(this.currentRoomCode);
                oldRoomRef.child('game').off('value', this.gameWatcher);
                if (this.undoRequestWatcher) {
                    oldRoomRef.child('requests/undo').off('value', this.undoRequestWatcher);
                }
                if (this.rematchRequestWatcher) {
                    oldRoomRef.child('rematchRequest').off('value', this.rematchRequestWatcher);
                }
            } catch (e) {
                console.warn('[AIAdapter] Error cleaning old watcher:', e);
            }
        }

        // 重置所有状态
        this.gameWatcher = null;
        this.undoRequestWatcher = null;
        this.rematchRequestWatcher = null;
        this.isProcessing = false;
        this.currentRoomCode = roomCode;

        this.activeAI = aiConfig;
        this.aiEngine = new GomokuAI();
        this.aiEngine.setLevel(aiConfig._aiConfig.aiLevel);

        // 💾 保存AI配置用于再战
        this.lastAIConfig = aiConfig;
        this.lastRoomCode = roomCode;
        console.log('[AIAdapter] Saved AI config for rematch:', aiConfig.nickname);

        // 开始监听游戏状态
        await this.startWatching(roomCode);
    },

    /**
     * 开始监听游戏状态
     */
    async startWatching(roomCode) {
        // 等待Network准备好
        const maxRetries = 10;
        let retries = 0;

        while (retries < maxRetries) {
            if (roomCode && window.Network && window.Network.roomsRef) {
                break;
            }
            console.log('[AIAdapter] Waiting for Network to initialize...', retries);
            await this.sleep(500);
            retries++;
        }

        if (!roomCode || !window.Network || !window.Network.roomsRef) {
            console.error('[AIAdapter] Network initialization timeout!', {
                roomCode,
                hasNetwork: !!window.Network,
                hasRoomsRef: !!window.Network?.roomsRef
            });
            return;
        }

        console.log('[AIAdapter] Network ready, starting game watcher for room:', roomCode);
        const roomRef = window.Network.roomsRef.child(roomCode);


        // 监听游戏状态变化
        this.gameWatcher = roomRef.child('game').on('value', async (snapshot) => {
            const game = snapshot.val();
            if (!game) return;

            // 检查游戏是否结束
            if (game.winner) {
                console.log('[AIAdapter] Game ended');
                this.isProcessing = false;
                return;
            }

            // 检查是否轮到AI
            const aiColor = this.getAIColor(roomCode);
            if (game.currentTurn !== aiColor) {
                return; // 不是AI的回合
            }

            // 🔧 防重复:使用isProcessing标志
            if (this.isProcessing) {
                console.log('[AIAdapter] Already processing, skipping');
                return;
            }

            console.log('[AIAdapter] AI turn detected, calculating move...');
            this.isProcessing = true; // 立即设置标志

            try {
                await this.makeAIMove(roomRef, game.board, aiColor);
            } finally {
                this.isProcessing = false; // 完成后重置
            }
        });

        // 🎯 监听悔棋请求
        this.undoRequestWatcher = roomRef.child('requests/undo').on('value', async (snapshot) => {
            const request = snapshot.val();
            if (!request) return;

            // 防止重复处理（使用时间戳）
            if (this._lastProcessedUndoTimestamp === request.timestamp) {
                console.log('[AIAdapter] Skipping duplicate undo request');
                return;
            }
            this._lastProcessedUndoTimestamp = request.timestamp;

            console.log('[AIAdapter] 收到悔棋请求，AI准备响应');
            await this.handleUndoRequest(roomRef, request);
        });

        // 🎯 监听再来一局请求
        this.rematchRequestWatcher = roomRef.child('rematchRequest').on('value', async (snapshot) => {
            const request = snapshot.val();
            if (!request) return;

            // 只处理来自玩家的请求（不是AI自己的）
            if (request.from === this.activeAI.uid) {
                return;
            }

            // 防止重复处理
            if (this._lastProcessedRematchTimestamp === request.timestamp) {
                console.log('[AIAdapter] Skipping duplicate rematch request');
                return;
            }
            this._lastProcessedRematchTimestamp = request.timestamp;

            console.log('[AIAdapter] 收到再来一局请求，AI准备响应');
            await this.handleRematchRequest(roomRef, request);
        });
    },

    /**
     * 获取AI的颜色
     */
    getAIColor(roomCode) {
        // 从Network模块获取对手颜色
        // 如果我是黑棋,AI就是白棋;反之亦然
        return Network.myColor === 'black' ? 'white' : 'black';
    },

    /**
     * AI落子
     */
    async makeAIMove(roomRef, boardData, aiColor) {
        try {
            // 1. 规范化棋盘数据
            const board = Network.normalizeBoard(boardData);

            // 2. 计算最佳落子
            const currentPlayer = aiColor === 'black' ? 1 : 2;
            const moveResult = this.aiEngine.calculateBestMoveWithScore(board, currentPlayer);

            if (!moveResult || !moveResult.move) {
                console.warn('[AIAdapter] No valid move found');
                return;
            }

            const { x, y } = moveResult.move;

            // 3. 模拟思考时间
            const complexity = this.calculateComplexity(board);
            const thinkTime = this.calculateThinkTime(complexity);

            console.log(`[AIAdapter] AI thinking for ${thinkTime}ms, will play (${x},${y})`);
            await this.sleep(thinkTime);

            // 4. 执行落子
            const pieceValue = aiColor === 'black' ? 1 : 2;

            // 更新棋盘
            await roomRef.child('game').update({
                [`board/${x}/${y}`]: pieceValue,
                currentTurn: aiColor === 'black' ? 'white' : 'black'
            });

            // 添加到移动记录
            await roomRef.child('game/moves').push({
                x, y,
                color: aiColor,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });

            // 5. 检查胜负
            const boardCopy = board.map(row => [...row]);
            boardCopy[x][y] = pieceValue;
            const winner = this.checkWin(boardCopy, x, y, pieceValue);

            if (winner) {
                await roomRef.update({
                    status: 'finished',
                    'game/winner': aiColor
                });
            }

            console.log('[AIAdapter] AI moved:', { x, y, color: aiColor });

        } catch (error) {
            console.error('[AIAdapter] Move error:', error);
        }
    },

    /**
     * 计算局面复杂度
     */
    calculateComplexity(board) {
        let pieceCount = 0;
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                if (board[i][j] !== 0) pieceCount++;
            }
        }

        // 开局复杂度低,中盘高
        if (pieceCount < 10) return 0.3;
        if (pieceCount < 50) return 0.7;
        return 0.5;
    },

    /**
     * 计算思考时间
     */
    calculateThinkTime(complexity) {
        const config = this.activeAI._aiConfig;
        const [minTime, maxTime] = config.thinkTimeRange;
        const baseDelay = minTime + (maxTime - minTime) * complexity;

        // ±20%随机抖动
        return Math.floor(baseDelay * (0.8 + Math.random() * 0.4));
    },

    /**
     * 检查五连胜负
     */
    checkWin(board, x, y, player) {
        const directions = [
            [1, 0],   // 水平
            [0, 1],   // 垂直
            [1, 1],   // 对角线 \
            [1, -1]   // 对角线 /
        ];

        for (const [dx, dy] of directions) {
            let count = 1;

            // 正方向
            for (let i = 1; i < 5; i++) {
                const nx = x + dx * i;
                const ny = y + dy * i;
                if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board[nx][ny] === player) {
                    count++;
                } else break;
            }

            // 反方向
            for (let i = 1; i < 5; i++) {
                const nx = x - dx * i;
                const ny = y - dy * i;
                if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board[nx][ny] === player) {
                    count++;
                } else break;
            }

            if (count >= 5) return true;
        }

        return false;
    },

    /**
     * 处理玩家的悔棋请求（AI响应）
     */
    async handleUndoRequest(roomRef, request) {
        // 根据AI性格决定同意概率
        const acceptProbability = {
            'fast': 0.3,   // 快棋风格：30%同意（想快速结束）
            'normal': 0.6, // 平衡风格：60%同意
            'slow': 0.8    // 慢棋风格：80%同意（更有耐心）
        }[this.activeAI._aiConfig.personality] || 0.5;

        const willAccept = Math.random() < acceptProbability;

        // 模拟AI思考时间（1-3秒）
        const thinkTime = 1000 + Math.random() * 2000;

        console.log(`[AIAdapter] AI deciding undo... (${Math.round(acceptProbability * 100)}% accept rate, will ${willAccept ? 'accept' : 'reject'})`);

        setTimeout(async () => {
            try {
                if (willAccept) {
                    await this.acceptUndo(roomRef, request);
                } else {
                    await this.rejectUndo(roomRef, request);
                }
            } catch (error) {
                console.error('[AIAdapter] Undo response error:', error);
            }
        }, thinkTime);
    },

    /**
     * AI同意悔棋
     */
    async acceptUndo(roomRef, request) {
        console.log('[AIAdapter] AI accepts undo request');

        // 1. 删除悔棋请求
        await roomRef.child('requests/undo').remove();

        // 2. 获取当前棋盘状态
        const gameSnap = await roomRef.child('game').once('value');
        const game = gameSnap.val();
        if (!game) return;

        const movesSnap = await roomRef.child('game/moves').once('value');
        const moves = movesSnap.val() || {};
        const moveKeys = Object.keys(moves).sort();

        if (moveKeys.length === 0) {
            console.warn('[AIAdapter] No moves to undo');
            return;
        }

        // 3. 删除最后一步棋
        const lastMoveKey = moveKeys[moveKeys.length - 1];
        const lastMove = moves[lastMoveKey];

        if (lastMove) {
            // 从棋盘上移除这步棋
            await roomRef.child('game').update({
                [`board/${lastMove.x}/${lastMove.y}`]: 0,
                currentTurn: lastMove.color // 切换回合到上一步的玩家
            });

            // 删除移动记录
            await roomRef.child(`game/moves/${lastMoveKey}`).remove();

            console.log('[AIAdapter] Undo completed:', lastMove);

            // 可选：发送聊天消息表示同意
            if (window.Network) {
                Network.sendMessage?.('gg.ok');
            }
        }
    },

    /**
     * AI拒绝悔棋
     */
    async rejectUndo(roomRef, request) {
        console.log('[AIAdapter] AI rejects undo request');

        // 删除悔棋请求（拒绝）
        await roomRef.child('requests/undo').remove();

        // 可选：发送拒绝消息
        if (window.Network) {
            Network.sendMessage?.('gg.no');
        }
    },

    /**
     * 处理玩家的再来一局请求（AI响应）
     */
    async handleRematchRequest(roomRef, request) {
        console.log('[AIAdapter] Handling rematch request from player');

        // AI总是同意再来一局（模拟思考1-2秒）
        const thinkTime = 1000 + Math.random() * 1000;

        console.log(`[AIAdapter] AI thinking about rematch for ${Math.round(thinkTime)}ms...`);

        setTimeout(async () => {
            try {
                console.log('[AIAdapter] AI accepts rematch request');

                // 🎯 步骤1: 更新rematch状态为accepted
                await roomRef.child('rematchRequest/status').set('accepted');

                // 🎯 步骤2: 等待一下，然后重置游戏
                await new Promise(resolve => setTimeout(resolve, 800));

                // 🎯 步骤3: 重置游戏棋盘和状态
                await roomRef.child('game').set({
                    board: this.createEmptyBoard(),
                    currentTurn: 'black',
                    moves: [],
                    winner: null,
                    startTime: firebase.database.ServerValue.TIMESTAMP
                });

                // 🎯 步骤4: 更新房间状态为playing
                await roomRef.update({
                    status: 'playing'
                });

                // 🎯 步骤5: 重置准备状态
                const playersSnapshot = await roomRef.child('players').once('value');
                const players = playersSnapshot.val() || {};
                for (const playerId of Object.keys(players)) {
                    await roomRef.child('players').child(playerId).child('ready').set(false);
                }

                // 🎯 步骤6: 清除rematch请求
                await roomRef.child('rematchRequest').remove();

                // 🎯 步骤7: 关闭结算界面
                setTimeout(() => {
                    const modal = document.getElementById('mp-result-modal');
                    if (modal) {
                        modal.remove();
                        console.log('[AIAdapter] Result modal closed');
                    }
                }, 100);

                // 发送聊天消息表示同意
                if (window.Network) {
                    Network.sendMessage?.('gg.ok');
                }

                console.log('[AIAdapter] Rematch accepted, game reset complete');
            } catch (error) {
                console.error('[AIAdapter] Rematch response error:', error);
            }
        }, thinkTime);
    },

    /**
     * 创建空棋盘
     */
    createEmptyBoard() {
        const board = [];
        for (let i = 0; i < 15; i++) {
            board.push(new Array(15).fill(0));
        }
        return board;
    },

    /**
     * 清理监听器
     */
    cleanup() {
        if (this.gameWatcher && Network.roomsRef && Network.currentRoom) {
            Network.roomsRef.child(Network.currentRoom).child('game').off('value', this.gameWatcher);
            this.gameWatcher = null;
        }
        if (this.undoRequestWatcher && Network.roomsRef && Network.currentRoom) {
            Network.roomsRef.child(Network.currentRoom).child('requests/undo').off('value', this.undoRequestWatcher);
            this.undoRequestWatcher = null;
        }
        if (this.rematchRequestWatcher && Network.roomsRef && Network.currentRoom) {
            Network.roomsRef.child(Network.currentRoom).child('rematchRequest').off('value', this.rematchRequestWatcher);
            this.rematchRequestWatcher = null;
        }
        this.activeAI = null;
    },

    /**
     * 工具函数:延迟
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
