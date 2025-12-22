// AI逻辑模块
class GomokuAI {
    constructor(gridSize = 15) {
        this.gridSize = gridSize;
        this.level = 2; // 默认普通难度 (1=简单, 2=普通, 3=困难)
    }

    calculateBestMove(board, currentPlayer) {
        const result = this.calculateBestMoveWithScore(board, currentPlayer);
        return result ? result.move : null;
    }

    // 返回最佳移动和评分
    calculateBestMoveWithScore(board, currentPlayer) {
        // 收集所有可行落点及其分数
        let allMoves = [];

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (board[i][j] === 0) {
                    const score = this.evaluatePosition(board, i, j, currentPlayer);
                    allMoves.push({ x: i, y: j, score });
                }
            }
        }

        if (allMoves.length === 0) return null;

        // 按分数排序（高到低）
        allMoves.sort((a, b) => b.score - a.score);

        // 根据难度选择落点
        let selectedMove;
        const bestScore = allMoves[0].score;

        if (this.level === 1) {
            // 简单模式：40%概率选择次优解（前5名中随机）
            // 但如果最优解是活四/五连，必须走
            if (bestScore >= 10000) {
                selectedMove = allMoves[0];
            } else if (Math.random() < 0.4 && allMoves.length > 1) {
                // 从前5名或所有可选中选较小范围
                const range = Math.min(5, allMoves.length);
                selectedMove = allMoves[Math.floor(Math.random() * range)];
            } else {
                selectedMove = allMoves[0];
            }
        } else if (this.level === 3) {
            // 困难模式：总是选最优解
            selectedMove = allMoves[0];
        } else {
            // 普通模式：从并列最高分中随机选
            const bestMoves = allMoves.filter(m => m.score === bestScore);
            selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        }

        return { move: { x: selectedMove.x, y: selectedMove.y }, score: selectedMove.score };
    }

    evaluatePosition(board, x, y, currentPlayer) {
        const opponent = currentPlayer === 1 ? 2 : 1;
        const center = Math.floor(this.gridSize / 2);

        // 进攻分数 * 1.1 + 防守分数 + 位置分数
        return this.evaluateForPlayer(board, x, y, currentPlayer) * 1.1 +
            this.evaluateForPlayer(board, x, y, opponent) +
            (this.gridSize - Math.abs(x - center) - Math.abs(y - center)) * 0.1;
    }

    evaluateForPlayer(board, x, y, player) {
        let score = 0;
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

        for (const [dx, dy] of directions) {
            const { count, openEnds } = this.countLine(board, x, y, dx, dy, player);
            score += this.getPatternScore(count, openEnds);
        }

        return score;
    }

    getPatternScore(count, openEnds) {
        // 评分表
        if (count >= 5) return 100000;           // 五连
        if (count === 4 && openEnds === 2) return 10000;  // 活四
        if (count === 4 && openEnds === 1) return 1000;   // 冲四
        if (count === 3 && openEnds === 2) return 1000;   // 活三
        if (count === 3 && openEnds === 1) return 100;    // 眠三
        if (count === 2 && openEnds === 2) return 100;    // 活二
        if (count === 2 && openEnds === 1) return 10;     // 眠二
        if (count === 1 && openEnds === 2) return 10;     // 活一
        return 0;
    }

    countLine(board, x, y, dx, dy, player) {
        let count = 1;
        let openEnds = 0;

        // 正方向
        for (let i = 1; i < 5; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            if (!this.isValidPos(nx, ny)) break;
            if (board[nx][ny] === player) count++;
            else if (board[nx][ny] === 0) { openEnds++; break; }
            else break;
        }

        // 反方向
        for (let i = 1; i < 5; i++) {
            const nx = x - dx * i;
            const ny = y - dy * i;
            if (!this.isValidPos(nx, ny)) break;
            if (board[nx][ny] === player) count++;
            else if (board[nx][ny] === 0) { openEnds++; break; }
            else break;
        }

        return { count, openEnds };
    }

    isValidPos(x, y) {
        return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
    }

    // 评估单个点的分数（用于数据视图技能）
    evaluatePoint(board, x, y, player) {
        return this.evaluatePosition(board, x, y, player);
    }

    // 设置AI难度级别
    setLevel(level) {
        // 可以根据级别调整评估权重等
        this.level = level;
    }

    // ========== 局势评估系统（用于智能台词匹配）==========

    /**
     * 全面评估当前局势
     * @param {Array} board - 棋盘状态
     * @param {number} aiPlayer - AI是哪方（1=黑，2=白）
     * @param {Object} lastMove - 最后一手棋 {x, y, player}
     * @returns {Object} 局势评估结果
     */
    evaluateSituation(board, aiPlayer, lastMove = null) {
        const humanPlayer = aiPlayer === 1 ? 2 : 1;

        // 1. 计算双方所有可落子点的最高分
        let aiMaxScore = 0;
        let humanMaxScore = 0;
        let aiTopMoves = [];    // AI视角的好点
        let humanTopMoves = []; // 玩家视角的好点
        let highValuePoints = 0; // 高价值点数量（判断复杂度）

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (board[i][j] === 0) {
                    const aiScore = this.evaluatePosition(board, i, j, aiPlayer);
                    const humanScore = this.evaluatePosition(board, i, j, humanPlayer);

                    // 统计高价值点
                    if (aiScore > 1000 || humanScore > 1000) {
                        highValuePoints++;
                    }

                    // 记录AI最高分
                    if (aiScore > aiMaxScore) {
                        aiMaxScore = aiScore;
                        aiTopMoves = [{ x: i, y: j, score: aiScore }];
                    } else if (aiScore === aiMaxScore) {
                        aiTopMoves.push({ x: i, y: j, score: aiScore });
                    }

                    // 记录玩家最高分
                    if (humanScore > humanMaxScore) {
                        humanMaxScore = humanScore;
                        humanTopMoves = [{ x: i, y: j, score: humanScore }];
                    } else if (humanScore === humanMaxScore) {
                        humanTopMoves.push({ x: i, y: j, score: humanScore });
                    }
                }
            }
        }

        // 2. 计算优势值（正=AI优势，负=玩家优势）
        const advantage = aiMaxScore - humanMaxScore;

        // 3. 判断玩家最后一手的质量
        let playerMoveQuality = 'normal';
        let playerMoveRank = -1;

        if (lastMove && lastMove.player === humanPlayer) {
            // 检查玩家这手是否在AI预测的前3好点里
            const allMoves = [];
            for (let i = 0; i < this.gridSize; i++) {
                for (let j = 0; j < this.gridSize; j++) {
                    if (board[i][j] === 0 || (i === lastMove.x && j === lastMove.y)) {
                        // 模拟这个位置落子前的评分
                        const tempBoard = board.map(row => [...row]);
                        if (i === lastMove.x && j === lastMove.y) {
                            tempBoard[i][j] = 0; // 还原
                        }
                        const score = this.evaluatePosition(tempBoard, lastMove.x, lastMove.y, humanPlayer);
                        allMoves.push({ x: i, y: j, score });
                    }
                }
            }
            allMoves.sort((a, b) => b.score - a.score);

            // 找到玩家落子在排名中的位置
            for (let i = 0; i < allMoves.length; i++) {
                if (allMoves[i].x === lastMove.x && allMoves[i].y === lastMove.y) {
                    playerMoveRank = i + 1;
                    break;
                }
            }

            if (playerMoveRank <= 3) {
                playerMoveQuality = 'good';
            } else if (playerMoveRank > 10) {
                playerMoveQuality = 'bad';
            }
        }

        // 4. 检测危险状态（是否有活四/冲四威胁）
        let hasThreat = false;
        let threatLevel = 0;

        if (aiMaxScore >= 10000) {
            hasThreat = true;
            threatLevel = aiMaxScore >= 100000 ? 3 : 2; // 3=已经五连，2=活四
        } else if (humanMaxScore >= 10000) {
            hasThreat = true;
            threatLevel = humanMaxScore >= 100000 ? 3 : 2;
        } else if (aiMaxScore >= 1000 || humanMaxScore >= 1000) {
            threatLevel = 1; // 活三/冲四级别
        }

        // 5. 判断局势类型
        let situationType;
        if (advantage > 10000) {
            situationType = 'ai_winning';      // AI必胜
        } else if (advantage > 3000) {
            situationType = 'ai_advantage';    // AI大优
        } else if (advantage > 500) {
            situationType = 'ai_slight';       // AI小优
        } else if (advantage > -500) {
            situationType = 'even';            // 势均力敌
        } else if (advantage > -3000) {
            situationType = 'human_slight';    // 玩家小优
        } else if (advantage > -10000) {
            situationType = 'human_advantage'; // 玩家大优
        } else {
            situationType = 'human_winning';   // 玩家必胜
        }

        return {
            advantage,              // 优势值
            aiMaxScore,             // AI最高分
            humanMaxScore,          // 玩家最高分
            situationType,          // 局势类型
            playerMoveQuality,      // 玩家落子质量 good/normal/bad
            playerMoveRank,         // 玩家落子排名
            complexity: highValuePoints, // 局面复杂度
            hasThreat,              // 是否有威胁
            threatLevel             // 威胁等级 0-3
        };
    }

    // 检查是否获胜
    checkWin(board, x, y) {
        const player = board[x][y];
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

        for (const [dx, dy] of directions) {
            const line = [{ x, y }];

            // 正方向
            for (let i = 1; i < 5; i++) {
                const nx = x + dx * i;
                const ny = y + dy * i;
                if (this.isValidPos(nx, ny) && board[nx][ny] === player) {
                    line.push({ x: nx, y: ny });
                } else break;
            }

            // 反方向
            for (let i = 1; i < 5; i++) {
                const nx = x - dx * i;
                const ny = y - dy * i;
                if (this.isValidPos(nx, ny) && board[nx][ny] === player) {
                    line.unshift({ x: nx, y: ny });
                } else break;
            }

            if (line.length >= 5) return line;
        }

        return null;
    }
}

window.GomokuAI = GomokuAI;
