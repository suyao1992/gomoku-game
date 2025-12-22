// ========== 玩家入场与加载模块 ==========

const Onboarding = {
    STORAGE_KEY: 'gomoku_player_name',
    playerName: '玩家',

    // 需要预加载的资源
    resources: {
        images: [
            'assets/images/bg.webp',
            'assets/images/char_idle.webp',
            'assets/images/char_calc.webp',
            'assets/images/char_attack.webp',
            'assets/images/char_win.webp',
            'assets/images/char_lose.webp'
        ],
        audio: [
            // 'assets/audio/bgm.mp3', // Removed as per user request to silence default music
            'assets/audio/place.mp3',
            'assets/audio/win.mp3'
        ]
    },

    loadingTips: [
        '正在建立量子连接...',
        '同步时空坐标...',
        '初始化神经网络...',
        '加载对弈核心...',
        '量子态就绪'
    ],

    init() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.nameModal = document.getElementById('name-input-modal');
        this.nameInput = document.getElementById('player-name-input');
        this.startBtn = document.getElementById('start-game-btn');
        this.progressBar = document.getElementById('loading-progress');
        this.loadingTip = document.getElementById('loading-tip');
        this.modeSelect = document.getElementById('mode-select');

        this.bindEvents();
        this.startLoading();
    },

    bindEvents() {
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.handleStartGame());
        }
        if (this.nameInput) {
            this.nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleStartGame();
            });

            // 实时验证
            this.nameInput.addEventListener('input', (e) => {
                const value = e.target.value;
                if (window.NameGenerator) {
                    const result = NameGenerator.validate(value);
                    if (!result.valid && value.length > 0) {
                        this.showNameHint(result.error);
                    } else {
                        this.hideNameHint();
                    }
                }
            });

            // 粘贴时过滤
            this.nameInput.addEventListener('paste', (e) => {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text');
                const filtered = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_]/g, '').slice(0, 8);
                document.execCommand('insertText', false, filtered);
            });
        }

        // 随机中文名按钮
        const randomCnBtn = document.getElementById('random-name-cn');
        if (randomCnBtn) {
            randomCnBtn.addEventListener('click', () => {
                if (window.NameGenerator && this.nameInput) {
                    this.nameInput.value = NameGenerator.generate('cn');
                    this.hideNameHint();
                }
            });
        }

        // 随机英文名按钮
        const randomEnBtn = document.getElementById('random-name-en');
        if (randomEnBtn) {
            randomEnBtn.addEventListener('click', () => {
                if (window.NameGenerator && this.nameInput) {
                    this.nameInput.value = NameGenerator.generate('en');
                    this.hideNameHint();
                }
            });
        }
    },

    // 显示姓名提示
    showNameHint(msg) {
        const hint = document.querySelector('.name-hint');
        if (hint) {
            hint.textContent = '⚠️ ' + msg;
            hint.style.color = '#ff6b6b';
        }
    },

    // 隐藏姓名提示
    hideNameHint() {
        const hint = document.querySelector('.name-hint');
        if (hint) {
            hint.textContent = '名字将显示在游戏中';
            hint.style.color = '';
        }
    },

    async startLoading() {
        // 显示加载屏幕
        if (this.loadingScreen) {
            this.loadingScreen.classList.remove('hidden');
        }

        // 隐藏模式选择
        if (this.modeSelect) {
            this.modeSelect.classList.add('hidden');
        }

        try {
            await this.preloadResources();
        } catch (e) {
            console.warn('Some resources failed to load:', e);
        }

        // 加载完成后检查是否需要输入姓名
        setTimeout(() => {
            this.hideLoading();
            this.checkPlayerName();
        }, 500);
    },

    async preloadResources() {
        const allResources = [...this.resources.images, ...this.resources.audio];
        const total = allResources.length;
        let loaded = 0;

        const updateProgress = () => {
            loaded++;
            const percent = Math.round((loaded / total) * 100);
            if (this.progressBar) {
                this.progressBar.style.width = percent + '%';
            }
            // 更新提示文字
            const tipIndex = Math.min(
                Math.floor((loaded / total) * this.loadingTips.length),
                this.loadingTips.length - 1
            );
            if (this.loadingTip) {
                this.loadingTip.textContent = this.loadingTips[tipIndex];
            }
        };

        const loadImage = (src) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => { updateProgress(); resolve(); };
                img.onerror = () => { updateProgress(); resolve(); };
                img.src = src;
            });
        };

        const loadAudio = (src) => {
            return new Promise((resolve) => {
                const audio = new Audio();
                audio.oncanplaythrough = () => { updateProgress(); resolve(); };
                audio.onerror = () => { updateProgress(); resolve(); };
                audio.src = src;
            });
        };

        const imagePromises = this.resources.images.map(loadImage);
        const audioPromises = this.resources.audio.map(loadAudio);

        // Add timeout to prevent hanging forever
        const timeoutPromise = new Promise(resolve => {
            setTimeout(() => {
                console.warn('Resource loading timed out');
                resolve();
            }, 3000);
        });

        await Promise.race([
            Promise.all([...imagePromises, ...audioPromises]),
            timeoutPromise
        ]);
    },

    hideLoading() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                this.loadingScreen.classList.add('hidden');
                this.loadingScreen.classList.remove('fade-out');
            }, 500);
        }
    },

    checkPlayerName() {
        console.log('[Onboarding] checkPlayerName');
        try {
            const savedName = localStorage.getItem(this.STORAGE_KEY);

            if (savedName) {
                console.log('[Onboarding] Found saved name:', savedName);
                this.playerName = savedName;

                // NEW: Ensure PlayerStats is in sync
                try {
                    if (window.PlayerStats && PlayerStats.data) {
                        if (PlayerStats.data.playerName !== savedName) {
                            PlayerStats.data.playerName = savedName;
                            PlayerStats.save();
                        }
                    }
                } catch (e) {
                    console.error('[Onboarding] PlayerStats sync error:', e);
                }

                // 确保旧用户也有ID
                if (!localStorage.getItem('gomoku_user_id')) {
                    const userId = Math.floor(100000 + Math.random() * 900000).toString();
                    localStorage.setItem('gomoku_user_id', userId);
                }

                this.showModeSelect();
            } else {
                console.log('[Onboarding] No saved name, showing input');
                this.showNameInput();
            }
        } catch (error) {
            console.error('[Onboarding] Critical error in checkPlayerName:', error);
            // Fallback to name input to avoid blank screen
            this.showNameInput();
        }
    },

    showNameInput() {
        console.log('[Onboarding] showNameInput');
        try {
            if (this.nameModal) {
                // Force visibility styles
                this.nameModal.classList.remove('hidden');
                this.nameModal.style.display = 'flex';
                this.nameModal.style.opacity = '1';
                this.nameModal.style.zIndex = '10001'; // Ensure it's on top

                if (this.nameInput) {
                    // Safe logic for name generation
                    try {
                        // 默认生成一个随机中文名
                        if (window.NameGenerator && !this.nameInput.value) {
                            this.nameInput.value = NameGenerator.generate('cn');
                            console.log('[Onboarding] Generated default name:', this.nameInput.value);
                        }
                    } catch (genError) {
                        console.warn('[Onboarding] Name generation failed:', genError);
                        // Fallback default name
                        this.nameInput.value = '玩家' + Math.floor(Math.random() * 1000);
                    }
                    this.nameInput.focus();
                }

                // 初始化头像选择器
                try {
                    if (window.AvatarSystem) {
                        AvatarSystem.init();
                    }
                } catch (avatarError) {
                    console.warn('[Onboarding] AvatarSystem init failed:', avatarError);
                }
            } else {
                console.error('[Onboarding] nameModal not found');
            }
        } catch (e) {
            console.error('[Onboarding] Error showing name input:', e);
        }
    },

    handleStartGame() {
        // 直接获取名字并开始游戏，无需验证码
        const name = this.nameInput?.value.trim() || '玩家';
        this.playerName = name;
        localStorage.setItem(this.STORAGE_KEY, name);

        // 同步到 PlayerStats
        if (window.PlayerStats && PlayerStats.data) {
            PlayerStats.data.playerName = name;
            PlayerStats.save();
        }

        // 生成并保存唯一数字ID (如果不存在)
        let userId = localStorage.getItem('gomoku_user_id');
        if (!userId) {
            userId = Math.floor(100000 + Math.random() * 900000).toString();
            localStorage.setItem('gomoku_user_id', userId);
        }

        // 隐藏姓名输入
        if (this.nameModal) {
            this.nameModal.classList.add('hidden');
        }

        this.showModeSelect();
    },

    showModeSelect() {
        console.log('[Onboarding] showModeSelect');
        // Updated to use new Bento Grid Main Menu
        const mainMenuView = document.getElementById('main-menu-view');
        if (mainMenuView) {
            mainMenuView.classList.remove('hidden');
            // Only set visibility properties, preserve layout CSS
            mainMenuView.style.display = 'flex';
            mainMenuView.style.opacity = '1';
            mainMenuView.style.visibility = 'visible';
            console.log('[Onboarding] Main menu forced visible');
        } else {
            console.error('[Onboarding] main-menu-view not found!');
        }

        // Hide legacy if present
        if (this.modeSelect) {
            this.modeSelect.classList.add('hidden');
        }

        // 更新玩家标签
        this.updatePlayerLabel();
        // 检查是否需要显示版本公告
        if (window.checkVersionAnnouncement) {
            window.checkVersionAnnouncement();
        }
    },

    updatePlayerLabel() {
        const nameDisplay = document.getElementById('menu-user-name');
        const blackLabel = document.getElementById('black-label');

        const userId = localStorage.getItem('gomoku_user_id') || '???';

        if (nameDisplay) {
            nameDisplay.textContent = this.playerName;
        }

        if (blackLabel) {
            blackLabel.textContent = `⚫ ${this.playerName} (ID: ${userId})`;
        }
    },

    getPlayerName() {
        return this.playerName;
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    Onboarding.init();
});

// 导出供其他模块使用
window.Onboarding = Onboarding;

// ========== 版本公告系统 ==========
const VERSION_KEY = 'gomoku_version_seen';
const CURRENT_VERSION = 'v2.2'; // Updated to v2.2

function showVersionModal() {
    const modal = document.getElementById('version-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeVersionModal() {
    const modal = document.getElementById('version-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    // 自动标记为已读
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
}

function checkVersionAnnouncement() {
    const seenVersion = localStorage.getItem(VERSION_KEY);
    // 如果没有看过当前版本的公告，显示它
    if (seenVersion !== CURRENT_VERSION) {
        setTimeout(() => {
            showVersionModal();
        }, 800); // 略微延时，等待 PWA 检查完成
    }
}

// 在主菜单显示后检查版本公告
window.checkVersionAnnouncement = checkVersionAnnouncement;
window.showVersionModal = showVersionModal;
window.closeVersionModal = closeVersionModal;

// 自动初始化版本检查
document.addEventListener('DOMContentLoaded', () => {
    // 延迟 2.5s 执行，以防与首屏加载动画冲突
    setTimeout(checkVersionAnnouncement, 2500);
});
