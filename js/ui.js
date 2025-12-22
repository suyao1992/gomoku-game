// UI交互模块
class UIManager {
    constructor() {
        this.elements = {
            currentPlayer: document.getElementById('current-player'),
            winnerModal: document.getElementById('winner-modal'),
            winnerTitle: document.getElementById('winner-title'),
            winnerMessage: document.getElementById('winner-message'),
            modeSelect: document.getElementById('mode-select'),
            rpsModal: document.getElementById('rps-modal'),
            gameModeDisplay: document.getElementById('game-mode-display'),
            aiThinking: document.getElementById('ai-thinking'),
            countdownModal: document.getElementById('countdown-modal'),
            countdownNumber: document.getElementById('countdown-number'),
            blackLabel: document.getElementById('black-label'),
            whiteLabel: document.getElementById('white-label'),
            p1Choices: document.getElementById('p1-choices'),
            p2Choices: document.getElementById('p2-choices'),
            p1Selected: document.getElementById('p1-selected'),
            p2Selected: document.getElementById('p2-selected'),
            rpsResult: document.getElementById('rps-result'),
            rpsWaiting: document.getElementById('rps-waiting'),
            rpsP1: document.getElementById('rps-p1'),
            rpsP2: document.getElementById('rps-p2'),
            p2Label: document.getElementById('p2-label'),
            gameTimer: document.getElementById('game-timer'),
            gameStats: document.getElementById('game-stats'),
            // 角色相关元素
            characterWrapper: document.getElementById('character-wrapper'),
            charImg: document.getElementById('char-img'),
            dialogueBox: document.getElementById('dialogue-box'),
            dialogueText: document.getElementById('dialogue-text'),
            // 故事对话相关元素
            storyDialogModal: document.getElementById('story-dialog-modal'),
            storySpeaker: document.getElementById('story-speaker'),
            storyText: document.getElementById('story-text'),
            skipDialogBtn: document.getElementById('skip-dialog-btn'),
            // 温故知新关卡选择相关元素
            missionSelectModal: document.getElementById('mission-select-modal'),
            missionProgressText: document.getElementById('mission-progress-text'),
            missionList: document.getElementById('mission-list'),
            missionSelectClose: document.getElementById('mission-select-close'),
            // 聊天元素
            chatPanel: document.getElementById('chat-panel'),
            chatBtn: document.getElementById('chat-btn'),
            blackChatBubble: document.getElementById('black-chat-bubble'),
            whiteChatBubble: document.getElementById('white-chat-bubble')
        };

        this.dialogueTimeout = null;

        // 故事对话状态
        this.storyDialogState = {
            lines: [],
            currentIndex: 0,
            onFinished: null
        };

        // 存储事件处理器引用,便于后续移除
        this._storyDialogClickHandler = null;
        this._skipDialogClickHandler = null;
        this._missionSelectCloseHandler = null;

        // 初始化绑定
        this.initElementBindings();
    }

    // This method is added to ensure elements are bound, especially for dynamically loaded ones or if called before DOM is ready.
    // In this specific context, it re-fetches chat elements.
    initElementBindings() {
        this.elements.chatPanel = this.elements.chatPanel || document.getElementById('chat-panel');
        this.elements.chatBtn = this.elements.chatBtn || document.getElementById('chat-btn');
        this.elements.blackChatBubble = this.elements.blackChatBubble || document.getElementById('black-chat-bubble');
        this.elements.whiteChatBubble = this.elements.whiteChatBubble || document.getElementById('white-chat-bubble');

        // New Bento Grid bindings
        this.elements.gameLayout = this.elements.gameLayout || document.querySelector('.game-layout');
        this.elements.controls = this.elements.controls || document.querySelector('.controls');
        this.elements.onlineHeader = this.elements.onlineHeader || document.getElementById('online-header');
        this.elements.mainMenuView = this.elements.mainMenuView || document.getElementById('main-menu-view');

        // Settings Modal Elements
        this.elements.settingsModal = this.elements.settingsModal || document.getElementById('settings-modal');
        this.elements.musicToggle = this.elements.musicToggle || document.getElementById('setting-music-toggle');
        this.elements.soundToggle = this.elements.soundToggle || document.getElementById('setting-sound-toggle');
        this.elements.volumeSlider = this.elements.volumeSlider || document.getElementById('setting-volume-slider');
        this.elements.volumeDisplay = this.elements.volumeDisplay || document.getElementById('volume-value-display');

        // Initialize Settings Events if not already done
        if (!this._settingsEventsBound) {
            this.initSettingsEvents();
            this._settingsEventsBound = true;
        }
    }

