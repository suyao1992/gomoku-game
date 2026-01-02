/**
 * RobustMatchmakingUI - 健壮匹配系统的UI控制器
 * 桥接MultiplayerUI与RobustMatchmaking核心逻辑
 */

console.log('[RobustMatchmakingUI] Loading module...');

const RobustMatchmakingUI = {
    // ========== 公共API ==========

    /**
     * 开始匹配
     */
    startMatch() {
        console.log('[RobustMatchmakingUI] Starting match...');

        if (!window.RobustMatchmaking) {
            console.error('[RobustMatchmakingUI] RobustMatchmaking not loaded');
            return;
        }

        // 显示匹配UI
        if (window.MultiplayerUI) {
            window.MultiplayerUI.showQuantumSearch();
        }

        // 启动核心匹配逻辑(带回调)
        window.RobustMatchmaking.startSearch(
            // onMatchFound
            async (roomCode, color) => {
                console.log('[RobustMatchmakingUI] Match found! Room:', roomCode, 'Color:', color);

                // 获取对手信息
                const roomSnap = await firebase.database().ref('rooms').child(roomCode).once('value');
                const roomData = roomSnap.val();

                let opponentInfo = { name: '对手', avatar: '🎮', elo: 1000 };

                if (roomData && roomData.players) {
                    const myId = window.RobustMatchmaking.playerId;
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
                    window.MultiplayerUI.gameState.opponentInfo = opponentInfo;
                    window.MultiplayerUI.gameState.myColor = color;
                    window.MultiplayerUI.gameState.currentTurn = 'black';
                    window.MultiplayerUI.gameState.roomCode = roomCode;

                    // 显示匹配成功动画
                    window.MultiplayerUI.showFateWheel(opponentInfo);

                    // 等待动画完成后启动游戏
                    setTimeout(() => {
                        if (window.game) {
                            window.game.setupOnlineGameListeners();
                            window.game.startOnlineGame();
                        }
                    }, 3000);
                } else {
                    // 降级:直接启动游戏
                    const modal = document.getElementById('matchmaking-modal');
                    if (modal) modal.classList.add('hidden');

                    if (window.game) {
                        window.game.setupOnlineGameListeners();
                        window.game.startOnlineGame();
                    }
                }
            },
            // onMatchFailed
            (error) => {
                console.error('[RobustMatchmakingUI] Match failed:', error);
                const modal = document.getElementById('matchmaking-modal');
                if (modal) modal.classList.add('hidden');
            },
            // onStatusUpdate  
            (status) => {
                console.log('[RobustMatchmakingUI] Status:', status);
            }
        );
    },

    /**
     * 取消匹配
     */
    cancel() {
        console.log('[RobustMatchmakingUI] Canceling match...');

        if (window.RobustMatchmaking) {
            window.RobustMatchmaking.cancelSearch();
        }

        if (window.MultiplayerUI) {
            window.MultiplayerUI.cancelMatching();
        }
    },

    /**
     * 显示匹配成功
     * @param {Object} opponentInfo - 对手信息
     */
    showMatchSuccess(opponentInfo) {
        console.log('[RobustMatchmakingUI] Match success:', opponentInfo);

        if (window.MultiplayerUI) {
            // 设置对手信息到gameState
            window.MultiplayerUI.gameState.opponentInfo = opponentInfo;

            // 显示匹配成功界面
            window.MultiplayerUI.showMatchSuccess(opponentInfo);
        }
    }
};

// 导出到全局
window.RobustMatchmakingUI = RobustMatchmakingUI;
console.log('[RobustMatchmakingUI] Module loaded successfully');
