/**
 * MultiplayerFix.js - 简化的联机对战修复模块
 * 解决：颜色分配、准备状态、同步问题
 */

const MultiplayerFix = {
    // 初始化修复
    init() {
        console.log('[MultiplayerFix] Initializing...');

        // 确保使用正确的playerId
        this.ensureUniquePlayerId();

        // 修复准备按钮
        this.fixReadyButton();

        console.log('[MultiplayerFix] Initialized, playerId:', Network.myPlayerId);
    },

    // 确保在同一浏览器测试时使用不同的playerId
    ensureUniquePlayerId() {
        // 检查是否需要为测试生成临时ID
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('testPlayer')) {
            // 使用URL参数指定的玩家ID进行测试
            const testId = urlParams.get('testPlayer');
            if (testId) {
                Network.myPlayerId = testId;
                console.log('[MultiplayerFix] Using test player ID:', testId);
            }
        }
    },

    // 修复准备按钮点击
    fixReadyButton() {
        const readyBtn = document.getElementById('ready-btn');
        if (!readyBtn) return;

        // 移除旧的事件监听器，添加新的
        const newBtn = readyBtn.cloneNode(true);
        readyBtn.parentNode?.replaceChild(newBtn, readyBtn);

        newBtn.addEventListener('click', async () => {
            console.log('[MultiplayerFix] Ready button clicked');

            if (!Network.currentRoomRef || !Network.myPlayerId) {
                console.error('[MultiplayerFix] No room or player ID');
                return;
            }

            try {
                // 直接读取当前状态
                const snapshot = await Network.currentRoomRef
                    .child('players')
                    .child(Network.myPlayerId)
                    .child('ready')
                    .once('value');

                const currentReady = snapshot.val() || false;
                const newReady = !currentReady;

                console.log('[MultiplayerFix] Toggling ready:', currentReady, '->', newReady);

                // 更新准备状态
                await Network.currentRoomRef
                    .child('players')
                    .child(Network.myPlayerId)
                    .child('ready')
                    .set(newReady);

                // 更新按钮UI
                newBtn.textContent = newReady ? '取消准备' : '准备';
                newBtn.classList.toggle('is-ready', newReady);

                console.log('[MultiplayerFix] Ready state updated successfully');

            } catch (error) {
                console.error('[MultiplayerFix] Ready button error:', error);
            }
        });

        console.log('[MultiplayerFix] Ready button fixed');
    },

    // 调试：打印当前状态
    debug() {
        console.log('=== MultiplayerFix Debug ===');
        console.log('Network.myPlayerId:', Network.myPlayerId);
        console.log('Network.myColor:', Network.myColor);
        console.log('Network.isHost:', Network.isHost);
        console.log('Network.currentRoom:', Network.currentRoom);
        console.log('Network.connected:', Network.connected);
        console.log('===========================');
    }
};

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保Network模块已加载
    setTimeout(() => {
        if (window.Network) {
            MultiplayerFix.init();
        }
    }, 1000);
});

// 暴露到全局作用域用于调试
window.MultiplayerFix = MultiplayerFix;
