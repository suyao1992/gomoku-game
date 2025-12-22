/**
 * QuickMatchFix.js - 快速匹配修复模块
 * 解决：匹配成功后另一方没有显示、取消匹配返回错误页面
 */

const QuickMatchFix = {
    initialized: false,

    init() {
        if (this.initialized) return;
        console.log('[QuickMatchFix] Initializing...');

        this.fixCancelButton();
        this.enhanceMatchmakingListener();

        this.initialized = true;
        console.log('[QuickMatchFix] Initialized');
    },

    // 修复取消匹配按钮
    fixCancelButton() {
        const cancelBtn = document.getElementById('cancel-match-btn');
        if (!cancelBtn) {
            console.warn('[QuickMatchFix] Cancel button not found');
            return;
        }

        // 克隆替换以移除旧事件
        const newBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode?.replaceChild(newBtn, cancelBtn);

        newBtn.addEventListener('click', async () => {
            console.log('[QuickMatchFix] Cancel match clicked');

            // 取消网络匹配
            if (window.Network) {
                await Network.cancelMatchmaking();
            }

            // 隐藏匹配弹窗
            document.getElementById('matchmaking-modal')?.classList.add('hidden');

            // 关键：显示主菜单而不是联机大厅
            this.returnToMainMenu();
        });

        console.log('[QuickMatchFix] Cancel button fixed');
    },

    // 返回主菜单
    returnToMainMenu() {
        console.log('[QuickMatchFix] Returning to main menu');

        // 隐藏所有联机相关界面
        document.getElementById('matchmaking-modal')?.classList.add('hidden');
        document.getElementById('online-lobby')?.classList.add('hidden');
        document.getElementById('room-waiting-modal')?.classList.add('hidden');

        // 显示主菜单
        document.getElementById('main-menu')?.classList.remove('hidden');

        // 确保游戏区域隐藏
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.display = 'none';
        }
    },

    // 增强匹配监听器
    enhanceMatchmakingListener() {
        if (!window.Network) {
            console.warn('[QuickMatchFix] Network not ready, will retry...');
            setTimeout(() => this.enhanceMatchmakingListener(), 1000);
            return;
        }

        // 保存原始的startMatchmakingListener
        const originalStartListener = Network.startMatchmakingListener.bind(Network);

        // 增强版本：添加轮询机制作为备份
        Network.startMatchmakingListener = function () {
            console.log('[QuickMatchFix] Enhanced matchmaking listener starting');

            // 调用原始监听器
            originalStartListener();

            // 添加轮询备份（每2秒检查一次）
            this._matchPollInterval = setInterval(async () => {
                if (!this.isMatchmaking) {
                    clearInterval(this._matchPollInterval);
                    return;
                }

                try {
                    // 检查是否有包含我的匹配房间
                    const snapshot = await this.roomsRef
                        .orderByChild('matchmaking')
                        .equalTo(true)
                        .once('value');

                    const rooms = snapshot.val();
                    if (!rooms) return;

                    for (const [roomCode, roomData] of Object.entries(rooms)) {
                        if (roomData.players && roomData.players[this.myPlayerId]) {
                            console.log('[QuickMatchFix] Poll found matching room:', roomCode);

                            // 清除轮询
                            clearInterval(this._matchPollInterval);

                            // 设置房间状态
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

                            // 停止匹配监听
                            this.stopMatchmakingListener();
                            this.stopRoomListeners();
                            this.startRoomListeners();
                            this.setupDisconnectHandler();

                            // 通知游戏
                            if (this.onMatchFound) {
                                this.onMatchFound(roomCode);
                            }

                            return;
                        }
                    }
                } catch (e) {
                    console.error('[QuickMatchFix] Poll error:', e);
                }
            }, 2000);
        };

        console.log('[QuickMatchFix] Matchmaking listener enhanced');
    },

    // 调试
    debug() {
        console.log('=== QuickMatchFix Debug ===');
        console.log('Network.isMatchmaking:', Network?.isMatchmaking);
        console.log('Network.currentRoom:', Network?.currentRoom);
        console.log('Network.myPlayerId:', Network?.myPlayerId);
        console.log('===========================');
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        QuickMatchFix.init();
    }, 1500);
});

window.QuickMatchFix = QuickMatchFix;
