// 棋盘工具函数 - 统一坐标系统和边界检查
class BoardUtils {
    /**
     * 检查坐标是否在棋盘范围内
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} gridSize - 棋盘大小，默认15
     * @returns {boolean} 是否安全
     */
    static isSafePosition(x, y, gridSize = 15) {
        return x >= 0 && x < gridSize && y >= 0 && y < gridSize;
    }

    /**
     * 安全地获取棋盘位置的值
     * @param {Array} board - 棋盘数组
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} defaultValue - 越界时的默认值
     * @returns {number} 该位置的值或默认值
     */
    static safeGet(board, x, y, defaultValue = 0) {
        if (!board || !Array.isArray(board)) {
            console.warn('[BoardUtils] Invalid board');
            return defaultValue;
        }
        if (!this.isSafePosition(x, y, board.length)) {
            return defaultValue;
        }
        if (!board[x] || !Array.isArray(board[x])) {
            console.warn('[BoardUtils] Row not initialized:', x);
            return defaultValue;
        }
        return board[x][y] !== undefined ? board[x][y] : defaultValue;
    }

    /**
     * 安全地设置棋盘位置的值
     * @param {Array} board - 棋盘数组
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} value - 要设置的值
     * @returns {boolean} 是否成功设置
     */
    static safeSet(board, x, y, value) {
        if (!board || !Array.isArray(board)) {
            console.error('[BoardUtils] Invalid board');
            return false;
        }
        if (!this.isSafePosition(x, y, board.length)) {
            console.warn('[BoardUtils] Position out of bounds:', x, y);
            return false;
        }
        if (!board[x] || !Array.isArray(board[x])) {
            console.error('[BoardUtils] Row not initialized:', x);
            return false;
        }
        board[x][y] = value;
        return true;
    }

    /**
     * 创建空棋盘
     * @param {number} gridSize - 棋盘大小
     * @returns {Array} 初始化的棋盘
     */
    static createEmptyBoard(gridSize = 15) {
        return Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    }

    /**
     * 验证棋盘数据完整性
     * @param {Array} board - 棋盘数组
     * @param {number} expectedSize - 期望的棋盘大小
     * @returns {boolean} 是否有效
     */
    static validateBoard(board, expectedSize = 15) {
        if (!board || !Array.isArray(board)) {
            return false;
        }
        if (board.length !== expectedSize) {
            return false;
        }
        for (let i = 0; i < expectedSize; i++) {
            if (!board[i] || !Array.isArray(board[i]) || board[i].length !== expectedSize) {
                return false;
            }
        }
        return true;
    }
}

// 导出到全局
window.BoardUtils = BoardUtils;
