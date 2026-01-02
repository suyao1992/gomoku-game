/**
 * MultiplayerUI.js - 联机模式UI管理模块
 * 管理匹配界面、对战界面、结算页面的所有交互
 */

const MultiplayerUI = {
    // ============ 状态 ============
    phase: 'idle', // 'idle' | 'matching' | 'countdown' | 'playing' | 'result'
    handlers: {},
    timers: {},
    animationFrames: {},

    // 游戏状态
    gameState: {
        myInfo: null,
        opponentInfo: null,
        myColor: null,
        currentTurn: null,
        myTimeLeft: 300,
        opponentTimeLeft: 300,
        stepTimeLeft: 20,
        myMoves: 0,
        opponentMoves: 0,
        undoCount: 3
    },

    // ============ 初始化 ============
    init() {
        console.log('[MultiplayerUI] Initializing...');
        this.createDOMElements();
        this.bindEvents();
        console.log('[MultiplayerUI] Initialized');
    },

    // 创建DOM元素
    createDOMElements() {
        // 粒子Canvas
        if (!document.getElementById('particle-canvas')) {
            const canvas = document.createElement('canvas');
            canvas.id = 'particle-canvas';
            document.body.appendChild(canvas);
        }

        // 玩家卡片 - 我 (强制重新创建以确保新结构)
        const existingMyCard = document.getElementById('mp-my-card');
        if (existingMyCard) existingMyCard.remove();
        {
            const myCard = document.createElement('div');
            myCard.id = 'mp-my-card';
            myCard.className = 'player-card me hidden';
            myCard.innerHTML = `
                <div class="player-card-header">
                    <div class="avatar-wrapper">
                        <svg class="move-timer-ring" viewBox="0 0 60 60">
                            <circle class="ring-bg" cx="30" cy="30" r="26"/>
                            <circle class="ring-progress" id="mp-my-ring" cx="30" cy="30" r="26"/>
                        </svg>
                        <span class="player-card-avatar" id="mp-my-avatar">🎮</span>
                        <span class="move-timer-text" id="mp-my-move-time">30</span>
                    </div>
                    <span class="player-card-name" id="mp-my-name">${Localization.t('mp.me')}</span>
                </div>
                <div class="player-card-info">
                    <span class="player-card-elo" id="mp-my-elo">ELO: 1000</span>
                    <span class="player-card-color" id="mp-my-color">${Localization.t('mp.color_black')}</span>
                    <span class="player-card-moves" id="mp-my-moves">${Localization.t('mp.moves_count', { COUNT: 0 })}</span>
                    <span class="player-card-chat hidden" id="mp-my-chat">💬</span>
                    <span class="player-card-time" id="mp-my-time">05:00</span>
                </div>
                <div class="player-card-status hidden" id="mp-my-status">${Localization.t('mp.waiting_for_turn')}</div>
            `;
            document.body.appendChild(myCard);
        }

        // 玩家卡片 - 对手 (强制重新创建以确保新结构)
        const existingOppCard = document.getElementById('mp-opponent-card');
        if (existingOppCard) existingOppCard.remove();
        {
            const oppCard = document.createElement('div');
            oppCard.id = 'mp-opponent-card';
            oppCard.className = 'player-card opponent hidden';
            oppCard.innerHTML = `
                <div class="player-card-header">
                    <div class="avatar-wrapper">
                        <svg class="move-timer-ring" viewBox="0 0 60 60">
                            <circle class="ring-bg" cx="30" cy="30" r="26"/>
                            <circle class="ring-progress" id="mp-opponent-ring" cx="30" cy="30" r="26"/>
                        </svg>
                        <span class="player-card-avatar" id="mp-opponent-avatar">❓</span>
                        <span class="move-timer-text" id="mp-opponent-move-time">30</span>
                    </div>
                    <span class="player-card-name" id="mp-opponent-name">${Localization.t('mp.opponent')}</span>
                </div>
                <div class="player-card-info">
                    <span class="player-card-elo" id="mp-opponent-elo">ELO: 1000</span>
                    <span class="player-card-color" id="mp-opponent-color">${Localization.t('mp.color_white')}</span>
                    <span class="player-card-moves" id="mp-opponent-moves">${Localization.t('mp.moves_count', { COUNT: 0 })}</span>
                    <span class="player-card-chat hidden" id="mp-opponent-chat">💬</span>
                    <span class="player-card-time" id="mp-opponent-time">05:00</span>
                </div>
                <div class="player-card-status hidden" id="mp-opponent-status">${Localization.t('mp.thinking')}</div>
            `;
            document.body.appendChild(oppCard);
        }

        // 底部操作按钮
        if (!document.getElementById('mp-game-actions')) {
            const actions = document.createElement('div');
            actions.id = 'mp-game-actions';
            actions.className = 'game-actions hidden';
            actions.innerHTML = `
                <button class="action-btn" id="mp-undo-btn">${Localization.t('mp.undo')} <span id="mp-undo-count">(3)</span></button>
                <button class="action-btn" id="mp-draw-btn">${Localization.t('mp.draw')}</button>
                <button class="action-btn danger" id="mp-surrender-btn">${Localization.t('mp.surrender')}</button>
                <button class="action-btn" id="mp-chat-btn">${Localization.t('mp.chat')}</button>
            `;
            document.body.appendChild(actions);
        }

        // 回合指示器
        if (!document.getElementById('mp-turn-indicator')) {
            const turn = document.createElement('div');
            turn.id = 'mp-turn-indicator';
            turn.className = 'turn-indicator hidden';
            turn.textContent = Localization.t('mp.turn_mine');
            document.body.appendChild(turn);
        }

        // 聊天弹窗
        if (!document.getElementById('mp-chat-popup')) {
            const chatPopup = document.createElement('div');
            chatPopup.id = 'mp-chat-popup';
            chatPopup.className = 'hidden';
            // 直接设置内联样式，确保居中显示
            chatPopup.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 320px;
                max-width: 90vw;
                background: rgba(30, 30, 60, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                padding: 25px;
                z-index: 1000;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            `;
            chatPopup.innerHTML = `
                <div style="font-size: 1.2rem; font-weight: bold; color: white; margin-bottom: 15px; text-align: center;">${Localization.t('mp.chat_title')}</div>
                <div class="chat-options" id="mp-chat-options" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                    <button class="chat-option-btn" data-msg="${Localization.t('mp.msg.hello')}">${Localization.t('mp.msg.hello')}</button>
                    <button class="chat-option-btn" data-msg="${Localization.t('mp.msg.good_job')}">${Localization.t('mp.msg.good_job')}</button>
                    <button class="chat-option-btn" data-msg="${Localization.t('mp.msg.wait')}">${Localization.t('mp.msg.wait')}</button>
                    <button class="chat-option-btn" data-msg="${Localization.t('mp.msg.thinking')}">${Localization.t('mp.msg.thinking')}</button>
                    <button class="chat-option-btn" data-msg="${Localization.t('mp.msg.amazing')}">${Localization.t('mp.msg.amazing')}</button>
                    <button class="chat-option-btn" data-msg="${Localization.t('mp.msg.gg')}">${Localization.t('mp.msg.gg')}</button>
                    <button class="chat-option-btn" data-msg="${Localization.t('mp.msg.rematch')}">${Localization.t('mp.msg.rematch')}</button>
                    <button class="chat-option-btn" data-msg="${Localization.t('mp.msg.bye')}">${Localization.t('mp.msg.bye')}</button>
                </div>
                <button style="margin-top: 15px; width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px; color: white; cursor: pointer;" onclick="MultiplayerUI.closeChatPopup()">${Localization.t('mp.close')}</button>
            `;
            document.body.appendChild(chatPopup);
        }
    },

    // 绑定事件
    bindEvents() {
        this.unbindEvents();

        // 悔棋按钮
        this.handlers.onUndo = () => this.requestUndo();
        document.getElementById('mp-undo-btn')?.addEventListener('click', this.handlers.onUndo);

        // 求和按钮
        this.handlers.onDraw = () => this.requestDraw();
        document.getElementById('mp-draw-btn')?.addEventListener('click', this.handlers.onDraw);

        // 认输按钮
        this.handlers.onSurrender = () => this.confirmSurrender();
        document.getElementById('mp-surrender-btn')?.addEventListener('click', this.handlers.onSurrender);

        // 聊天按钮
        this.handlers.onChat = (e) => {
            e.stopPropagation();  // 防止事件冒泡导致立即关闭
            this.showChatPopup();
        };
        document.getElementById('mp-chat-btn')?.addEventListener('click', this.handlers.onChat);

        // 聊天选项
        document.querySelectorAll('.chat-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.sendChat(e.target.dataset.msg);
                this.closeChatPopup();
            });
        });
    },

    unbindEvents() {
        document.getElementById('mp-undo-btn')?.removeEventListener('click', this.handlers.onUndo);
        document.getElementById('mp-draw-btn')?.removeEventListener('click', this.handlers.onDraw);
        document.getElementById('mp-surrender-btn')?.removeEventListener('click', this.handlers.onSurrender);
        document.getElementById('mp-chat-btn')?.removeEventListener('click', this.handlers.onChat);
    },

    // ============ 匹配界面 ============
    showQuantumSearch() {
        this.phase = 'matching';
        this.matchStartTime = Date.now();
        this.matchingStage = 1;  // 匹配阶段：1-4
        this.accelerationMode = false;  // 重置加速模式
        this.accelerationStartTime = null;
        this.queueCount = null;  // 重置队列人数

        const modal = document.getElementById('matchmaking-modal');
        if (!modal) return;

        // 更新为量子搜索样式（含渐进式提示）
        modal.classList.remove('hidden');
        const content = modal.querySelector('.modal-content') || modal.querySelector('.matchmaking-content');
        if (content) {
            content.innerHTML = `
                <div class="quantum-search">
                    <div class="quantum-title" id="quantum-title">◉ ${Localization.t('mp.search.title')}</div>
                    <div class="quantum-subtitle" id="quantum-subtitle">${Localization.t('mp.search.subtitle')}</div>
                    <div class="quantum-avatars">
                        <div class="quantum-avatar">${this.getMyAvatar()}</div>
                        <div class="quantum-connection"></div>
                        <div class="quantum-avatar opponent">❓</div>
                    </div>
                    <div class="quantum-progress">
                        <div class="quantum-progress-bar" id="quantum-progress-bar" style="width: 5%"></div>
                    </div>
                    <div class="quantum-timer" id="quantum-timer">00:00</div>
                    <div class="quantum-online" id="quantum-online" style="display:none;">
                        ${Localization.t('mp.search.online_prefix')}<span id="quantum-online-count">--</span>${Localization.t('mp.search.online_suffix')}
                    </div>
                    <div class="quantum-actions" id="quantum-actions" style="display:none; gap: 10px; justify-content: center; margin-top: 15px;">
                        <button class="quantum-btn primary" id="quantum-reserve-btn">${Localization.t('mp.search.reserve')}</button>
                        <button class="quantum-btn secondary" id="quantum-continue-btn">${Localization.t('mp.search.continue')}</button>
                    </div>
                    <button class="quantum-cancel-btn" id="quantum-cancel-btn">${Localization.t('mp.search.cancel')}</button>
                </div>
            `;

            // 绑定取消按钮
            document.getElementById('quantum-cancel-btn')?.addEventListener('click', () => {
                this.cancelMatching();
            });

            // 绑定预约按钮
            document.getElementById('quantum-reserve-btn')?.addEventListener('click', () => {
                if (window.RobustMatchmaking) {
                    RobustMatchmaking.enterReservationMode();
                }
            });

            // 绑定继续等待按钮
            document.getElementById('quantum-continue-btn')?.addEventListener('click', () => {
                // 隐藏按钮，重置阶段继续等待
                document.getElementById('quantum-actions').style.display = 'none';
                this.matchingStage = 3;  // 回到阶段3继续
            });
        }

        // 启动渐进式提示
        this.startProgressivePrompts();
    },

    // 渐进式提示更新器
    startProgressivePrompts() {
        // 清理旧的定时器
        if (this.promptInterval) {
            clearInterval(this.promptInterval);
        }

        this.promptInterval = setInterval(() => {
            if (this.phase !== 'matching') {
                clearInterval(this.promptInterval);
                this.promptInterval = null;
                return;
            }

            const elapsed = (Date.now() - this.matchStartTime) / 1000;
            this.updateProgressiveUI(elapsed);

            // 更新真实计时器显示
            const timerEl = document.getElementById('quantum-timer');
            if (timerEl) {
                const minutes = Math.floor(elapsed / 60);
                const seconds = Math.floor(elapsed % 60);
                timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        }, 500);
    },

    // 🚀 接收队列信息更新（从 RobustMatchmaking 调用）
    async updateQueueInfo(otherPlayersCount) {
        this.queueCount = otherPlayersCount;

        // 🤖 获取AI在线数量
        let aiCount = 0;
        if (window.AIOnlineManager) {
            aiCount = await window.AIOnlineManager.getAIOnlineCount();
        }

        // 总在线数 = 其他真人玩家 + AI
        const totalOnline = otherPlayersCount + aiCount;

        // 更新显示的在线人数
        const onlineCount = document.getElementById('quantum-online-count');
        if (onlineCount) {
            onlineCount.textContent = totalOnline;
        }

        // 智能加速：队列为空时启用加速模式
        if (otherPlayersCount === 0 && !this.accelerationMode) {
            this.accelerationMode = true;
            this.accelerationStartTime = Date.now();
            console.log('[MultiplayerUI] Queue empty, enabling acceleration mode');
        } else if (otherPlayersCount > 0 && this.accelerationMode) {
            // 有人加入队列，退出加速模式
            this.accelerationMode = false;
            console.log('[MultiplayerUI] Players found, disabling acceleration mode');
        }
    },

    // 更新渐进式 UI（支持智能加速）
    updateProgressiveUI(elapsed) {
        const title = document.getElementById('quantum-title');
        const subtitle = document.getElementById('quantum-subtitle');
        const progressBar = document.getElementById('quantum-progress-bar');
        const onlineSection = document.getElementById('quantum-online');
        const actionsSection = document.getElementById('quantum-actions');

        // 智能加速模式：5秒后会召唤AI对手
        if (this.accelerationMode && this.accelerationStartTime) {
            const accelElapsed = (Date.now() - this.accelerationStartTime) / 1000;

            if (accelElapsed < 5) {
                // 加速阶段：不提示空队列，而是显示"正在寻找对手"
                if (title) title.textContent = '🎯 ' + Localization.t('mp.search.title');
                if (subtitle) subtitle.textContent = '正在召唤旗鼓相当的对手...';
                if (progressBar) progressBar.style.width = `${20 + accelElapsed * 16}%`;
                if (onlineSection) {
                    // 显示在线人数（包含AI），但不特别提示队列为空
                    onlineSection.style.display = 'block';
                }
            } else {
                // 5秒后AI会被召唤，这时应该很快匹配成功
                if (title) title.textContent = '✨ 对手即将抵达';
                if (subtitle) subtitle.textContent = '请稍候...';
                if (progressBar) progressBar.style.width = '90%';
            }
            return;
        }

        // 正常模式：按时间阶段显示
        if (elapsed < 15) {
            // 阶段1：正常搜索 (0-15秒)
            if (title) title.textContent = Localization.t('mp.search.title');
            if (subtitle) subtitle.textContent = Localization.t('mp.search.subtitle');
            if (progressBar) progressBar.style.width = `${5 + (elapsed / 15) * 25}%`;
            this.matchingStage = 1;
        } else if (elapsed < 30) {
            // 阶段2：扩大范围 (15-30秒)
            if (title) title.textContent = Localization.t('mp.search.expanding');
            if (subtitle) subtitle.textContent = Localization.t('mp.search.expanding_sub');
            if (progressBar) progressBar.style.width = `${30 + ((elapsed - 15) / 15) * 25}%`;
            this.matchingStage = 2;
        } else if (elapsed < 45) {
            // 阶段3：全局搜索 (30-45秒)
            if (title) title.textContent = Localization.t('mp.search.global');
            if (onlineSection) {
                onlineSection.style.display = 'block';
            }
            if (subtitle) subtitle.textContent = Localization.t('mp.search.global_sub');
            if (progressBar) progressBar.style.width = `${55 + ((elapsed - 30) / 15) * 25}%`;
            this.matchingStage = 3;
        } else {
            // 阶段4：显示选项 (45秒+)
            if (title) title.textContent = Localization.t('mp.search.few_players');
            if (subtitle) subtitle.textContent = Localization.t('mp.search.few_players_sub');
            if (progressBar) progressBar.style.width = `${80 + Math.min((elapsed - 45) / 15 * 15, 15)}%`;
            if (actionsSection && actionsSection.style.display === 'none') {
                actionsSection.style.display = 'flex';
            }
            this.matchingStage = 4;
        }
    },

    // 停止渐进式提示
    stopProgressivePrompts() {
        if (this.promptInterval) {
            clearInterval(this.promptInterval);
            this.promptInterval = null;
        }
    },

    // 显示命运之轮
    showFateWheel(opponentInfo) {
        // 🔥 关键：立即隐藏旧的倒计时黑色遮罩，防止覆盖动画
        document.getElementById('countdown-modal')?.classList.add('hidden');

        const modal = document.getElementById('matchmaking-modal');
        if (!modal) return;

        const content = modal.querySelector('.modal-content') || modal.querySelector('.matchmaking-content');
        if (content) {
            content.innerHTML = `
                <div class="fate-wheel-container">
                    <div class="fate-wheel spinning">
                        <div class="fate-wheel-center">❓</div>
                    </div>
                    <div class="fate-wheel-text">${Localization.t('mp.search.fate_wheel')}</div>
                </div>
            `;

            // 2秒后显示对手
            setTimeout(() => {
                this.showMatchSuccess(opponentInfo);
            }, 2000);
        }
    },

    // 显示匹配成功 - 统一界面（含倒计时）
    showMatchSuccess(opponentInfo) {
        const modal = document.getElementById('matchmaking-modal');
        if (!modal) return;

        const content = modal.querySelector('.modal-content') || modal.querySelector('.matchmaking-content');
        if (content) {
            const myColor = this.gameState.myColor || 'black';
            const myPiece = myColor === 'black' ? '⚫' : '⚪';
            const oppPiece = myColor === 'black' ? '⚪' : '⚫';
            const myColorLabel = myColor === 'black' ? '先手' : '后手';
            const oppColorLabel = myColor === 'black' ? '后手' : '先手';

            const oppAvatar = opponentInfo.avatar || '🎮';
            const oppName = opponentInfo.name || Localization.t('mp.mysterious_opponent');
            const oppElo = opponentInfo.elo || 1000;

            content.innerHTML = `
                <div class="hero-duel-container">
                    <!-- Aurora Background -->
                    <div class="aurora-bg"></div>
                    
                    <!-- Title -->
                    <div class="duel-title">🤝 ${Localization.t('mp.search.found')} 🤝</div>
                    
                    <!-- Duel Arena -->
                    <div class="duel-arena">
                        <!-- My Zone -->
                        <div class="player-zone me slide-in-left">
                            <div class="zone-avatar">
                                <div class="avatar-halo me"></div>
                                <span class="avatar-emoji">${this.getMyAvatar()}</span>
                            </div>
                            <div class="zone-info">
                                <div class="zone-label me">${Localization.t('mp.me')}</div>
                                <div class="zone-name">${this.getMyName()}</div>
                                <div class="zone-elo">ELO ${this.getMyElo()}</div>
                            </div>
                            <div class="zone-piece me">
                                <span class="piece-icon">${myPiece}</span>
                                <span class="piece-label">${Localization.t(myColor === 'black' ? 'mp.color_first' : 'mp.color_second')}</span>
                            </div>
                        </div>
                        
                        <!-- VS Connector -->
                        <div class="vs-connector">
                            <div class="particle-flow">
                                <span class="particle p1">✨</span>
                                <span class="particle p2">⭐</span>
                                <span class="particle p3">💫</span>
                            </div>
                            <div class="vs-badge">${Localization.t('mp.search.vs')}</div>
                            <div class="particle-flow reverse">
                                <span class="particle p1">💫</span>
                                <span class="particle p2">⭐</span>
                                <span class="particle p3">✨</span>
                            </div>
                        </div>
                        
                        <!-- Opponent Zone -->
                        <div class="player-zone opponent slide-in-right">
                            <div class="zone-avatar">
                                <div class="avatar-halo opponent"></div>
                                <span class="avatar-emoji">${oppAvatar}</span>
                            </div>
                            <div class="zone-info">
                                <div class="zone-label opponent">${Localization.t('mp.opponent')}</div>
                                <div class="zone-name">${oppName}</div>
                                <div class="zone-elo">ELO ${oppElo}</div>
                            </div>
                            <div class="zone-piece opponent">
                                <span class="piece-icon">${oppPiece}</span>
                                <span class="piece-label">${Localization.t(myColor === 'black' ? 'mp.color_second' : 'mp.color_first')}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Countdown Section -->
                    <div class="duel-countdown-section">
                        <div class="duel-message">「 ${Localization.t('mp.search.starting')} 」</div>
                        <div class="duel-countdown-number" id="duel-countdown">—</div>
                    </div>
                </div>
            `;

            // 1秒后开始倒计时
            setTimeout(() => {
                this.startIntegratedCountdown();
            }, 1000);
        }
    },

    // 统一界面内的倒计时
    startIntegratedCountdown() {
        this.phase = 'countdown';
        let count = 3;
        const countdownEl = document.getElementById('duel-countdown');

        const tick = () => {
            if (count > 0 && countdownEl) {
                countdownEl.textContent = count;
                countdownEl.classList.remove('bounce');
                // Force reflow to restart animation
                void countdownEl.offsetWidth;
                countdownEl.classList.add('bounce');

                if (count === 1) {
                    countdownEl.classList.add('final');
                }

                count--;
                setTimeout(tick, 1000);
            } else if (count === 0 && countdownEl) {
                countdownEl.textContent = Localization.t('mp.search.ready');
                countdownEl.classList.add('go');

                // 500ms 后进入游戏
                setTimeout(() => {
                    const modal = document.getElementById('matchmaking-modal');
                    if (modal) modal.classList.add('hidden');
                    this.enterGamePhase();
                }, 500);
            }
        };

        tick();
    },

    // 显示倒计时 - 保留兼容性，但现在使用 startIntegratedCountdown
    showCountdown() {
        // 如果已经在统一界面中，直接开始倒计时
        if (document.getElementById('duel-countdown')) {
            this.startIntegratedCountdown();
            return;
        }

        // 降级使用旧的倒计时逻辑
        this.phase = 'countdown';
        const modal = document.getElementById('matchmaking-modal');
        if (!modal) return;

        const content = modal.querySelector('.modal-content') || modal.querySelector('.matchmaking-content');
        if (!content) return;

        let count = 3;

        const updateCountdown = () => {
            if (count > 0) {
                content.innerHTML = `
                    <div class="countdown-container">
                        <div class="countdown-players">
                            <div class="countdown-player">
                                <div class="countdown-player-avatar">${this.getMyAvatar()}</div>
                                <div class="countdown-player-name">${this.getMyName()}</div>
                            </div>
                            <div class="countdown-player">
                                <div class="countdown-player-avatar">${this.gameState.opponentInfo?.avatar || '🎮'}</div>
                                <div class="countdown-player-name">${this.gameState.opponentInfo?.name || '对手'}</div>
                            </div>
                        </div>
                        <div class="countdown-number">${count}</div>
                        <div class="countdown-text">${Localization.t('mp.search.ready')}</div>
                    </div>
                `;
                count--;
                setTimeout(updateCountdown, 1000);
            } else {
                // 开始游戏
                modal.classList.add('hidden');
                this.enterGamePhase();
            }
        };

        updateCountdown();
    },

    cancelMatching() {
        this.phase = 'idle';
        this.stopProgressivePrompts(); // 停止渐进式提示
        document.getElementById('matchmaking-modal')?.classList.add('hidden');
        document.getElementById('main-menu')?.classList.remove('hidden');

        if (window.RobustMatchmaking) {
            RobustMatchmaking.cancelSearch();
        }
    },

    // ============ 对战界面 ============
    enterGamePhase() {
        this.phase = 'playing';

        // 🔥 添加 mp-game 类到 body，使 CSS 作用域生效
        document.body.classList.add('mp-game');

        // 🔔 移除预约匹配通知（如果存在）
        document.getElementById('match-notification')?.remove();
        if (this.notifCountdown) {
            clearInterval(this.notifCountdown);
            this.notifCountdown = null;
        }

        // ⚡ 隐藏所有旧的 UI 元素
        this.hideAllOldUI();

        // 显示新的玩家卡片
        document.getElementById('mp-my-card')?.classList.remove('hidden');
        document.getElementById('mp-opponent-card')?.classList.remove('hidden');
        document.getElementById('mp-game-actions')?.classList.remove('hidden');

        // 更新玩家信息
        this.updatePlayerCards();

        // 开始计时
        this.startGameTimer();

        // 更新回合指示
        this.updateTurnIndicator();

        // 🔥 监听聊天消息
        this.setupChatListener();

        // 🔥 设置悔棋/求和请求回调
        this.setupRequestCallbacks();
    },

    // 设置悔棋/求和请求回调
    setupRequestCallbacks() {
        if (!window.Network) return;

        // 收到悔棋请求
        Network.onUndoRequest = (request) => {
            console.log('[MultiplayerUI] 收到悔棋请求:', request);
            this.showUndoRequestModal(request);
        };

        // 收到求和请求
        Network.onDrawRequest = (request) => {
            console.log('[MultiplayerUI] 收到求和请求:', request);
            this.showDrawRequestModal(request);
        };
    },

    // 显示悔棋请求弹窗
    showUndoRequestModal(request) {
        const opponentName = Network.opponentName || Localization.t('mp.opponent');
        this.showRequestConfirmModal({
            title: Localization.t('mp.request.undo'),
            message: Localization.t('mp.request.undo_msg', { NAME: opponentName }),
            onAccept: () => this.respondToUndo(true),
            onReject: () => this.respondToUndo(false)
        });
    },

    // 响应悔棋请求
    async respondToUndo(accept) {
        if (!window.Network || !Network.currentRoomRef) return;

        if (accept) {
            // 执行悔棋逻辑：撤销最后一步
            if (window.game && game.state.history.length > 0) {
                const lastMove = game.state.history.pop();
                if (lastMove) {
                    game.state.board[lastMove.x][lastMove.y] = 0;
                    // 切换回上一个玩家
                    game.state.currentPlayer = lastMove.player;
                    game.drawBoard();

                    // 同步到网络
                    await Network.currentRoomRef.child('game').update({
                        [`board/${lastMove.x}/${lastMove.y}`]: 0,
                        currentTurn: lastMove.player === 1 ? 'black' : 'white'
                    });
                }
            }
            this.showToast(Localization.t('mp.toast.undo_accepted'));
        } else {
            this.showToast(Localization.t('mp.toast.undo_rejected'));
        }

        // 清除请求
        await Network.currentRoomRef.child('requests/undo').remove();
    },

    // 显示求和请求弹窗
    showDrawRequestModal(request) {
        const opponentName = Network.opponentName || Localization.t('mp.opponent');
        this.showRequestConfirmModal({
            title: Localization.t('mp.request.draw'),
            message: Localization.t('mp.request.draw_msg', { NAME: opponentName }),
            onAccept: () => this.respondToDraw(true),
            onReject: () => this.respondToDraw(false)
        });
    },

    // 响应求和请求
    async respondToDraw(accept) {
        if (!window.Network || !Network.currentRoomRef) return;

        if (accept) {
            // 和棋结束游戏
            await Network.currentRoomRef.update({
                status: 'finished',
                'game/winner': 'draw',
                'game/endReason': 'draw_agreed'
            });
            this.showToast(Localization.t('mp.toast.draw_accepted'));
        } else {
            this.showToast(Localization.t('mp.toast.draw_rejected'));
        }

        // 清除请求
        await Network.currentRoomRef.child('requests/draw').remove();
    },

    // 通用请求确认弹窗
    showRequestConfirmModal(options) {
        // 移除已有的弹窗
        document.getElementById('mp-request-modal')?.remove();

        const modal = document.createElement('div');
        modal.id = 'mp-request-modal';
        modal.className = 'mp-modal active';
        modal.innerHTML = `
            <div class="mp-modal-content request-modal">
                <div class="request-icon">❓</div>
                <div class="request-title">${options.title}</div>
                <div class="request-message">${options.message}</div>
                <div class="request-actions">
                    <button class="request-btn accept" id="request-accept-btn">${Localization.t('mp.request.accept')}</button>
                    <button class="request-btn reject" id="request-reject-btn">${Localization.t('mp.request.reject')}</button>
                </div>
            </div>
        `;

        // 添加样式（如果不存在）
        if (!document.getElementById('mp-request-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'mp-request-modal-styles';
            style.textContent = `
                #mp-request-modal {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }
                #mp-request-modal .mp-modal-content.request-modal {
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    border-radius: 16px;
                    padding: 24px 32px;
                    text-align: center;
                    min-width: 280px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                #mp-request-modal .request-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }
                #mp-request-modal .request-title {
                    font-size: 20px;
                    font-weight: bold;
                    color: #fff;
                    margin-bottom: 12px;
                }
                #mp-request-modal .request-message {
                    font-size: 16px;
                    color: rgba(255, 255, 255, 0.8);
                    margin-bottom: 24px;
                }
                #mp-request-modal .request-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }
                #mp-request-modal .request-btn {
                    padding: 12px 24px;
                    border-radius: 8px;
                    border: none;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                #mp-request-modal .request-btn.accept {
                    background: linear-gradient(135deg, #00b894, #00cec9);
                    color: #fff;
                }
                #mp-request-modal .request-btn.accept:hover {
                    transform: scale(1.05);
                }
                #mp-request-modal .request-btn.reject {
                    background: linear-gradient(135deg, #e17055, #d63031);
                    color: #fff;
                }
                #mp-request-modal .request-btn.reject:hover {
                    transform: scale(1.05);
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);

        // 绑定按钮事件
        document.getElementById('request-accept-btn').addEventListener('click', () => {
            modal.remove();
            options.onAccept();
        });

        document.getElementById('request-reject-btn').addEventListener('click', () => {
            modal.remove();
            options.onReject();
        });
    },

    // 设置聊天消息监听
    setupChatListener() {
        if (!window.Network || !Network.currentRoomRef) return;

        // 移除旧的监听器
        if (this._chatListener) {
            Network.currentRoomRef.child('chat').off('child_added', this._chatListener);
        }

        // 记录当前时间，只处理新消息
        const startTime = Date.now();

        // 监听新消息
        this._chatListener = (snapshot) => {
            const data = snapshot.val();
            if (!data || data.timestamp < startTime) return;

            // 如果是对方发的消息，显示在对方卡片上
            if (data.from !== Network.myPlayerId) {
                this.showChatBubble(data.message, false);
            }
        };

        Network.currentRoomRef.child('chat').on('child_added', this._chatListener);
    },

    // 隐藏所有旧的联机 UI 元素
    hideAllOldUI() {
        // 0. 🔥 移除结算弹窗 (防止再来一局时遮挡)
        document.getElementById('mp-result-modal')?.remove();

        // 1. 旧的 soul-header（顶部双人头像 p1-card, p2-card）
        document.getElementById('online-header')?.classList.add('hidden');

        // 2. 旧的控制按钮区域（整个容器）
        document.querySelector('.controls')?.classList.add('hidden');

        // 2.1 单独隐藏每个老按钮（确保彻底隐藏）
        document.getElementById('restart-btn')?.classList.add('hidden');
        document.getElementById('undo-btn')?.classList.add('hidden');
        document.getElementById('surrender-btn')?.classList.add('hidden');
        document.getElementById('change-mode-btn')?.classList.add('hidden');
        document.getElementById('chat-btn')?.classList.add('hidden');

        // 3. 匹配弹窗
        document.getElementById('matchmaking-modal')?.classList.add('hidden');

        // 4. 旧的结算弹窗
        document.getElementById('winner-modal')?.classList.add('hidden');

        // 5. 旧的玩家标签（hidden-legacy-ui 已经默认 hidden）
        document.querySelector('.hidden-legacy-ui')?.classList.add('hidden');

        // 6. 联机大厅
        document.getElementById('online-lobby-modal')?.classList.add('hidden');

        // 7. 房间等待弹窗
        document.getElementById('room-waiting-modal')?.classList.add('hidden');

        // 8. 加入房间弹窗
        document.getElementById('join-room-modal')?.classList.add('hidden');

        // 9. 🔥 旧的倒计时黑色遮罩 - 这就是覆盖动画的元凶！
        document.getElementById('countdown-modal')?.classList.add('hidden');

        // 10. 隐藏底部 dock 栏（对战中不需要）
        document.querySelector('.dock-bar')?.classList.add('hidden');
        document.getElementById('dock-toggle')?.classList.add('hidden');

        // 11. 隐藏老聊天按钮包装器
        document.querySelector('.chat-wrapper')?.classList.add('hidden');

        console.log('[MultiplayerUI] All old UI elements hidden');
    },

    updatePlayerCards() {
        const myInfo = this.gameState.myInfo || {};
        const oppInfo = this.gameState.opponentInfo || {};

        // 我的卡片
        document.getElementById('mp-my-avatar').textContent = myInfo.avatar || this.getMyAvatar();
        document.getElementById('mp-my-name').textContent = myInfo.name || this.getMyName();
        document.getElementById('mp-my-elo').textContent = `ELO: ${myInfo.elo || this.getMyElo()}`;
        document.getElementById('mp-my-color').textContent = this.gameState.myColor === 'black' ? Localization.get('mp.color_black_label') : Localization.get('mp.color_white_label');

        // 对手卡片
        document.getElementById('mp-opponent-avatar').textContent = oppInfo.avatar || '🎮';
        document.getElementById('mp-opponent-name').textContent = oppInfo.name || Localization.get('mp.opponent');
        document.getElementById('mp-opponent-elo').textContent = `ELO: ${oppInfo.elo || 1000}`;
        document.getElementById('mp-opponent-color').textContent = this.gameState.myColor === 'black' ? Localization.get('mp.color_white_label') : Localization.get('mp.color_black_label');
    },

    updateTurnIndicator() {
        // 🔥 隐藏中心回合指示器（不再遮挡棋盘）
        const indicator = document.getElementById('mp-turn-indicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }

        // 使用 Network.myColor 作为备用，确保颜色正确
        const myColor = this.gameState.myColor || (window.Network ? Network.myColor : null);
        const currentTurn = this.gameState.currentTurn;

        // 如果没有颜色信息，无法判断回合
        if (!myColor || !currentTurn) {
            console.log('[MultiplayerUI] updateTurnIndicator: missing myColor or currentTurn', myColor, currentTurn);
            return;
        }

        const isMyTurn = currentTurn === myColor;

        // 更新我的卡片状态
        const myCard = document.getElementById('mp-my-card');
        const myStatus = document.getElementById('mp-my-status');
        const myChat = document.getElementById('mp-my-chat');
        if (myCard) {
            myCard.classList.toggle('active-turn', isMyTurn);
            myCard.classList.toggle('waiting-turn', !isMyTurn);
        }
        if (myStatus) {
            myStatus.textContent = isMyTurn ? Localization.get('mp.turn_mine_label') : '';
            myStatus.classList.toggle('hidden', !isMyTurn);
        }
        // 更新chat元素显示回合状态（移动端用）
        if (myChat && !myChat._hideTimer) {
            if (isMyTurn) {
                myChat.textContent = Localization.get('mp.turn_mine_label');
                myChat.classList.remove('hidden');
                myChat.classList.add('turn-status');
            } else {
                myChat.classList.add('hidden');
                myChat.classList.remove('turn-status');
            }
        }

        // 更新对手卡片状态
        const oppCard = document.getElementById('mp-opponent-card');
        const oppStatus = document.getElementById('mp-opponent-status');
        const oppChat = document.getElementById('mp-opponent-chat');
        if (oppCard) {
            oppCard.classList.toggle('active-turn', !isMyTurn);
            oppCard.classList.toggle('waiting-turn', isMyTurn);
        }
        if (oppStatus) {
            oppStatus.textContent = !isMyTurn ? Localization.get('mp.thinking_label') : '';
            oppStatus.classList.toggle('hidden', isMyTurn);
        }
        // 更新对手chat元素显示回合状态（移动端用）
        if (oppChat && !oppChat._hideTimer) {
            if (!isMyTurn) {
                oppChat.textContent = Localization.get('mp.thinking_label');
                oppChat.classList.remove('hidden');
                oppChat.classList.add('turn-status');
            } else {
                oppChat.classList.add('hidden');
                oppChat.classList.remove('turn-status');
            }
        }

        // 🔥 步时计时器 - 只显示当前回合玩家的
        const myRing = document.getElementById('mp-my-ring');
        const myMoveTime = document.getElementById('mp-my-move-time');
        const oppRing = document.getElementById('mp-opponent-ring');
        const oppMoveTime = document.getElementById('mp-opponent-move-time');

        // 显示/隐藏步时计时器
        if (myRing) myRing.style.opacity = isMyTurn ? '1' : '0.2';
        if (myMoveTime) myMoveTime.style.opacity = isMyTurn ? '1' : '0.2';
        if (oppRing) oppRing.style.opacity = !isMyTurn ? '1' : '0.2';
        if (oppMoveTime) oppMoveTime.style.opacity = !isMyTurn ? '1' : '0.2';

        // 重置步时为20秒
        this.resetMoveTimer();

        // 更新落子数
        this.updateMoveCount();
    },

    // Update move count display for both players
    updateMoveCount() {
        if (!window.game || !game.state.history) return;

        const history = game.state.history;
        let myMoves = 0;
        let oppMoves = 0;

        // Count moves based on player's color
        const myPlayer = this.gameState.myColor === 'black' ? 1 : 2;

        history.forEach(move => {
            if (move.player === myPlayer) {
                myMoves++;
            } else {
                oppMoves++;
            }
        });

        // 更新显示
        const myMovesEl = document.getElementById('mp-my-moves');
        const oppMovesEl = document.getElementById('mp-opponent-moves');

        if (myMovesEl) myMovesEl.textContent = Localization.get('mp.moves_count', { COUNT: myMoves });
        if (oppMovesEl) oppMovesEl.textContent = Localization.get('mp.moves_count', { COUNT: oppMoves });

        // 同步到 gameState
        this.gameState.myMoves = myMoves;
        this.gameState.opponentMoves = oppMoves;
    },

    // 步时计时器相关
    moveTimeLimit: 30,
    currentMoveTime: 30,

    resetMoveTimer() {
        this.currentMoveTime = this.moveTimeLimit;
        this.updateMoveTimerDisplay();

        // 清除旧的步时计时器
        if (this.timers.moveTimer) {
            clearInterval(this.timers.moveTimer);
        }

        // 启动新的步时计时器
        this.timers.moveTimer = setInterval(() => {
            if (this.phase !== 'playing') {
                clearInterval(this.timers.moveTimer);
                return;
            }

            this.currentMoveTime--;
            this.updateMoveTimerDisplay();

            if (this.currentMoveTime <= 0) {
                clearInterval(this.timers.moveTimer);
                // 时间用尽，可以触发超时逻辑
            }
        }, 1000);
    },

    updateMoveTimerDisplay() {
        const isMyTurn = this.gameState.currentTurn === this.gameState.myColor;
        const ringId = isMyTurn ? 'mp-my-ring' : 'mp-opponent-ring';
        const textId = isMyTurn ? 'mp-my-move-time' : 'mp-opponent-move-time';

        const ring = document.getElementById(ringId);
        const text = document.getElementById(textId);

        if (text) {
            text.textContent = this.currentMoveTime;
            // 颜色变化
            text.classList.remove('warning', 'danger', 'critical');
            if (this.currentMoveTime <= 5) {
                text.classList.add('critical');
            } else if (this.currentMoveTime <= 10) {
                text.classList.add('danger');
            }
        }

        if (ring) {
            // SVG 圆环进度 (周长 = 2 * π * r = 2 * 3.14159 * 26 ≈ 163.36)
            const circumference = 2 * Math.PI * 26;
            const progress = this.currentMoveTime / this.moveTimeLimit;
            const offset = circumference * (1 - progress);
            ring.style.strokeDasharray = circumference;
            ring.style.strokeDashoffset = offset;

            // 颜色变化
            if (this.currentMoveTime <= 5) {
                ring.style.stroke = '#ff0000';
            } else if (this.currentMoveTime <= 10) {
                ring.style.stroke = 'var(--mp-danger)';
            } else {
                ring.style.stroke = 'var(--mp-primary)';
            }
        }
    },

    updateTime(myTime, opponentTime) {
        this.gameState.myTimeLeft = myTime;
        this.gameState.opponentTimeLeft = opponentTime;

        const myTimeEl = document.getElementById('mp-my-time');
        const myCard = document.getElementById('mp-my-card');
        const oppTimeEl = document.getElementById('mp-opponent-time');
        const oppCard = document.getElementById('mp-opponent-card');

        // 我的计时器
        if (myTimeEl) {
            myTimeEl.textContent = this.formatTime(myTime);
            // 三级警告：warning < 30s, danger < 10s, critical < 5s
            myTimeEl.classList.remove('warning', 'danger', 'critical');
            if (myTime <= 5) {
                myTimeEl.classList.add('critical');
            } else if (myTime <= 10) {
                myTimeEl.classList.add('danger');
            } else if (myTime <= 30) {
                myTimeEl.classList.add('warning');
            }
        }
        // 我的卡片警告状态
        if (myCard) {
            myCard.classList.toggle('time-warning', myTime <= 30 && myTime > 10);
            myCard.classList.toggle('time-danger', myTime <= 10 && myTime > 5);
            myCard.classList.toggle('time-critical', myTime <= 5);
        }

        // 对手计时器
        if (oppTimeEl) {
            oppTimeEl.textContent = this.formatTime(opponentTime);
            oppTimeEl.classList.remove('warning', 'danger', 'critical');
            if (opponentTime <= 5) {
                oppTimeEl.classList.add('critical');
            } else if (opponentTime <= 10) {
                oppTimeEl.classList.add('danger');
            } else if (opponentTime <= 30) {
                oppTimeEl.classList.add('warning');
            }
        }
        // 对手卡片警告状态
        if (oppCard) {
            oppCard.classList.toggle('time-warning', opponentTime <= 30 && opponentTime > 10);
            oppCard.classList.toggle('time-danger', opponentTime <= 10 && opponentTime > 5);
            oppCard.classList.toggle('time-critical', opponentTime <= 5);
        }
    },

    formatTime(seconds) {
        const min = Math.floor(seconds / 60).toString().padStart(2, '0');
        const sec = (seconds % 60).toString().padStart(2, '0');
        return `${min}:${sec}`;
    },

    startGameTimer() {
        // 清除旧计时器
        if (this.timers.gameTimer) {
            clearInterval(this.timers.gameTimer);
        }

        this.timers.gameTimer = setInterval(() => {
            if (this.phase !== 'playing') {
                clearInterval(this.timers.gameTimer);
                return;
            }

            // 这里应该由服务器同步时间，本地只做显示
            // 实际时间扣减由game.js/Network处理
        }, 1000);
    },

    // ============ 操作按钮 ============
    requestUndo() {
        if (this.gameState.undoCount <= 0) {
            this.showToast(Localization.get('mp.undo_limit_reached'));
            return;
        }

        // 发送悔棋请求到Network
        if (window.Network && Network.currentRoomRef) {
            Network.currentRoomRef.child('requests').child('undo').set({
                from: Network.myPlayerId,
                timestamp: Date.now()
            });
            this.showToast(Localization.get('mp.undo_request_sent'));
        }
    },

    requestDraw() {
        // 使用游戏历史记录获取实际步数
        const totalMoves = window.game ? game.state.history.length : 0;
        if (totalMoves < 10) {
            this.showToast(Localization.get('mp.toast.draw_min_moves', { COUNT: totalMoves }));
            return;
        }

        if (window.Network && Network.currentRoomRef) {
            Network.currentRoomRef.child('requests').child('draw').set({
                from: Network.myPlayerId,
                timestamp: Date.now()
            });
            this.showToast(Localization.get('mp.draw_request_sent'));
        }
    },

    confirmSurrender() {
        // 使用自定义弹窗替代 confirm()，避免浏览器限制
        this.showRequestConfirmModal({
            title: Localization.get('mp.confirm_surrender_title'),
            message: Localization.get('mp.confirm_surrender_msg'),
            onAccept: () => this.executeSurrender(),
            onReject: () => { } // 取消不做任何操作
        });
    },

    // 执行认输
    executeSurrender() {
        if (window.Network && Network.currentRoomRef) {
            // 使用 Network.myColor 而不是 gameState.myColor，确保两端都正确
            const myColor = Network.myColor || this.gameState.myColor;
            const winner = myColor === 'black' ? 'white' : 'black';
            console.log('[MultiplayerUI] Surrender: myColor=', myColor, 'winner=', winner);
            // 🔥 关键修复：同时更新 status 为 finished，这样离开房间时会自动删除
            Network.currentRoomRef.update({
                status: 'finished',
                'game/winner': winner,
                'game/endReason': 'surrender'
            });
        }
    },

    showChatPopup() {
        const popup = document.getElementById('mp-chat-popup');
        if (!popup) {
            console.warn('[MultiplayerUI] Chat popup element not found');
            return;
        }

        console.log('[MultiplayerUI] Showing chat popup');
        popup.classList.remove('hidden');

        // 确保弹窗在最上层
        popup.style.zIndex = '10000';

        // 添加点击弹窗内部阻止冒泡
        popup.onclick = (e) => e.stopPropagation();
        popup.ontouchend = (e) => e.stopPropagation();

        // 点击外部关闭（延迟300ms，避免移动端触摸事件立即触发）
        setTimeout(() => {
            this._chatOutsideHandler = (e) => {
                // 检查是否点击在弹窗外部
                if (!popup.contains(e.target)) {
                    this.closeChatPopup();
                }
            };
            document.addEventListener('click', this._chatOutsideHandler);
            document.addEventListener('touchend', this._chatOutsideHandler);
        }, 300);
    },

    closeChatPopup() {
        console.log('[MultiplayerUI] Closing chat popup');
        document.getElementById('mp-chat-popup')?.classList.add('hidden');
        // 移除外部点击/触摸监听
        if (this._chatOutsideHandler) {
            document.removeEventListener('click', this._chatOutsideHandler);
            document.removeEventListener('touchend', this._chatOutsideHandler);
            this._chatOutsideHandler = null;
        }
    },

    sendChat(message) {
        if (window.Network && Network.currentRoomRef) {
            Network.currentRoomRef.child('chat').push({
                from: Network.myPlayerId,
                message: message,
                timestamp: Date.now()
            });
        }

        // 显示自己的气泡
        this.showChatBubble(message, true);
    },

    showChatBubble(message, isMe) {
        // 在玩家卡片的聊天元素显示消息（移动端和PC端都用）
        const chatId = isMe ? 'mp-my-chat' : 'mp-opponent-chat';
        const chatEl = document.getElementById(chatId);

        if (chatEl) {
            // 显示聊天消息
            chatEl.classList.remove('hidden');
            chatEl.textContent = `💬 ${message}`;
            chatEl.classList.add('chat-active');

            // 清除之前的定时器
            if (chatEl._hideTimer) clearTimeout(chatEl._hideTimer);

            // 5秒后隐藏
            chatEl._hideTimer = setTimeout(() => {
                chatEl.classList.add('hidden');
                chatEl.classList.remove('chat-active');
                chatEl.textContent = '💬';
            }, 5000);
        }

        // 同时在状态区域显示（PC端大屏幕）
        const statusId = isMe ? 'mp-my-status' : 'mp-opponent-status';
        const statusEl = document.getElementById(statusId);

        if (statusEl) {
            // 保存原始状态
            const originalContent = statusEl.textContent;
            const originalBg = statusEl.style.background;
            const wasHidden = statusEl.classList.contains('hidden');

            // 显示聊天消息
            statusEl.classList.remove('hidden');  // 确保可见
            statusEl.textContent = `💬 ${message}`;
            statusEl.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            statusEl.style.borderRadius = '20px';
            statusEl.style.padding = '8px 16px';

            // 5秒后恢复原始状态
            setTimeout(() => {
                statusEl.textContent = originalContent;
                statusEl.style.background = originalBg || '';
                if (wasHidden) {
                    statusEl.classList.add('hidden');
                }
            }, 5000);
        }
    },

    // ============ 结算页面 ============
    showResult(result, stats) {
        this.phase = 'result';

        // 隐藏游戏UI
        document.getElementById('mp-my-card')?.classList.add('hidden');
        document.getElementById('mp-opponent-card')?.classList.add('hidden');
        document.getElementById('mp-game-actions')?.classList.add('hidden');
        document.getElementById('mp-turn-indicator')?.classList.add('hidden');

        // 创建结算弹窗
        const modal = document.createElement('div');
        modal.id = 'mp-result-modal';
        modal.className = 'mp-modal active';

        let icon, title, titleClass, eloChange, eloClass, message;

        if (result === 'victory') {
            icon = '🏆';
            title = Localization.get('mp.result.victory');
            titleClass = 'victory';
            eloChange = stats.eloChange || 25;
            eloClass = 'up';
            message = '';
            this.showVictoryParticles();
        } else if (result === 'defeat') {
            icon = '💔';
            title = Localization.get('mp.result.defeat');
            titleClass = 'defeat';
            eloChange = stats.eloChange || -15;
            eloClass = 'down';
            message = '💪 "Keep going, you\'ll win next time!"';
        } else {
            icon = '🤝';
            title = Localization.get('mp.result.draw');
            titleClass = 'draw';
            eloChange = 0;
            eloClass = '';
            message = '';
        }

        const eloText = eloChange > 0 ? `+${eloChange}` : (eloChange < 0 ? `${eloChange}` : '不变');

        modal.innerHTML = `
            <div class="mp-modal-content result-modal">
                <div class="result-icon">${icon}</div>
                <div class="result-title ${titleClass}">${title}</div>
                
                <div class="result-stats">
                    <div class="result-stat-row">
                        <span>${Localization.get('mp.result.duration')}</span>
                        <span>${stats.duration || '0:00'}</span>
                    </div>
                    <div class="result-stat-row">
                        <span>${Localization.get('mp.result.moves')}</span>
                        <span>${stats.moves || 0}</span>
                    </div>
                </div>
                
                <div class="result-elo ${eloClass}">
                    📈 ELO: ${stats.oldElo || 1000} → <span id="elo-new">${stats.oldElo || 1000}</span> (${eloText})
                </div>
                
                ${message ? `<div class="result-message">${message}</div>` : ''}
                
                <div class="result-actions">
                    <button class="result-btn primary" onclick="MultiplayerUI.requestRematch()">${Localization.get('mp.result.rematch')}</button>
                    <button class="result-btn secondary" onclick="window.location.reload()">${Localization.get('mp.result.return')}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 绑定按钮 (保留以防onclick不工作)
        document.getElementById('mp-rematch-btn')?.addEventListener('click', () => MultiplayerUI.requestRematch());
        document.getElementById('mp-return-btn')?.addEventListener('click', () => MultiplayerUI.returnToMenu());

        // ELO滚动动画
        if (eloChange !== 0) {
            this.animateEloChange(stats.oldElo || 1000, (stats.oldElo || 1000) + eloChange);
        }
    },

    animateEloChange(from, to) {
        const el = document.getElementById('elo-new');
        if (!el) return;

        const duration = 1500;
        const start = performance.now();

        const update = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            const value = Math.round(from + (to - from) * eased);
            el.textContent = value;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    },

    // 返回主菜单
    returnToMenu() {
        console.log('[MultiplayerUI] returnToMenu called');

        // 清理游戏状态
        this.cleanup();

        // 移除 mp-game 类
        document.body.classList.remove('mp-game');

        // 隐藏结算弹窗
        document.getElementById('mp-result-modal')?.remove();

        // 隐藏所有老的联机对战 UI
        document.getElementById('online-header')?.classList.add('hidden');
        document.querySelector('.online-header')?.classList.add('hidden');

        // 隐藏棋盘和游戏布局
        document.querySelector('.game-layout')?.classList.add('hidden');
        document.querySelector('.game-container')?.classList.add('hidden');

        // 隐藏所有玩家卡片
        document.querySelectorAll('.player-card, .p1-card, .p2-card').forEach(el => {
            el.classList.add('hidden');
        });

        // Leave Room
        if (window.Network && Network.leaveRoom) {
            Network.leaveRoom();
        }

        // Clean up matchmaking queue data to prevent ghost matches
        if (window.RobustMatchmaking) {
            RobustMatchmaking.cancelSearch();
            RobustMatchmaking.cleanupMyData();
        }

        // Reset game state
        if (window.game) {
            game.state.gameOver = true; // Mark game over
            game.state.isOnline = false;
        }

        // Show main menu selection buttons
        document.getElementById('choose-mode-btn')?.classList.remove('hidden');

        // Show main menu / Trigger main menu display
        if (window.game && game.ui && game.ui.showModeSelection) {
            game.ui.showModeSelection();
        } else if (window.game && game.showModeSelection) {
            game.showModeSelection();
        } else {
            // 降级：点击选择模式按钮
            const chooseModeBtn = document.getElementById('choose-mode-btn');
            if (chooseModeBtn) {
                chooseModeBtn.click();
            } else {
                // 最后手段：刷新页面
                console.log('[MultiplayerUI] No menu method found, reloading page');
                window.location.reload();
            }
        }
    },

    // 请求再来一局
    requestRematch() {
        console.log('[MultiplayerUI] Request rematch...');

        // 检查是否是AI对局
        const isAIMatch = window.AIPlayerAdapter?.lastAIConfig?._isAI;

        if (isAIMatch) {
            console.log('[MultiplayerUI] AI match detected, reusing same AI');

            // AI再战：直接重新初始化同一个AI
            if (window.RobustMatchmaking) {
                this.showToast('正在与同一AI再战...');

                // 关闭结算弹窗
                document.getElementById('mp-result-modal')?.remove();

                // 请求与同一AI再战
                RobustMatchmaking.requestRematchWithSameAI();
            } else {
                this.showToast('匹配系统未就绪');
            }
        } else {
            console.log('[MultiplayerUI] Human match, sending rematch request');

            // 真人再战：发送网络请求
            if (window.Network && Network.requestRematch) {
                Network.requestRematch().then(result => {
                    if (result && result.success) {
                        this.showToast('已发送再来一局请求...');
                        // 更新按钮状态
                        const btn = document.querySelector('.result-btn.primary');
                        if (btn) {
                            btn.textContent = '等待对方...';
                            btn.disabled = true;
                            btn.style.opacity = '0.7';
                            btn.style.cursor = 'not-allowed';
                        }
                    } else {
                        this.showToast('请求失败: ' + (result ? result.error : '未知错误'));
                    }
                });
            } else {
                this.showToast('网络模块未接通');
            }
        }
    },

    showVictoryParticles() {
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');

        const particles = [];
        const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6'];

        // 创建粒子
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15 - 5,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                gravity: 0.15,
                life: 1
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let alive = false;
            particles.forEach(p => {
                if (p.life <= 0) return;

                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.life -= 0.015;

                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);

                alive = true;
            });

            if (alive) {
                requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };

        animate();
    },

    requestRematch() {
        if (window.Network && Network.requestRematch) {
            Network.requestRematch().then(result => {
                if (result && result.success) {
                    this.showToast('已发送再来一局请求...');
                    // 更新按钮状态
                    const btn = document.querySelector('.result-btn.primary');
                    if (btn) {
                        btn.textContent = '等待对方...';
                        btn.disabled = true;
                        btn.style.opacity = '0.7';
                        btn.style.cursor = 'not-allowed';
                    }
                } else {
                    this.showToast('请求失败: ' + (result ? result.error : '未知错误'));
                }
            });
        } else {
            this.showToast('网络模块未接通');
        }
    },


    returnToMenu() {
        this.cleanup();
        document.getElementById('mp-result-modal')?.remove();
        document.getElementById('game-container')?.classList.add('hidden');
        document.getElementById('main-menu')?.classList.remove('hidden');
    },

    // ============ 工具方法 ============
    showToast(message) {
        // 使用现有的toast或创建新的
        if (window.game && game.ui && game.ui.showToast) {
            game.ui.showToast(message);
        } else {
            console.log('[MultiplayerUI] Toast:', message);
            alert(message);
        }
    },

    getMyAvatar() {
        return window.AvatarSystem ? AvatarSystem.getCurrent().emoji : '🎮';
    },

    getMyName() {
        return localStorage.getItem('gomoku_player_name') || '玩家';
    },

    getMyElo() {
        // 优先使用 PlayerStats 的真实 ELO
        if (window.PlayerStats && PlayerStats.data && PlayerStats.data.competitive) {
            return PlayerStats.data.competitive.elo;
        }
        return parseInt(localStorage.getItem('gomoku_elo') || '1000');
    },

    cleanup() {
        this.phase = 'idle';
        this.unbindEvents();
        this.stopProgressivePrompts(); // 停止渐进式提示
        this.hideReservationIndicator(); // 隐藏预约指示器

        // 🔥 移除 mp-game 类
        document.body.classList.remove('mp-game');

        // 清除所有计时器
        Object.values(this.timers).forEach(timer => clearInterval(timer));
        this.timers = {};

        // 取消所有动画帧
        Object.values(this.animationFrames).forEach(frame => cancelAnimationFrame(frame));
        this.animationFrames = {};

        // 隐藏所有UI
        document.getElementById('mp-my-card')?.classList.add('hidden');
        document.getElementById('mp-opponent-card')?.classList.add('hidden');
        document.getElementById('mp-game-actions')?.classList.add('hidden');
        document.getElementById('mp-turn-indicator')?.classList.add('hidden');
        document.getElementById('mp-chat-popup')?.classList.add('hidden');
    },

    // ============ 预约匹配 UI ============

    // 显示预约模式界面
    showReservationUI() {
        const modal = document.getElementById('matchmaking-modal');
        if (!modal) return;

        this.stopProgressivePrompts(); // 停止渐进式提示

        const content = modal.querySelector('.modal-content') || modal.querySelector('.matchmaking-content');
        if (content) {
            content.innerHTML = `
                <div class="reservation-mode">
                    <div class="reservation-icon">🔔</div>
                    <div class="reservation-title">预约匹配已开启</div>
                    <div class="reservation-status">
                        <span class="status-dot"></span>
                        状态：后台匹配中
                    </div>
                    <div class="reservation-tip">
                        💡 匹配成功后会在屏幕顶部通知您
                    </div>
                    <div class="reservation-activities">
                        <div class="activities-title">🎮 您现在可以：</div>
                        <div class="activities-buttons">
                            <button class="activity-btn" id="res-story-btn">📖 故事模式</button>
                            <button class="activity-btn" id="res-ai-btn">🤖 AI练习</button>
                            <button class="activity-btn" id="res-culture-btn">📜 文化探索</button>
                        </div>
                    </div>
                    <button class="reservation-cancel-btn" id="res-cancel-btn">取消预约</button>
                </div>
            `;

            // 绑定事件
            document.getElementById('res-cancel-btn')?.addEventListener('click', () => {
                if (window.RobustMatchmaking) {
                    RobustMatchmaking.cancelReservation();
                }
                modal.classList.add('hidden');
                document.getElementById('main-menu')?.classList.remove('hidden');
            });

            document.getElementById('res-story-btn')?.addEventListener('click', () => {
                modal.classList.add('hidden');
                this.showReservationIndicator();
                if (window.game) game.startStoryMode();
            });

            document.getElementById('res-ai-btn')?.addEventListener('click', () => {
                modal.classList.add('hidden');
                this.showReservationIndicator();
                if (window.game) game.startPVE();
            });

            document.getElementById('res-culture-btn')?.addEventListener('click', () => {
                modal.classList.add('hidden');
                this.showReservationIndicator();
                document.getElementById('culture-modal')?.classList.remove('hidden');
            });
        }
    },

    // 显示预约状态小图标（顶部常驻）
    showReservationIndicator() {
        let indicator = document.getElementById('reservation-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'reservation-indicator';
            indicator.innerHTML = `
                <span class="res-icon">🔔</span>
                <span class="res-text">预约匹配中</span>
            `;
            indicator.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: linear-gradient(135deg, rgba(0, 150, 255, 0.9), rgba(100, 200, 255, 0.9));
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.9em;
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 6px;
                animation: reservationPulse 2s infinite;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0, 150, 255, 0.3);
            `;
            indicator.addEventListener('click', () => {
                // 点击返回预约界面
                this.showReservationUI();
                document.getElementById('matchmaking-modal')?.classList.remove('hidden');
            });
            document.body.appendChild(indicator);

            // 添加动画样式
            if (!document.getElementById('reservation-indicator-styles')) {
                const style = document.createElement('style');
                style.id = 'reservation-indicator-styles';
                style.textContent = `
                    @keyframes reservationPulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.8; transform: scale(1.02); }
                    }
                `;
                document.head.appendChild(style);
            }
        }
        indicator.style.display = 'flex';
    },

    // 隐藏预约状态图标
    hideReservationIndicator() {
        const indicator = document.getElementById('reservation-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    },

    // 显示等待同步界面（非预约方等待预约方确认）
    showSyncWaiting(roomCode, opponentInfo) {
        const modal = document.getElementById('matchmaking-modal');
        if (!modal) return;

        modal.classList.remove('hidden');
        const content = modal.querySelector('.modal-content') || modal.querySelector('.matchmaking-content');
        if (content) {
            content.innerHTML = `
                <div class="sync-waiting">
                    <div class="sync-icon">⏳</div>
                    <div class="sync-title">等待对方确认</div>
                    <div class="sync-opponent">
                        <span class="sync-avatar">${opponentInfo.avatar || '🎮'}</span>
                        <span class="sync-name">${opponentInfo.name || '对手'}</span>
                    </div>
                    <div class="sync-progress">
                        <div class="sync-progress-bar"></div>
                    </div>
                    <div class="sync-tip">对手正在确认对局...</div>
                </div>
            `;
        }

        // 添加样式
        if (!document.getElementById('sync-waiting-styles')) {
            const style = document.createElement('style');
            style.id = 'sync-waiting-styles';
            style.textContent = `
                .sync-waiting {
                    text-align: center;
                    padding: 40px 20px;
                }
                .sync-icon {
                    font-size: 48px;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .sync-title {
                    font-size: 1.4em;
                    color: var(--mp-accent);
                    margin: 20px 0;
                }
                .sync-opponent {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin: 20px 0;
                }
                .sync-avatar {
                    font-size: 2em;
                }
                .sync-name {
                    font-size: 1.2em;
                    color: white;
                }
                .sync-progress {
                    width: 80%;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 2px;
                    margin: 20px auto;
                    overflow: hidden;
                }
                .sync-progress-bar {
                    height: 100%;
                    width: 30%;
                    background: linear-gradient(90deg, var(--mp-primary), var(--mp-secondary));
                    animation: syncLoading 1.5s infinite;
                }
                @keyframes syncLoading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(400%); }
                }
                .sync-tip {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.9em;
                }
            `;
            document.head.appendChild(style);
        }

        // 监听双方确认
        this.waitForBothConfirmed(roomCode, opponentInfo, null);
    },

    // 匹配成功通知（预约模式下）
    showReservationMatchNotification(opponentInfo) {
        this.hideReservationIndicator();

        // 创建全局通知
        let notif = document.getElementById('match-notification');
        if (notif) notif.remove();

        notif = document.createElement('div');
        notif.id = 'match-notification';
        notif.innerHTML = `
            <div class="notif-content">
                <div class="notif-icon">🎉</div>
                <div class="notif-text">
                    <div class="notif-title">对手已找到！</div>
                    <div class="notif-opponent">
                        <span class="notif-avatar">${opponentInfo.avatar || '🎮'}</span>
                        <span class="notif-name">${opponentInfo.name || '对手'}</span>
                        <span class="notif-elo">(ELO: ${opponentInfo.elo || 1000})</span>
                    </div>
                </div>
                <div class="notif-actions">
                    <button class="notif-btn primary" id="notif-start-btn">立即开始</button>
                    <div class="notif-timer">⏱️ <span id="notif-countdown">30</span>秒</div>
                </div>
            </div>
        `;
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 2px solid #00d4ff;
            border-radius: 16px;
            padding: 20px 30px;
            z-index: 10000;
            box-shadow: 0 10px 40px rgba(0, 150, 255, 0.3);
            animation: slideDownNotif 0.5s ease;
        `;

        // 添加动画样式
        if (!document.getElementById('match-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'match-notification-styles';
            style.textContent = `
                @keyframes slideDownNotif {
                    from { top: -100px; opacity: 0; }
                    to { top: 20px; opacity: 1; }
                }
                #match-notification .notif-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    color: white;
                }
                #match-notification .notif-icon {
                    font-size: 48px;
                }
                #match-notification .notif-title {
                    font-size: 1.3em;
                    font-weight: bold;
                }
                #match-notification .notif-opponent {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 1.1em;
                }
                #match-notification .notif-avatar {
                    font-size: 1.5em;
                }
                #match-notification .notif-elo {
                    color: rgba(255, 255, 255, 0.7);
                }
                #match-notification .notif-actions {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    margin-top: 10px;
                }
                #match-notification .notif-btn {
                    padding: 12px 32px;
                    border: none;
                    border-radius: 25px;
                    font-size: 1.1em;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                #match-notification .notif-btn.primary {
                    background: linear-gradient(135deg, #00d4ff, #00a8ff);
                    color: white;
                }
                #match-notification .notif-btn:hover {
                    transform: scale(1.05);
                }
                #match-notification .notif-timer {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.9em;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notif);

        // 30秒倒计时
        let countdown = 30;
        const countdownEl = document.getElementById('notif-countdown');
        this.notifCountdown = setInterval(() => {
            countdown--;
            if (countdownEl) countdownEl.textContent = countdown;
            if (countdown <= 0) {
                clearInterval(this.notifCountdown);
                notif.remove();
                if (window.RobustMatchmaking) {
                    RobustMatchmaking.cancelReservation('响应超时');
                }
            }
        }, 1000);

        // 绑定开始按钮
        document.getElementById('notif-start-btn')?.addEventListener('click', async () => {
            clearInterval(this.notifCountdown);

            // 写入确认状态
            const roomCode = this.gameState.roomCode;
            if (roomCode && window.Network && Network.myPlayerId) {
                try {
                    // 显示等待同步提示
                    notif.querySelector('.notif-title').textContent = '正在同步...';
                    notif.querySelector('.notif-timer').textContent = '等待对方确认';

                    // 写入我的确认状态
                    await firebase.database().ref('rooms').child(roomCode)
                        .child('players').child(Network.myPlayerId)
                        .update({ confirmed: true });

                    // 监听双方确认
                    this.waitForBothConfirmed(roomCode, opponentInfo, notif);
                } catch (e) {
                    console.error('[MultiplayerUI] Confirm failed:', e);
                    notif.remove();
                    document.getElementById('matchmaking-modal')?.classList.remove('hidden');
                    this.showFateWheel(opponentInfo);
                }
            } else {
                notif.remove();
                document.getElementById('matchmaking-modal')?.classList.remove('hidden');
                this.showFateWheel(opponentInfo);
            }
        });
    },

    // 等待双方都确认后开始动画
    waitForBothConfirmed(roomCode, opponentInfo, notif) {
        const playersRef = firebase.database().ref('rooms').child(roomCode).child('players');
        const myColor = this.gameState.myColor || 'black';

        const checkConfirmed = playersRef.on('value', (snap) => {
            const players = snap.val();
            if (!players) return;

            const allConfirmed = Object.values(players).every(p => p.confirmed === true);

            if (allConfirmed) {
                console.log('[MultiplayerUI] Both confirmed! Starting synchronized animation');

                // 停止监听
                playersRef.off('value', checkConfirmed);

                // 移除通知
                if (notif) notif.remove();

                // 双方同时进入动画
                document.getElementById('matchmaking-modal')?.classList.remove('hidden');
                this.showFateWheel(opponentInfo);

                // 🔥 设置动画结束后的游戏启动
                if (window.RobustMatchmakingUI) {
                    RobustMatchmakingUI.setupAnimationWatcher(roomCode, myColor);
                }
            }
        });

        // 15秒超时保护
        setTimeout(() => {
            playersRef.off('value', checkConfirmed);
            if (notif && notif.parentNode) {
                notif.remove();
                document.getElementById('matchmaking-modal')?.classList.remove('hidden');
                this.showFateWheel(opponentInfo);
                if (window.RobustMatchmakingUI) {
                    RobustMatchmakingUI.setupAnimationWatcher(roomCode, myColor);
                }
            }
        }, 15000);
    },

    // 被邀请方（B）等待同步后播放动画
    showSyncWaitingForAnimation(roomCode, opponentInfo, color) {
        console.log('[MultiplayerUI] Waiting for sync animation, room:', roomCode);

        // 显示等待同步UI
        const modal = document.getElementById('matchmaking-modal');
        if (modal) {
            modal.classList.remove('hidden');
            const searchSection = modal.querySelector('.quantum-search-section');
            if (searchSection) {
                searchSection.innerHTML = `
                    <div class="sync-waiting">
                        <div class="sync-icon">⏳</div>
                        <div class="sync-title">等待对方确认...</div>
                        <div class="sync-opponent">
                            <span class="sync-avatar">${opponentInfo.avatar}</span>
                            <span class="sync-name">${opponentInfo.name}</span>
                        </div>
                        <div class="sync-hint">对方正在确认中</div>
                    </div>
                `;
            }
        }

        // 监听双方确认
        const playersRef = firebase.database().ref('rooms').child(roomCode).child('players');

        const checkConfirmed = playersRef.on('value', (snap) => {
            const players = snap.val();
            if (!players) return;

            const allConfirmed = Object.values(players).every(p => p.confirmed === true);

            if (allConfirmed) {
                console.log('[MultiplayerUI] Both confirmed! Starting animation');
                playersRef.off('value', checkConfirmed);

                // 双方同时进入动画
                this.showFateWheel(opponentInfo);

                // 设置动画结束后的游戏启动
                if (window.RobustMatchmakingUI) {
                    RobustMatchmakingUI.setupAnimationWatcher(roomCode, color);
                }
            }
        });

        // 15秒超时保护
        setTimeout(() => {
            playersRef.off('value', checkConfirmed);
            console.log('[MultiplayerUI] Sync timeout, starting animation anyway');
            this.showFateWheel(opponentInfo);
            if (window.RobustMatchmakingUI) {
                RobustMatchmakingUI.setupAnimationWatcher(roomCode, color);
            }
        }, 15000);
    },

    // 显示游戏邀请弹窗（当有玩家邀请对战时）
    showGameInvite(invite) {
        // 检查玩家状态，决定显示方式
        const playerStatus = window.Network?._currentStatus || 'idle';

        // 游戏中状态：显示小图标提示
        if (['pve', 'story', 'culture'].includes(playerStatus)) {
            this.showInviteIndicator(invite);
            return;
        }

        // 空闲状态：显示完整弹窗
        this.showInvitePopup(invite);
    },

    // 显示邀请小图标（游戏中使用）
    showInviteIndicator(invite) {
        // 移除旧的
        document.getElementById('invite-indicator')?.remove();

        const indicator = document.createElement('div');
        indicator.id = 'invite-indicator';
        indicator.innerHTML = `🎮 <span class="indicator-badge">1</span>`;
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: linear-gradient(135deg, #ffa500, #ff6b00);
            color: white;
            padding: 10px 15px;
            border-radius: 25px;
            font-size: 1.2em;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(255, 165, 0, 0.4);
            animation: indicatorPulse 1s infinite;
        `;

        // 添加动画样式
        if (!document.getElementById('invite-indicator-styles')) {
            const style = document.createElement('style');
            style.id = 'invite-indicator-styles';
            style.textContent = `
                @keyframes indicatorPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                #invite-indicator .indicator-badge {
                    background: #ff0000;
                    border-radius: 50%;
                    padding: 2px 8px;
                    font-size: 0.8em;
                    margin-left: 5px;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(indicator);

        // 点击展开详情
        indicator.addEventListener('click', () => {
            indicator.remove();
            this.showInvitePopup(invite);
        });

        // 7秒后自动消失
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.remove();
                if (window.RobustMatchmaking) {
                    RobustMatchmaking.onInviteDeclined(invite.inviterId);
                }
            }
        }, 7000);
    },

    // 显示完整邀请弹窗
    showInvitePopup(invite) {
        // 防止重复显示
        if (document.getElementById('game-invite-popup')) return;

        const popup = document.createElement('div');
        popup.id = 'game-invite-popup';
        popup.innerHTML = `
            <div class="invite-content">
                <div class="invite-icon">🎮</div>
                <div class="invite-title">有玩家邀请你对战！</div>
                <div class="invite-player">
                    <span class="invite-avatar">${invite.inviterAvatar || '🎮'}</span>
                    <span class="invite-name">${invite.inviterName || '玩家'}</span>
                    <span class="invite-elo">(ELO: ${invite.inviterElo || 1000})</span>
                </div>
                <div class="invite-actions">
                    <button class="invite-btn primary" id="invite-accept-btn">✅ 接受挑战</button>
                    <button class="invite-btn secondary" id="invite-decline-btn">❌ 稍后再说</button>
                </div>
                <div class="invite-timer">⏱️ <span id="invite-countdown">7</span>秒</div>
                <label class="invite-dnd">
                    <input type="checkbox" id="invite-dnd-checkbox">
                    <span>不再接收邀请</span>
                </label>
            </div>
        `;
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 2px solid #ffa500;
            border-radius: 20px;
            padding: 30px 40px;
            z-index: 10000;
            box-shadow: 0 10px 50px rgba(255, 165, 0, 0.3);
            animation: invitePopIn 0.3s ease;
        `;

        // 添加样式
        if (!document.getElementById('game-invite-styles')) {
            const style = document.createElement('style');
            style.id = 'game-invite-styles';
            style.textContent = `
                @keyframes invitePopIn {
                    from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
                    to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                #game-invite-popup .invite-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                    color: white;
                    text-align: center;
                }
                #game-invite-popup .invite-icon {
                    font-size: 48px;
                    animation: shake 0.5s ease-in-out infinite;
                }
                @keyframes shake {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(10deg); }
                    75% { transform: rotate(-10deg); }
                }
                #game-invite-popup .invite-title {
                    font-size: 1.3em;
                    font-weight: bold;
                    color: #ffa500;
                }
                #game-invite-popup .invite-player {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 1.1em;
                }
                #game-invite-popup .invite-avatar {
                    font-size: 1.8em;
                }
                #game-invite-popup .invite-elo {
                    color: rgba(255, 255, 255, 0.7);
                }
                #game-invite-popup .invite-actions {
                    display: flex;
                    gap: 15px;
                    margin-top: 10px;
                }
                #game-invite-popup .invite-btn {
                    padding: 12px 25px;
                    border: none;
                    border-radius: 25px;
                    font-size: 1em;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                #game-invite-popup .invite-btn.primary {
                    background: linear-gradient(135deg, #4ade80, #22c55e);
                    color: white;
                }
                #game-invite-popup .invite-btn.secondary {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                #game-invite-popup .invite-btn:hover {
                    transform: scale(1.05);
                }
                #game-invite-popup .invite-timer {
                    font-size: 0.9em;
                    color: rgba(255, 255, 255, 0.6);
                }
                #game-invite-popup .invite-dnd {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.85em;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    margin-top: 5px;
                }
                #game-invite-popup .invite-dnd input {
                    cursor: pointer;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(popup);

        // 7-second countdown
        let countdown = 7;
        const countdownEl = document.getElementById('invite-countdown');
        const countdownTimer = setInterval(() => {
            countdown--;
            if (countdownEl) countdownEl.textContent = countdown;
            if (countdown <= 0) {
                clearInterval(countdownTimer);
                popup.remove();
                // Timeout treated as rejection
                this.handleInviteDecline(invite);
            }
        }, 1000);

        // Bind accept button
        document.getElementById('invite-accept-btn')?.addEventListener('click', () => {
            clearInterval(countdownTimer);
            popup.remove();
            if (window.RobustMatchmaking) {
                RobustMatchmaking.onInviteAccepted(invite.inviterId);
                RobustMatchmaking.acceptInvite(invite);
            }
        });

        // Bind reject button
        document.getElementById('invite-decline-btn')?.addEventListener('click', () => {
            clearInterval(countdownTimer);
            popup.remove();
            this.handleInviteDecline(invite);
        });
    },

    // Handle invite rejection
    async handleInviteDecline(invite) {
        // Check if "Do Not Disturb" is checked
        const dndCheckbox = document.getElementById('invite-dnd-checkbox');
        if (dndCheckbox?.checked) {
            // Save DND settings
            localStorage.setItem('gomoku_invite_disabled', 'true');
            if (window.firebase && firebase.database && window.Network?.myPlayerId) {
                try {
                    await firebase.database().ref('settings')
                        .child(Network.myPlayerId)
                        .update({ inviteDisabled: true });
                } catch (e) {
                    console.warn('[MultiplayerUI] Failed to save DND setting:', e);
                }
            }
        }

        if (window.RobustMatchmaking) {
            RobustMatchmaking.onInviteDeclined(invite.inviterId);
            RobustMatchmaking.declineInvite();
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        MultiplayerUI.init();
    }, 1000);
});

window.MultiplayerUI = MultiplayerUI;
