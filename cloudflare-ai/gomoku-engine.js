/**
 * gomoku-engine.js - 五子棋AI引擎 (Cloudflare Workers版本)
 * 移植自 js/ai.js 的 GomokuAI 类
 */

// ========== 核心评估函数 ==========

/**
 * 计算最佳落子
 * @param {Array} board - 15x15棋盘数组
 * @param {number} currentPlayer - 当前玩家 (1=黑, 2=白)
 * @param {number} difficulty - 难度 (1=简单, 2=普通, 3=困难)
 * @param {number} errorRate - 失误率 (0-1)
 * @returns {{x: number, y: number, score: number}}
 */
export function getBestMove(board, currentPlayer, difficulty = 2, errorRate = 0.1) {
    const gridSize = 15;
    const allMoves = [];

    // 收集所有可行落点及其分数
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j] === 0) {
                const score = evaluatePosition(board, i, j, currentPlayer);
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

    // 模拟人类失误
    if (Math.random() < errorRate && bestScore < 10000) {
        // 偶尔选次优解（但不在必胜/必防局面）
        const range = Math.min(5, allMoves.length);
        selectedMove = allMoves[Math.floor(Math.random() * range)];
    } else if (difficulty === 1) {
        // 简单模式：40%概率选择次优解
        if (bestScore >= 10000) {
            selectedMove = allMoves[0];
        } else if (Math.random() < 0.4 && allMoves.length > 1) {
            const range = Math.min(5, allMoves.length);
            selectedMove = allMoves[Math.floor(Math.random() * range)];
        } else {
            selectedMove = allMoves[0];
        }
    } else if (difficulty === 3) {
        // 困难模式：总是选最优解
        selectedMove = allMoves[0];
    } else {
        // 普通模式：从并列最高分中随机选
        const bestMoves = allMoves.filter(m => m.score === bestScore);
        selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    return {
        x: selectedMove.x,
        y: selectedMove.y,
        score: selectedMove.score
    };
}

/**
 * 评估某个位置的分数
 */
function evaluatePosition(board, x, y, currentPlayer) {
    const opponent = currentPlayer === 1 ? 2 : 1;
    const center = Math.floor(15 / 2);

    // 进攻分数 * 1.1 + 防守分数 + 位置分数
    return evaluateForPlayer(board, x, y, currentPlayer) * 1.1 +
        evaluateForPlayer(board, x, y, opponent) +
        (15 - Math.abs(x - center) - Math.abs(y - center)) * 0.1;
}

/**
 * 评估某玩家在该位置的得分
 */
function evaluateForPlayer(board, x, y, player) {
    let score = 0;
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

    for (const [dx, dy] of directions) {
        const { count, openEnds } = countLine(board, x, y, dx, dy, player);
        score += getPatternScore(count, openEnds);
    }

    return score;
}

/**
 * 根据棋型返回分数
 */
function getPatternScore(count, openEnds) {
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

/**
 * 统计某方向的连子数和开放端
 */
function countLine(board, x, y, dx, dy, player) {
    let count = 1;
    let openEnds = 0;

    // 正方向
    for (let i = 1; i < 5; i++) {
        const nx = x + dx * i;
        const ny = y + dy * i;
        if (!isValidPos(nx, ny)) break;
        if (board[nx][ny] === player) count++;
        else if (board[nx][ny] === 0) { openEnds++; break; }
        else break;
    }

    // 反方向
    for (let i = 1; i < 5; i++) {
        const nx = x - dx * i;
        const ny = y - dy * i;
        if (!isValidPos(nx, ny)) break;
        if (board[nx][ny] === player) count++;
        else if (board[nx][ny] === 0) { openEnds++; break; }
        else break;
    }

    return { count, openEnds };
}

function isValidPos(x, y) {
    return x >= 0 && x < 15 && y >= 0 && y < 15;
}

// ========== 人类行为模拟 ==========

/**
 * 计算思考时间（毫秒）
 * @param {number} complexity - 局面复杂度 (0-1)
 * @param {Array} thinkTimeRange - 思考时间范围 [min, max]
 * @returns {number} 延迟毫秒数
 */
export function calculateThinkTime(complexity, thinkTimeRange) {
    const [minTime, maxTime] = thinkTimeRange;
    const baseDelay = minTime + (maxTime - minTime) * complexity;

    // ±20%随机抖动
    return Math.floor(baseDelay * (0.8 + Math.random() * 0.4));
}

/**
 * 评估棋局复杂度
 * @param {Array} board - 棋盘
 * @returns {number} 0-1的复杂度值
 */
export function getBoardComplexity(board) {
    let emptyCount = 0;
    let pieceCount = 0;

    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            if (board[i][j] === 0) {
                emptyCount++;
            } else {
                pieceCount++;
            }
        }
    }

    // 开局复杂度低，中盘高，残局中等
    if (pieceCount < 10) return 0.3; // 开局
    if (pieceCount < 50) return 0.7; // 中盘
    return 0.5; // 残局
}

/**
 * 检查是否获胜
 * @param {Array} board - 棋盘
 * @param {number} x - 最后落子x
 * @param {number} y - 最后落子y
 * @returns {Array|null} 获胜棋子坐标数组，或null
 */
export function checkWin(board, x, y) {
    const player = board[x][y];
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

    for (const [dx, dy] of directions) {
        const line = [{ x, y }];

        // 正方向
        for (let i = 1; i < 5; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            if (isValidPos(nx, ny) && board[nx][ny] === player) {
                line.push({ x: nx, y: ny });
            } else break;
        }

        // 反方向
        for (let i = 1; i < 5; i++) {
            const nx = x - dx * i;
            const ny = y - dy * i;
            if (isValidPos(nx, ny) && board[nx][ny] === player) {
                line.unshift({ x: nx, y: ny });
            } else break;
        }

        if (line.length >= 5) return line;
    }

    return null;
}

// ========== 工具函数 ==========

/**
 * 创建空棋盘
 */
export function createEmptyBoard() {
    return Array(15).fill(null).map(() => Array(15).fill(0));
}

/**
 * 规范化Firebase返回的棋盘数据
 */
export function normalizeBoard(boardData) {
    if (Array.isArray(boardData)) {
        return boardData;
    }

    // Firebase对象格式转数组
    const board = [];
    for (let i = 0; i < 15; i++) {
        if (boardData[i] !== undefined) {
            if (Array.isArray(boardData[i])) {
                board.push([...boardData[i]]);
            } else if (typeof boardData[i] === 'object') {
                const row = [];
                for (let j = 0; j < 15; j++) {
                    row.push(boardData[i][j] !== undefined ? boardData[i][j] : 0);
                }
                board.push(row);
            } else {
                board.push(new Array(15).fill(0));
            }
        } else {
            board.push(new Array(15).fill(0));
        }
    }
    return board;
}
