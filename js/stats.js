// 比赛统计模块
class GameStats {
    constructor() {
        this.stats = this.loadStats();
        this.timer = null;
        this.elapsedSeconds = 0;
        this.timerDisplay = null;
    }

    // 从本地存储加载统计数据
    loadStats() {
        const saved = localStorage.getItem('gomoku-stats');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            pvp: { player1Wins: 0, player2Wins: 0, draws: 0 },
            pve: { playerWins: 0, aiWins: 0, draws: 0 },
            eve: { ai1Wins: 0, ai2Wins: 0, draws: 0 }
        };
    }

    // 保存统计数据到本地存储
    saveStats() {
        localStorage.setItem('gomoku-stats', JSON.stringify(this.stats));
    }

    // 重置所有统计
    resetStats() {
        this.stats = {
            pvp: { player1Wins: 0, player2Wins: 0, draws: 0 },
            pve: { playerWins: 0, aiWins: 0, draws: 0 },
            eve: { ai1Wins: 0, ai2Wins: 0, draws: 0 }
        };
        this.saveStats();
    }

    // 记录比赛结果
    recordResult(gameMode, winner, firstPlayer) {
        if (gameMode === 'pvp') {
            if (winner === 0) {
                this.stats.pvp.draws++;
            } else if (winner === firstPlayer) {
                this.stats.pvp.player1Wins++;
            } else {
                this.stats.pvp.player2Wins++;
            }
        } else if (gameMode === 'pve') {
            if (winner === 0) {
                this.stats.pve.draws++;
            } else {
                const isPlayerWin = winner === (firstPlayer === 1 ? 1 : 2);
                if (isPlayerWin) {
                    this.stats.pve.playerWins++;
                } else {
                    this.stats.pve.aiWins++;
                }
            }
        } else if (gameMode === 'eve') {
            if (winner === 0) {
                this.stats.eve.draws++;
            } else if (winner === 1) {
                this.stats.eve.ai1Wins++;
            } else {
                this.stats.eve.ai2Wins++;
            }
        }
        this.saveStats();
    }

    // 获取当前模式的统计文本
    getStatsText(gameMode) {
        if (gameMode === 'pvp') {
            const s = this.stats.pvp;
            return `玩家1: ${s.player1Wins}胜 | 玩家2: ${s.player2Wins}胜 | 平局: ${s.draws}`;
        } else if (gameMode === 'pve') {
            const s = this.stats.pve;
            return `玩家: ${s.playerWins}胜 | 弈·零: ${s.aiWins}胜 | 平局: ${s.draws}`;
        } else if (gameMode === 'eve') {
            const s = this.stats.eve;
            return `AI-1: ${s.ai1Wins}胜 | AI-2: ${s.ai2Wins}胜 | 平局: ${s.draws}`;
        }
        return '';
    }

    // 设置计时器显示元素
    setTimerDisplay(element) {
        this.timerDisplay = element;
    }

    // 开始计时
    startTimer() {
        this.stopTimer();
        this.elapsedSeconds = 0;
        this.updateTimerDisplay();
        this.timer = setInterval(() => {
            this.elapsedSeconds++;
            this.updateTimerDisplay();
        }, 1000);
    }

    // 停止计时
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    // 更新计时器显示
    updateTimerDisplay() {
        if (this.timerDisplay) {
            const minutes = Math.floor(this.elapsedSeconds / 60);
            const seconds = this.elapsedSeconds % 60;
            this.timerDisplay.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // 获取格式化的比赛时长
    getFormattedTime() {
        const minutes = Math.floor(this.elapsedSeconds / 60);
        const seconds = this.elapsedSeconds % 60;
        return `${minutes}分${seconds}秒`;
    }
}

window.GameStats = GameStats;
