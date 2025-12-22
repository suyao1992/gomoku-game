// Board Utility Functions - Unified coordinate system and boundary checking
class BoardUtils {
    /**
     * Check if coordinates are within board bounds
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} gridSize - Board size, default 15
     * @returns {boolean} Whether position is safe
     */
    static isSafePosition(x, y, gridSize = 15) {
        return x >= 0 && x < gridSize && y >= 0 && y < gridSize;
    }

    /**
     * Safely get board value at position
     * @param {Array} board - Board array
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} defaultValue - Default value if out of bounds
     * @returns {number} Value at position or default
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
     * Safely set board value at position
     * @param {Array} board - Board array
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} value - Value to set
     * @returns {boolean} Whether operation was successful
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
     * Create empty board
     * @param {number} gridSize - Board size
     * @returns {Array} Initialized board
     */
    static createEmptyBoard(gridSize = 15) {
        return Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    }

    /**
     * Validate board data integrity
     * @param {Array} board - Board array
     * @param {number} expectedSize - Expected board size
     * @returns {boolean} Whether board is valid
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

// Export to global scope
window.BoardUtils = BoardUtils;
