// 五子棋游戏主逻辑
class GomokuGame {
    constructor() {
        // 立即导出到window供外部函数使用
        window.game = this;

        // 初始化模块
        this.audio = new AudioManager();
        this.ui = new UIManager();
        window.UI = this.ui;
        this.ai = new GomokuAI(15);
        this.board = new BoardRenderer(document.getElementById('board'), 15);
        this.stats = new GameStats();
        this.forbidden = new ForbiddenChecker(15);  // 禁手检测模块

        // Zen Board Integration
        this.useZenMode = true;


        // 游戏状态
        this.state = {
            board: [],
            currentPlayer: 1,
            history: [],
            gameOver: false,
            winningLine: [],
            gameMode: null,
            firstPlayer: 1,
            rpsChoices: { p1: null, p2: null },
            lastMoveScore: 0  // 记录AI最后一步的评分
        };

        // 故事模式状态
        this.storyState = {
            mode: 'classic',      // 'classic' | 'story'
            missionId: null,      // 当前关卡ID
            isStoryMode: false,   // 是否处于故事模式
            fromReview: false,    // 是否来自温故知新（回放模式不更新存档）
            levelConfig: null,    // 当前关卡配置
            currentRankTitle: null,      // 当前段位称号
            unlockedLevelMaxId: 1,       // 已解锁到第几关
            forbiddenMode: 'none',       // 禁手模式: 'none' | 'teaching' | 'strict'
            maxUndo: -1,                 // 悔棋次数限制，-1表示不限
            undoUsed: 0,                 // 已使用悔棋次数
            hintsEnabled: true,          // 是否启用提示
            // 禁手教学记录（每种禁手只弹一次大弹窗）
            forbiddenSeen: {
                doubleThree: false,
                doubleFour: false,
                overline: false
            },
            // 时间控制状态
            timeControl: null,           // 当前关卡的时间控制配置
            playerTimeRemaining: 0,      // 玩家剩余时间（秒）
            moveTimerInterval: null,     // 每步计时器
            // 数据视图技能
            dataView: {
                enabled: false,
                remainingUses: 0,
                candidatesPerUse: 3,
                highlightedPoints: []
            }
        };

        // 游戏状态（用于背景系统）
        this.gameState = {
            currentMode: 'classic',   // 'classic' | 'story'
            currentMissionId: null    // 关卡ID
        };

        this.aiThinkTime = 500;

        this.init();
    }

    init() {
        // 设置音乐按钮
        const musicBtn = document.getElementById('music-toggle');
        this.audio.setMusicButton(musicBtn);
        this.audio.setupAutoPlay();

        // 设置计时器显示
        this.stats.setTimerDisplay(document.getElementById('game-timer'));

        // 加载段位存档
        this.loadRankFromStorage();

        // 更新主菜单段位显示
        this.updateMainMenuRankLabel();

        this.bindEvents();
        this.initMenuSounds();

        // 初始化响应式 Canvas 尺寸
        this.resizeBoard();

        // Initialize Zen Board
        this.initZenBoard();

        // 优化: 保存resize处理器引用,便于后续移除
        this.resizeBoardHandler = () => this.resizeBoard();
        window.removeEventListener('resize', this.resizeBoardHandler); // 先移除旧的
        window.addEventListener('resize', this.resizeBoardHandler);

        this.drawBoard();

        // 初始化键盘快捷键
        this.initKeyboardShortcuts();

        // NOTE: Do not show Main Menu here. 

        // 绑定在线人数监听 (Global Init)
        if (window.Network) {
            Network.onOnlineCountUpdate = (count) => {
                if (this.ui && this.ui.updateOnlineCount) {
                    this.ui.updateOnlineCount(count);
                }
            };
        }
        // Let Onboarding.js handle the initial flow (Loading -> Name -> Menu).
    }

    initZenBoard() {
        const initBridge = () => {
            if (window.ZenBoard) {
                window.ZenBoard.init('zen-board-root');
                window.ZenBoard.setClickHandler((row, col) => this.handleZenClick(row, col));
                console.log('[Game] Zen Board Bridge connected');
                // Force a redraw if we have state
                if (this.state.board) {
                    this.drawBoard();
                }
            } else {
                // Retry until loaded (Babel compilation takes a moment)
                console.log('[Game] Waiting for Zen Board Bridge...');
                setTimeout(initBridge, 200);
            }
        };
        initBridge();
    }

    handleZenClick(row, col) {
        console.log('[handleZenClick] 点击位置:', row, col, '游戏模式:', this.state.gameMode);

        if (this.state.isSpectating) {
            this.ui.showToast(Localization.get('toast.spectate_no_move'), 'info');
            return;
        }

        if (this.state.gameOver) {
            console.log('[handleZenClick] 游戏已结束');
            return;
        }
        if (!this.state.gameMode) {
            console.log('[handleZenClick] 无游戏模式');
            return;
        }
        if (!this.isHumanTurn()) {
            console.log('[handleZenClick] 非人类回合 - gameMode:', this.state.gameMode);
            return;
        }

        if (!window.BoardUtils || !BoardUtils.isSafePosition(row, col, 15)) {
            console.log('[handleZenClick] 无效位置');
            return;
        }

        const cellValue = BoardUtils.safeGet(this.state.board, row, col, -1);
        if (cellValue !== 0) {
            console.log('[handleZenClick] 位置已被占用:', cellValue);
            return;
        }

        // 联机模式：通过网络发送落子
        if (this.state.gameMode === 'online') {
            // 检查是否轮到自己
            const isMyTurn = (Network.myColor === 'black' && this.state.currentPlayer === 1) ||
                (Network.myColor === 'white' && this.state.currentPlayer === 2);

            console.log('[handleZenClick] 联机回合检查:', {
                myColor: Network.myColor,
                currentPlayer: this.state.currentPlayer,
                isMyTurn: isMyTurn
            });

            if (!isMyTurn) {
                this.ui.showToast(Localization.get('toast.not_your_turn'), 'warning');
                return;
            }
            // 发送到服务器，实际落子由onGameUpdate回调处理
            // 传递当前时间状态，以便同步给观战者
            const timeStats = {
                p1Time: this.state.p1Time,
                p2Time: this.state.p2Time,
                moveTime: this.state.moveTime
            };
            Network.makeMove(row, col, timeStats);
            return;
        }

        // 检查禁手（故事模式 或 PVE模式）
        const forbiddenMode = this.storyState.isStoryMode
            ? this.storyState.forbiddenMode
            : (this.state.gameMode === 'pve' ? window.selectedForbiddenMode : 'none');

        if (forbiddenMode !== 'none') {
            const isBlack = this.state.currentPlayer === 1;
            if (isBlack && this.isForbiddenMove(row, col)) {
                if (forbiddenMode === 'teaching') {
                    this.showForbiddenTeachingToast(row, col);
                    return;
                } else if (forbiddenMode === 'strict') {
                    this.handleForbiddenLoss(row, col);
                    return;
                }
            }
        }

        this.placePiece(row, col);

        if (!this.state.gameOver && this.state.gameMode === 'pve') {
            this.showSmartDialogueAfterPlayerMove(row, col);
        }
    }

    shouldUseZenMode() {
        if (!this.useZenMode) return false;
        // 统一所有模式使用 ZenBoard (3D 木纹棋盘)
        // Also check if ZenBoard is actually ready
        return !!window.ZenBoard;
    }

    // 键盘快捷键
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // 如果正在输入框中，不处理快捷键
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // 空格键 - 继续对话
            if (e.code === 'Space') {
                const dialogModal = document.getElementById('story-dialog-modal');
                if (dialogModal && !dialogModal.classList.contains('hidden')) {
                    e.preventDefault();
                    // 调用UI的下一行对话方法
                    if (this.ui && this.ui.nextStoryDialogLine) {
                        this.ui.nextStoryDialogLine();
                        // 播放点击音效
                        this.audio.playClick();
                    }
                }
            }

