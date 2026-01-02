/**
 * ZenPVE Controller
 * Handles the immersive Zen PVE mode UI and game flow
 */
window.ZenPVE = (function () {
    let selectedColor = 'black'; // 'black' or 'white'
    let isActive = false;
    let zenBoardRoot = null;

    // DOM Elements
    const getContainer = () => document.getElementById('zen-pve-container');
    const getDialogue = () => document.getElementById('zen-ai-dialogue');
    const getAiImg = () => document.getElementById('zen-ai-img');
    const getBoardRoot = () => document.getElementById('zen-pve-board-root');

    /**
     * Initialize the Zen PVE mode (lazy - called on first show)
     */
    function init() {
        // Initialize the React board root if not already done
        if (!zenBoardRoot && window.ReactDOM && getBoardRoot()) {
            zenBoardRoot = ReactDOM.createRoot(getBoardRoot());
            console.log('[ZenPVE] React board root initialized');
        }
        return !!zenBoardRoot;
    }

    /**
     * Wait for React Board component to be available
     */
    function waitForBoard(callback, maxWait = 5000) {
        const startTime = Date.now();
        const check = () => {
            if (window.Board && window.ReactDOM) {
                callback();
            } else if (Date.now() - startTime < maxWait) {
                setTimeout(check, 100);
            } else {
                console.error('[ZenPVE] Board component not available after', maxWait, 'ms');
            }
        };
        check();
    }

    /**
     * Show the Zen PVE container and start the game
     */
    function show() {
        const container = getContainer();
        if (!container) return;

        // Hide other UI elements
        if (window.UI) {
            UI.hideMainMenu();
        }

        // Hide the old game layout
        const gameLayout = document.querySelector('.game-layout');
        if (gameLayout) gameLayout.classList.add('hidden');

        // Show Zen PVE container
        container.classList.add('active');
        isActive = true;

        // Wait for Board component and then start the game
        waitForBoard(() => {
            init(); // Lazy init the React root
            startGame();

            // Initialize forbidden toggle UI
            updateForbiddenToggleUI(window.selectedForbiddenMode || 'none');

            console.log('[ZenPVE] Mode activated');
        });
    }

    /**
     * Hide the Zen PVE container
     */
    function hide() {
        const container = getContainer();
        if (!container) return;

        container.classList.remove('active');
        isActive = false;

        console.log('[ZenPVE] Mode deactivated');
    }

    /**
     * Select player color
     */
    function selectColor(color) {
        if (color !== 'black' && color !== 'white') return;

        selectedColor = color;

        // Update UI
        document.querySelectorAll('.zen-player-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.color === color);
        });

        // Restart the game with new color
        if (isActive && window.game) {
            startGame();
        }
    }

    /**
     * Start/restart the game with current settings
     */
    function startGame() {
        if (!window.game) return;

        // Respect user's selected color (managed by selectColor() function)
        // Default is 'black' if not explicitly set

        // Update selector UI to show current color
        document.querySelectorAll('.zen-player-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.color === selectedColor);
        });

        // Set first player based on selection
        // Black = 1, White = 2
        const firstPlayer = (selectedColor === 'black') ? 1 : 2;

        // Reset and configure game state
        game.state.board = Array(15).fill(null).map(() => Array(15).fill(0));
        game.state.history = [];
        game.state.currentPlayer = 1; // Black always starts
        game.state.firstPlayer = firstPlayer;
        game.state.gameOver = false;
        game.state.winningLine = [];
        game.state.gameMode = 'pve';

        // Configure for Zen mode (no popups)
        game.useZenMode = true;
        game.zenPVEMode = true; // Flag for special handling

        // Start timer
        if (game.stats) {
            game.stats.startTimer();
        }

        // Initial render
        renderBoard();

        // Show localized dialogue based on assigned color
        const startDialogue = window.getRandomDialogue ? getRandomDialogue('start') : null;
        const getLocalizedText = (key, fallback) => window.Localization ? Localization.t(key) : fallback;

        if (selectedColor === 'white') {
            showDialogue(startDialogue || getLocalizedText('zen.dialog.white_start', 'You are White. I\'ll start!'), 2000);
            setTimeout(() => {
                if (window.game && !game.state.gameOver) {
                    game.aiMove();
                }
            }, 800);
        } else {
            showDialogue(startDialogue || getLocalizedText('zen.dialog.black_start', 'You are Black. Your move!'), 2000);
        }

        console.log('[ZenPVE] Game started, player is', selectedColor);
    }

    /**
     * Render the board using React
     */
    function renderBoard() {
        console.log('[ZenPVE] renderBoard called, zenBoardRoot:', !!zenBoardRoot, 'window.Board:', !!window.Board);

        if (!zenBoardRoot || !window.game) {
            console.warn('[ZenPVE] renderBoard early exit - zenBoardRoot:', !!zenBoardRoot, 'game:', !!window.game);
            return;
        }

        const state = game.state;
        const ghostPlayer = state.firstPlayer; // Human's color

        // Format data for React Board component
        let lastMove = null;
        if (state.history && state.history.length > 0) {
            const last = state.history[state.history.length - 1];
            lastMove = { row: last.x, col: last.y };
        }

        let formattedWinningLine = null;
        let winner = null;
        if (state.winningLine && state.winningLine.length > 0) {
            formattedWinningLine = state.winningLine.map(pt => ({ row: pt.x, col: pt.y }));
            if (state.history.length > 0) {
                winner = state.history[state.history.length - 1].player;
            }
        }

        // Render using global Board component
        if (window.Board) {
            console.log('[ZenPVE] Rendering Board with state:', { boardSize: state.board?.length, currentPlayer: state.currentPlayer });
            zenBoardRoot.render(
                React.createElement(window.Board, {
                    board: state.board,
                    onCellClick: handleCellClick,
                    lastMove: lastMove,
                    currentPlayer: state.currentPlayer,
                    ghostPlayer: ghostPlayer,
                    winner: winner,
                    winningLine: formattedWinningLine
                })
            );
        }
    }

    /**
     * Handle cell click from board
     */
    function handleCellClick(pos) {
        if (!window.game || game.state.gameOver) return;

        // Check if it's human's turn
        const isHumanTurn = game.state.currentPlayer === game.state.firstPlayer;
        if (!isHumanTurn) {
            showDialogue("Wait for me...", 1000);
            return;
        }

        // Check if cell is empty
        if (game.state.board[pos.row][pos.col] !== 0) return;

        // Place the piece (this will trigger AI move too)
        placePiece(pos.row, pos.col);
    }

    /**
     * Place a piece and handle game flow (no victory popup)
     */
    function placePiece(x, y) {
        if (!window.game) return;

        const state = game.state;
        const isAI = state.currentPlayer !== state.firstPlayer;

        // Place the piece
        state.board[x][y] = state.currentPlayer;
        state.history.push({ x, y, player: state.currentPlayer });

        // Play sound
        if (window.ZenBoard) {
            ZenBoard.playStoneSound(state.currentPlayer);
        }

        // Check for win
        const winResult = game.ai.checkWin(state.board, x, y);
        if (winResult) {
            state.gameOver = true;
            state.winningLine = winResult;

            // Stop timer
            if (game.stats) game.stats.stopTimer();

            // Show result via dialogue (not popup!)
            const playerWon = !isAI;
            const getLocalizedText = (key, fallback) => window.Localization ? Localization.t(key) : fallback;
            if (playerWon) {
                const loseDialogue = window.getRandomDialogue ? getRandomDialogue('lose') : getLocalizedText('zen.dialog.player_win', 'Well played! You win.');
                showDialogue(loseDialogue, 5000);
                setAIState('LOSE');
            } else {
                const winDialogue = window.getRandomDialogue ? getRandomDialogue('win') : getLocalizedText('zen.dialog.ai_win', 'I win this time!');
                showDialogue(winDialogue, 5000);
                setAIState('WIN');
            }

            renderBoard();
            return;
        }

        // Check for draw
        if (state.history.length === 15 * 15) {
            state.gameOver = true;
            const getLocalizedText = (key, fallback) => window.Localization ? Localization.t(key) : fallback;
            const drawDialogue = window.getRandomDialogue ? getRandomDialogue('evenMatch') : getLocalizedText('zen.dialog.draw', 'A draw. Impressive.');
            showDialogue(drawDialogue, 5000);
            renderBoard();
            return;
        }

        // Switch player
        state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
        renderBoard();

        // AI's turn
        if (state.currentPlayer !== state.firstPlayer && !state.gameOver) {
            // Show thinking
            const getLocalizedText = (key, fallback) => window.Localization ? Localization.t(key) : fallback;
            const thinkDialogue = window.getRandomDialogue ? getRandomDialogue('calc') : getLocalizedText('zen.dialog.thinking', 'Hmm...');
            showDialogue(thinkDialogue, 0);
            setAIState('CALC');

            setTimeout(() => {
                if (!game.state.gameOver) {
                    const result = game.ai.calculateBestMoveWithScore(state.board, state.currentPlayer);
                    if (result && result.move) {
                        setAIState('IDLE');
                        placePiece(result.move.x, result.move.y);
                    }
                }
            }, 600);
        }
    }

    /**
     * Undo the last move(s)
     */
    function undo() {
        if (!window.game) return;

        const state = game.state;

        // Can't undo if no moves or game over
        if (state.history.length === 0) {
            showDialogue("Nothing to undo.", 1500);
            return;
        }

        // Reset game over state if active
        if (state.gameOver) {
            state.gameOver = false;
            state.winningLine = [];
        }

        // Undo last 2 moves (player's move + AI's response)
        // Unless player just made the first move
        const movesToUndo = (state.history.length >= 2 && state.currentPlayer === state.firstPlayer) ? 2 : 1;

        for (let i = 0; i < movesToUndo && state.history.length > 0; i++) {
            const lastMove = state.history.pop();
            state.board[lastMove.x][lastMove.y] = 0;
        }

        // Set current player based on history
        if (state.history.length > 0) {
            const lastPlayer = state.history[state.history.length - 1].player;
            state.currentPlayer = lastPlayer === 1 ? 2 : 1;
        } else {
            state.currentPlayer = 1; // Black starts
        }

        setAIState('IDLE');
        showDialogue("Let's try again.", 1500);
        renderBoard();
    }

    /**
     * Restart the current game
     */
    function restart() {
        startGame();
        showDialogue("New game!", 1500);
    }

    /**
     * Go back to main menu
     */
    function backToMenu() {
        hide();

        // Stop timer
        if (window.game && game.stats) {
            game.stats.stopTimer();
        }

        // Show main menu
        if (window.UI) {
            UI.showMainMenu();
        }
    }

    /**
     * Show dialogue from AI character
     */
    function showDialogue(text, duration = 2000) {
        const dialogue = getDialogue();
        if (!dialogue) return;

        dialogue.textContent = text;
        dialogue.classList.add('visible');

        if (duration > 0) {
            setTimeout(() => {
                dialogue.classList.remove('visible');
            }, duration);
        }
    }

    /**
     * Set AI character state (image)
     */
    function setAIState(state) {
        const img = getAiImg();
        if (!img) return;

        const stateMap = {
            'IDLE': 'char_idle.webp',
            'CALC': 'char_calc.webp',
            'WIN': 'char_win.webp',
            'LOSE': 'char_lose.webp'
        };

        const filename = stateMap[state] || stateMap['IDLE'];
        img.src = `assets/images/${filename}`;
    }

    /**
     * Check if Zen PVE mode is currently active
     */
    function isZenPVEActive() {
        return isActive;
    }

    /**
     * Toggle forbidden mode (cycle through: none -> teaching -> strict -> none)
     */
    function toggleForbiddenMode() {
        const modes = ['none', 'teaching', 'strict'];
        const currentIndex = modes.indexOf(window.selectedForbiddenMode || 'none');
        const nextIndex = (currentIndex + 1) % modes.length;
        const nextMode = modes[nextIndex];

        window.selectedForbiddenMode = nextMode;
        localStorage.setItem('zen_pve_forbidden_mode', nextMode);

        // Update UI
        updateForbiddenToggleUI(nextMode);

        // Show toast
        const modeNames = {
            'none': '关闭',
            'teaching': '教学',
            'strict': '严格'
        };
        const modeDescs = {
            'none': '普通五子棋',
            'teaching': '提示但不判负',
            'strict': '禁手即判负'
        };

        showDialogue(`⚖️ 禁手规则: ${modeNames[nextMode]} (${modeDescs[nextMode]})`, 2000);

        console.log('[ZenPVE] Forbidden mode changed to:', nextMode);
    }

    /**
     * Update forbidden toggle UI
     */
    function updateForbiddenToggleUI(mode) {
        const iconEl = document.getElementById('zen-forbidden-icon');
        const textEl = document.getElementById('zen-forbidden-text');

        if (!iconEl || !textEl) return;

        const config = {
            'none': { icon: '🔓', text: '禁手: 关' },
            'teaching': { icon: '🎓', text: '禁手: 教学' },
            'strict': { icon: '⚠️', text: '禁手: 严格' }
        };

        const current = config[mode] || config['none'];
        iconEl.textContent = current.icon;
        textEl.textContent = current.text;
    }

    // Public API
    return {
        init,
        show,
        hide,
        selectColor,
        startGame,
        renderBoard,
        undo,
        restart,
        backToMenu,
        showDialogue,
        setAIState,
        isActive: isZenPVEActive,
        toggleForbiddenMode
    };
})();

// Initialization is now lazy - called in show() when Board is available
console.log('[ZenPVE] Controller loaded');