    // Initialize Settings Events
    initSettingsEvents() {
        if (this.elements.musicToggle) {
            this.elements.musicToggle.addEventListener('change', (e) => {
                if (window.game && window.game.audio) {
                    const shouldPlay = e.target.checked;
                    console.log('[UI] Music Toggle Changed:', shouldPlay);

                    if (shouldPlay) {
                        window.game.audio.startBGM();
                    } else {
                        window.game.audio.stopBGM();
                    }
                }
            });
        }

        if (this.elements.soundToggle) {
            this.elements.soundToggle.addEventListener('change', (e) => {
                // SFX Toggle: Logic from PlayerStats was setVolume(0.5 or 0)
                // We should probably refine this. 
                // faster solution: Mute audio if unchecked?
                if (window.game && window.game.audio) {
                    const vol = e.target.checked ? 0.5 : 0;
                    window.game.audio.setVolume(vol);

                    // Sync slider if exists
                    if (this.elements.volumeSlider) {
                        this.elements.volumeSlider.value = vol * 100;
                        if (this.elements.volumeDisplay) this.elements.volumeDisplay.textContent = Math.round(vol * 100) + '%';
                    }
                }
            });
        }

        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.addEventListener('input', (e) => {
                const vol = e.target.value / 100;
                if (window.game && window.game.audio) {
                    window.game.audio.setVolume(vol);
                }

                // Update display
                if (this.elements.volumeDisplay) {
                    this.elements.volumeDisplay.textContent = e.target.value + '%';
                }

                // Update sound toggle if volume is 0
                if (this.elements.soundToggle) {
                    this.elements.soundToggle.checked = vol > 0;
                }
            });
        }
    }

    // Open Settings Modal
    openSettings() {
        this.initElementBindings();
        if (this.elements.settingsModal) {
            this.elements.settingsModal.classList.remove('hidden');

            // Sync UI with current Audio State
            if (window.game && window.game.audio) {
                // Music
                if (this.elements.musicToggle) {
                    this.elements.musicToggle.checked = window.game.audio.bgmPlaying;
                }

                // Volume / Sound
                // Assuming masterVolume is exposed
                const vol = window.game.audio.masterVolume !== undefined ? window.game.audio.masterVolume : 0.5;

                if (this.elements.volumeSlider) {
                    this.elements.volumeSlider.value = vol * 100;
                }
                if (this.elements.volumeDisplay) {
                    this.elements.volumeDisplay.textContent = Math.round(vol * 100) + '%';
                }
                if (this.elements.soundToggle) {
                    this.elements.soundToggle.checked = vol > 0;
                }
            }
        }
    }

    // Close Settings Modal
    closeSettings() {
        if (this.elements.settingsModal) {
            this.elements.settingsModal.classList.add('hidden');
        }
    }

    // 更新控制按钮显示
    updateControls(mode, isHost) {
        this.initElementBindings();

        if (mode === 'online') {
            // 联机模式：显示认输，隐藏悔棋，显示聊天
            if (this.elements.undoBtn) this.elements.undoBtn.classList.add('hidden');
            if (this.elements.surrenderBtn) this.elements.surrenderBtn.classList.remove('hidden');
            if (this.elements.chatBtn) this.elements.chatBtn.classList.remove('hidden');

            // 房主显示重新开始，非房主隐藏
            if (this.elements.restartBtn) {
                if (isHost) this.elements.restartBtn.classList.remove('hidden');
                else this.elements.restartBtn.classList.add('hidden');
            }
        } else {
            // 本地模式：显示悔棋，隐藏认输，隐藏聊天
            if (this.elements.undoBtn) this.elements.undoBtn.classList.remove('hidden');
            if (this.elements.surrenderBtn) this.elements.surrenderBtn.classList.add('hidden');
            if (this.elements.chatBtn) this.elements.chatBtn.classList.add('hidden');
            if (this.elements.chatPanel) this.elements.chatPanel.classList.add('hidden');

            if (this.elements.restartBtn) this.elements.restartBtn.classList.remove('hidden');
        }
    }

    // 显示主菜单 (Bento Grid)
    showMainMenu() {
        this.initElementBindings(); // Ensure elements are bound

        if (this.elements.mainMenuView) {
            this.elements.mainMenuView.classList.remove('hidden');
            this.elements.mainMenuView.style.display = 'flex';
        }

        // Hide Game Elements
        if (this.elements.gameLayout) this.elements.gameLayout.classList.add('hidden');
        if (this.elements.controls) this.elements.controls.classList.add('hidden');
        if (this.elements.onlineHeader) this.elements.onlineHeader.classList.add('hidden');

        // Hide other modals if open
        if (this.elements.modeSelect) this.elements.modeSelect.classList.add('hidden');
    }

    // 隐藏主菜单
    hideMainMenu() {
        this.initElementBindings();

        if (this.elements.mainMenuView) {
            this.elements.mainMenuView.classList.add('hidden');
            this.elements.mainMenuView.style.display = 'none';
        }

        // Show Game Elements (only gameLayout and controls)
        // Note: onlineHeader should NOT be shown here - it's only for online mode
        // and is controlled by toggleOnlineHeader() when entering online mode
        if (this.elements.gameLayout) this.elements.gameLayout.classList.remove('hidden');
        if (this.elements.controls) this.elements.controls.classList.remove('hidden');
        // Removed: if (this.elements.onlineHeader) this.elements.onlineHeader.classList.remove('hidden');
    }

    // 模式选择 (Compatibility Wrapper)
    showModeSelect() {
        // Redirect to new Main Menu
        this.showMainMenu();
    }

    hideModeSelect() {
        console.log('[UI] hideModeSelect called, element:', this.elements.modeSelect);
        if (this.elements.modeSelect) {
            this.elements.modeSelect.classList.add('hidden');
            console.log('[UI] modeSelect hidden class added');
        } else {
            console.error('[UI] modeSelect element is null!');
            // 备用方案
            document.getElementById('mode-select')?.classList.add('hidden');
        }
    }

    // 猜拳界面
    showRPS(gameMode) {
        this.elements.rpsModal.classList.remove('hidden');
        this.elements.p1Choices.classList.remove('hidden');
        this.elements.p2Choices.classList.add('hidden');
        this.elements.p1Selected.classList.add('hidden');
        this.elements.p2Selected.classList.add('hidden');
        this.elements.rpsResult.classList.add('hidden');
        this.elements.rpsWaiting.textContent = '等待玩家1选择...';
        this.elements.rpsWaiting.classList.remove('hidden');
        this.elements.rpsP1.classList.remove('winner');
        this.elements.rpsP2.classList.remove('winner');
        this.elements.rpsP1.classList.add('active');
        this.elements.rpsP2.classList.remove('active');

        document.querySelectorAll('.rps-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('selected');
        });

        this.elements.p2Label.textContent = gameMode === 'pve' ? 'AI' : '玩家2';
    }

    hideRPS() {
        this.elements.rpsModal.classList.add('hidden');
    }

    updateRPSPlayer1(symbol) {
        this.elements.p1Choices.classList.add('hidden');
        this.elements.p1Selected.textContent = symbol;
        this.elements.p1Selected.classList.remove('hidden');
        this.elements.rpsP1.classList.remove('active');
    }

    showRPSPlayer2Choices() {
        this.elements.p2Choices.classList.remove('hidden');
        this.elements.rpsP2.classList.add('active');
        this.elements.rpsWaiting.textContent = '等待玩家2选择...';
    }

    showRPSAIWaiting() {
        this.elements.rpsP2.classList.add('active');
        this.elements.rpsWaiting.textContent = 'AI选择中...';
    }

    updateRPSPlayer2(symbol) {
        this.elements.p2Choices.classList.add('hidden');
        this.elements.p2Selected.textContent = symbol;
        this.elements.p2Selected.classList.remove('hidden');
        this.elements.rpsP2.classList.remove('active');
        this.elements.rpsWaiting.classList.add('hidden');
    }

    showRPSResult(winner, winnerName) {
        const resultEl = this.elements.rpsResult;
        resultEl.classList.remove('hidden', 'draw');

        if (winner === 0) {
            resultEl.textContent = '🤝 平局！重新猜拳...';
            resultEl.classList.add('draw');
        } else {
            resultEl.textContent = `🎉 ${winnerName} 获胜！执黑先手！`;
            this.elements[winner === 1 ? 'rpsP1' : 'rpsP2'].classList.add('winner');
        }
    }

    // 倒计时
    showCountdown() {
        // 如果房间等待弹窗是打开的，先隐藏它
        const roomWaitingModal = document.getElementById('room-waiting-modal');
        if (roomWaitingModal && !roomWaitingModal.classList.contains('hidden')) {
            roomWaitingModal.classList.add('hidden');
        }

        this.elements.countdownModal.classList.remove('hidden');
    }

    hideCountdown() {
        this.elements.countdownModal.classList.add('hidden');
    }

    updateCountdown(count) {
        this.elements.countdownNumber.textContent = count;
        if (count === '开始!') {
            this.elements.countdownNumber.style.color = '#00ff88';
        } else {
            this.elements.countdownNumber.style.animation = 'none';
            void this.elements.countdownNumber.offsetWidth;
            this.elements.countdownNumber.style.animation = 'countPop 0.5s ease-out';
        }
    }

    resetCountdownColor() {
        this.elements.countdownNumber.style.color = '#00d4ff';
    }

    // 游戏状态
    updateCurrentPlayer(player) {
        if (this.elements.currentPlayer) {
            this.elements.currentPlayer.textContent = player === 1 ? '黑棋 ⚫' : '白棋 ⚪';
        }
    }

    updateGameMode(mode) {
        const modeTexts = {
            'eve': '🎬 AI观战模式',
            'pve': '🤖 人机对战模式',
            'pvp': '👥 双人对战模式',
            'online': '🌐 联机对战模式'
        };
        if (this.elements.gameModeDisplay) {
            this.elements.gameModeDisplay.textContent = modeTexts[mode] || '';
        }
    }

    clearGameMode() {
        if (this.elements.gameModeDisplay) {
            this.elements.gameModeDisplay.textContent = '';
        }
    }

    updateLabels(gameMode, firstPlayer) {
        const { blackLabel, whiteLabel } = this.elements;
        if (!blackLabel || !whiteLabel) return; // Null safety
        const playerName = window.Onboarding?.getPlayerName() || '玩家';

        if (gameMode === 'pvp') {
            blackLabel.textContent = firstPlayer === 1 ? `⚫ ${playerName} 1(黑)` : `⚫ ${playerName} 2(黑)`;
            whiteLabel.textContent = firstPlayer === 1 ? `⚪ ${playerName} 2(白)` : `⚪ ${playerName} 1(白)`;
        } else if (gameMode === 'pve') {
            blackLabel.textContent = firstPlayer === 1 ? `⚫ ${playerName} (黑)` : '⚫ 弈·零(黑)';
            whiteLabel.textContent = firstPlayer === 1 ? '⚪ 弈·零(白)' : `⚪ ${playerName} (白)`;
        } else {
            blackLabel.textContent = '⚫ AI-1(黑)';
            whiteLabel.textContent = '⚪ AI-2(白)';
        }
    }

    // AI思考提示
    showAIThinking(show) {
        if (this.elements.aiThinking) {
            this.elements.aiThinking.classList.toggle('hidden', !show);
        }
    }

    // 胜利/平局弹窗
    showWinner(data) {
        // data 可以是字符串(兼容旧代码) 或 对象
        const isObject = typeof data === 'object' && data !== null;
        const text = isObject ? data.title : data;

        this.elements.winnerMessage.textContent = text;
        this.elements.winnerModal.classList.remove('hidden');

        // 处理结算进度条
        const progressContainer = document.getElementById('settlement-progress-container');
        if (progressContainer) {
            if (isObject && data.elo !== undefined) {
                // 显示进度区域
                progressContainer.classList.remove('hidden');

                // 1. 设置基础信息
                const rankNameEl = document.getElementById('settlement-rank-name');
                const eloChangeEl = document.getElementById('settlement-elo-change');
                const tipEl = document.getElementById('settlement-next-tip');
                const barEl = document.getElementById('settlement-progress-bar');

                // 段位名
                if (data.nextRankInfo) { // 传进来的 EloSystem.getNextRank 结果
                    // 如果这局赢了导致段位变化，这里处理稍微复杂，暂时简化显示当前段位
                }

                // Elo 变化文本
                const sign = data.change >= 0 ? '+' : '';
                eloChangeEl.textContent = `${data.elo} (${sign}${data.change})`;
                eloChangeEl.className = data.change >= 0 ? 'settlement-elo' : 'settlement-elo lose';

                // 胜利/失败样式
                progressContainer.className = data.change >= 0 ? 'settlement-container visible win' : 'settlement-container visible';

                // 2. 进度条动画逻辑
                // 计算当前进度的百分比
                let progress = 0;
                let nextRankName = '';
                let tipText = '';

                if (data.nextRankInfo) {
                    progress = data.nextRankInfo.progress;
                    nextRankName = data.nextRankInfo.name;
                    tipText = `距离下一段位 (${nextRankName}) 还需 ${data.nextRankInfo.minElo - data.elo} 分`;
                } else {
                    progress = 100;
                    tipText = '已达最高段位！';
                }

                tipEl.textContent = tipText;

                // 动画：先设为旧进度 (近似)，然后延时设为新进度
                // 为了简化，我们假设每场变化不超过一个段位，直接从 (current - change) 动画到 current
                // 或者更简单：直接从 0 动画到 current (更有填充感)
                barEl.style.transition = 'none';
                barEl.style.width = '0%';

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        barEl.style.transition = 'width 1.5s cubic-bezier(0.22, 1, 0.36, 1)';
                        barEl.style.width = `${Math.max(5, progress)}%`; // 至少显示一点
                    });
                });

            } else {
                // 如果没有 Elo 数据 (比如 PVE)，隐藏进度条
                progressContainer.classList.add('hidden');
                progressContainer.classList.remove('visible');
            }
        }
    }

    hideWinner() {
        this.elements.winnerModal.classList.add('hidden');
    }

    // 再来一局邀请弹窗
    showRematchInvitation(fromName) {
        const modal = document.getElementById('rematch-modal');
        const message = document.getElementById('rematch-message');
        if (modal && message) {
            message.textContent = `${fromName} 想再来一局！`;
            modal.classList.remove('hidden');
        }
    }

    hideRematchInvitation() {
        const modal = document.getElementById('rematch-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // 获取胜利者名称
    getWinnerName(gameMode, player, firstPlayer) {
        if (gameMode === 'eve') {
            return player === 1 ? 'AI-1 (黑棋)' : 'AI-2 (白棋)';
        } else if (gameMode === 'pve') {
            const isHuman = player === (firstPlayer === 1 ? 1 : 2);
            return (isHuman ? '玩家' : '弈·零') + (player === 1 ? ' (黑棋)' : ' (白棋)');
        } else {
            return (player === firstPlayer ? '玩家1' : '玩家2') + (player === 1 ? ' (黑棋)' : ' (白棋)');
        }
    }

    // 更新战绩统计显示
    updateStats(statsText) {
        if (this.elements.gameStats) {
            this.elements.gameStats.textContent = statsText;
        }
    }

    // 显示/隐藏统计
    showStats(show) {
        if (this.elements.gameStats) {
            this.elements.gameStats.style.display = show ? 'block' : 'none';
        }
    }

    // 显示/隐藏计时器
    showTimer(show) {
        if (this.elements.gameTimer && this.elements.gameTimer.parentElement) {
            this.elements.gameTimer.parentElement.style.display = show ? 'block' : 'none';
        }
    }

    // 重置计时器显示
    resetTimer() {
        if (this.elements.gameTimer) {
            this.elements.gameTimer.textContent = '00:00';
        }
    }

    // ========== 角色"弈·零"控制方法 ==========

    // 显示/隐藏角色
    showCharacter(show) {
        if (this.elements.characterWrapper) {
            this.elements.characterWrapper.classList.toggle('hidden', !show);
        }
    }

    // 切换角色状态
    setCharacterState(stateKey, gameState = null) {
        const wrapper = this.elements.characterWrapper;
        const charImg = this.elements.charImg;

        if (!wrapper || !charImg || !window.CHARACTER_CONFIG) return;

        const config = CHARACTER_CONFIG.states[stateKey];
        if (!config) return;

        // 1. 切换图片
        charImg.src = config.img;

        // 2. 切换CSS类 (先移除所有旧状态类，再添加新的)
        wrapper.classList.remove('state-idle', 'state-calc', 'state-attack', 'state-win', 'state-lose');
        wrapper.classList.add(config.cssClass);

        // 3. 同步背景切换（故事模式时根据状态切换背景）
        if (gameState && window.setBackground) {
            setBackground(gameState.currentMode, gameState.currentMissionId, stateKey);
        }

        // 4. 根据状态触发对应台词
        let dialogueType = null;
        switch (stateKey) {
            case 'CALC': dialogueType = 'calc'; break;
            case 'ATTACK': dialogueType = 'attack'; break;
            case 'WIN': dialogueType = 'win'; break;
            case 'LOSE': dialogueType = 'lose'; break;
            case 'IDLE':
                // 待机状态偶尔说话
                if (Math.random() < 0.3) dialogueType = 'idle';
                break;
        }

        if (dialogueType && window.getRandomDialogue) {
            this.showDialogue(getRandomDialogue(dialogueType));
        } else if (stateKey === 'IDLE') {
            this.hideDialogue();
        }
    }

    // 显示对话
    showDialogue(text) {
        if (!text || !this.elements.dialogueBox || !this.elements.dialogueText) return;

        // 清除之前的定时器
        if (this.dialogueTimeout) {
            clearTimeout(this.dialogueTimeout);
        }

        this.elements.dialogueText.innerText = text;
        this.elements.dialogueBox.classList.remove('hidden');

        // 3秒后自动隐藏
        this.dialogueTimeout = setTimeout(() => {
            this.hideDialogue();
        }, 3000);
    }

    // 隐藏对话
    hideDialogue() {
        if (this.elements.dialogueBox) {
            this.elements.dialogueBox.classList.add('hidden');
        }
    }

    // 显示角色台词（智能台词系统使用）
    showCharacterDialogue(text) {
        this.showDialogue(text);
    }

    // 显示开局台词
    showStartDialogue() {
        if (window.getRandomDialogue) {
            this.showDialogue(getRandomDialogue('start'));
        }
    }

    // 显示防御台词
    showDefendDialogue() {
        if (window.getRandomDialogue) {
            this.showDialogue(getRandomDialogue('defend'));
        }
    }

    // ========== 故事对话系统 ==========

    // 个性化文本处理 - 替换占位符
    personalizeText(text) {
        if (!text) return text;
        const playerName = window.Onboarding?.getPlayerName() || '玩家';
        return text
            .replace(/{PLAYER}/g, playerName)
            .replace(/{player}/g, playerName);
    }


    // 显示故事对话场景
    showStoryDialog(key, onFinished) {
        // 根据 key 前缀判断从哪个对话配置中获取
        let lines = null;

        // 对话配置映射表
        const dialogMaps = {
            'mission1_': window.MISSION1_DIALOGS,
            'mission2_': window.MISSION2_DIALOGS,
            'mission3_': window.MISSION3_DIALOGS,
            'mission4_': window.MISSION4_DIALOGS,
            'mission5_': window.MISSION5_DIALOGS,
            'mission6_': window.MISSION6_DIALOGS,
            'mission7_': window.MISSION7_DIALOGS,
        };

        // 遍历查找匹配的对话配置
        for (const [prefix, dialogs] of Object.entries(dialogMaps)) {
            if (key.startsWith(prefix) && dialogs && dialogs[key]) {
                lines = dialogs[key];
                break;
            }
        }

        // 兼容旧格式，尝试从第一关对话中查找
        if (!lines) {
            const dialogs = window.MISSION1_DIALOGS;
            if (dialogs && dialogs[key]) {
                lines = dialogs[key];
            }
        }

        if (!lines) {
            console.warn('Dialog not found:', key);
            if (onFinished) onFinished();
            return;
        }
        this.storyDialogState = {
            lines: lines,
            currentIndex: 0,
            onFinished: onFinished
        };

        // 显示对话框
        this.elements.storyDialogModal.classList.remove('hidden');
        this.renderStoryDialogLine();

        // 创建事件处理器(保存引用以便后续移除)
        if (!this._storyDialogClickHandler) {
            this._storyDialogClickHandler = (e) => {
                // 跳过按钮单独处理,不触发下一行
                if (e.target.id === 'skip-dialog-btn') return;
                this.nextStoryDialogLine();
                // 播放点击音效
                if (window.game && window.game.audio) {
                    window.game.audio.playClick();
                }
            };
        }

        if (!this._skipDialogClickHandler) {
            this._skipDialogClickHandler = (e) => {
                e.stopPropagation();
                this.skipAllDialog();
            };
        }

        // 绑定点击事件(使用保存的处理器)
        if (!this._storyDialogBound) {
            this._storyDialogBound = true;
            this.elements.storyDialogModal.addEventListener('click', this._storyDialogClickHandler);

            // 绑定跳过按钮
            if (this.elements.skipDialogBtn) {
                this.elements.skipDialogBtn.addEventListener('click', this._skipDialogClickHandler);
            }
        }
    }

    // 跳过所有对话
    skipAllDialog() {
        this.hideStoryDialog();
        if (this.storyDialogState.onFinished) {
            this.storyDialogState.onFinished();
        }
    }

    // 渲染当前对话行
    renderStoryDialogLine() {
        const { lines, currentIndex } = this.storyDialogState;
        if (currentIndex >= lines.length) return;

        const line = lines[currentIndex];
        const speakerConfig = window.SPEAKER_CONFIG ? SPEAKER_CONFIG[line.speaker] : null;

        // 更新说话者
        const speakerEl = this.elements.storySpeaker;
        if (speakerConfig) {
            // 如果是玩家说话，显示玩家姓名
            if (line.speaker === 'PLR') {
                const playerName = window.Onboarding?.getPlayerName() || '你';
                speakerEl.textContent = playerName;
            } else {
                speakerEl.textContent = speakerConfig.name;
            }
            speakerEl.className = 'story-dialog-speaker speaker-' + line.speaker.toLowerCase();
        } else {
            speakerEl.textContent = line.speaker;
            speakerEl.className = 'story-dialog-speaker';
        }

        // 更新对话文本（支持个性化占位符替换）
        this.elements.storyText.textContent = this.personalizeText(line.text);

        // 添加动画效果
        this.elements.storyText.style.animation = 'none';
        void this.elements.storyText.offsetWidth;
        this.elements.storyText.style.animation = 'textFade 0.3s ease-out';

        // 更新立绘显示
        this.updateStoryPortrait(speakerConfig);
    }

    // 更新对话立绘
    updateStoryPortrait(speakerConfig) {
        const portraitArea = document.getElementById('story-portrait-area');
        const portraitImg = document.getElementById('story-portrait');
        const dialogWrapper = document.querySelector('.story-dialog-wrapper');

        if (!portraitArea || !portraitImg || !dialogWrapper) return;

        // 判断是否有立绘
        if (speakerConfig && speakerConfig.portrait) {
            // 显示立绘
            portraitImg.src = speakerConfig.portrait;
            portraitImg.alt = speakerConfig.name || '';
            portraitImg.classList.remove('hidden');
            portraitArea.classList.remove('hidden');

            // 根据对齐方向调整布局
            if (speakerConfig.align === 'right') {
                dialogWrapper.classList.add('portrait-right');
                dialogWrapper.classList.remove('portrait-left');
            } else {
                dialogWrapper.classList.add('portrait-left');
                dialogWrapper.classList.remove('portrait-right');
            }

            // 添加入场动画
            portraitImg.style.animation = 'none';
            void portraitImg.offsetWidth;
            portraitImg.style.animation = 'portraitFadeIn 0.4s ease-out';
        } else {
            // 隐藏立绘
            portraitImg.classList.add('hidden');
            portraitArea.classList.add('hidden');
            dialogWrapper.classList.remove('portrait-left', 'portrait-right');
        }
    }

    // 下一行对话
    nextStoryDialogLine() {
        this.storyDialogState.currentIndex++;

        if (this.storyDialogState.currentIndex >= this.storyDialogState.lines.length) {
            // 对话结束
            this.hideStoryDialog();
            if (this.storyDialogState.onFinished) {
                this.storyDialogState.onFinished();
            }
        } else {
            this.renderStoryDialogLine();
        }
    }

    // 隐藏故事对话
    hideStoryDialog() {
        this.elements.storyDialogModal.classList.add('hidden');
    }

    // 设置故事模式背景
    setStoryModeBackground(missionId, stateKey) {
        if (window.setStoryBackground) {
            setStoryBackground('story', missionId, stateKey);
        }
    }

    // 进入故事模式
    enterStoryMode() {
        document.body.classList.add('story-mode');
    }

    // 退出故事模式
    exitStoryMode() {
        document.body.classList.remove('story-mode');
        // 恢复默认背景
        document.body.style.backgroundImage = '';
    }

    // ========== 温故知新关卡选择系统 ==========

    // 打开关卡选择弹窗
    openMissionSelectDialog(onMissionSelect) {
        // 获取带状态的关卡列表
        const missions = window.getMissionsWithStatus ? getMissionsWithStatus() : [];
        const unlockedNext = window.getUnlockedMission ? getUnlockedMission() : 1;

        // 更新进度文字
        this.elements.missionProgressText.textContent = `当前进度：已解锁到第 ${unlockedNext} 关`;

        // 生成关卡列表HTML
        this.renderMissionList(missions, onMissionSelect);

        // 显示弹窗
        this.elements.missionSelectModal.classList.remove('hidden');

        // 绑定关闭按钮事件（只绑定一次）
        if (!this._missionSelectCloseBound) {
            this._missionSelectCloseBound = true;
            this.elements.missionSelectClose.addEventListener('click', () => {
                this.closeMissionSelectDialog();
            });
        }
    }

    // 渲染关卡列表
    renderMissionList(missions, onMissionSelect) {
        const listEl = this.elements.missionList;
        listEl.innerHTML = '';

        missions.forEach(mission => {
            const card = document.createElement('div');
            card.className = `mission-card ${mission.unlocked ? 'unlocked' : 'locked'}`;

            // 生成难度星星
            const stars = this.renderDifficultyStars(mission.difficulty);

            // 只对已解锁的任务显示状态（进行中/已通关）
            let statusHtml = '';
            if (mission.unlocked) {
                if (mission.current) {
                    statusHtml = '<span class="mission-status current">进行中</span>';
                } else if (mission.finished) {
                    statusHtml = '<span class="mission-status finished">已通关</span>';
                }
            }

            // 按钮文案
            const btnText = mission.unlocked ? '重新体验' : '未解锁';

            // 安全: 转义文本和验证URL
            const safeTitle = window.SecurityUtils ?
                SecurityUtils.escapeHTML(mission.title) : mission.title;
            const safeTagline = window.SecurityUtils ?
                SecurityUtils.escapeHTML(mission.tagline) : mission.tagline;
            const safeThumb = window.SecurityUtils ?
                SecurityUtils.sanitizeImageURL(mission.thumb, 'assets/missions/default.jpg') :
                mission.thumb;

            card.innerHTML = `
    <div class="mission-thumb" style="background-image: url('${safeThumb}')"></div>
                <div class="mission-info">
                    <div class="mission-title">${safeTitle}${statusHtml}</div>
                    <div class="mission-tagline">${safeTagline}</div>
                    <div class="mission-difficulty">${stars}</div>
                </div>
                <div class="mission-action">
                    <button class="mission-action-btn">${btnText}</button>
                </div>
`;

            // 点击事件
            if (mission.unlocked) {
                card.addEventListener('click', () => {
                    this.closeMissionSelectDialog();
                    if (onMissionSelect) {
                        onMissionSelect(mission);
                    }
                });
            }

            listEl.appendChild(card);
        });
    }

    // 渲染难度星星
    renderDifficultyStars(difficulty) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += `<span class="star ${i <= difficulty ? '' : 'empty'}">★</span>`;
        }
        return html;
    }

    // 关闭关卡选择弹窗
    closeMissionSelectDialog() {
        this.elements.missionSelectModal.classList.add('hidden');
    }

    // ========== Toast提示系统 ==========

    // 显示Toast提示
    showToast(text, type = 'info') {
        // 创建或获取toast容器
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = text;

        toastContainer.appendChild(toast);

        // 触发动画
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // 3秒后自动消失
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // ========== 禁手教学弹窗系统 ==========

    // 显示禁手教学弹窗（首次触发某类禁手时）
    showForbiddenTutorialModal(options) {
        const { title, bodyLines, point, onConfirm } = options;

        // 创建或获取弹窗
        let modal = document.getElementById('forbidden-tutorial-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'forbidden-tutorial-modal';
            modal.className = 'modal forbidden-modal';
            modal.innerHTML = `
    <div class="modal-content forbidden-tutorial-content">
                    <div class="forbidden-icon">🎓</div>
                    <h2 class="forbidden-title"></h2>
                    <div class="forbidden-body"></div>
                    <div class="forbidden-point-info"></div>
                    <button class="forbidden-confirm-btn">我知道了</button>
                </div>
    `;
            document.body.appendChild(modal);
        }

        // 更新内容
        modal.querySelector('.forbidden-title').textContent = title;
        modal.querySelector('.forbidden-body').innerHTML = bodyLines.map(line => `<p>${line}</p>`).join('');

        if (point) {
            modal.querySelector('.forbidden-point-info').textContent = `禁手位置：(${point.x + 1}, ${point.y + 1})`;
        }

        // 显示弹窗
        modal.classList.remove('hidden');

        // 绑定确认按钮
        const confirmBtn = modal.querySelector('.forbidden-confirm-btn');
        const handleConfirm = () => {
            modal.classList.add('hidden');
            confirmBtn.removeEventListener('click', handleConfirm);
            if (onConfirm) onConfirm();
        };
        confirmBtn.addEventListener('click', handleConfirm);
    }

    // 显示禁手判负面板（严格模式失败时）
    showForbiddenLosePanel(options) {
        const { levelName, title, reasonLines, extraLines, point } = options;

        // 创建或获取弹窗
        let modal = document.getElementById('forbidden-lose-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'forbidden-lose-modal';
            modal.className = 'modal forbidden-modal';
            modal.innerHTML = `
    <div class="modal-content forbidden-lose-content">
                    <div class="forbidden-icon">💔</div>
                    <div class="forbidden-level-name"></div>
                    <h2 class="forbidden-title"></h2>
                    <div class="forbidden-reason"></div>
                    <div class="forbidden-extra"></div>
                    <div class="forbidden-point-info"></div>
                    <div class="forbidden-actions">
                        <button class="forbidden-retry-btn">再试一次</button>
                        <button class="forbidden-menu-btn">返回菜单</button>
                    </div>
                </div>
    `;
            document.body.appendChild(modal);
        }

        // 更新内容
        modal.querySelector('.forbidden-level-name').textContent = levelName;
        modal.querySelector('.forbidden-title').textContent = title;
        modal.querySelector('.forbidden-reason').innerHTML = reasonLines.map(line => `<p>${line}</p>`).join('');

        if (extraLines && extraLines.length > 0) {
            modal.querySelector('.forbidden-extra').innerHTML = extraLines.map(line => `<p class="extra-line">${line}</p>`).join('');
        } else {
            modal.querySelector('.forbidden-extra').innerHTML = '';
        }

        if (point) {
            modal.querySelector('.forbidden-point-info').textContent = `禁手位置：(${point.x + 1}, ${point.y + 1})`;
        }

        // 显示弹窗
        modal.classList.remove('hidden');

        // 绑定按钮事件
        const retryBtn = modal.querySelector('.forbidden-retry-btn');
        const menuBtn = modal.querySelector('.forbidden-menu-btn');

        const handleRetry = () => {
            modal.classList.add('hidden');
            retryBtn.removeEventListener('click', handleRetry);
            menuBtn.removeEventListener('click', handleMenu);
            // 触发重新开始
            document.getElementById('play-again-btn')?.click();
        };

        const handleMenu = () => {
            modal.classList.add('hidden');
            retryBtn.removeEventListener('click', handleRetry);
            menuBtn.removeEventListener('click', handleMenu);
            // 触发返回菜单
            document.getElementById('back-to-menu-btn')?.click();
        };

        retryBtn.addEventListener('click', handleRetry);
        menuBtn.addEventListener('click', handleMenu);
    }

    // ============ 联机对战UI ============

    // 显示联机大厅 - 已禁用，直接返回主菜单
    showOnlineLobby() {
        // 旧代码：document.getElementById('online-lobby-modal')?.classList.remove('hidden');
        // 新逻辑：直接返回主菜单
        document.getElementById('online-lobby-modal')?.classList.add('hidden');
        document.getElementById('main-menu')?.classList.remove('hidden');
        console.log('[UI] showOnlineLobby disabled - returning to main menu');
    }

    // 更新在线人数
    updateOnlineCount(count) {
        // 1. 联机大厅
        // data 可能是数字(旧版)或对象(新版 {total, playing, story})
        const total = (typeof count === 'object') ? (count.total || 0) : (count || 0);
        const playing = (typeof count === 'object') ? (count.playing || 0) : 0;
        const story = (typeof count === 'object') ? (count.story || 0) : 0;

        // 1. 联机大厅
        const lobbyCountEl = document.getElementById('online-count');
        if (lobbyCountEl) {
            // Need 'lobby.online_players' key. Fallback for now.
            const text = window.Localization ? Localization.t('menu.status_online') : '在线'; // Reuse status_online="Online"
            lobbyCountEl.textContent = `${text}: ${total}`;
        }

        // 2. 主菜单 (Bento Grid) - Updated: menu-online-count is now just the number span
        const menuCountEl = document.getElementById('menu-online-count');
        if (menuCountEl) {
            menuCountEl.textContent = total;
        }

        // 3. 对战中 - Updated: menu-playing-count is now just the number span
        const menuPlayingEl = document.getElementById('menu-playing-count');
        if (menuPlayingEl) {
            menuPlayingEl.textContent = playing;
        }

        // 4. 故事模式
        const menuStoryEl = document.getElementById('menu-story-count');
        if (menuStoryEl) {
            // "5 people playing"
            const suffix = window.Localization ? Localization.t('menu.story_playing_suffix') : '人在玩';
            menuStoryEl.textContent = `${story} ${suffix}`;
        }
    }

    // 隐藏联机大厅
    closeOnlineLobby() {
        document.getElementById('online-lobby-modal')?.classList.add('hidden');
        this.showModeSelect();
    }



    // 显示房间等待界面
    showRoomWaiting(roomCode) {
        document.getElementById('room-waiting-modal')?.classList.remove('hidden');
        document.getElementById('display-room-code').textContent = roomCode;

        // 重置准备按钮状态为未准备
        this.updateReadyButton(false);

        // 在等待大厅也显示聊天按钮
        if (this.elements.chatBtn) {
            this.elements.chatBtn.classList.remove('hidden');
        }
    }

    // 隐藏房间等待界面
    closeRoomWaiting() {
        document.getElementById('room-waiting-modal')?.classList.add('hidden');
        if (this.elements.chatBtn) this.elements.chatBtn.classList.add('hidden');
    }

    // 复制房间码
    copyRoomCode() {
        const roomCode = document.getElementById('display-room-code').textContent;
        navigator.clipboard.writeText(roomCode).then(() => {
            // 显示复制成功提示
            const copyBtn = document.querySelector('.copy-btn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✓ 已复制';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    }

    // 更新房间玩家显示 (兼容等待大厅和游戏头部)
    updateRoomPlayers(players) {
        const hostCard = document.querySelector('.player-card.host');
        const guestCard = document.querySelector('.player-card.guest');

        let hostPlayer = null;
        let guestPlayer = null;

        for (const [id, player] of Object.entries(players)) {
            // 简单判定：房主执黑，房客执白 (或根据 id/role 判定)
            if (player.color === 'black') {
                hostPlayer = player;
            } else {
                guestPlayer = player;
            }
        }

        // 1. 更新等待大厅 UI (Waiting Modal)
        if (hostPlayer) {
            const hostNameEl = document.getElementById('host-name');
            if (hostNameEl) hostNameEl.textContent = (hostPlayer.name || '玩家') + ` (${hostPlayer.elo || 1000})`;
            const hostAvatarEl = document.getElementById('host-avatar');
            if (hostAvatarEl) hostAvatarEl.textContent = hostPlayer.avatar || '👤';
            const hostStatusEl = document.getElementById('host-status');
            if (hostStatusEl) {
                hostStatusEl.textContent = hostPlayer.ready ? '已准备' : '未准备';
                hostStatusEl.className = 'player-status' + (hostPlayer.ready ? ' ready' : '');
            }
            if (hostCard) hostCard.classList.toggle('ready', hostPlayer.ready);
        } else {
            // 房主离开处理...
        }

        if (guestPlayer) {
            const guestNameEl = document.getElementById('guest-name');
            if (guestNameEl) guestNameEl.textContent = (guestPlayer.name || '玩家') + ` (${guestPlayer.elo || 1000})`;
            const guestAvatarEl = document.getElementById('guest-avatar')
            if (guestAvatarEl) guestAvatarEl.textContent = guestPlayer.avatar || '👤';
            const guestStatusEl = document.getElementById('guest-status');
            if (guestStatusEl) {
                guestStatusEl.textContent = guestPlayer.ready ? '已准备' : '未准备';
                guestStatusEl.className = 'player-status' + (guestPlayer.ready ? ' ready' : '');
            }
            if (guestCard) {
                guestCard.classList.remove('empty');
                guestCard.classList.toggle('ready', guestPlayer.ready);
            }
        } else {
            // 没有房客
            if (guestCard) guestCard.classList.add('empty');
            const guestNameEl = document.getElementById('guest-name');
            if (guestNameEl) guestNameEl.textContent = '等待加入...';
            const guestAvatarEl = document.getElementById('guest-avatar');
            if (guestAvatarEl) guestAvatarEl.textContent = '❓';
            const guestStatusEl = document.getElementById('guest-status');
            if (guestStatusEl) guestStatusEl.textContent = '--';
            if (guestCard) guestCard.classList.remove('ready');
        }

        // 2. 关键：同步到游戏头部 (Soul Duel Header)
        // 确保即使在游戏中，玩家信息也能实时更新
        if (hostPlayer || guestPlayer) {
            this.updatePlayerInfo(
                hostPlayer ? hostPlayer.name : '等待中...',
                guestPlayer ? guestPlayer.name : '等待中...',
                hostPlayer ? hostPlayer.avatar : '👤',
                guestPlayer ? guestPlayer.avatar : '❓',
                hostPlayer ? hostPlayer.elo : '1000',
                guestPlayer ? guestPlayer.elo : '1000'
            );
        }
    }

    // 更新准备按钮状态
    updateReadyButton(isReady) {
        const readyBtn = document.getElementById('ready-btn');
        if (readyBtn) {
            readyBtn.textContent = isReady ? '取消准备' : '准备';
            readyBtn.classList.toggle('is-ready', isReady);
        }
    }

    // 显示房间消息
    showRoomMessage(message) {
        const msgEl = document.getElementById('room-message');
        if (msgEl) {
            msgEl.textContent = message;
        }
    }



    // 隐藏所有联机弹窗
    closeAllOnlineModals() {
        this.closeOnlineLobby();
        this.closeJoinRoom();
        this.closeRoomWaiting();
    }

    // 快捷消息显示
    showChatMessage(playerColor, msgId) {
        this.initElementBindings();

        const messages = {
            'greeting': '👋 你好',
            'hurry': '⏰ 快点',
            'praise': '👍 厉害',
            'gg': '🤝 承让',
            'oops': '😱 失误',
            'again': '🔄 再来'
        };

        const text = messages[msgId] || msgId;
        const bubble = playerColor === 'black' ? this.elements.blackChatBubble : this.elements.whiteChatBubble;

        if (bubble) {
            bubble.textContent = text;
            bubble.classList.remove('hidden', 'fade-out');
            bubble.classList.add('visible');

            // 3秒后消失
            setTimeout(() => {
                bubble.classList.add('fade-out');
                setTimeout(() => {
                    bubble.classList.remove('visible', 'fade-out');
                    bubble.classList.add('hidden');
                }, 500);
            }, 3000);
        }
    }

    toggleChatPanel(show) {
        this.initElementBindings();
        if (!this.elements.chatPanel) return;

        if (show === undefined) {
            this.elements.chatPanel.classList.toggle('hidden');
        } else if (show) {
            this.elements.chatPanel.classList.remove('hidden');
        } else {
            this.elements.chatPanel.classList.add('hidden');
        }
    }

    // ============ Soul Duel Header Logic ============

    // 切换 Header 显示模式
    // skipBodyClass: true 时不添加 online-game 类（用于本地模式，避免影响移动端触摸）
    toggleOnlineHeader(isOnline, skipBodyClass = false) {
        const soulHeader = document.getElementById('online-header');
        const legacyHeader = document.querySelector('.header-main-layout'); // 旧的
        const storyHud = document.getElementById('story-hud');

        if (soulHeader) {
            if (isOnline) {
                soulHeader.classList.remove('hidden');
                soulHeader.style.display = 'flex'; // 确保显示
                if (legacyHeader) legacyHeader.classList.add('hidden');
                if (storyHud) storyHud.classList.add('hidden');

                // 添加 body class 辅助 CSS 隐藏其他干扰元素
                // 本地模式跳过，避免影响移动端
                if (!skipBodyClass) {
                    document.body.classList.add('online-game');
                }
            } else {
                soulHeader.classList.add('hidden');
                soulHeader.style.display = 'none';
                if (storyHud && !storyHud.classList.contains('hidden')) {
                    // Story mode handles its own HUD
                } else if (legacyHeader) {
                    legacyHeader.classList.remove('hidden');
                }

                document.body.classList.remove('online-game');
            }
        }
    }

    // 更新玩家信息 (Soul Duel 版)
    updatePlayerInfo(player1Name, player2Name, player1Avatar, player2Avatar, p1Elo, p2Elo) {
        // 1. 更新旧逻辑 (PVE/Local)
        if (this.elements.blackLabel) this.elements.blackLabel.textContent = `⚫ ${player1Name}`;
        if (this.elements.whiteLabel) this.elements.whiteLabel.textContent = `⚪ ${player2Name}`;

        // 2. 更新 Soul Duel (Online)
        // P1 (左)
        const p1NameEl = document.getElementById('p1-name');
        const p1AvatarEl = document.getElementById('p1-avatar');
        const p1EloEl = document.getElementById('p1-elo');
        if (p1NameEl) p1NameEl.textContent = player1Name;
        if (p1AvatarEl) p1AvatarEl.textContent = player1Avatar || '🦊';
        if (p1EloEl) p1EloEl.textContent = p1Elo || '1000';

        // P2 (右)
        const p2NameEl = document.getElementById('p2-name');
        const p2AvatarEl = document.getElementById('p2-avatar');
        const p2EloEl = document.getElementById('p2-elo');
        if (p2NameEl) p2NameEl.textContent = player2Name;
        if (p2AvatarEl) p2AvatarEl.textContent = player2Avatar || '🐯';
        if (p2EloEl) p2EloEl.textContent = p2Elo || '1000';
    }

    // 更新当前回合 (Soul Duel 高亮逻辑)
    updateCurrentPlayer(text, color) {
        // 更新旧文本 (PVE用)
        if (this.elements.currentPlayer) {
            this.elements.currentPlayer.textContent = text;
        }

        // 更新 Soul Duel 高亮
        const p1Card = document.getElementById('p1-card');
        const p2Card = document.getElementById('p2-card');

        if (p1Card && p2Card) {
            // 假设 P1 = Black (Left), P2 = White (Right)
            // 这里的 color 是 'black' 或 'white'
            if (color === 'black') {
                p1Card.classList.add('active');
                p2Card.classList.remove('active');

                // 重置 P2 进度条
                this.resetRingProgress(2);
            } else {
                p2Card.classList.add('active');
                p1Card.classList.remove('active');

                // 重置 P1 进度条
                this.resetRingProgress(1);
            }
        }
    }

    // 重置光环
    resetRingProgress(playerNum) {
        const ring = document.getElementById(`p${playerNum}-timer-ring`);
        if (ring) {
            ring.style.strokeDashoffset = '0'; // 满圈
            // 移除紧急状态
            document.getElementById(`p${playerNum}-card`)?.classList.remove('urgent');
        }
        // 隐藏计时胶囊 (添加null检查)
        const timer = document.getElementById(`p${playerNum}-timer`);
        if (timer) timer.classList.add('hidden');
    }

    // 更新双重计时器 (每步倒计时 + 总时间)
    updateDualTimer(moveTime, totalTime, color) {
        const playerNum = color === 'black' ? 1 : 2;
        const ring = document.getElementById(`p${playerNum}-timer-ring`);
        const card = document.getElementById(`p${playerNum}-card`);
        const timerText = document.getElementById(`p${playerNum}-timer`);

        // 1. 光环动画 (每步 20秒)
        const maxMoveTime = 20;
        const progress = Math.max(0, moveTime / maxMoveTime); // 0.0 - 1.0
        const circumference = 289;
        const offset = circumference * (1 - progress);

        if (ring) {
            ring.style.strokeDashoffset = offset;

            // 紧急状态 (每步最后 10秒)
            if (moveTime <= 10 && moveTime > 0) {
                card?.classList.add('urgent');
            } else {
                card?.classList.remove('urgent');
            }
        }

        // 2. 总时间数字 (05:00)
        if (timerText) {
            const minutes = Math.floor(Math.max(0, totalTime) / 60);
            const seconds = Math.max(0, totalTime) % 60;
            timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            // 总时间低电量 (可选，例如最后30秒变红)
            timerText.classList.toggle('low-time', totalTime <= 30);
        }
    }

    // ============ 结算与弹窗逻辑 ============

    showWinner(data) {
        const modal = document.getElementById('winner-modal');
        if (!modal) return;

        // 1. 设置标题和消息
        const titleEl = document.getElementById('winner-title');
        const msgEl = document.getElementById('winner-message');

        let titleText = typeof data === 'string' ? data : data.title;
        if (titleEl) titleEl.textContent = titleText.includes('赢') ? 'VICTORY' : 'DEFEAT';
        if (msgEl) msgEl.textContent = titleText; // 显示中文详细信息

        // 样式调整
        if (titleText.includes('赢') || titleText.includes('Win')) {
            modal.classList.add('win');
            modal.classList.remove('lose');
        } else {
            modal.classList.add('lose');
            modal.classList.remove('win');
        }

        // 2. 更新结算数据 (如果有)
        const settlementContainer = document.getElementById('settlement-container');
        if (data.elo !== undefined && data.nextRankInfo) {
            settlementContainer.classList.add('visible');

            // 更新分数
            document.getElementById('settlement-rank').textContent = data.nextRankInfo.currentRank;
            document.getElementById('settlement-elo').textContent = data.elo;

            // 更新进度条
            const bar = document.getElementById('settlement-bar');
            const progress = (data.nextRankInfo.progress / data.nextRankInfo.total) * 100;

            // 动画: 先归零再长
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = `${progress}%`;
            }, 300);

            // 提示语
            const diff = data.nextRankInfo.total - data.nextRankInfo.progress;
            document.getElementById('settlement-tip').textContent = `距离下一段位还需 ${diff} 分`;

        } else {
            // 简单模式，隐藏详细数据
            // settlementContainer.classList.remove('visible');
        }

        // 显示弹窗
        modal.classList.remove('hidden');
    }

    closeWinnerModal() {
        const modal = document.getElementById('winner-modal');
        if (modal) modal.classList.add('hidden');

        // 返回主菜单或大厅
        this.toggleOnlineHeader(false); // 关闭对战头部
        this.showModeSelect(); // 显示模式选择

        // 如果在房间里，可能需要退出房间？
        // 这里只是关闭UI，逻辑由 Network 处理
        if (window.Network && Network.roomId) {
            Network.leaveRoom();
        }
    }

    requestRematch() {
        if (window.Network) {
            Network.requestRematch();
            this.showToast('已发送再来一局请求...');

            const btn = document.getElementById('winner-confirm-btn');
            if (btn) {
                btn.textContent = '等待对方...';
                btn.disabled = true;
            }
        }
    }

    // 显示再来一局邀请
    showRematchInvitation(fromName) {
        // 创建临时弹窗
        const modal = document.createElement('div');
        modal.id = 'rematch-modal';
        modal.className = 'modal flex-center';
        modal.innerHTML = `
            <div class="modal-content rematch-content" style="text-align: center; padding: 30px;">
                <div style="font-size: 40px; margin-bottom: 20px;">⚔️</div>
                <h3 style="color: #fff; margin-bottom: 15px;">再来一局?</h3>
                <p style="color: #ccc; margin-bottom: 25px;">${fromName} 想要和你再战一局</p>
                <div class="modal-actions" style="justify-content: center; gap: 20px;">
                    <button id="rematch-accept" class="btn primary-btn">接受</button>
                    <button id="rematch-reject" class="btn secondary-btn">拒绝</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // 绑定事件
        const acceptBtn = document.getElementById('rematch-accept');
        const rejectBtn = document.getElementById('rematch-reject');

        acceptBtn.onclick = () => {
            if (window.Network) Network.respondRematch(true);
            modal.remove();
        };

        rejectBtn.onclick = () => {
            if (window.Network) Network.respondRematch(false);
            modal.remove();
        };
    }

    // 头像点击交互
    onAvatarClick(playerNum) {
        // 分配全局方法以便 HTML onClick 调用
        if (window.UI) {
            // 简单震动反馈
            const avatar = document.getElementById(`p${playerNum}-avatar`);
            if (avatar) {
                avatar.style.transform = 'scale(0.9)';
                setTimeout(() => avatar.style.transform = '', 100);
            }
        }
    }



    // 显示加入房间弹窗
    showJoinRoom() {
        const modal = document.getElementById('join-room-modal');
        if (modal) {
            modal.classList.remove('hidden');
            // 清空输入框和错误信息
            const input = document.getElementById('room-code-input');
            const error = document.getElementById('join-room-error');
            if (input) input.value = '';
            if (error) {
                error.textContent = '';
                error.classList.add('hidden');
            }
            if (input) input.focus();
        }

        // 绑定关闭按钮
        const closeList = document.querySelectorAll('#join-room-modal .close-btn');
        closeList.forEach(btn => {
            btn.onclick = () => this.closeJoinRoom();
        });
    }

    // 关闭加入房间弹窗
    closeJoinRoom() {
        const modal = document.getElementById('join-room-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // 显示加入房间错误
    showJoinRoomError(msg) {
        const error = document.getElementById('join-room-error');
        if (error) {
            error.textContent = msg;
            error.classList.remove('hidden');

            // 晃动动画
            error.style.animation = 'none';
            error.offsetHeight; /* trigger reflow */
            error.style.animation = 'shake 0.5s';
        }
    }

    // 显示历史面板
    showHistory() {
        const panel = document.getElementById('history-panel');
        const content = document.getElementById('history-content');
        if (panel && content && window.GOMOKU_HISTORY_ARTICLE_HTML) {
            content.innerHTML = window.GOMOKU_HISTORY_ARTICLE_HTML;
            panel.classList.remove('hidden');

            // Bind close button
            const closeBtn = document.getElementById('history-close-btn');
            if (closeBtn) {
                closeBtn.onclick = () => this.hideHistory();
            }
        }
    }

    // 隐藏历史面板
    hideHistory() {
        const panel = document.getElementById('history-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
    }
}


window.UIManager = UIManager;