            // Esc键 - 关闭弹窗/返回
            if (e.code === 'Escape') {
                e.preventDefault();
                this.handleEscapeKey();
            }
        });
    }

    // 处理Esc键逻辑
    handleEscapeKey() {
        // 按优先级关闭弹窗
        const modals = [
            'ai-difficulty-modal',
            'donate-modal',
            'wechat-modal',
            'stats-modal',
            'leaderboard-modal',
            'mission-select-modal',
            'mission-brief-modal',
            'forbidden-lesson-panel',
            'winner-modal',
            'rps-modal'
        ];

        for (const modalId of modals) {
            const modal = document.getElementById(modalId);
            if (modal && !modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
                return;
            }
        }

        // 如果游戏进行中，返回菜单
        if (this.state.gameMode && !this.state.gameOver) {
            // 可选：询问是否确认返回
            this.changeMode();
        }
    }

    // ========== UI Helpers for Bento Grid ==========
    startOnlineMode() {
        if (window.Network) Network.updatePlayerStatus('idle'); // In lobby = idle/matching
        this.openOnlineLobby();
    }

    startPVEMode() {
        if (window.Network) Network.updatePlayerStatus('pve');

        // Use immersive Zen PVE mode (no RPS, no popups)
        // Wait for ZenPVE if not loaded yet
        const tryZenPVE = () => {
            if (window.ZenPVE) {
                console.log('[Game] Starting Zen PVE mode');
                ZenPVE.show();
            } else {
                // Wait and retry
                console.log('[Game] Waiting for ZenPVE to load...');
                setTimeout(tryZenPVE, 100);
            }
        };
        tryZenPVE();
    }

    startStoryMode() {
        if (window.Network) Network.updatePlayerStatus('story');
        this.startNewStory();
    }

    showStats() {
        // Ensure stats modal logic is triggered
        this.openHistoryPanel();
    }

    showLeaderboard() {
        const modal = document.getElementById('leaderboard-modal');
        if (modal) {
            modal.classList.remove('hidden');
            // Trigger refresh if available, assuming window.leaderboardManager or similar
            // For now just show logic
        } else {
            this.ui.showToast(Localization.get('toast.leaderboard_unavailable'), 'info');
        }
    }

    // New Helpers for 1:1 Design
    startQuickMatch() {
        if (window.Network) {
            // Open Online Lobby first if needed, or directly trigger quick match
            // Since quick match usually requires being connected, let's open lobby or trigger if connected
            if (!Network.connected) {
                this.ui.showToast(Localization.get('toast.connecting'), 'info');
                Network.connect();
                // Wait for connection? For now, open lobby is safer
                this.openOnlineLobby();
            } else {
                this.startQuickMatchAction(); // Call actual logic
            }
        } else {
            this.ui.showToast(Localization.get('toast.mp_module_missing'), 'error');
        }
    }

    createOnlineRoom() {
        if (window.Network) {
            if (!Network.connected) Network.connect();
            this.createOnlineRoomAction(); // Call actual logic
        }
    }

    openSpectateLobby() {
        const modal = document.getElementById('spectate-lobby-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.refreshSpectateGames();
        }
    }

    // IMPLEMENTATION of Quick Match Action - 使用新的 RobustMatchmakingUI
    async startQuickMatchAction() {
        // 使用新的匹配UI系统
        if (window.RobustMatchmakingUI) {
            console.log('[Game] Using RobustMatchmakingUI for quick match');
            RobustMatchmakingUI.startMatch();
        } else {
            // 降级：使用旧的匹配系统
            console.log('[Game] Fallback to old matchmaking system');
            this.setupOnlineGameListeners();

            Network.onMatchFound = (roomCode) => {
                console.log('[Game] Match found:', roomCode);
                this.ui.closeRoomWaiting();
                this.ui.showMatchmaking(false);
                this.startOnlineGame();
            };

            this.ui.showMatchmaking(true);
            try {
                const result = await Network.joinMatchmaking();
                if (!result.success) {
                    this.ui.showMatchmaking(false);
                    this.ui.showToast(result.error || Localization.get('toast.match_failed'), 'error');
                }
            } catch (e) {
                console.error(e);
                this.ui.showMatchmaking(false);
                this.ui.showToast(Localization.get('toast.mp_system_error'), 'error');
            }
        }
    }

    // IMPLEMENTATION of Create Room Action
    async createOnlineRoomAction() {
        // 关键：先设置网络回调
        this.setupOnlineGameListeners();

        try {
            const result = await Network.createRoom();
            if (result.success) {
                // UI update handled by Network listeners usually, 
                // but we should ensure lobby is shown
                this.openOnlineLobby();
                // Pre-fill room code or wait for listener?
                // Network.currentRoom should be set
            } else {
                this.ui.showToast(result.error || Localization.get('toast.room_create_failed'), 'error');
            }
        } catch (e) {
            console.error(e);
            this.ui.showToast(Localization.get('toast.room_create_error'), 'error');
        }
    }

    // 响应式调整棋盘尺寸
    resizeBoard() {
        const canvas = document.getElementById('board');
        const container = document.querySelector('.game-container');
        if (!canvas || !container) return;

        // 获取容器实际宽度（受 CSS 影响）
        const containerWidth = container.clientWidth;

        // 计算合适的棋盘尺寸（正方形，最大600px）
        const boardSize = Math.min(containerWidth, 600);

        // 设置 Canvas 内部分辨率（关键！）
        canvas.width = boardSize;
        canvas.height = boardSize;

        // 同时设置 CSS 显示尺寸，确保与内部分辨率一致，避免拉伸
        // 这是修复移动端棋盘变形的关键
        canvas.style.width = boardSize + 'px';
        canvas.style.height = boardSize + 'px';

        // 优化：复用 BoardRenderer 实例，仅更新尺寸参数
        // 避免每次 resize 都创建新实例造成内存泄漏
        if (this.board && this.board.canvas === canvas) {
            this.board.updateDimensions();
        } else {
            this.board = new BoardRenderer(canvas, 15);
        }

        // 重绘棋盘
        this.drawBoard();
    }

    // 更新主菜单段位标签
    updateMainMenuRankLabel() {
        const rankLabel = document.getElementById('story-rank-label');
        if (rankLabel) {
            rankLabel.textContent = this.getCurrentRankDisplay();
        }
    }

    initMenuSounds() {
        // 模式选择按钮悬停音效
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => this.audio.playHover());
        });
        // 猜拳按钮悬停音效
        document.querySelectorAll('.rps-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => this.audio.playHover());
        });
    }

    bindEvents() {
        // 绑定 Canvas 触摸事件（优化移动端体验）
        const boardCanvas = document.getElementById('board');
        if (boardCanvas) {
            boardCanvas.addEventListener('touchstart', (e) => {
                e.preventDefault(); // 防止滚动和延迟
                this.handleClick(e);
            }, { passive: false });

            boardCanvas.addEventListener('click', (e) => {
                this.handleClick(e);
            });
        }

        const musicBtn = document.getElementById('music-toggle');
        musicBtn.addEventListener('click', () => this.audio.toggleBGM());

        // 音量滑块
        const volumeSlider = document.getElementById('volume-slider');
        const volumeIcon = document.querySelector('.volume-icon');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                this.audio.setVolume(volume);
                // 更新图标
                if (volumeIcon) {
                    volumeIcon.textContent = volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊';
                }
            });
        }
        // 自由对局模式选择
        const pvpBtn = document.getElementById('pvp-btn');
        if (pvpBtn) pvpBtn.addEventListener('click', () => this.selectMode('pvp'));

        const pveBtn = document.getElementById('pve-btn');
        if (pveBtn) pveBtn.addEventListener('click', () => this.selectMode('pve'));

        const eveBtn = document.getElementById('eve-btn');
        if (eveBtn) eveBtn.addEventListener('click', () => this.selectMode('eve'));

        // 联机对战入口
        const onlineBtn = document.getElementById('online-btn');
        if (onlineBtn) {
            onlineBtn.addEventListener('click', () => this.openOnlineLobby());
            onlineBtn.addEventListener('mouseenter', () => this.audio.playHover());
        }

        // 联机大厅按钮
        const createRoomBtn = document.getElementById('create-room-btn');
        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', () => this.createOnlineRoom());
        }

        const joinRoomBtn = document.getElementById('join-room-btn');
        if (joinRoomBtn) {
            joinRoomBtn.addEventListener('click', () => this.ui.showJoinRoom());
        }

        const confirmJoinBtn = document.getElementById('confirm-join-btn');
        if (confirmJoinBtn) {
            confirmJoinBtn.addEventListener('click', () => this.joinOnlineRoom());
        }

        // 房间等待按钮
        const readyBtn = document.getElementById('ready-btn');
        if (readyBtn) {
            readyBtn.addEventListener('click', () => this.toggleReady());
        }

        const leaveRoomBtn = document.getElementById('leave-room-btn');
        if (leaveRoomBtn) {
            leaveRoomBtn.addEventListener('click', () => this.leaveOnlineRoom());
        }

        // 快速匹配按钮
        const quickMatchBtn = document.getElementById('quick-match-btn');
        if (quickMatchBtn) {
            quickMatchBtn.addEventListener('click', () => this.startQuickMatch());
        }

        const cancelMatchBtn = document.getElementById('cancel-match-btn');
        if (cancelMatchBtn) {
            cancelMatchBtn.addEventListener('click', () => this.cancelQuickMatch());
        }

        // 观战按钮
        const spectateBtn = document.getElementById('spectate-btn');
        if (spectateBtn) {
            spectateBtn.addEventListener('click', () => this.openSpectateLobby());
        }

        const spectateRefreshBtn = document.getElementById('spectate-refresh-btn');
        if (spectateRefreshBtn) {
            spectateRefreshBtn.addEventListener('click', () => this.refreshSpectateGames());
        }

        // 故事模式 - 全新故事
        const newStoryBtn = document.getElementById('new-story-btn');
        if (newStoryBtn) {
            newStoryBtn.addEventListener('click', () => this.startNewStory());
            newStoryBtn.addEventListener('mouseenter', () => this.audio.playHover());
        }

        // 故事模式 - 温故知新
        const reviewStoryBtn = document.getElementById('review-story-btn');
        if (reviewStoryBtn) {
            reviewStoryBtn.addEventListener('click', () => this.openReviewStory());
            reviewStoryBtn.addEventListener('mouseenter', () => this.audio.playHover());
        }

        // 历史介绍入口
        const historyBtn = document.getElementById('history-btn');
        if (historyBtn) {
            historyBtn.addEventListener('click', () => this.openHistoryPanel());
            historyBtn.addEventListener('mouseenter', () => this.audio.playHover());
        }

        // 历史面板关闭按钮
        const historyCloseBtn = document.getElementById('history-close-btn');
        if (historyCloseBtn) {
            historyCloseBtn.addEventListener('click', () => this.closeHistoryPanel());
        }

        // 猜拳
        document.querySelectorAll('#p1-choices .rps-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleRPSChoice(1, e.target.dataset.choice));
        });
        document.querySelectorAll('#p2-choices .rps-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleRPSChoice(2, e.target.dataset.choice));
        });

        // 棋盘交互
        const canvas = document.getElementById('board');
        canvas.addEventListener('click', (e) => this.handleClick(e));
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        canvas.addEventListener('mouseleave', () => this.drawBoard());

        // 游戏控制
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('change-mode-btn').addEventListener('click', () => this.changeMode());
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.ui.hideWinner();
            this.restart();
        });
        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            this.ui.hideWinner();
            // 联机模式：先退出房间再返回菜单
            if (this.state.gameMode === 'online' && window.Network) {
                Network.leaveRoom();
            }
            this.changeMode(); // This calls showModeSelect which calls showMainMenu
        });

        const surrenderBtn = document.getElementById('surrender-btn');
        if (surrenderBtn) {
            surrenderBtn.addEventListener('click', () => this.surrenderOnline());
        }

        // 再来一局邀请按钮
        const acceptRematchBtn = document.getElementById('accept-rematch-btn');
        const rejectRematchBtn = document.getElementById('reject-rematch-btn');
        if (acceptRematchBtn) {
            acceptRematchBtn.addEventListener('click', () => {
                this.ui.hideRematchInvitation();
                if (window.Network) {
                    Network.respondRematch(true);
                    this.ui.showToast(Localization.get('toast.rematch_accepted'), 'success');
                }
            });
        }
        if (rejectRematchBtn) {
            rejectRematchBtn.addEventListener('click', () => {
                this.ui.hideRematchInvitation();
                if (window.Network) {
                    Network.respondRematch(false);
                    this.ui.showToast(Localization.get('toast.rematch_rejected'), 'info');
                }
            });
        }

        // 聊天按钮
        const chatBtn = document.getElementById('chat-btn');
        if (chatBtn) {
            chatBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.ui.toggleChatPanel();
            });
        }

        // 聊天选项
        document.querySelectorAll('.chat-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const msgId = e.target.dataset.msg;
                // 只要在房间里（无论是否开始游戏）都可以聊天
                if (window.Network && Network.currentRoom) {
                    Network.sendMessage(msgId);
                    this.ui.toggleChatPanel(false);
                }
            });
        });

        // 点击外部关闭聊天面板
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.chat-wrapper')) {
                this.ui.toggleChatPanel(false);
            }
        });

        // ============ 昵称设置弹窗事件 ============

        // 输入框字符计数和验证
        const nameInput = document.getElementById('player-name-input');
        if (nameInput) {
            nameInput.addEventListener('input', () => {
                this._updateNameCharCount();
                this._validateName(nameInput.value);
            });
        }

        // 随机中文名按钮
        const randomCnBtn = document.getElementById('random-name-cn-btn');
        if (randomCnBtn) {
            randomCnBtn.addEventListener('click', () => {
                if (window.NameGenerator) {
                    const name = NameGenerator.generate('cn');
                    document.getElementById('player-name-input').value = name;
                    this._updateNameCharCount();
                    this._validateName(name);
                }
            });
        }

        // 随机英文名按钮
        const randomEnBtn = document.getElementById('random-name-en-btn');
        if (randomEnBtn) {
            randomEnBtn.addEventListener('click', () => {
                if (window.NameGenerator) {
                    const name = NameGenerator.generate('en');
                    document.getElementById('player-name-input').value = name;
                    this._updateNameCharCount();
                    this._validateName(name);
                }
            });
        }

        // 确认昵称按钮
        const confirmNameBtn = document.getElementById('confirm-name-btn');
        if (confirmNameBtn) {
            confirmNameBtn.addEventListener('click', () => {
                const name = document.getElementById('player-name-input').value.trim();
                if (name && window.NameGenerator) {
                    const validation = NameGenerator.validate(name);
                    if (validation.valid) {
                        // 保存昵称
                        localStorage.setItem('gomoku_player_name', name);

                        // 关闭弹窗，进入联机大厅
                        document.getElementById('name-setup-modal').classList.add('hidden');
                        this._proceedToOnlineLobby();
                    }
                }
            });
        }
    }

    // 更新字符计数
    _updateNameCharCount() {
        const input = document.getElementById('player-name-input');
        const counter = document.getElementById('name-char-count');
        if (input && counter) {
            counter.textContent = `${input.value.length}/8`;
        }
    }

    // 验证昵称
    _validateName(name) {
        const statusEl = document.getElementById('name-status');
        const confirmBtn = document.getElementById('confirm-name-btn');
        const suggestionsEl = document.getElementById('name-suggestions');

        if (!window.NameGenerator || !statusEl) return;

        const validation = NameGenerator.validate(name);

        if (validation.valid) {
            statusEl.textContent = Localization.get('toast.nickname_available');
            statusEl.className = 'name-status success';
            confirmBtn.disabled = false;
            suggestionsEl?.classList.add('hidden');
        } else {
            statusEl.textContent = `❌ ${validation.error}`;
            statusEl.className = 'name-status error';
            confirmBtn.disabled = true;

            // 如果因为其他原因无效，显示推荐名字
            if (name.length >= 2) {
                this._showNameSuggestions(name);
            } else {
                suggestionsEl?.classList.add('hidden');
            }
        }
    }

    // 显示推荐昵称
    _showNameSuggestions(baseName) {
        const suggestionsEl = document.getElementById('name-suggestions');
        const listEl = document.getElementById('suggestion-list');

        if (!suggestionsEl || !listEl || !window.NameGenerator) return;

        const suggestions = NameGenerator.getSimilarNames(baseName);

        listEl.innerHTML = suggestions.map(name =>
            `<button class="suggestion-btn" data-name="${name}">${name}</button>`
        ).join('');

        // 绑定点击事件
        listEl.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('player-name-input').value = btn.dataset.name;
                this._updateNameCharCount();
                this._validateName(btn.dataset.name);
            });
        });

        suggestionsEl.classList.remove('hidden');
    }

    // 模式选择
    selectMode(mode, skipDifficultySelect = false) {
        // 对于PVE模式，先显示难度选择
        if (mode === 'pve' && !skipDifficultySelect) {
            this.ui.hideMainMenu(); // 先隐藏主菜单
            window.showDifficultyModal();
            return;
        }

        this.state.gameMode = mode;
        // this.ui.hideModeSelect(); // OLD
        this.ui.hideMainMenu(); // NEW: Hide Bento Grid

        // 📊 游戏分析埋点
        if (window.GameAnalytics) {
            const subMode = mode === 'pve' ? (window.selectedAIDifficulty || 'medium') : null;
            GameAnalytics.trackGameStart(mode, subMode);
        }

        // 显示该模式的战绩
        this.ui.showStats(true);
        this.ui.updateStats(this.stats.getStatsText(mode));

        // 在PVE和EVE模式下显示角色
        if (mode === 'pve' || mode === 'eve') {
            this.ui.showCharacter(true);
            this.ui.setCharacterState('IDLE');

            // 应用AI难度设置（PVE模式）
            if (mode === 'pve') {
                // 使用选择的难度，如果未设置则默认为中等难度
                const difficulty = window.selectedAIDifficulty || 'medium';
                this.ai.setLevel(difficulty);

                // 确保全局变量也被设置，方便后续使用
                if (!window.selectedAIDifficulty) {
                    window.selectedAIDifficulty = difficulty;
                }
            }
        } else {
            this.ui.showCharacter(false);
        }

        if (mode === 'eve') {
            this.state.firstPlayer = Math.random() < 0.5 ? 1 : 2;
            this.prepareGame();
        } else if (mode === 'pve') {
            // Zen PVE: skip RPS, randomly decide first player
            this.state.firstPlayer = Math.random() < 0.5 ? 1 : 2;
            this.prepareGame();
        } else {
            // PVP still uses RPS
            this.showRPS();
        }
    }

    // 猜拳
    showRPS() {
        this.state.rpsChoices = { p1: null, p2: null };
        this.ui.showRPS(this.state.gameMode);
    }

    handleRPSChoice(player, choice) {
        const symbols = { rock: '✊', scissors: '✌️', paper: '🖐️' };
        this.audio.playRPSSelect();

        if (player === 1) {
            this.state.rpsChoices.p1 = choice;
            this.ui.updateRPSPlayer1(symbols[choice]);

            if (this.state.gameMode === 'pve') {
                this.ui.showRPSAIWaiting();
                setTimeout(() => {
                    const aiChoice = ['rock', 'scissors', 'paper'][Math.floor(Math.random() * 3)];
                    this.handleRPSChoice(2, aiChoice);
                }, 800);
            } else {
                this.ui.showRPSPlayer2Choices();
            }
        } else {
            this.state.rpsChoices.p2 = choice;
            this.ui.updateRPSPlayer2(symbols[choice]);
            this.resolveRPS();
        }
    }

    resolveRPS() {
        const { p1, p2 } = this.state.rpsChoices;
        let winner = p1 === p2 ? 0 :
            ((p1 === 'rock' && p2 === 'scissors') ||
                (p1 === 'scissors' && p2 === 'paper') ||
                (p1 === 'paper' && p2 === 'rock')) ? 1 : 2;

        const winnerName = winner === 0 ? '' :
            (this.state.gameMode === 'pve' && winner === 2 ? 'AI' : `玩家${winner}`);

        this.ui.showRPSResult(winner, winnerName);

        if (winner === 0) {
            setTimeout(() => this.showRPS(), 1500);
        } else {
            this.state.firstPlayer = winner;
            setTimeout(() => {
                this.ui.hideRPS();
                this.prepareGame();
            }, 2000);
        }
    }

    // 游戏准备
    prepareGame() {
        this.state.board = Array(15).fill(null).map(() => Array(15).fill(0));
        this.state.currentPlayer = 1;
        this.state.history = [];
        this.state.gameOver = false;
        this.state.winningLine = [];
        this.state.lastMoveScore = 0;

        // 仅联机模式显示 Soul Header
        if (this.state.gameMode === 'online') {
            this.ui.toggleOnlineHeader(true);
        }

        // 初始化本地模式计时器状态
        if (this.state.gameMode !== 'online') {
            this.state.p1Time = 300;
            this.state.p2Time = 300;
            this.state.moveTimeLeft = 20;
        }

        this.ui.updateLabels(this.state.gameMode, this.state.firstPlayer);
        this.ui.updateCurrentPlayer(this.state.currentPlayer);
        this.ui.resetTimer();
        this.ui.showTimer(true);

        // 重要：调整棋盘尺寸（确保从隐藏状态显示后有正确尺寸）
        this.resizeBoard();
        this.drawBoard();

        // 联机模式使用新 UI 的倒计时，跳过旧的
        if (this.state.gameMode !== 'online' || !window.MultiplayerUI) {
            this.showCountdown();
        }
    }

    // 根据模式设置玩家信息
    setupPlayerInfoForMode(mode, firstPlayer) {
        const playerName = window.Onboarding?.getPlayerName() || Localization.get('mp.player');
        const playerAvatar = window.PlayerStats?.getAvatar?.() || '🦊';
        const playerElo = window.PlayerStats?.getElo?.() || 1000;

        let p1Name, p1Avatar, p1Elo;
        let p2Name, p2Avatar, p2Elo;

        if (mode === 'pve') {
            // 人机对弈
            if (firstPlayer === 1) {
                // 玩家先手 (黑)
                p1Name = playerName;
                p1Avatar = playerAvatar;
                p1Elo = playerElo;
                p2Name = '弈·零';
                p2Avatar = '🤖';
                p2Elo = 1500;
            } else {
                // AI先手 (黑)
                p1Name = '弈·零';
                p1Avatar = '🤖';
                p1Elo = 1500;
                p2Name = playerName;
                p2Avatar = playerAvatar;
                p2Elo = playerElo;
            }
        } else if (mode === 'pvp') {
            // 双人对弈
            if (firstPlayer === 1) {
                p1Name = `${playerName} 1`;
                p2Name = `${playerName} 2`;
            } else {
                p1Name = `${playerName} 2`;
                p2Name = `${playerName} 1`;
            }
            p1Avatar = '🦊';
            p2Avatar = '🐯';
            p1Elo = playerElo;
            p2Elo = playerElo;
        } else if (mode === 'eve') {
            // AI观战
            p1Name = 'AI-1';
            p1Avatar = '🤖';
            p1Elo = 1500;
            p2Name = 'AI-2';
            p2Avatar = '🧠';
            p2Elo = 1500;
        } else {
            // 默认
            p1Name = 'Player 1';
            p1Avatar = '🦊';
            p1Elo = 1000;
            p2Name = 'Player 2';
            p2Avatar = '🐯';
            p2Elo = 1000;
        }

        // 更新 UI
        this.ui.updatePlayerInfo(p1Name, p2Name, p1Avatar, p2Avatar, p1Elo, p2Elo);
    }

    showCountdown() {
        this.ui.showCountdown();
        let count = 3;
        this.ui.updateCountdown(count);
        this.audio.playCountdown();

        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                this.ui.updateCountdown(count);
                this.audio.playCountdown();
            } else if (count === 0) {
                this.ui.updateCountdown(Localization.get('game.go'));
                this.audio.playStart();
            } else {
                clearInterval(interval);
                this.ui.hideCountdown();
                this.ui.resetCountdownColor();
                this.startGame();
            }
        }, 1000);
    }

    startGame() {
        this.ui.updateGameMode(this.state.gameMode);

        // 开始计时
        this.stats.startTimer();

        // 故事模式：启动时间控制计时器
        if (this.storyState.isStoryMode && this.isHumanTurn()) {
            this.startMoveTimer();
        }

        // 本地模式 (PVE/PVP): 启动统一计时器
        if ((this.state.gameMode === 'pve' || this.state.gameMode === 'pvp') && !this.storyState.isStoryMode) {
            this.startLocalTimerLoop();
        }

        // 显示开局台词
        if (this.state.gameMode === 'pve' || this.state.gameMode === 'eve') {
            this.ui.showStartDialogue();
            this.ui.setCharacterState('IDLE');
        }

        if (this.state.gameMode === 'eve') {
            setTimeout(() => this.aiMove(), this.aiThinkTime);
        } else if (this.state.gameMode === 'pve' && this.state.firstPlayer === 2) {
            setTimeout(() => this.aiMove(), this.aiThinkTime);
        }
    }

    // 本地模式计时器循环
    startLocalTimerLoop() {
        this.stopLocalTimerLoop(); // 确保之前的循环已停止

        this.localTimerInterval = setInterval(() => {
            if (this.state.gameOver) {
                this.stopLocalTimerLoop();
                return;
            }

            // 确定当前正在计时的玩家
            const color = this.state.currentPlayer === 1 ? 'black' : 'white';
            const playerNum = this.state.currentPlayer === 1 ? 1 : 2;

            // 更新单步倒计时
            this.state.moveTimeLeft = Math.max(0, this.state.moveTimeLeft - 1);

            // 更新总时间 (仅扣减当前玩家)
            if (playerNum === 1) {
                this.state.p1Time = Math.max(0, this.state.p1Time - 1);
            } else {
                this.state.p2Time = Math.max(0, this.state.p2Time - 1);
            }

            // 更新 UI 显示
            const totalTime = playerNum === 1 ? this.state.p1Time : this.state.p2Time;
            this.ui.updateDualTimer(this.state.moveTimeLeft, totalTime, color);

            // 超时警告 (仅显示提示，不判负)
            if (this.state.moveTimeLeft <= 0 && this.isHumanTurn()) {
                this.ui.showToast(Localization.get('toast.move_time_warning'), 'warning');
                this.state.moveTimeLeft = 20; // 重置单步计时
            }

            // 总时间用尽时的警告 (本地模式不强制判负)
            if (totalTime <= 0 && this.isHumanTurn()) {
                this.ui.showToast(Localization.get('toast.total_time_warning'), 'warning');
            }
        }, 1000);
    }

    stopLocalTimerLoop() {
        if (this.localTimerInterval) {
            clearInterval(this.localTimerInterval);
            this.localTimerInterval = null;
        }
    }

    // 本地模式落子后重置计时器
    resetLocalMoveTimer() {
        this.state.moveTimeLeft = 20;
        // 加时 +3 秒
        if (this.state.currentPlayer === 1) {
            this.state.p1Time = Math.min(300, this.state.p1Time + 3);
        } else {
            this.state.p2Time = Math.min(300, this.state.p2Time + 3);
        }
    }

    // 绘制棋盘
    drawBoard() {
        if (!this.state.board) return;

        const useZen = this.shouldUseZenMode();
        const canvas = document.getElementById('board');
        const zenRoot = document.getElementById('zen-board-root');

        if (useZen) {
            if (canvas) canvas.style.display = 'none';
            if (zenRoot) zenRoot.style.display = 'flex'; // flex for centering

            // Render via React Bridge
            if (window.ZenBoard) {
                // Ghost player: 决定影子棋子颜色
                // - online: 根据玩家自己的颜色显示影子
                // - pvp: 当前回合玩家颜色
                // - pve/story: 人类玩家颜色（firstPlayer）
                let ghostPlayer;
                if (this.state.gameMode === 'online' && window.Network) {
                    // 联机模式：根据自己的颜色决定影子
                    ghostPlayer = Network.myColor === 'black' ? 1 : 2;
                } else if (this.state.gameMode === 'pvp') {
                    ghostPlayer = this.state.currentPlayer;
                } else {
                    ghostPlayer = this.state.firstPlayer;
                }
                window.ZenBoard.render({ ...this.state, ghostPlayer });
            }
        } else {
            if (canvas) canvas.style.display = 'block';
            if (zenRoot) zenRoot.style.display = 'none';

            if (this.board) {
                this.board.draw(this.state.board, this.state.history, this.state.winningLine);
            }
        }
    }

    // 判断是否人类回合
    isHumanTurn() {
        if (this.state.gameMode === 'eve') return false;
        if (this.state.gameMode === 'pvp') return true;
        if (this.state.gameMode === 'online') return true; // 联机模式：双方都是人类
        return this.state.currentPlayer === (this.state.firstPlayer === 1 ? 1 : 2);
    }

    // 判断当前是否为AI回合
    isAITurn() {
        if (this.state.gameMode === 'eve') return true;
        if (this.state.gameMode === 'pvp') return false;
        return this.state.currentPlayer !== (this.state.firstPlayer === 1 ? 1 : 2);
    }

    // 棋盘点击
    handleClick(e) {
        // 观战模式下禁止落子
        if (this.state.isSpectating) {
            this.ui.showToast(Localization.get('toast.spectate_no_move'), 'info');
            return;
        }

        if (this.state.gameOver || !this.state.gameMode || !this.isHumanTurn()) return;

        const pos = this.board.getGridPosition(e);
        if (!pos) return;

        // 安全检查：使用 BoardUtils 确保棋盘位置存在且为空
        if (!window.BoardUtils || !BoardUtils.isSafePosition(pos.x, pos.y, 15)) {
            console.warn('[Game] Invalid position:', pos);
            return;
        }

        // 使用 BoardUtils 安全访问
        const cellValue = BoardUtils.safeGet(this.state.board, pos.x, pos.y, -1);
        if (cellValue !== 0) {
            return; // 位置已被占用或无效
        }

        // 联机模式：通过网络发送落子
        if (this.state.gameMode === 'online') {
            // 检查是否轮到自己
            const isMyTurn = (Network.myColor === 'black' && this.state.currentPlayer === 1) ||
                (Network.myColor === 'white' && this.state.currentPlayer === 2);

            console.log('[handleClick] 回合检查:', {
                myColor: Network.myColor,
                currentPlayer: this.state.currentPlayer,
                isMyTurn: isMyTurn
            });

            if (!isMyTurn) {
                this.ui.showToast(Localization.get('toast.not_your_turn'), 'warning');
                return;
            }
            // 发送到服务器，实际落子由onGameUpdate回调处理
            // 传递当前时间状态，以便同步给观战者
            const timeStats = {
                p1Time: this.state.p1Time,
                p2Time: this.state.p2Time,
                moveTime: this.state.moveTime
            };
            Network.makeMove(pos.x, pos.y, timeStats);
            return;
        }

        // 检查禁手（故事模式 或 PVE模式）
        const forbiddenMode = this.storyState.isStoryMode
            ? this.storyState.forbiddenMode
            : (this.state.gameMode === 'pve' ? window.selectedForbiddenMode : 'none');

        if (forbiddenMode !== 'none') {
            const isBlack = this.state.currentPlayer === 1;
            if (isBlack && this.isForbiddenMove(pos.x, pos.y)) {
                if (forbiddenMode === 'teaching') {
                    // 教学模式：提示但阻止落子
                    this.showForbiddenTeachingToast(pos.x, pos.y);
                    return;
                } else if (forbiddenMode === 'strict') {
                    // 严格模式：禁手即判负
                    this.handleForbiddenLoss(pos.x, pos.y);
                    return;
                }
            }
        }

        this.placePiece(pos.x, pos.y);

        // 玩家落子后显示智能台词（在AI思考之前）
        if (!this.state.gameOver && this.state.gameMode === 'pve') {
            this.showSmartDialogueAfterPlayerMove(pos.x, pos.y);
        }
    }

    // ========== 禁手判断系统 ==========

    // 检查是否为禁手，返回详细信息 (委托给禁手模块)
    checkForbiddenMove(x, y) {
        return this.forbidden.checkForbiddenMove(this.state.board, x, y);
    }

    // 旧接口兼容
    isForbiddenMove(x, y) {
        return this.forbidden.isForbiddenMove(this.state.board, x, y);
    }

    // 注意: checkLongConnection, checkDoubleFour, isOpenFour, isClosedFour, 
    // checkDoubleThree, isOpenThree, getLine 已移至 js/game/forbidden.js

    // 显示禁手教学提示（使用详细文案）
    showForbiddenTeachingToast(x, y) {
        // 获取禁手类型
        const forbiddenInfo = this.checkForbiddenMove(x, y);
        const type = forbiddenInfo.type;

        if (!type) return;

        // 高亮禁手点
        this.board.highlightForbiddenPoint(x, y);

        // 检查是否是该类型禁手第一次出现
        if (!this.storyState.forbiddenSeen[type] && window.FORBIDDEN_TUTORIAL_TEXT) {
            // 第一次出现：弹出教学弹窗
            this.storyState.forbiddenSeen[type] = true;

            const cfg = FORBIDDEN_TUTORIAL_TEXT[type];
            this.ui.showForbiddenTutorialModal({
                title: cfg.title,
                bodyLines: cfg.bodyLines,
                point: { x, y },
                onConfirm: () => {
                    // 关闭弹窗后玩家重新选择落点
                }
            });
        } else {
            // 之后只弹短Toast
            const cfg = window.FORBIDDEN_TUTORIAL_TEXT ? FORBIDDEN_TUTORIAL_TEXT[type] : null;
            const toastText = cfg ? cfg.toast : `⚠️ 这是禁手！请换一个位置。`;
            this.ui.showToast(toastText, 'warning');
        }
    }

    // 禁手判负处理（严格模式，使用详细文案）
    handleForbiddenLoss(x, y) {
        this.state.gameOver = true;
        this.stats.stopTimer();

        // 获取禁手类型
        const forbiddenInfo = this.checkForbiddenMove(x, y);
        const type = forbiddenInfo.type;

        // 显示禁手位置
        this.board.highlightForbiddenPoint(x, y);

        // 更新角色状态
        this.ui.setCharacterState('WIN', this.storyState.isStoryMode ? this.gameState : null);

        // 故事模式下的失败处理
        if (this.storyState.isStoryMode) {
            const missionId = this.storyState.missionId;
            const levelConfig = this.storyState.levelConfig;

            // 埋点
            if (window.GameAnalytics) {
                GameAnalytics.trackGameEnd('lose', 'forbidden', this.state.history.length);
            }

            // 获取禁手失败文案
            const textCfg = window.FORBIDDEN_LOSE_TEXT ? FORBIDDEN_LOSE_TEXT[type] : null;
            const extraText = window.FORBIDDEN_LEVEL_EXTRA ? FORBIDDEN_LEVEL_EXTRA[missionId] : '';

            // 显示禁手失败面板
            setTimeout(() => {
                if (textCfg) {
                    this.ui.showForbiddenLosePanel({
                        levelName: levelConfig ? levelConfig.name : `第${missionId}关`,
                        title: textCfg.title,
                        reasonLines: textCfg.reasonLines,
                        extraLines: extraText ? [extraText] : [],
                        point: { x, y }
                    });
                } else {
                    // 兜底显示
                    this.ui.showWinner(`💔 禁手判负！\n你下了一步禁手棋，被判负。`);
                }
            }, 1000);
        } else {
            setTimeout(() => {
                this.ui.showWinner(`💔 禁手判负！\n黑棋下了禁手，白棋获胜！`);
            }, 1000);
        }
    }

    // 鼠标移动预览
    handleMouseMove(e) {
        if (this.state.gameOver || !this.state.gameMode || !this.isHumanTurn()) return;

        const pos = this.board.getGridPosition(e);
        this.drawBoard();

        if (pos && window.BoardUtils && BoardUtils.isSafePosition(pos.x, pos.y, 15)) {
            const cellValue = BoardUtils.safeGet(this.state.board, pos.x, pos.y, -1);
            if (cellValue === 0) {
                // 联机模式下使用玩家自己的颜色预览
                let previewPlayer;
                if (this.state.gameMode === 'online') {
                    previewPlayer = Network.myColor === 'black' ? 1 : 2;
                } else {
                    previewPlayer = this.state.currentPlayer;
                }
                this.board.drawPreview(pos.x, pos.y, previewPlayer);
            }
        }
    }

    // 落子
    placePiece(x, y, moveScore = 0) {
        const isAI = this.isAITurn();
        const wasHumanTurn = this.isHumanTurn();

        // 故事模式：玩家落子后处理时间
        if (this.storyState.isStoryMode && wasHumanTurn) {
            this.stopMoveTimer();
            this.onPlayerMove();  // 处理加秒等
        }

        this.state.board[x][y] = this.state.currentPlayer;
        this.state.history.push({ x, y, player: this.state.currentPlayer });
        this.drawBoard();

        // Zen Sound Integration
        if (this.shouldUseZenMode() && window.ZenBoard) {
            setTimeout(() => {
                if (window.ZenBoard) window.ZenBoard.playStoneSound(this.state.currentPlayer);
            }, 100);
        } else {
            this.audio.playPlace();
        }

        // 检查胜利
        const winResult = this.ai.checkWin(this.state.board, x, y);
        if (winResult) {
            this.state.gameOver = true;
            this.state.winningLine = winResult;
            this.audio.playWin();
            this.drawBoard();

            // 停止计时
            this.stats.stopTimer();
            const gameTime = this.stats.getFormattedTime();

            // 记录战绩
            this.stats.recordResult(this.state.gameMode, this.state.currentPlayer, this.state.firstPlayer);
            this.ui.updateStats(this.stats.getStatsText(this.state.gameMode));

            // 记录到全局玩家统计
            if (window.PlayerStats) {
                const isHumanWin = !isAI && (this.state.gameMode === 'pve' || this.state.gameMode === 'story');
                const isHumanLose = isAI && (this.state.gameMode === 'pve' || this.state.gameMode === 'story');
                const mode = this.storyState.isStoryMode ? 'story' : this.state.gameMode;
                if (isHumanWin) {
                    PlayerStats.recordResult(mode, 'win');
                } else if (isHumanLose) {
                    PlayerStats.recordResult(mode, 'lose');
                }
            }

            // Game Analytics 埋点
            if (window.GameAnalytics) {
                const result = isAI ? 'lose' : 'win';
                const winner = this.state.currentPlayer === 1 ? 'black' : 'white';
                GameAnalytics.trackGameEnd(result, winner, this.state.history.length);
            }

            // 更新角色状态（故事模式下同步背景）
            if (this.state.gameMode === 'pve') {
                // PVE模式：AI赢了显示WIN，玩家赢了显示LOSE
                const aiWon = isAI;
                const stateKey = aiWon ? 'WIN' : 'LOSE';
                this.ui.setCharacterState(stateKey, this.storyState.isStoryMode ? this.gameState : null);

                // 故事模式下同步背景
                if (this.storyState.isStoryMode && window.setBackground) {
                    setBackground('story', this.gameState.currentMissionId, stateKey);
                }
            } else if (this.state.gameMode === 'eve') {
                // EVE模式：显示WIN状态
                this.ui.setCharacterState('WIN');
            }

            const winnerName = this.ui.getWinnerName(
                this.state.gameMode,
                this.state.currentPlayer,
                this.state.firstPlayer
            );

            // 故事模式结算
            if (this.storyState.isStoryMode) {
                const playerWon = !isAI;
                this.handleStoryGameOver(playerWon, gameTime);
                return;
            }

            // 复盘缓冲时间：给玩家3秒查看棋盘
            setTimeout(() => this.ui.showWinner(`🎉 ${winnerName} 获胜！\n⏱️ 用时: ${gameTime}`), 3000);
            return;
        }

        // 检查平局
        if (this.state.history.length === 15 * 15) {
            this.state.gameOver = true;

            // 停止计时
            this.stats.stopTimer();
            const gameTime = this.stats.getFormattedTime();

            // 记录平局
            this.stats.recordResult(this.state.gameMode, 0, this.state.firstPlayer);
            this.ui.updateStats(this.stats.getStatsText(this.state.gameMode));

            // 记录到全局玩家统计
            if (window.PlayerStats && this.state.gameMode !== 'eve') {
                const mode = this.storyState.isStoryMode ? 'story' : this.state.gameMode;
                PlayerStats.recordResult(mode, 'draw');
            }

            // Game Analytics 埋点
            if (window.GameAnalytics) {
                GameAnalytics.trackGameEnd('draw', null, this.state.history.length);
            }

            // 角色状态：平局
            if (this.state.gameMode !== 'pvp') {
                this.ui.setCharacterState('IDLE');
            }

            // 复盘缓冲时间：给玩家3秒查看棋盘
            setTimeout(() => this.ui.showWinner(`🤝 平局！\n⏱️ 用时: ${gameTime}`), 3000);
            return;
        }

        // AI下完棋后的状态更新
        if (isAI && (this.state.gameMode === 'pve' || this.state.gameMode === 'eve')) {
            // 根据评分判断是否为攻击性的棋
            if (moveScore >= 10000) {
                // 高分：攻击/绝杀
                this.ui.setCharacterState('ATTACK');
                setTimeout(() => {
                    if (!this.state.gameOver) {
                        this.ui.setCharacterState('IDLE');
                    }
                }, 1500);
            } else if (moveScore >= 1000) {
                // 中等分数：防御
                this.ui.showDefendDialogue();
                setTimeout(() => {
                    if (!this.state.gameOver) {
                        this.ui.setCharacterState('IDLE');
                    }
                }, 1500);
            } else {
                // 普通棋步
                this.ui.setCharacterState('IDLE');
            }
        }

        // 切换玩家
        this.state.currentPlayer = this.state.currentPlayer === 1 ? 2 : 1;
        this.ui.updateCurrentPlayer(this.state.currentPlayer);

        // Redraw to update ghost stone color for next player
        this.drawBoard();

        // 故事模式：AI落子后轮到玩家时启动计时器
        if (!this.state.gameOver && this.storyState.isStoryMode && this.isHumanTurn()) {
            this.startMoveTimer();
        }

        // AI回合
        if (!this.state.gameOver && !this.isHumanTurn()) {
            setTimeout(() => this.aiMove(), this.aiThinkTime);
        }
    }

    // AI下棋
    aiMove() {
        if (this.state.gameOver) return;

        this.ui.showAIThinking(true);

        // 显示思考状态（故事模式下同步背景）
        if (this.state.gameMode === 'pve' || this.state.gameMode === 'eve') {
            this.ui.setCharacterState('CALC', this.storyState.isStoryMode ? this.gameState : null);

            // 故事模式下切换背景到CALC
            if (this.storyState.isStoryMode && window.setBackground) {
                setBackground('story', this.gameState.currentMissionId, 'CALC');
            }
        }

        // 计算开始时间
        const t0 = performance.now();

        // 先计算AI落子
        const result = this.ai.calculateBestMoveWithScore(this.state.board, this.state.currentPlayer);
        const elapsed = (performance.now() - t0) / 1000;

        // 计算思考时间
        let thinkTime;

        if (this.storyState.isStoryMode && window.getStoryAiThinkTime) {
            // 故事模式：使用关卡专属节奏
            const moveNumber = this.state.history.length;
            const score = result ? result.score : 0;

            // 判断局面标签
            const isForcedDefence = score >= 5000 && score < 10000;  // 防守紧急局面
            const isKillingMove = score >= 10000;  // 致命进攻
            const isCriticalMoment = moveNumber >= 30 || score >= 8000;  // 关键时刻

            thinkTime = getStoryAiThinkTime({
                levelId: this.storyState.missionId || 1,
                moveNumber: moveNumber,
                difficulty: 3,  // 中等难度
                isForcedDefence: isForcedDefence,
                isKillingMove: isKillingMove,
                isCriticalMoment: isCriticalMoment,
                playerTimeLow: false
            });
        } else {
            // 自由模式：固定思考时间
            thinkTime = 0.5;
        }

        // 减去已经花费的计算时间
        const waitTime = Math.max(0.3, thinkTime - elapsed);

        setTimeout(() => {
            this.ui.showAIThinking(false);

            if (result && result.move) {
                // 记录AI落子前的局势（用于智能台词）
                this.state.lastAIMoveScore = result.score || 0;

                this.placePiece(result.move.x, result.move.y, result.score || 0);

                // AI落子后显示智能台词
                if (!this.state.gameOver) {
                    this.showSmartDialogueAfterAIMove();
                }
            }
        }, waitTime * 1000);
    }

    // ========== 智能台词系统 ==========

    // AI落子后显示智能台词
    showSmartDialogueAfterAIMove() {
        if (!window.getSmartDialogue || !this.ai.evaluateSituation) return;

        // 确定AI是哪方
        const aiPlayer = this.state.firstPlayer === 1 ? 2 : 1;

        // 获取局势评估
        const situation = this.ai.evaluateSituation(
            this.state.board,
            aiPlayer,
            null  // AI落子后不需要评估玩家落子质量
        );

        // 获取智能台词
        const dialogue = getSmartDialogue(situation, 'afterAIMove');

        if (dialogue) {
            this.ui.showCharacterDialogue(dialogue.text);

            // 根据台词类型更新角色状态
            if (dialogue.type === 'attack') {
                this.ui.setCharacterState('ATTACK');
            } else if (dialogue.type === 'defend' || dialogue.type === 'lose') {
                // 防守或劣势时保持CALC状态
            }
        }
    }

    // 玩家落子后显示智能台词
    showSmartDialogueAfterPlayerMove(x, y) {
        if (!window.getSmartDialogue || !this.ai.evaluateSituation) return;
        if (this.state.gameMode === 'pvp') return;  // PVP模式不触发

        // 确定AI是哪方
        const aiPlayer = this.state.firstPlayer === 1 ? 2 : 1;
        const humanPlayer = aiPlayer === 1 ? 2 : 1;

        // 获取局势评估（包含玩家落子质量）
        const situation = this.ai.evaluateSituation(
            this.state.board,
            aiPlayer,
            { x, y, player: humanPlayer }
        );

        // 获取智能台词
        const dialogue = getSmartDialogue(situation, 'afterPlayerMove');

        if (dialogue) {
            this.ui.showCharacterDialogue(dialogue.text);

            // 根据玩家表现更新角色状态
            if (dialogue.type === 'goodMove') {
                // 玩家好棋：AI表现出认可
                this.ui.setCharacterState('IDLE');
            } else if (dialogue.type === 'danger') {
                // 玩家危险：AI可能有点得意
                this.ui.setCharacterState('CALC');
            }
        }
    }

    // 重新开始
    restart() {
        this.stats.stopTimer();
        this.state.winningLine = [];

        // 重置角色状态
        if (this.state.gameMode === 'pve' || this.state.gameMode === 'eve') {
            this.ui.setCharacterState('IDLE');
        }

        // 联机模式：发送再来一局请求
        if (this.state.gameMode === 'online') {
            if (window.Network) {
                Network.requestRematch();
                this.ui.hideWinner();
                this.ui.showToast(Localization.get('toast.rematch_sent'), 'info');
            }
            return;
        }

        if (this.state.gameMode === 'eve') {
            this.state.firstPlayer = Math.random() < 0.5 ? 1 : 2;
            this.prepareGame();
        } else if (this.state.gameMode) {
            this.showRPS();
        }
    }

    // 切换模式
    changeMode() {
        this.stats.stopTimer();

        // 联机模式：离开房间
        if (this.state.gameMode === 'online' && window.Network) {
            Network.leaveRoom();
        }

        this.state.gameOver = true;
        this.state.gameMode = null;
        this.state.winningLine = [];
        this.state.board = Array(15).fill(null).map(() => Array(15).fill(0));
        this.state.history = [];
        this.drawBoard();
        this.drawBoard();
        this.ui.showModeSelect();
        this.ui.clearGameMode();
        this.ui.showTimer(false);
        this.ui.showStats(false);
        this.ui.showCharacter(false);

        // 恢复默认按钮显示
        this.ui.updateControls('classic', true);
        this.ui.clearGameMode();
        this.ui.showTimer(false);
        this.ui.showStats(false);
        this.ui.showCharacter(false);

        // 隐藏故事模式HUD
        this.hideStoryHud();

        // 重置故事模式状态
        this.storyState.isStoryMode = false;
        this.storyState.missionId = null;
        this.storyState.mode = 'classic';

        // 重置游戏状态
        this.gameState.currentMode = 'classic';
        this.gameState.currentMissionId = null;

        // 更新主菜单段位显示
        this.updateMainMenuRankLabel();

        // 恢复默认背景
        if (window.resetBackground) {
            resetBackground();
        }
    }

    // 悔棋
    undo() {
        const { gameMode, history, gameOver } = this.state;
        if (history.length === 0 || gameOver || (gameMode !== 'pvp' && gameMode !== 'pve')) return;

        // 故事模式下检查悔棋次数限制
        if (this.storyState.isStoryMode && this.storyState.maxUndo >= 0) {
            if (this.storyState.undoUsed >= this.storyState.maxUndo) {
                this.ui.showToast(`⚠️ 悔棋次数已用完（最多${this.storyState.maxUndo}次）`, 'warning');
                return;
            }
            this.storyState.undoUsed++;
            const remaining = this.storyState.maxUndo - this.storyState.undoUsed;
            this.ui.showToast(`⏪ 悔棋成功（剩余${remaining}次）`, 'info');
        }

        const steps = gameMode === 'pve' && history.length >= 2 ? 2 : 1;
        for (let i = 0; i < steps && this.state.history.length > 0; i++) {
            const last = this.state.history.pop();
            this.state.board[last.x][last.y] = 0;
            this.state.currentPlayer = last.player;
        }

        this.ui.updateCurrentPlayer(this.state.currentPlayer);
        this.drawBoard();
        this.audio.playUndo();

        // 悔棋后角色恢复待机
        if (gameMode === 'pve') {
            this.ui.setCharacterState('IDLE');
        }

        // 故事模式下重置每步计时器
        if (this.storyState.isStoryMode && this.isHumanTurn()) {
            this.stopMoveTimer();
            this.startMoveTimer();
        }
    }

    // ========== 故事模式 ==========

    // 全新故事 - 始终从第一关开始，重置进度
    startNewStory() {
        // 全新故事模式：重置所有进度，从第1关开始
        this.storyState.fromReview = false;
        this.storyState.newGameProgress = 1;  // 新开游戏的进度

        // 重置存档进度（清除解锁状态，让玩家一关一关闯）
        this.storyState.unlockedLevelMaxId = 1;  // 只解锁第1关
        this.storyState.currentRankTitle = null;  // 清除段位

        // 重置禁手教学记录
        this.storyState.forbiddenSeen = {
            doubleThree: false,
            doubleFour: false,
            overline: false
        };

        // 保存重置后的进度到存储
        if (window.resetStoryProgress) {
            resetStoryProgress();
        } else {
            // 直接清除本地存储
            try {
                localStorage.removeItem('gomoku_story_progress');
            } catch (e) {
                console.warn('重置进度失败:', e);
            }
        }

        this.startStoryMission(1);
    }

    // 温故知新 - 打开关卡选择
    openReviewStory() {
        this.ui.openMissionSelectDialog((mission) => {
            // 回放模式，不更新存档
            this.storyState.fromReview = true;
            this.startStoryMission(mission.id);
        });
    }

    // 开始故事关卡
    startStoryMission(missionId, fromReview = false) {
        this.storyState.isStoryMode = true;
        this.storyState.missionId = missionId;
        this.storyState.mode = 'story';

        // 获取关卡配置
        const levelConfig = window.getStoryLevelConfig ? getStoryLevelConfig(missionId) : null;
        this.storyState.levelConfig = levelConfig;

        // 更新游戏状态（用于背景系统）
        this.gameState.currentMode = 'story';
        this.gameState.currentMissionId = missionId;

        // 隐藏模式选择
        this.ui.hideModeSelect();

        // 进入故事模式UI状态
        this.ui.enterStoryMode();

        // 设置故事模式初始背景
        if (window.setBackground) {
            setBackground('story', missionId, 'IDLE');
        }

        // 显示角色
        this.ui.showCharacter(true);
        this.ui.setCharacterState('IDLE', this.gameState);

        // 隐藏统计和计时器
        this.ui.showStats(false);
        this.ui.showTimer(false);

        // 根据关卡ID选择对应的对话key
        const introDialogKey = `mission${missionId}_intro`;

        // 播放开场对话
        this.ui.showStoryDialog(introDialogKey, () => {
            // 对话结束后显示任务简报面板
            this.showMissionBriefPanel(missionId);
        });
    }

    // 显示任务简报面板
    showMissionBriefPanel(missionId) {
        const levelConfig = window.getStoryLevelConfig ? getStoryLevelConfig(missionId) : null;

        if (!levelConfig) {
            // 如果没有配置，直接开始对战
            this.startStoryBattle();
            return;
        }

        // Update panel content with localized strings
        const titleEl = document.getElementById('mission-brief-title');
        const subtitleEl = document.getElementById('mission-brief-subtitle');
        const ruleEl = document.getElementById('mission-rule-text');
        const goalEl = document.getElementById('mission-goal-text');

        if (titleEl) titleEl.textContent = Localization.get(levelConfig.nameKey);
        if (subtitleEl) subtitleEl.textContent = Localization.get(levelConfig.subtitleKey);
        if (ruleEl) ruleEl.textContent = Localization.get(levelConfig.ui.ruleSummaryKey);
        if (goalEl) goalEl.textContent = Localization.get(levelConfig.ui.goalSummaryKey);

        // 显示面板
        const modal = document.getElementById('mission-brief-modal');
        if (modal) modal.classList.remove('hidden');

        // 绑定按钮事件
        const startBtn = document.getElementById('mission-start-btn');
        const cancelBtn = document.getElementById('mission-cancel-btn');

        const onStart = () => {
            modal.classList.add('hidden');
            startBtn.removeEventListener('click', onStart);
            cancelBtn.removeEventListener('click', onCancel);

            // 第三关：先进行禁手教学
            if (missionId === 3 && window.FORBIDDEN_LESSON_PAGES) {
                this.showForbiddenLessonPanel(() => {
                    this.startStoryBattle();
                });
            } else {
                this.startStoryBattle();
            }
        };

        const onCancel = () => {
            modal.classList.add('hidden');
            startBtn.removeEventListener('click', onStart);
            cancelBtn.removeEventListener('click', onCancel);
            this.exitStoryMode();
        };

        if (startBtn) startBtn.addEventListener('click', onStart);
        if (cancelBtn) cancelBtn.addEventListener('click', onCancel);
    }

    // 开始故事模式对战
    startStoryBattle() {
        const levelConfig = this.storyState.levelConfig;
        const rules = levelConfig ? levelConfig.rules : null;

        // 设置游戏模式为PVE
        this.state.gameMode = 'pve';

        // 1. 根据关卡配置设置先后手
        if (rules && rules.playerColor === 'white') {
            this.state.firstPlayer = 2;  // AI先手（黑）
        } else {
            this.state.firstPlayer = 1;  // 玩家先手（黑）
        }

        // 2. 准备棋盘
        this.state.board = Array(15).fill(null).map(() => Array(15).fill(0));
        this.state.currentPlayer = 1;
        this.state.history = [];
        this.state.gameOver = false;
        this.state.winningLine = [];

        // 3. 应用预设局面（如果有）
        if (rules && rules.startPresetId && window.PRESET_POSITIONS) {
            const preset = window.PRESET_POSITIONS[rules.startPresetId];
            if (preset) {
                this.applyPresetPosition(preset);
            }
        }

        // 4. 设置禁手模式
        if (rules && rules.forbiddenRule) {
            this.storyState.forbiddenMode = rules.forbiddenRule;
        } else {
            this.storyState.forbiddenMode = 'none';
        }

        // 5. 设置悔棋限制
        if (rules && typeof rules.maxUndo === 'number') {
            this.storyState.maxUndo = rules.maxUndo;
        } else {
            this.storyState.maxUndo = -1;  // 不限
        }
        this.storyState.undoUsed = 0;

        // 6. 设置提示开关
        this.storyState.hintsEnabled = rules ? rules.hintsEnabled !== false : true;

        // 7. 设置AI难度（如果AI模块支持）
        if (rules && rules.aiLevel && this.ai.setLevel) {
            this.ai.setLevel(rules.aiLevel);
        }

        // 8. 初始化时间控制
        this.initTimeControl(rules ? rules.timeControl : null);

        // 9. 初始化数据视图技能
        this.initDataViewSkill(rules ? rules.dataView : null);

        // 10. 更新UI为故事模式样式
        this.ui.hideMainMenu();
        // 确保容器可见后调整棋盘尺寸
        this.resizeBoard();
        this.updateStoryHud(levelConfig);

        // 修复：确保HUD显示正确名字
        this.setupPlayerInfoForMode('pve', this.state.firstPlayer);

        this.ui.updateLabels('pve', this.state.firstPlayer);
        this.ui.updateCurrentPlayer(this.state.currentPlayer);
        this.ui.resetTimer();
        this.ui.showTimer(true);
        this.drawBoard();

        // 显示倒计时后开始
        this.showCountdown();
    }

    // ========== 时间控制系统 ==========

    // 初始化时间控制
    initTimeControl(timeControl) {
        // 清除之前的计时器
        this.stopMoveTimer();

        this.storyState.timeControl = timeControl || { mode: 'none' };

        if (!timeControl || timeControl.mode === 'none') {
            this.storyState.playerTimeRemaining = Infinity;
            return;
        }

        if (timeControl.mode === 'overall') {
            // 总时间模式
            this.storyState.playerTimeRemaining = timeControl.totalSeconds;
        } else if (timeControl.mode === 'perMove') {
            // 每步计时模式
            this.storyState.playerTimeRemaining = timeControl.perMoveSeconds;
        }

        // 更新HUD显示
        this.updateTimerDisplay();
    }

    // 开始玩家回合计时
    startMoveTimer() {
        const tc = this.storyState.timeControl;
        if (!tc || tc.mode === 'none') return;

        // 每步模式：重置为每步时间
        if (tc.mode === 'perMove') {
            this.storyState.playerTimeRemaining = tc.perMoveSeconds;
        }

        this.updateTimerDisplay();

        // 启动计时器（每秒更新）
        this.storyState.moveTimerInterval = setInterval(() => {
            if (this.state.gameOver || !this.isHumanTurn()) {
                return;
            }

            this.storyState.playerTimeRemaining--;
            this.updateTimerDisplay();

            // 检查超时
            if (this.storyState.playerTimeRemaining <= 0) {
                this.handleTimeout();
            }
        }, 1000);
    }

    // 停止计时器
    stopMoveTimer() {
        if (this.storyState.moveTimerInterval) {
            clearInterval(this.storyState.moveTimerInterval);
            this.storyState.moveTimerInterval = null;
        }
    }

    // 玩家落子后处理时间
    onPlayerMove() {
        const tc = this.storyState.timeControl;
        if (!tc || tc.mode === 'none') return;

        // 总时间+加秒模式：落子后加时间
        if (tc.mode === 'overall' && tc.incrementSeconds) {
            this.storyState.playerTimeRemaining += tc.incrementSeconds;
        }

        this.updateTimerDisplay();
    }

    // 更新计时器显示
    updateTimerDisplay() {
        const timerMain = document.getElementById('timer-main-text');
        if (!timerMain) return;

        const tc = this.storyState.timeControl;
        if (!tc || tc.mode === 'none') {
            timerMain.textContent = Localization.get('game.free_mode');
            timerMain.classList.remove('urgent');
            return;
        }

        const remaining = this.storyState.playerTimeRemaining;

        // 格式化时间显示
        if (tc.mode === 'perMove') {
            timerMain.textContent = remaining.toString();
        } else {
            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            timerMain.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }

        // 紧急状态
        if (remaining <= 10) {
            timerMain.classList.add('urgent');
        } else {
            timerMain.classList.remove('urgent');
        }

        // 更新进度条（如果有）
        const progressBar = document.getElementById('timer-progress-bar');
        if (progressBar) {
            let totalTime = tc.mode === 'perMove' ? tc.perMoveSeconds : tc.totalSeconds;
            let percent = (remaining / totalTime) * 100;
            progressBar.style.width = `${percent}%`;

            if (percent <= 20) {
                progressBar.className = 'timer-progress-bar danger';
            } else if (percent <= 50) {
                progressBar.className = 'timer-progress-bar warning';
            } else {
                progressBar.className = 'timer-progress-bar';
            }
        }
    }

    // 超时处理
    handleTimeout() {
        this.stopMoveTimer();
        this.state.gameOver = true;
        this.stats.stopTimer();

        // 更新角色状态
        this.ui.setCharacterState('WIN', this.storyState.isStoryMode ? this.gameState : null);

        // 调用结算
        if (this.storyState.isStoryMode) {
            this.onStoryGameOver('TIMEOUT');
        } else {
            this.ui.showWinner('⏱️ 超时判负！\n时间用尽了！');
        }
    }

    // ========== 数据视图技能 ==========

    // 初始化数据视图技能
    initDataViewSkill(dataViewConfig) {
        if (!dataViewConfig || !dataViewConfig.enabled) {
            this.storyState.dataView.enabled = false;
            this.storyState.dataView.remainingUses = 0;
            return;
        }

        this.storyState.dataView.enabled = true;
        this.storyState.dataView.remainingUses = dataViewConfig.maxUses || 3;
        this.storyState.dataView.candidatesPerUse = dataViewConfig.candidatesPerUse || 3;
        this.storyState.dataView.highlightedPoints = [];

        // 更新技能按钮显示
        this.updateDataViewButton();

        // 绑定技能按钮事件
        const skillBtn = document.getElementById('data-view-btn');
        if (skillBtn && !skillBtn.hasAttribute('data-bound')) {
            skillBtn.setAttribute('data-bound', 'true');
            skillBtn.addEventListener('click', () => this.useDataViewSkill());
        }
    }

    // 使用数据视图技能
    useDataViewSkill() {
        const dv = this.storyState.dataView;
        if (!dv.enabled || dv.remainingUses <= 0 || !this.isHumanTurn() || this.state.gameOver) {
            return;
        }

        // 消耗次数
        dv.remainingUses--;
        this.updateDataViewButton();

        // 获取推荐落点
        const candidates = this.getRecommendedMoves(dv.candidatesPerUse);

        // 高亮这些点
        dv.highlightedPoints = candidates;
        this.board.highlightRecommendedPoints(candidates);

        // 播放技能音效
        this.audio.playPlace();

        // 显示提示
        this.ui.showToast(`🔮 数据视图：显示${candidates.length}个推荐落点`, 'info');
    }

    // 获取推荐落点
    getRecommendedMoves(count) {
        const candidates = [];
        const player = this.state.currentPlayer;

        // 使用AI评估所有空位
        for (let x = 0; x < 15; x++) {
            for (let y = 0; y < 15; y++) {
                if (this.state.board[x][y] === 0) {
                    // 简单评估：检查周围是否有棋子
                    let hasNeighbor = false;
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            const nx = x + dx, ny = y + dy;
                            if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && this.state.board[nx][ny] !== 0) {
                                hasNeighbor = true;
                                break;
                            }
                        }
                        if (hasNeighbor) break;
                    }

                    if (hasNeighbor || this.state.history.length === 0) {
                        // 简单评分
                        const score = this.ai.evaluatePoint(this.state.board, x, y, player);
                        candidates.push({ x, y, score });
                    }
                }
            }
        }

        // 按评分排序，取前N个
        candidates.sort((a, b) => b.score - a.score);
        return candidates.slice(0, count).map(c => ({ x: c.x, y: c.y }));
    }

    // 更新数据视图按钮
    updateDataViewButton() {
        const btn = document.getElementById('data-view-btn');
        const countEl = document.getElementById('data-view-count');

        if (!btn) return;

        const dv = this.storyState.dataView;

        if (!dv.enabled) {
            btn.style.display = 'none';
            return;
        }

        btn.style.display = 'flex';

        if (countEl) {
            countEl.textContent = `×${dv.remainingUses}`;
            countEl.className = dv.remainingUses > 0 ? 'skill-count' : 'skill-count empty';
        }

        btn.disabled = dv.remainingUses <= 0;
    }

    // ========== 故事模式结算系统 ==========

    // 统一结算入口
    onStoryGameOver(result, extra = {}) {
        this.stopMoveTimer();

        const levelConfig = this.storyState.levelConfig;
        const missionId = this.storyState.missionId;
        const isWin = (result === 'PLAYER_WIN');

        const gameTime = this.stats.getFormattedTime();

        if (isWin && !this.storyState.fromReview) {
            // 解锁下一关
            if (levelConfig && levelConfig.story && levelConfig.story.unlocksNextLevelId) {
                this.storyState.unlockedLevelMaxId = Math.max(
                    this.storyState.unlockedLevelMaxId,
                    levelConfig.story.unlocksNextLevelId
                );
            }

            // 调用存档系统
            if (window.completeMission) {
                completeMission(missionId);
            }

            // 更新段位
            const oldRank = this.storyState.currentRankTitle;
            if (levelConfig && levelConfig.story && levelConfig.story.rankOnFirstClear) {
                this.storyState.currentRankTitle = levelConfig.story.rankOnFirstClear.title;
            }
            const newRank = this.storyState.currentRankTitle;
            const rankChanged = oldRank !== newRank;

            // 保存段位
            this.saveRankToStorage();

            // 播放胜利对话
            const dialogKey = `mission${missionId}_win`;
            setTimeout(() => {
                this.ui.showStoryDialog(dialogKey, () => {
                    this.showStoryClearPanel(levelConfig, rankChanged, gameTime);
                });
            }, 3000);
        } else {
            // 失败处理
            let message = '';

            switch (result) {
                case 'PLAYER_LOSE':
                    message = `💔 遗憾落败！\n⏱️ 用时: ${gameTime}\n再接再厉！`;
                    break;
                case 'TIMEOUT':
                    message = `⏱️ 超时判负！\n时间用尽了，再试一次！`;
                    break;
                case 'PLAYER_FORBIDDEN':
                    // 禁手判负已在handleForbiddenLoss中处理
                    return;
                default:
                    message = `💔 遗憾落败！\n⏱️ 用时: ${gameTime}`;
            }

            const dialogKey = `mission${missionId}_lose`;
            setTimeout(() => {
                this.ui.showStoryDialog(dialogKey, () => {
                    this.ui.showWinner(message);
                });
            }, 3000);
        }
    }

    // 应用预设局面
    applyPresetPosition(preset) {
        if (!preset || !preset.moves) return;

        preset.moves.forEach(move => {
            const player = move.color === 'black' ? 1 : 2;
            this.state.board[move.x][move.y] = player;
            this.state.history.push({ x: move.x, y: move.y, player });
        });

        // 根据预设决定当前该谁下
        if (preset.nextToMove === 'white') {
            this.state.currentPlayer = 2;
        } else {
            this.state.currentPlayer = 1;
        }
    }

    // 更新故事模式HUD（新三栏式布局）
    updateStoryHud(levelConfig) {
        // 获取新配置
        const missionId = this.storyState.missionId || 1;
        const newConfig = typeof getLevelConfig === 'function' ? getLevelConfig(missionId) : null;

        // 更新故事模式专用HUD
        const storyHud = document.getElementById('story-hud');
        if (storyHud) {
            storyHud.classList.remove('hidden');
        }

        // 使用新配置或旧配置
        const hudConfig = newConfig ? newConfig.hud : null;
        const rules = newConfig ? newConfig.rules : (levelConfig ? levelConfig.rules : null);

        // 左侧：关卡信息
        const hudTitle = document.getElementById('story-hud-title');
        if (hudTitle) {
            hudTitle.textContent = hudConfig ? hudConfig.left.line1 : (levelConfig ? levelConfig.name : Localization.get('game.story_mode'));
        }

        // 中间：规则标签
        const tagsContainer = document.getElementById('story-hud-tags');
        if (tagsContainer && hudConfig && hudConfig.center && hudConfig.center.tags) {
            tagsContainer.innerHTML = hudConfig.center.tags.map(tag => {
                let tagClass = 'rule-tag';
                // 根据内容添加特殊样式
                if (tag.text.includes('严格') || tag.text.includes('判负')) {
                    tagClass += ' tag-forbidden-strict';
                } else if (tag.text.includes('教学')) {
                    tagClass += ' tag-forbidden-teaching';
                } else if (tag.text.includes('每步') || tag.text.includes('总时')) {
                    tagClass += ' tag-time-pressure';
                } else if (tag.text.includes('技能') || tag.text.includes('数据视图')) {
                    tagClass += ' tag-skill';
                }
                return `<span class="${tagClass}"><span class="tag-icon">${tag.icon}</span>${tag.text}</span>`;
            }).join('');
        }

        // 右侧：计时显示
        const timerMain = document.getElementById('timer-main-text');
        const timerSub = document.getElementById('timer-sub-text');
        const timerBadge = document.getElementById('timer-badge');
        const timerWarning = document.getElementById('timer-warning');

        if (hudConfig && hudConfig.right) {
            const right = hudConfig.right;
            if (timerMain) timerMain.textContent = right.mainText || Localization.get('game.free_mode');
            if (timerSub) timerSub.textContent = right.subText || '';

            // 徽章显示
            if (timerBadge) {
                if (right.showBadge && right.badgeText) {
                    timerBadge.textContent = right.badgeText;
                    timerBadge.classList.remove('hidden');
                } else {
                    timerBadge.classList.add('hidden');
                }
            }

            // 警告显示
            if (timerWarning) {
                if (right.showWarning && right.warningText) {
                    timerWarning.textContent = right.warningText;
                    timerWarning.classList.remove('hidden');
                } else {
                    timerWarning.classList.add('hidden');
                }
            }
        }

        // 数据视图技能按钮（第5关）
        const dataViewSkill = document.getElementById('data-view-skill');
        if (dataViewSkill) {
            if (rules && rules.dataView && rules.dataView.enabled) {
                dataViewSkill.classList.remove('hidden');
                const countEl = document.getElementById('data-view-count');
                if (countEl) countEl.textContent = `×${rules.dataView.maxUses || 3}`;
            } else {
                dataViewSkill.classList.add('hidden');
            }
        }

        // 隐藏普通模式的显示
        const gameModeDisplay = document.getElementById('game-mode-display');
        if (gameModeDisplay) {
            gameModeDisplay.classList.add('hidden');
        }
    }

    // 隐藏故事模式HUD
    hideStoryHud() {
        const storyHud = document.getElementById('story-hud');
        if (storyHud) {
            storyHud.classList.add('hidden');
        }

        const gameModeDisplay = document.getElementById('game-mode-display');
        if (gameModeDisplay) {
            gameModeDisplay.classList.remove('hidden');
        }
    }

    // 故事模式对局结束处理（段位系统核心）
    handleStoryGameOver(playerWon, gameTime) {
        const levelConfig = this.storyState.levelConfig;
        const missionId = this.storyState.missionId;

        if (playerWon && !this.storyState.fromReview) {
            // 1. 解锁下一关
            if (levelConfig && levelConfig.unlocksNextLevelId) {
                this.storyState.unlockedLevelMaxId = Math.max(
                    this.storyState.unlockedLevelMaxId,
                    levelConfig.unlocksNextLevelId
                );
            }

            // 调用存档系统
            if (window.completeMission) {
                completeMission(missionId);
            }

            // 2. 更新段位
            const oldRank = this.storyState.currentRankTitle;
            if (levelConfig && levelConfig.rankOnFirstClear) {
                this.storyState.currentRankTitle = levelConfig.rankOnFirstClear.title;
            }
            const newRank = this.storyState.currentRankTitle;
            const rankChanged = oldRank !== newRank;

            // 保存段位到本地存储
            this.saveRankToStorage();

            // 3. 播放胜利对话
            const dialogKey = `mission${missionId}_win`;

            setTimeout(() => {
                this.ui.showStoryDialog(dialogKey, () => {
                    // 4. 显示通关面板（包含段位提升）
                    this.showStoryClearPanel(levelConfig, rankChanged, gameTime);
                });
            }, 3000);
        } else {
            // 失败处理
            const dialogKey = `mission${missionId}_lose`;

            setTimeout(() => {
                this.ui.showStoryDialog(dialogKey, () => {
                    this.ui.showWinner(`💔 遗憾落败！\n⏱️ 用时: ${gameTime}\n再接再厉！`);
                });
            }, 3000);
        }
    }

    // 显示通关面板（带段位提升）
    showStoryClearPanel(levelConfig, rankChanged, gameTime) {
        const rankInfo = levelConfig ? levelConfig.rankOnFirstClear : null;

        let message = `🎉 恭喜通关！\n⏱️ 用时: ${gameTime}`;

        if (rankChanged && rankInfo) {
            message += `\n\n🏆 段位提升！\n${rankInfo.title}\n"${rankInfo.description}"`;
        }

        this.ui.showWinner(message);
    }

    // 保存段位到本地存储
    saveRankToStorage() {
        try {
            const storyProgress = JSON.parse(localStorage.getItem('gomoku_story_progress') || '{}');
            storyProgress.currentRankTitle = this.storyState.currentRankTitle;
            storyProgress.unlockedLevelMaxId = this.storyState.unlockedLevelMaxId;
            localStorage.setItem('gomoku_story_progress', JSON.stringify(storyProgress));
        } catch (e) {
            console.warn('保存段位失败:', e);
        }
    }

    // 从本地存储加载段位
    loadRankFromStorage() {
        try {
            const storyProgress = JSON.parse(localStorage.getItem('gomoku_story_progress') || '{}');
            if (storyProgress.currentRankTitle) {
                this.storyState.currentRankTitle = storyProgress.currentRankTitle;
            }
            if (storyProgress.unlockedLevelMaxId) {
                this.storyState.unlockedLevelMaxId = storyProgress.unlockedLevelMaxId;
            }
        } catch (e) {
            console.warn('加载段位失败:', e);
        }
    }

    // 获取当前段位显示文本
    getCurrentRankDisplay() {
        if (this.storyState.currentRankTitle) {
            return `当前段位：${this.storyState.currentRankTitle}`;
        }
        return `${Localization.get('game.rank_status', { RANK: Localization.get('rank.unranked') })}`;
    }

    // 故事模式结束处理（旧版兼容）
    handleStoryEnd(playerWon) {
        const dialogKey = playerWon ? 'winEnding' : 'loseEnding';

        this.ui.showStoryDialog(dialogKey, () => {
            // 显示结果弹窗后返回菜单
            setTimeout(() => {
                this.exitStoryMode();
            }, 1000);
        });
    }

    // ========== 第三关禁手教学课程 ==========

    // 显示禁手教学面板
    showForbiddenLessonPanel(onComplete) {
        const pages = window.FORBIDDEN_LESSON_PAGES || [];
        if (pages.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        let currentPage = 0;

        // 创建或获取教学面板
        let panel = document.getElementById('forbidden-lesson-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'forbidden-lesson-panel';
            panel.className = 'modal-overlay';
            document.body.appendChild(panel);
        }

        const renderPage = () => {
            const page = pages[currentPage];
            const isLast = currentPage === pages.length - 1;
            const isFirst = currentPage === 0;

            let demoHtml = '';
            if (page.boardDemo) {
                demoHtml = `
                    <div class="lesson-demo">
                        <canvas id="lesson-demo-canvas" width="280" height="280"></canvas>
                        <div class="lesson-demo-annotation">${page.boardDemo.annotation}</div>
                    </div>
                `;
            }

            panel.innerHTML = `
                <div class="modal-content lesson-modal">
                    <div class="lesson-header">
                        <div class="lesson-progress">
                            ${pages.map((_, i) => `<span class="progress-dot ${i === currentPage ? 'active' : i < currentPage ? 'done' : ''}"></span>`).join('')}
                        </div>
                        <h2 class="lesson-title">${page.title}</h2>
                    </div>
                    <div class="lesson-body">
                        <div class="lesson-speaker">
                            <span class="speaker-icon">🤖</span>
                            <span class="speaker-name">弈·零</span>
                        </div>
                        <div class="lesson-content">
                            ${page.content.map(p => `<p>${p}</p>`).join('')}
                        </div>
                        ${demoHtml}
                    </div>
                    <div class="lesson-footer">
                        <button class="lesson-btn lesson-btn-prev ${isFirst ? 'hidden' : ''}" id="lesson-prev-btn">
                            ◀ 上一页
                        </button>
                        <button class="lesson-btn lesson-btn-next" id="lesson-next-btn">
                            ${isLast ? Localization.get('game.start_match') : Localization.get('game.next_page')}
                        </button>
                    </div>
                </div>
            `;

            panel.classList.remove('hidden');

            // 绘制演示棋盘
            if (page.boardDemo) {
                setTimeout(() => this.drawLessonDemo(page.boardDemo), 50);
            }

            // 绑定按钮事件
            const prevBtn = document.getElementById('lesson-prev-btn');
            const nextBtn = document.getElementById('lesson-next-btn');

            if (prevBtn) {
                prevBtn.onclick = () => {
                    if (currentPage > 0) {
                        currentPage--;
                        renderPage();
                    }
                };
            }

            if (nextBtn) {
                nextBtn.onclick = () => {
                    if (isLast) {
                        panel.classList.add('hidden');
                        if (onComplete) onComplete();
                    } else {
                        currentPage++;
                        renderPage();
                    }
                };
            }
        };

        renderPage();
    }

    // 绘制教学演示棋盘
    drawLessonDemo(demo) {
        const canvas = document.getElementById('lesson-demo-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const size = canvas.width;
        const gridSize = 9;  // 只显示9x9的小棋盘
        const cellSize = size / (gridSize + 1);
        const offset = cellSize;

        // 清空画布
        ctx.fillStyle = '#dcb35c';
        ctx.fillRect(0, 0, size, size);

        // 绘制网格线
        ctx.strokeStyle = '#8b7355';
        ctx.lineWidth = 1;

        for (let i = 0; i < gridSize; i++) {
            // 横线
            ctx.beginPath();
            ctx.moveTo(offset, offset + i * cellSize);
            ctx.lineTo(offset + (gridSize - 1) * cellSize, offset + i * cellSize);
            ctx.stroke();

            // 竖线
            ctx.beginPath();
            ctx.moveTo(offset + i * cellSize, offset);
            ctx.lineTo(offset + i * cellSize, offset + (gridSize - 1) * cellSize);
            ctx.stroke();
        }

        // 坐标偏移（将15x15的坐标映射到9x9显示）
        const mapX = (x) => (x - 3) * cellSize + offset;
        const mapY = (y) => (y - 3) * cellSize + offset;

        // 绘制高亮线
        if (demo.highlightLines) {
            ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
            ctx.lineWidth = 3;

            demo.highlightLines.forEach(line => {
                if (line.length >= 2) {
                    ctx.beginPath();
                    ctx.moveTo(mapX(line[0].x), mapY(line[0].y));
                    for (let i = 1; i < line.length; i++) {
                        ctx.lineTo(mapX(line[i].x), mapY(line[i].y));
                    }
                    ctx.stroke();
                }
            });
        }

        // 绘制棋子
        const stoneRadius = cellSize * 0.4;

        demo.stones.forEach(stone => {
            const x = mapX(stone.x);
            const y = mapY(stone.y);

            ctx.beginPath();
            ctx.arc(x, y, stoneRadius, 0, Math.PI * 2);
            ctx.fillStyle = stone.color === 'black' ? '#1a1a1a' : '#f5f5f5';
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // 绘制禁手点标记
        if (demo.forbiddenPoint) {
            const x = mapX(demo.forbiddenPoint.x);
            const y = mapY(demo.forbiddenPoint.y);

            // 绘制红色星号
            ctx.fillStyle = '#ff4444';
            ctx.font = `bold ${cellSize * 0.8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('★', x, y);
        }
    }

    // 退出故事模式
    exitStoryMode() {
        this.storyState.isStoryMode = false;
        this.storyState.missionId = null;
        this.storyState.mode = 'classic';

        this.ui.exitStoryMode();
        this.changeMode();
    }

    // ========== 历史介绍面板 ==========

    // 打开历史面板
    openHistoryPanel() {
        const historyPanel = document.getElementById('history-panel');
        const historyContent = document.getElementById('history-content');
        const modeSelect = document.getElementById('mode-select');

        if (!historyPanel || !historyContent) return;

        // 隐藏模式选择
        if (modeSelect) modeSelect.classList.add('hidden');

        // 渲染历史内容（使用预生成的HTML）
        if (window.GOMOKU_HISTORY_ARTICLE_HTML) {
            historyContent.innerHTML = GOMOKU_HISTORY_ARTICLE_HTML;
        }

        // 显示历史面板
        historyPanel.classList.remove('hidden');

        // 滚动到顶部
        historyPanel.scrollTop = 0;
    }

    // 关闭历史面板
    closeHistoryPanel() {
        const historyPanel = document.getElementById('history-panel');
        const modeSelect = document.getElementById('mode-select');

        if (historyPanel) historyPanel.classList.add('hidden');
        if (modeSelect) modeSelect.classList.remove('hidden');
    }

    // 渲染历史内容HTML
    renderHistoryContent(historyData) {
        let html = '';

        historyData.chapters.forEach(chapter => {
            html += `
                <div class="history-chapter">
                    <div class="chapter-header">
                        <div class="chapter-icon">${chapter.icon}</div>
                        <div class="chapter-title-wrap">
                            <div class="chapter-era">${chapter.era}</div>
                            <h2 class="chapter-title">${chapter.title}</h2>
                        </div>
                    </div>
                    <div class="chapter-body">
                        ${chapter.content.map(p => `<p>${p}</p>`).join('')}
                    </div>
                </div>
            `;
        });

        return html;
    }

    // ============ 联机对战方法 ============

    // 打开联机大厅
    openOnlineLobby() {
        console.log('[Game] openOnlineLobby called');

        // 重置游戏开始标志
        this._gameStarting = false;

        // 检查是否已设置昵称
        const savedName = localStorage.getItem('gomoku_player_name');
        if (!savedName) {
            // 首次联机，显示昵称设置弹窗
            this.showNameSetupModal();
            return;
        }

        this._proceedToOnlineLobby();
    }

    // 显示昵称设置弹窗
    showNameSetupModal() {
        this.ui.hideModeSelect();
        const modal = document.getElementById('name-setup-modal');
        if (modal) {
            modal.classList.remove('hidden');

            // 生成一个随机名字作为默认值
            if (window.NameGenerator) {
                const randomName = NameGenerator.generate('cn');
                document.getElementById('player-name-input').value = randomName;
                this._updateNameCharCount();
                this._validateName(randomName);
            }
        }
    }

    // 继续进入联机大厅
    _proceedToOnlineLobby() {
        try {
            // 初始化网络模块
            if (window.Network) {
                // 绑定在线人数监听
                Network.onOnlineCountUpdate = (count) => {
                    if (this.ui.updateOnlineCount) {
                        this.ui.updateOnlineCount(count);
                    }
                };

                if (!Network.db) {
                    Network.init();
                }
            }

            console.log('[Game] Hiding mode select...');
            this.ui.hideModeSelect();

            console.log('[Game] Showing online lobby...');
            this.ui.showOnlineLobby();

            console.log('[Game] Online lobby opened successfully');
        } catch (error) {
            console.error('[Game] Error opening online lobby:', error);
            // 保底：直接操作DOM
            document.getElementById('mode-select')?.classList.add('hidden');
            document.getElementById('online-lobby-modal')?.classList.remove('hidden');
        }
    }

    // 创建房间
    async createOnlineRoom() {
        if (!window.Network) {
            alert(Localization.get('toast.mp_module_missing'));
            return;
        }

        const result = await Network.createRoom();

        if (result.success) {
            this.ui.closeOnlineLobby();
            this.ui.showRoomWaiting(result.roomCode);
            this.ui.hideMainMenu(); // Ensure game layout is shown in background
            this.resizeBoard();     // Resize board now that container is visible
            this.setupOnlineGameListeners();

            // 显示自己的信息
            const playerName = localStorage.getItem('gomoku_player_name') || Localization.get('mp.player');
            this.ui.updateRoomPlayers({
                [Network.myPlayerId]: {
                    name: playerName,
                    color: 'black',
                    ready: false
                }
            });
        } else {
            alert(Localization.get('toast.room_create_failed') + ': ' + result.error);
        }
    }

    // 检查断线重连
    async checkReconnection() {
        const lastRoom = localStorage.getItem('gomoku_last_room');
        if (!lastRoom) return;

        // 简单检查：询问用户
        if (confirm(Localization.get('toast.reconnect_confirm', { ROOM: lastRoom }))) {
            if (!window.Network) return;

            // 确保网络初始化
            // Network.init() 在 window.onload 中已经调用了，但这里为了保险可以检查
            if (!Network.myPlayerId) Network.init();

            // 关键：设置网络回调
            this.setupOnlineGameListeners();

            const result = await Network.joinRoom(lastRoom);
            if (result.success) {
                this.ui.showOnlineLobby(); // 先显示大厅背景
                this.ui.closeOnlineLobby();

                // 如果是重连，直接进入
                if (result.reconnected) {
                    this.setupOnlineGameListeners();
                    this.startOnlineGame();
                    this.ui.showToast(Localization.get('toast.reconnect_success'), 'success');
                } else {
                    // 如果房间还在waiting状态（虽然不太可能，因为异常退出通常意味着playing）
                    this.ui.showRoomWaiting(lastRoom);
                    this.setupOnlineGameListeners();
                }

            } else {
                this.ui.showToast(Localization.get('toast.reconnect_failed', { ERROR: result.error }), 'error');
                localStorage.removeItem('gomoku_last_room');
            }
        } else {
            localStorage.removeItem('gomoku_last_room');
        }
    }

    // 加入房间
    async joinOnlineRoom() {
        if (!window.Network) {
            alert(Localization.get('toast.mp_module_missing'));
            return;
        }

        const roomCode = document.getElementById('room-code-input').value.trim();

        if (roomCode.length !== 6) {
            this.ui.showJoinRoomError(Localization.get('toast.room_code_6_digits'));
            return;
        }

        // 关键：设置网络回调
        this.setupOnlineGameListeners();

        const result = await Network.joinRoom(roomCode);

        if (result.success) {
            this.ui.closeJoinRoom();
            this.ui.closeOnlineLobby();

            // 如果是重连，直接开始游戏
            if (result.reconnected) {
                this.setupOnlineGameListeners();
                this.startOnlineGame();
                this.ui.showToast(Localization.get('toast.reconnect_success'), 'success');
            } else {
                this.ui.showRoomWaiting(roomCode);
                this.setupOnlineGameListeners();
            }

            // 保存房间号以便重连
            localStorage.setItem('gomoku_last_room', roomCode);

        } else {
            this.ui.showJoinRoomError(result.error);
        }
    }

    // 切换准备状态
    async toggleReady() {
        if (!window.Network || !Network.connected) {
            this.ui.showToast(Localization.get('toast.not_connected'), 'error');
            return;
        }
        if (!Network.currentRoom) {
            this.ui.showToast(Localization.get('toast.not_in_room'), 'error');
            return;
        }

        try {
            // 获取当前准备状态
            const roomSnapshot = await Network.currentRoomRef.child('players').child(Network.myPlayerId).once('value');
            if (!roomSnapshot.exists()) {
                this.ui.showToast(Localization.get('toast.invalid_player_data'), 'error');
                return;
            }
            const playerData = roomSnapshot.val();
            const currentReady = playerData?.ready || false;

            console.log('[toggleReady] 当前准备状态:', currentReady, '将切换为:', !currentReady);

            // 切换状态
            await Network.setReady(!currentReady);
            this.ui.showToast(!currentReady ? '已准备' : '取消准备', 'success');

            // UI update will handle by onPlayersUpdate, but we can optimistically update
            // this.ui.updateReadyButton(!currentReady); 
        } catch (e) {
            console.error('Toggle Ready Error:', e);
            this.ui.showToast('操作失败: ' + e.message, 'error');
        }
    }

    // 离开房间
    async leaveOnlineRoom() {
        if (window.Network) {
            await Network.leaveRoom();
            // Update status to idle/menu
            Network.updatePlayerStatus('idle');
        }

        this.ui.closeRoomWaiting();
        // this.ui.showOnlineLobby(); // User requested to skip lobby
        this.ui.closeOnlineLobby(); // Return to main menu (Bento Grid)

        // 清除重连记录
        localStorage.removeItem('gomoku_last_room');
    }

    // 联机认输
    async surrenderOnline() {
        if (!window.Network || !Network.currentRoom) return;

        if (confirm('确定要认输吗？')) {
            await Network.surrender();
        }
    }

    // ============ 快速匹配辅助方法 ============
    // 注意：startQuickMatch 主方法已在第 213 行定义，使用新的 RobustMatchmakingUI

    // 取消快速匹配
    async cancelQuickMatch() {
        if (window.Network) {
            await Network.cancelMatchmaking();
        }
        if (window.RobustMatchmakingUI) {
            RobustMatchmakingUI.cancelMatch();
        }
        this.hideMatchmakingModal();
        this.ui.showOnlineLobby();
    }

    // 显示匹配中弹窗 (兼容旧代码)
    showMatchmakingModal() {
        document.getElementById('matchmaking-modal')?.classList.remove('hidden');
        const timer = document.getElementById('matchmaking-timer');
        if (timer) timer.textContent = '00:00';
    }

    // 隐藏匹配中弹窗 (兼容旧代码)
    hideMatchmakingModal() {
        document.getElementById('matchmaking-modal')?.classList.add('hidden');
        this.stopMatchmakingTimer();
    }

    // 开始匹配计时器
    startMatchmakingTimer() {
        this.matchmakingStartTime = Date.now();
        this.matchmakingTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.matchmakingStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            const timerEl = document.getElementById('matchmaking-timer');
            if (timerEl) {
                timerEl.textContent = `${minutes}:${seconds}`;
            }
        }, 1000);
    }

    // 停止匹配计时器
    stopMatchmakingTimer() {
        if (this.matchmakingTimer) {
            clearInterval(this.matchmakingTimer);
            this.matchmakingTimer = null;
        }
    }

    // 设置联机游戏监听器
    setupOnlineGameListeners() {
        if (!window.Network) return;

        // 重置游戏开始标志
        this._gameStarting = false;

        // 监听玩家变化
        Network.onPlayersUpdate = (players) => {
            // 只有在非游戏进行中才更新等待大厅 UI
            if (!this._gameStarting && (!window.MultiplayerUI || MultiplayerUI.phase !== 'playing')) {
                this.ui.updateRoomPlayers(players);
            }

            // 检查是否双方都准备好了
            const playerList = Object.values(players);
            console.log('Players update:', playerList.length, 'players', playerList);

            if (playerList.length === 2) {
                // 记录曾经有两个玩家（用于检测对手离开）
                this._hadTwoPlayers = true;

                const allReady = playerList.every(p => p.ready);
                console.log('All ready:', allReady, 'isHost:', Network.isHost);

                if (allReady && Network.isHost && !this._gameStarting) {
                    // 房主自动开始游戏（无倒计时）
                    this._gameStarting = true;
                    this.audio.playStart?.();
                    Network.startGame();
                } else if (!allReady) {
                    this.ui.showRoomMessage('等待双方准备...');
                    this._guestCountdownShown = false;
                }
            } else if (playerList.length === 1) {
                // 只剩一个玩家
                // 检查是否是游戏进行中对手离开
                if (this._hadTwoPlayers && this.state.gameMode === 'online') {
                    console.log('[Game] Opponent left during game!');
                    this._hadTwoPlayers = false; // Reset first
                    this._gameStarting = false;
                    this._guestCountdownShown = false;

                    // 隐藏倒计时（如果正在显示）
                    this.ui.hideCountdown?.();

                    // 显示对手离开提示
                    const opponentName = Network.opponentName || '对手';
                    this.ui.showToast(`对手 ${opponentName} 已离开房间`, 'warning');

                    // 仅当游戏仍在进行中时才强制退出
                    // 如果在结算界面，允许玩家自行离开
                    if (!this.state.gameOver) {
                        setTimeout(() => {
                            if (this.state.gameMode === 'online') {
                                Network.leaveRoom();
                                this.state.gameMode = null;
                                this.state.gameOver = true;
                                this.ui.hideWinner();
                                this.ui.showOnlineLobby();
                            }
                        }, 3000);
                    }
                } else {
                    this.ui.showRoomMessage(Localization.get('room.waiting_opponent'));
                }
            } else {
                this.ui.showRoomMessage(Localization.get('room.waiting_opponent'));
            }
        };

        // 监听对手离开
        Network.onOpponentLeft = (opponentName) => {
            this.ui.showToast(`对手 ${opponentName || ''} 已离开房间`, 'warning');

            // 仅当游戏仍在进行中时才强制退出
            if (!this.state.gameOver) {
                setTimeout(() => {
                    if (this.state.gameMode === 'online') {
                        Network.leaveRoom();
                        this.state.gameMode = null;
                        this.state.gameOver = true;
                        this.ui.hideWinner();
                        this.ui.showOnlineLobby();
                    }
                }, 3000);
            }
        };

        // 监听再来一局请求
        Network.onRematchRequest = (fromName) => {
            console.log('Rematch request from:', fromName);
            this.ui.hideWinner();
            this.ui.showRematchInvitation(fromName);
        };

        // 监听再来一局响应
        Network.onRematchResponse = (accepted) => {
            console.log('Rematch response:', accepted);
            if (accepted) {
                this.ui.showToast('对方接受了再来一局！', 'success');
                // 游戏将通过 onRoomUpdate 自动重新开始
            } else {
                this.ui.showToast('对方拒绝了再来一局', 'warning');
            }
        };

        // 监听房间状态变化
        Network.onRoomUpdate = (roomData) => {
            console.log('[onRoomUpdate] 收到房间状态更新:', roomData.status);

            // 🔥 关键：如果房间已结束，彻底停止监听，不做任何处理
            if (roomData.status === 'finished' || roomData.game?.winner) {
                console.log('[onRoomUpdate] Room finished, ignoring update');
                return;
            }

            if (roomData.status === 'playing') {
                // 如果已经在游戏中且未结束，就不再重新初始化（防止因落子导致的onRoomUpdate重复触发重置棋盘）
                if (this.state.gameMode === 'online' && !this.state.gameOver) {
                    return;
                }

                // 🔥 关键修复：立即设置所有必要状态，与快速匹配保持一致
                console.log('[onRoomUpdate] 房间状态变为 playing，初始化游戏');

                // 1. 立即设置 gameMode（最重要！）
                this.state.gameMode = 'online';

                // 2. 初始化棋盘状态（防止点击时棋盘为空）
                if (!this.state.board || this.state.board.length === 0) {
                    this.state.board = this.createEmptyBoard();
                }
                this.state.currentPlayer = 1; // 黑棋先手
                this.state.gameOver = false;

                console.log('[onRoomUpdate] 游戏状态已初始化, gameMode:', this.state.gameMode, 'myColor:', Network.myColor);

                // 3. 调用完整的游戏启动流程
                this.startOnlineGame();
            }
        };

        // 监听游戏状态变化
        Network.onGameUpdate = (gameData) => {
            if (this.state.gameMode !== 'online') return;

            // 调试：查看收到的currentTurn
            console.log('[onGameUpdate] 收到游戏数据, currentTurn:', gameData.currentTurn);

            // 同步棋盘
            if (gameData.board) {
                // 重要：将Firebase返回的对象格式转换为数组格式
                const newBoard = Network.normalizeBoard(gameData.board);

                // 检测是否有新落子（用于播放音效）
                const oldBoard = this.state.board;
                let hasMoveChange = false;

                if (oldBoard && oldBoard.length > 0 && newBoard && newBoard.length > 0) {
                    for (let y = 0; y < 15; y++) {
                        for (let x = 0; x < 15; x++) {
                            if (oldBoard[y] && newBoard[y] && oldBoard[y][x] !== newBoard[y][x] && newBoard[y][x] !== 0) {
                                hasMoveChange = true;
                                break;
                            }
                        }
                        if (hasMoveChange) break;
                    }
                }

                // Sync history for Last Move marker
                if (gameData.moves) {
                    const movesObj = gameData.moves;
                    const parsedMoves = Object.values(movesObj).sort((a, b) => {
                        return (a.timestamp || 0) - (b.timestamp || 0);
                    });

                    this.state.history = parsedMoves.map(m => ({
                        x: m.x,
                        y: m.y,
                        player: m.color === 'black' ? 1 : 2
                    }));
                }

                this.state.board = newBoard;
                this.drawBoard();

                // If new move detected and it's my turn, meaning opponent just played
                if (hasMoveChange) {
                    const isMyTurn = (Network.myColor === 'black' && gameData.currentTurn === 'black') ||
                        (Network.myColor === 'white' && gameData.currentTurn === 'white');
                    if (isMyTurn) {
                        this.audio.playPlace();
                    }
                }
            }

            // 同步回合
            let currentTurn = gameData.currentTurn;

            // 如果currentTurn未定义，根据棋盘上的棋子数量推断
            if (!currentTurn && gameData.board) {
                console.warn('[onGameUpdate] currentTurn未定义，尝试根据棋盘推断');
                const normalizedBoard = Network.normalizeBoard(gameData.board);
                let blackCount = 0, whiteCount = 0;
                for (let i = 0; i < 15; i++) {
                    for (let j = 0; j < 15; j++) {
                        if (normalizedBoard[i] && normalizedBoard[i][j] === 1) blackCount++;
                        if (normalizedBoard[i] && normalizedBoard[i][j] === 2) whiteCount++;
                    }
                }
                // 黑棋先手，所以如果黑白棋子数相等，轮到黑；如果黑>白，轮到白
                currentTurn = (blackCount <= whiteCount) ? 'black' : 'white';
                console.log('[onGameUpdate] 推断 currentTurn:', currentTurn, '(黑:', blackCount, '白:', whiteCount, ')');
            }

            if (currentTurn) {
                const newPlayer = currentTurn === 'black' ? 1 : 2;

                // 检测回合切换
                if (this.state.currentPlayer !== newPlayer) {
                    console.log('[onGameUpdate] 回合切换:', this.state.currentPlayer, '->', newPlayer);

                    // 增加 3秒 加时 (给刚刚结束回合的玩家)
                    // 如果现在是 2(白)，说明 1(黑) 刚下完
                    if (newPlayer === 2) {
                        this.state.p1Time = (this.state.p1Time || 300) + 3;
                    } else {
                        this.state.p2Time = (this.state.p2Time || 300) + 3;
                    }

                    // 重置单步计时
                    this.state.moveTime = 20;

                    // 更新 UI 一次以防跳动
                    this.ui.updateDualTimer(20, newPlayer === 1 ? this.state.p1Time : this.state.p2Time, currentTurn);
                }

                this.state.currentPlayer = newPlayer;
                const isMyTurn = (Network.myColor === 'black' && this.state.currentPlayer === 1) ||
                    (Network.myColor === 'white' && this.state.currentPlayer === 2);

                // 仅更新文字提示，高亮和光环由 timer loop 驱动
                // this.ui.updateCurrentPlayer(isMyTurn ? '你的回合' : '对手回合', currentTurn); 
                // updateCurrentPlayer 现在只处理 active class 切换，在这里调用也可以
                this.ui.updateCurrentPlayer(isMyTurn ? '你的回合' : '对手回合', currentTurn);

                // 同步MultiplayerUI回合指示
                if (window.MultiplayerUI && MultiplayerUI.phase === 'playing') {
                    MultiplayerUI.gameState.currentTurn = currentTurn;
                    MultiplayerUI.updateTurnIndicator();
                }
            }

            // 检查胜负
            if (gameData.winner && !this.state.gameOver) {
                const iWin = gameData.winner === Network.myColor;
                this.state.gameOver = true;
                this.stopOnlineTimerLoop(); // 停止计时
                this.stats.stopTimer();

                // 更新ELO积分
                // 更新ELO积分 (尝试获取对手分数，默认1000)
                const oppElo = (window.Network && Network.opponentElo) ? Network.opponentElo : 1000;

                if (window.PlayerStats && PlayerStats.updateElo) {
                    const eloResult = PlayerStats.updateElo(iWin ? 'win' : 'lose', oppElo);

                    // 获取最新段位进度用于结算显示
                    const currentElo = PlayerStats.data.competitive.elo;
                    const nextRankInfo = window.EloSystem ? EloSystem.getNextRank(currentElo) : null;

                    // 使用MultiplayerUI显示新结算页面 (只要MultiplayerUI已初始化且在游戏中)
                    if (window.MultiplayerUI && document.body.classList.contains('mp-game')) {
                        const duration = this.stats.getFormattedTime ? this.stats.getFormattedTime() : '0:00';
                        const moveCount = this.state.board ?
                            this.state.board.flat().filter(c => c !== 0).length : 0;

                        MultiplayerUI.showResult(iWin ? 'victory' : 'defeat', {
                            duration: duration,
                            moves: moveCount,
                            oldElo: eloResult.oldElo || (currentElo - eloResult.change),
                            eloChange: eloResult.change
                        });
                    } else {
                        // 降级：使用原来的UI
                        this.ui.showWinner({
                            title: iWin ? '🎉 你赢了!' : '😔 你输了',
                            elo: currentElo,
                            change: eloResult.change,
                            nextRankInfo: nextRankInfo
                        });
                    }
                } else {
                    // 仅当玩家数据完全损坏时才降级
                    if (window.MultiplayerUI && document.body.classList.contains('mp-game')) {
                        MultiplayerUI.showResult(iWin ? 'victory' : 'defeat', {
                            duration: '0:00',
                            moves: 0,
                            oldElo: 1000,
                            eloChange: iWin ? 25 : -15
                        });
                    } else {
                        this.ui.showWinner(iWin ? '🎉 你赢了!' : '😔 你输了');
                    }
                }
                // 记录战绩到主统计
                if (window.PlayerStats) {
                    PlayerStats.recordResult('online', iWin ? 'win' : 'lose');
                }

                // 播放胜负音效
                if (iWin) {
                    this.audio.playWin();
                } else {
                    this.audio.playLose?.();  // 播放失败音效（如果存在）
                }
            }
        };

        // 监听消息
        Network.onMessage = (msg) => {
            if (msg.sender && msg.id) {
                // 判断是己方还是对方
                const isMe = msg.sender === Network.myPlayerId;
                const playerColor = isMe ? Network.myColor : (Network.myColor === 'black' ? 'white' : 'black');
                this.ui.showChatMessage(playerColor, msg.id);

                // 对方消息播放音效并显示气泡
                if (!isMe) {
                    this.audio.playMessage?.();

                    // 显示MultiplayerUI聊天气泡
                    if (window.MultiplayerUI && MultiplayerUI.phase === 'playing') {
                        MultiplayerUI.showChatBubble(msg.text || msg.id, false);
                    }
                }
            }
        };
    }

    // 开始联机游戏
    startOnlineGame() {
        console.log('[startOnlineGame] 开始联机游戏, Network.myColor:', Network.myColor, 'Network.isHost:', Network.isHost);

        // 🔥 关键修复：隐藏 ZenPVE 容器，显示主游戏布局
        const zenPveContainer = document.getElementById('zen-pve-container');
        if (zenPveContainer) {
            zenPveContainer.style.display = 'none';
        }

        // 显示主游戏布局
        const gameLayout = document.querySelector('.game-layout');
        if (gameLayout) {
            gameLayout.classList.remove('hidden');
        }

        // 关闭所有模态框
        this.ui.closeRoomWaiting();
        this.ui.hideMainMenu();

        // 播放匹配成功音效
        this.audio.playMatchSuccess?.();

        // 确保 MultiplayerUI 进入游戏阶段 (处理再来一局的情况)
        // 但如果正在匹配或倒计时动画中，不要打断它 (由 MultiplayerUI 自行管理进入时机)
        if (window.MultiplayerUI) {
            if (MultiplayerUI.phase !== 'matching' && MultiplayerUI.phase !== 'countdown') {
                MultiplayerUI.enterGamePhase();
            }
        }

        // 初始化游戏状态
        this.state.gameMode = 'online';
        this.state.board = this.createEmptyBoard();
        this.state.currentPlayer = 1; // 黑棋先手
        this.state.gameOver = false;
        this.state.history = [];
        this.state.winningLine = [];

        // 初始化计时器状态 (5分钟 + 20秒单步)
        this.state.p1Time = 300; // 5分钟
        this.state.p2Time = 300;
        this.state.moveTime = 20; // 20秒单步
        this.startOnlineTimerLoop();

        // 更新UI
        const isBlack = Network.myColor === 'black';

        // 如果 MultiplayerUI 正在处理 UI，跳过旧的 soul-header
        // 否则会覆盖新 UI 的动画
        if (!window.MultiplayerUI || MultiplayerUI.phase !== 'playing') {
            // 切换到 Soul Duel Header (旧 UI)
            this.ui.toggleOnlineHeader(true);
        }
        this.ui.showCharacter(false);

        // 获取玩家信息并更新 Header
        const myName = Network.myName || '我';
        const opponentName = Network.opponentName || '对手';
        const myAvatar = Network.myAvatar || '🎮';
        const opponentAvatar = Network.opponentAvatar || '❓';

        const myElo = window.PlayerStats ? PlayerStats.data.competitive.elo : 1000;
        const opponentElo = Network.opponentElo || 1000;

        // 调用新的 updatePlayerInfo
        // 注意参数顺序：p1 (Black), p2 (White)
        if (isBlack) {
            // 我是黑棋(P1)
            this.ui.updatePlayerInfo(myName, opponentName, myAvatar, opponentAvatar, myElo, opponentElo);
        } else {
            // 我是白棋(P2)
            this.ui.updatePlayerInfo(opponentName, myName, opponentAvatar, myAvatar, opponentElo, myElo);
        }

        // 初始化 Turn Display
        this.ui.updateCurrentPlayer(isBlack ? '你的回合' : '对手回合', 'black');

        // 更新按钮显隐
        this.ui.updateControls('online', Network.isHost);

        // 启动统计计时器
        this.stats.startTimer();
        this.ui.showTimer(true);

        // 重要：调整棋盘尺寸（确保canvas在UI显示后有正确尺寸）
        // 使用 requestAnimationFrame 确保DOM已更新
        requestAnimationFrame(() => {
            this.resizeBoard();
            // 绘制棋盘
            this.drawBoard();
        });

        // 提示开局（解释无须猜拳）
        this.ui.showToast(Network.isHost ? '你是房主，由你执黑先手' : '你是挑战者，执白后手');

        console.log('Online game started, I am', Network.myColor);
    }

    // 创建空棋盘
    createEmptyBoard() {
        const board = [];
        for (let i = 0; i < 15; i++) {
            board.push(new Array(15).fill(0));
        }
        return board;
    }

    // ==========================================
    // 联机计时器核心逻辑 (Dual Timer Core)
    // ==========================================

    startOnlineTimerLoop() {
        this.stopOnlineTimerLoop(); // 防止重复启动

        console.log('Starting Online Timer Loop...');
        this.onlineTimerInterval = setInterval(() => {
            if (this.state.gameOver) {
                this.stopOnlineTimerLoop();
                return;
            }

            // 1. 扣除时间
            this.state.moveTime -= 1;

            if (this.state.currentPlayer === 1) {
                this.state.p1Time = Math.max(0, this.state.p1Time - 1);
            } else {
                this.state.p2Time = Math.max(0, this.state.p2Time - 1);
            }

            // 2. 获取当前数据
            const color = this.state.currentPlayer === 1 ? 'black' : 'white';
            const currentTime = this.state.currentPlayer === 1 ? this.state.p1Time : this.state.p2Time;

            // 3. 更新 UI (确保每秒刷新)
            if (this.ui && this.ui.updateDualTimer) {
                this.ui.updateDualTimer(this.state.moveTime, currentTime, color);
            }

            // 同步MultiplayerUI时间显示
            if (window.MultiplayerUI && MultiplayerUI.phase === 'playing') {
                const myTime = Network.myColor === 'black' ? this.state.p1Time : this.state.p2Time;
                const oppTime = Network.myColor === 'black' ? this.state.p2Time : this.state.p1Time;
                MultiplayerUI.updateTime(myTime, oppTime);
            }

            // 4. 超时检查

            // 情况A: 单步超时 (20s) -> 随机落子 (仅限己方回合触发)
            if (this.state.moveTime <= 0) {
                const isMyTurn = (Network.myColor === 'black' && this.state.currentPlayer === 1) ||
                    (Network.myColor === 'white' && this.state.currentPlayer === 2);

                if (isMyTurn && !this.state.gameOver) {
                    console.warn('Move timeout! Surrendering...');
                    Network.surrender();
                }
            }

            // 情况B: 总局时耗尽 (5min) -> 判负 (Surrender)
            if (currentTime <= 0) {
                const isMyTurn = (Network.myColor === 'black' && this.state.currentPlayer === 1) ||
                    (Network.myColor === 'white' && this.state.currentPlayer === 2);

                if (isMyTurn && !this.state.gameOver) {
                    console.warn('Total time exhausted! Surrendering...');
                    Network.surrender();
                }
            }

        }, 1000);
    }

    stopOnlineTimerLoop() {
        if (this.onlineTimerInterval) {
            clearInterval(this.onlineTimerInterval);
            this.onlineTimerInterval = null;
        }
    }

    // 超时惩罚：随机落子
    makeRandomMove() {
        const emptySpots = [];
        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 15; x++) {
                if (this.state.board[y][x] === 0) {
                    emptySpots.push({ x, y });
                }
            }
        }

        if (emptySpots.length > 0) {
            const randomSpot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
            Network.makeMove(randomSpot.x, randomSpot.y);
        }
    }
}

// GomokuGame 类定义结束
// 游戏实例在文件末尾通过 DOMContentLoaded 事件创建

// ========== 捐赠弹窗功能 ==========

// 显示捐赠提示弹窗
function showDonateModal() {
    const modal = document.getElementById('donate-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// 关闭捐赠提示弹窗
function closeDonateModal() {
    const modal = document.getElementById('donate-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// 选择咖啡选项
function selectCoffee(element) {
    // 取消所有选中状态
    document.querySelectorAll('.coffee-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    // 选中当前
    element.classList.add('selected');
    // 清空自定义输入
    const customInput = document.getElementById('custom-coffee-amount');
    if (customInput) {
        customInput.value = '';
    }
}

// 自定义金额输入时取消选项选中
document.addEventListener('DOMContentLoaded', () => {
    const customInput = document.getElementById('custom-coffee-amount');
    if (customInput) {
        customInput.addEventListener('focus', () => {
            document.querySelectorAll('.coffee-option').forEach(opt => {
                opt.classList.remove('selected');
            });
        });
    }
});

// 显示微信二维码弹窗
function showWechatModal() {
    // 关闭捐赠提示弹窗
    closeDonateModal();

    // 显示微信弹窗
    const wechatModal = document.getElementById('wechat-modal');
    if (wechatModal) {
        wechatModal.classList.remove('hidden');
    }
}

// 确认捐赠并解锁所有关卡
function confirmDonateAndUnlock() {
    // 关闭微信弹窗
    const wechatModal = document.getElementById('wechat-modal');
    if (wechatModal) {
        wechatModal.classList.add('hidden');
    }

    // 解锁所有关卡
    if (window.debugUnlockAll) {
        debugUnlockAll();
    }

    // 显示成功提示
    alert('🎉 感谢您的支持！所有关卡已解锁！');
}

// 关闭微信弹窗
function closeWechatModal() {
    const wechatModal = document.getElementById('wechat-modal');
    if (wechatModal) {
        wechatModal.classList.add('hidden');
    }
}

// 导出到全局
window.showDonateModal = showDonateModal;
window.closeDonateModal = closeDonateModal;
window.showWechatModal = showWechatModal;
window.closeWechatModal = closeWechatModal;
window.confirmDonateAndUnlock = confirmDonateAndUnlock;
window.selectCoffee = selectCoffee;

// ========== AI难度选择 ==========

// 存储选择的难度
window.selectedAIDifficulty = 2; // 默认普通难度

// 选择难度
function selectAIDifficulty(level) {
    window.selectedAIDifficulty = level;
    // 更新UI
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (parseInt(btn.dataset.level) === level) {
            btn.classList.add('selected');
        }
    });
}

// 显示难度选择弹窗
function showDifficultyModal() {
    const modal = document.getElementById('ai-difficulty-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// 关闭难度选择弹窗
function closeDifficultyModal() {
    const modal = document.getElementById('ai-difficulty-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// 开始游戏（带难度设置）
function startGameWithDifficulty() {
    closeDifficultyModal();
    if (window.game) {
        // 设置AI难度
        window.game.ai.setLevel(window.selectedAIDifficulty);

        // 保存禁手模式到localStorage
        localStorage.setItem('zen_pve_forbidden_mode', window.selectedForbiddenMode);

        // 继续原有的PVE流程
        window.game.selectMode('pve', true); // true表示跳过难度选择
    }
}

// ========== 禁手规则选择 ==========

// 存储选择的禁手模式
window.selectedForbiddenMode = localStorage.getItem('zen_pve_forbidden_mode') || 'none';

// 选择禁手模式
function selectForbiddenMode(mode) {
    window.selectedForbiddenMode = mode;

    // 更新UI
    document.querySelectorAll('.forbidden-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.mode === mode) {
            btn.classList.add('selected');
        }
    });

    // 根据难度自动推荐禁手模式（可选）
    console.log('[Forbidden] Mode selected:', mode);
}

// 显示禁手帮助说明
function showForbiddenHelp() {
    const helpText = `📖 禁手规则快速说明

黑棋（先手）受到三种限制：
• 三三：不能同时形成两个活三
• 四四：不能同时形成两个四
• 长连：连成6个或更多算禁手

🔓 关闭：普通五子棋，无禁手限制
🎓 教学：会提示禁手位置，但不判负
⚠️ 严格：下到禁手点直接判负（连珠规则）`;

    alert(helpText);
}

// 初始化难度选择弹窗的禁手模式
function initDifficultyModal() {
    // 读取保存的禁手模式
    const savedMode = window.selectedForbiddenMode;
    if (savedMode) {
        selectForbiddenMode(savedMode);
    }

    // 根据难度建议禁手模式
    const difficultyBtn = document.querySelector('.difficulty-btn.selected');
    if (difficultyBtn) {
        const level = parseInt(difficultyBtn.dataset.level);
        // 简单难度默认关闭，普通默认教学，困难默认严格
        if (!localStorage.getItem('zen_pve_forbidden_mode')) {
            if (level === 1) selectForbiddenMode('none');
            else if (level === 2) selectForbiddenMode('teaching');
            else if (level === 3) selectForbiddenMode('strict');
        }
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，等待DOM完全加载
    setTimeout(initDifficultyModal, 100);
});


// 导出
window.selectAIDifficulty = selectAIDifficulty;
window.showDifficultyModal = showDifficultyModal;
window.closeDifficultyModal = closeDifficultyModal;
window.startGameWithDifficulty = startGameWithDifficulty;
window.selectForbiddenMode = selectForbiddenMode;
window.showForbiddenHelp = showForbiddenHelp;

// ========== 留言板功能 ==========

// 游戏版本号
const GAME_VERSION = '2.1 Beta';

// HTML转义防止XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 相对时间显示
function getRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return Localization.get('time.just_now');
    if (minutes < 60) return Localization.get('time.minutes_ago').replace('{COUNT}', minutes);
    if (hours < 24) return Localization.get('time.hours_ago').replace('{COUNT}', hours);
    if (days < 7) return Localization.get('time.days_ago').replace('{COUNT}', days);

    // Beyond 7 days show specific date
    const locale = Localization.currentLang === 'en' ? 'en-US' : 'zh-CN';
    return new Date(timestamp).toLocaleDateString(locale);
}

function showFeedbackModal() {
    const modal = document.getElementById('feedback-modal');
    if (modal) {
        modal.classList.remove('hidden');
        loadFeedbackHistory();
        bindFeedbackCounter();
    }
}

function closeFeedbackModal() {
    const modal = document.getElementById('feedback-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function bindFeedbackCounter() {
    const textarea = document.getElementById('feedback-text');
    const counter = document.getElementById('feedback-count');
    if (textarea && counter) {
        // 初始化计数
        counter.textContent = textarea.value.length;
        // 实时更新
        textarea.addEventListener('input', () => {
            counter.textContent = textarea.value.length;
        });
    }
}

async function submitFeedback() {
    const textarea = document.getElementById('feedback-text');
    const submitBtn = document.getElementById('feedback-submit-btn');
    const text = textarea?.value.trim();

    if (!text) {
        alert('请输入您的建议内容');
        return;
    }

    if (text.length < 5) {
        alert('内容太短啦，请至少输入5个字符');
        return;
    }

    // 防止重复提交
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ 提交中...';

    const playerName = window.Onboarding?.getPlayerName() || '匿名玩家';
    const timestamp = Date.now();
    const contact = document.getElementById('feedback-contact')?.value.trim() || '';
    const feedbackType = document.getElementById('feedback-type')?.value || 'suggestion';

    // 保存到Firebase
    try {
        const db = firebase.database();
        await db.ref('feedback').push({
            playerName,
            content: text,
            contact: contact,
            type: feedbackType,
            gameVersion: GAME_VERSION,
            timestamp,
            date: new Date().toLocaleString()
        });

        // 清空输入框
        textarea.value = '';
        document.getElementById('feedback-count').textContent = '0';

        // 显示成功提示
        alert('✨ 感谢您的宝贵建议！我们会认真考虑每一条反馈。');

        // 刷新历史
        loadFeedbackHistory();
    } catch (error) {
        console.error('提交反馈失败:', error);
        alert('提交失败，请稍后再试');
    } finally {
        // 恢复按钮状态
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.textContent = originalText;
    }
}

async function loadFeedbackHistory() {
    const historyDiv = document.getElementById('feedback-history');
    if (!historyDiv) return;

    try {
        const db = firebase.database();
        const snapshot = await db.ref('feedback').orderByChild('timestamp').limitToLast(5).once('value');
        const feedbacks = [];

        snapshot.forEach(child => {
            feedbacks.unshift(child.val());
        });

        if (feedbacks.length === 0) {
            historyDiv.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 15px;">暂无留言</p>';
            return;
        }

        // 类型图标映射
        const typeIcons = {
            suggestion: '💡',
            bug: '🐛',
            question: '❓'
        };

        historyDiv.innerHTML = '<h4 style="color: #00d4ff; margin-bottom: 10px;">📝 最近留言</h4>' +
            feedbacks.map(f => `
                <div class="feedback-item">
                    <div class="feedback-item-time">
                        ${typeIcons[f.type] || '💬'} ${escapeHtml(f.playerName)} · ${getRelativeTime(f.timestamp)}
                    </div>
                    <div>${escapeHtml(f.content)}</div>
                </div>
            `).join('');
    } catch (error) {
        console.error('加载反馈历史失败:', error);
    }
}

// 导出留言板函数
window.showFeedbackModal = showFeedbackModal;
window.closeFeedbackModal = closeFeedbackModal;
window.submitFeedback = submitFeedback;


// ============ 观战系统方法 ============

GomokuGame.prototype.openSpectateLobby = async function () {
    console.log('[Game] Opening spectate lobby');

    // 确保网络模块已初始化
    if (!window.Network) {
        alert(Localization.get('toast.mp_module_missing'));
        return;
    }

    if (!Network.db) {
        Network.init();
    }

    // 显示观战大厅
    const modal = document.getElementById('spectate-lobby-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }

    // 加载对局列表
    await this.refreshSpectateGames();
};

GomokuGame.prototype.closeSpectateLobby = function () {
    const modal = document.getElementById('spectate-lobby-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

GomokuGame.prototype.refreshSpectateGames = async function () {
    console.log('[Game] Refreshing spectate games');

    if (!window.Network) return;

    const gameListEl = document.getElementById('game-list');
    const countEl = document.getElementById('active-games-count');

    if (!gameListEl) {
        console.error('[Game] game-list element not found!');
        return;
    }

    // Display loading state
    gameListEl.innerHTML = `<div class="empty-games">${Localization.get('spectate.loading')}</div>`;

    try {
        const games = await Network.getActiveGames();
        console.log('[Game] Loaded games:', games);

        // Update game count
        if (countEl) {
            countEl.textContent = Localization.get('spectate.active_count').replace('{COUNT}', games.length);
        }

        if (games.length === 0) {
            gameListEl.innerHTML = `<div class="empty-games">${Localization.get('spectate.empty')}</div>`;
            return;
        }

        // 渲染对局列表
        console.log('[Game] Rendering game cards...');
        const cardsHtml = games.map(game => this.renderGameCard(game)).join('');
        console.log('[Game] Cards HTML length:', cardsHtml.length);
        gameListEl.innerHTML = cardsHtml;

        // 绑定点击事件
        const cards = document.querySelectorAll('.game-card');
        console.log('[Game] Found card elements:', cards.length);
        cards.forEach((card, index) => {
            card.addEventListener('click', () => this.joinSpectator(games[index].roomCode));
        });

    } catch (error) {
        console.error('[Game] Error loading games:', error);
        gameListEl.innerHTML = '<div class="empty-games">加载失败,请稍后重试</div>';
    }
};

GomokuGame.prototype.renderGameCard = function (game) {
    const { roomCode, player1, player2, moveCount, spectatorCount, currentTurn } = game;

    return `
        <div class="game-card" data-room="${roomCode}">
            <div class="game-card-header">
                <div class="game-room-code">房间 ${roomCode}</div>
                <div class="game-spectator-badge">
                    <span>👁️</span>
                    <span>${spectatorCount}</span>
                </div>
            </div>
            <div class="game-players">
                <div class="game-player">
                    <div class="game-player-avatar">${player1.avatar || '⚫'}</div>
                    <div class="game-player-name">${player1.name || '玩家1'}</div>
                    <div class="game-player-elo">${player1.elo || 1000}</div>
                </div>
                <div class="game-vs">VS</div>
                <div class="game-player">
                    <div class="game-player-avatar">${player2.avatar || '⚪'}</div>
                    <div class="game-player-name">${player2.name || '玩家2'}</div>
                    <div class="game-player-elo">${player2.elo || 1000}</div>
                </div>
            </div>
            <div class="game-info-row">
                <div class="game-info-item">
                    <div class="game-info-label">回合数</div>
                    <div class="game-info-value">${moveCount}</div>
                </div>
                <div class="game-info-item">
                    <div class="game-info-label">当前</div>
                    <div class="game-info-value">
                        ${currentTurn === 'black' ? '⚫' : '⚪'}
                        <span class="game-turn-indicator"></span>
                    </div>
                </div>
        </div>
    `;
};

GomokuGame.prototype.joinSpectator = async function (roomCode) {
    console.log('[Game] Joining spectator mode for room:', roomCode);

    if (!window.Network) return;

    // 关闭观战大厅
    this.closeSpectateLobby();

    // 显示加载提示
    this.ui.showToast('正在进入观战...', 'info');

    const result = await Network.joinAsSpectator(roomCode);

    if (result.success) {
        // 设置观战模式
        this.state.isSpectating = true;
        this.state.gameMode = 'spectating';

        // 关闭所有弹窗 - 确保没有遮罩层
        const modeSelect = document.getElementById('mode-select');
        if (modeSelect) {
            modeSelect.classList.add('hidden');
        }
        this.ui.closeOnlineLobby();
        this.ui.hideModeSelect();

        // 设置观战回调
        this.setupSpectatorCallbacks();

        // Initialize board
        this.initSpectatorBoard(result.roomData);

        // Show spectate indicator
        this.showSpectatingIndicator();

        this.ui.showToast(Localization.get('spectate.toast.entered'), 'success');
    } else {
        this.ui.showToast(Localization.get('spectate.toast.failed') + ': ' + result.error, 'error');
        this.ui.showOnlineLobby();
    }
};

GomokuGame.prototype.setupSpectatorCallbacks = function () {
    // Listen for board updates
    Network.onSpectatorUpdate = (roomData) => {
        this.updateSpectatorBoard(roomData);
    };

    // 监听对局结束
    Network.onSpectatorGameEnd = (message) => {
        this.ui.showToast(message, 'info');
    };

    // Listen for messages
    Network.onMessage = (msg) => {
        if (!this.spectatorData) return;

        let color = null;
        if (msg.sender === this.spectatorData.p1Id) color = 'black';
        else if (msg.sender === this.spectatorData.p2Id) color = 'white';

        if (color) {
            this.ui.showChatMessage(color, msg.id);
            // 观战者也能听到消息音效
            if (this.audio) this.audio.playMessage?.();
        }
    };
};

GomokuGame.prototype.initSpectatorBoard = function (roomData) {
    if (!roomData || !roomData.game) return;

    const gameData = roomData.game;

    // CRITICAL: Hide main menu, show game board
    this.ui.hideMainMenu();

    // 同步棋盘状态
    this.state.board = gameData.board || Array(15).fill(null).map(() => Array(15).fill(0));
    this.state.currentPlayer = gameData.currentTurn === 'black' ? 1 : 2;
    this.state.gameOver = roomData.status === 'finished';
    this.state.winningLine = [];

    // 同步时间状态（如果有）
    if (gameData.p1Time !== undefined) {
        this.state.p1Time = gameData.p1Time;
        this.state.p2Time = gameData.p2Time;
        this.state.moveTime = gameData.moveTime || 20;
    }

    // 设置玩家信息
    const players = roomData.players || {};
    const playerList = Object.values(players);

    if (playerList.length >= 2) {
        const p1 = playerList.find(p => p.color === 'black') || playerList[0];
        const p2 = playerList.find(p => p.color === 'white') || playerList[1];

        // 缓存玩家ID用于消息显示
        this.spectatorData = {
            p1Id: Object.keys(players).find(key => players[key] === p1),
            p2Id: Object.keys(players).find(key => players[key] === p2)
        };

        this.ui.updatePlayerInfo(
            p1.name || Localization.get('mp.player'),
            p2.name || Localization.get('mp.player'),
            p1.avatar || '🎮',  // Use actual player avatar
            p2.avatar || '🎮',  // Use actual player avatar
            p1.elo || 1000,
            p2.elo || 1000
        );
    }

    // 显示Soul Header（双方头像和信息）
    this.ui.toggleOnlineHeader(true);

    // 隐藏聊天面板（观战者不能主动发消息）
    const chatPanel = document.getElementById('chat-panel');
    if (chatPanel) {
        chatPanel.classList.add('hidden');
        chatPanel.classList.remove('spectator-mode');
    }

    // 隐藏聊天输入按钮（观战者不能发消息）
    const chatBtn = document.getElementById('chat-btn');
    if (chatBtn) {
        chatBtn.classList.add('hidden');
    }

    // 隐藏观战模式下不适用的按钮
    const restartBtn = document.getElementById('restart-btn');
    const undoBtn = document.getElementById('undo-btn');
    const surrenderBtn = document.getElementById('surrender-btn');
    const switchModeBtn = document.getElementById('switch-mode-btn');

    if (restartBtn) restartBtn.classList.add('hidden');
    if (undoBtn) undoBtn.classList.add('hidden');
    if (surrenderBtn) surrenderBtn.classList.add('hidden');
    if (switchModeBtn) switchModeBtn.classList.add('hidden');

    // 显示计时器
    this.ui.showTimer(true);
    if (this.updateTimerDisplay) {
        this.updateTimerDisplay();
    }

    // 绘制棋盘
    this.drawBoard();
};

GomokuGame.prototype.updateSpectatorBoard = function (roomData) {
    if (!this.state.isSpectating) return;
    if (!roomData || !roomData.game) return;

    const gameData = roomData.game;

    // 检测是否有新落子
    const oldBoard = this.state.board;
    const newBoard = gameData.board;
    let hasNewMove = false;

    if (oldBoard && oldBoard.length > 0) {
        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 15; x++) {
                if (oldBoard[y] && oldBoard[y][x] !== newBoard[y][x] && newBoard[y][x] !== 0) {
                    hasNewMove = true;
                    break;
                }
            }
            if (hasNewMove) break;
        }
    }

    // 更新棋盘
    this.state.board = newBoard;
    this.state.currentPlayer = gameData.currentTurn === 'black' ? 1 : 2;

    // 同步时间状态
    if (gameData.p1Time !== undefined) {
        this.state.p1Time = gameData.p1Time;
        this.state.p2Time = gameData.p2Time;
        this.state.moveTime = gameData.moveTime || 20;

        // 使用针对Online UI的更新方法
        const color = this.state.currentPlayer === 1 ? 'black' : 'white';
        const currentTime = this.state.currentPlayer === 1 ? this.state.p1Time : this.state.p2Time;

        // 同时更新两个玩家的时间显示
        // 更新当前行动方的光环
        if (this.ui && this.ui.updateDualTimer) {
            this.ui.updateDualTimer(this.state.moveTime, currentTime, color);

            // 还需要更新非行动方的总时间文本
            const otherColor = color === 'black' ? 'white' : 'black';
            const otherTime = color === 'black' ? this.state.p2Time : this.state.p1Time;
            const timerEl = document.getElementById(otherColor === 'black' ? 'p1-timer' : 'p2-timer');
            if (timerEl) {
                timerEl.textContent = `${Math.floor(otherTime / 60).toString().padStart(2, '0')}:${(otherTime % 60).toString().padStart(2, '0')}`;
            }
        }

        // 启动观战倒计时循环（如果未启动）
        this.startSpectatorTimerLoop();
    }

    // 更新当前回合显示
    this.ui.updateCurrentPlayer(this.state.currentPlayer);

    // 检查游戏是否结束
    if (gameData.winner) {
        this.state.gameOver = true;
        const winnerText = gameData.winner === 'black' ? Localization.get('game.win.black') : Localization.get('game.win.white');
        this.ui.showToast(winnerText, 'success');
    }

    // 重绘棋盘
    this.drawBoard();

    // 播放落子音效
    if (hasNewMove) {
        this.audio.playPlace();
    }
};

GomokuGame.prototype.startSpectatorTimerLoop = function () {
    this.stopSpectatorTimerLoop(); // 确保之前的循环已停止

    this._spectatorTimerInterval = setInterval(() => {
        if (this.state.gameOver || !this.state.isSpectating) {
            this.stopSpectatorTimerLoop();
            return;
        }

        // 扣除当前玩家的时间
        if (this.state.currentPlayer === 1) {
            this.state.p1Time = Math.max(0, this.state.p1Time - 1);
        } else {
            this.state.p2Time = Math.max(0, this.state.p2Time - 1);
        }
        this.state.moveTime = Math.max(0, this.state.moveTime - 1); // 单步时间也递减

        // 更新UI
        const color = this.state.currentPlayer === 1 ? 'black' : 'white';
        const currentTime = this.state.currentPlayer === 1 ? this.state.p1Time : this.state.p2Time;
        const otherColor = color === 'black' ? 'white' : 'black';
        const otherTime = color === 'black' ? this.state.p2Time : this.state.p1Time;

        if (this.ui && this.ui.updateDualTimer) {
            this.ui.updateDualTimer(this.state.moveTime, currentTime, color);
            const timerEl = document.getElementById(otherColor === 'black' ? 'p1-timer' : 'p2-timer');
            if (timerEl) {
                timerEl.textContent = `${Math.floor(otherTime / 60).toString().padStart(2, '0')}:${(otherTime % 60).toString().padStart(2, '0')}`;
            }
        }
    }, 1000);
};

GomokuGame.prototype.stopSpectatorTimerLoop = function () {
    if (this._spectatorTimerInterval) {
        clearInterval(this._spectatorTimerInterval);
        this._spectatorTimerInterval = null;
    }
};

GomokuGame.prototype.showSpectatingIndicator = function () {
    // 创建观战指示器
    let indicator = document.getElementById('spectating-indicator');

    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'spectating-indicator';
        indicator.className = 'spectating-indicator';
        document.body.appendChild(indicator);
    }

    indicator.innerHTML = `
        <span class="spectating-indicator-icon">👁️</span>
        <span data-i18n="menu.spectate">${Localization.get('menu.spectate')}</span>
        <button class="btn spectate-exit-btn" onclick="game.exitSpectatorMode()" data-i18n="mission.back">${Localization.get('mission.back')}</button>
    `;

    indicator.style.display = 'flex';
};

GomokuGame.prototype.hideSpectatingIndicator = function () {
    const indicator = document.getElementById('spectating-indicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
};

GomokuGame.prototype.exitSpectatorMode = async function () {
    console.log('[Game] Exiting spectator mode');

    if (!this.state.isSpectating) return;

    // 退出前清理
    if (this._spectatorTimerInterval) {
        clearInterval(this._spectatorTimerInterval);
        this._spectatorTimerInterval = null;
    }

    // 停止并清理相关监听器
    if (window.Network) {
        Network.leaveSpectator();
    }

    // 重置状态
    this.state.isSpectating = false;
    this.state.gameMode = null;
    this.state.board = [];

    // 隐藏指示器
    this.hideSpectatingIndicator();

    // 隐藏Online Header
    this.ui.toggleOnlineHeader(false);

    // 隐藏聊天面板
    const chatPanel = document.getElementById('chat-panel');
    if (chatPanel) {
        chatPanel.classList.add('hidden');
        chatPanel.classList.remove('spectator-mode');
    }

    // 隐藏计时器
    this.ui.showTimer(false);

    // 恢复按钮显示
    const restartBtn = document.getElementById('restart-btn');
    const undoBtn = document.getElementById('undo-btn');
    const surrenderBtn = document.getElementById('surrender-btn');
    const switchModeBtn = document.getElementById('switch-mode-btn');

    if (restartBtn) restartBtn.classList.remove('hidden');
    if (undoBtn) undoBtn.classList.remove('hidden');
    if (surrenderBtn) surrenderBtn.classList.remove('hidden');
    if (switchModeBtn) switchModeBtn.classList.remove('hidden');

    // 清空棋盘
    this.drawBoard();

    // 返回联机大厅
    this.ui.showOnlineLobby();
};

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Main] DOM loaded, initializing game...');

    // Initialize Network if it exists
    if (window.Network && Network.init) {
        Network.init();
    }

    // Create Game Instance
    window.game = new GomokuGame();
});
