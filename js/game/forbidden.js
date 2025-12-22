// ========== Forbidden Move Detection Module ==========
// Extracted from game.js, handles Gomoku forbidden move detection logic

class ForbiddenChecker {
    constructor(gridSize = 15) {
        this.gridSize = gridSize;
    }

    // Check if the move is forbidden, returns detailed info
    checkForbiddenMove(board, x, y) {
        // Temporarily place stone for detection
        board[x][y] = 1;  // Black stone

        let result = { isForbidden: false, type: null };

        if (this.checkLongConnection(board, x, y)) {
            result = { isForbidden: true, type: 'overline' };
        } else if (this.checkDoubleFour(board, x, y)) {
            result = { isForbidden: true, type: 'doubleFour' };
        } else if (this.checkDoubleThree(board, x, y)) {
            result = { isForbidden: true, type: 'doubleThree' };
        }

        // Remove temporary stone
        board[x][y] = 0;

        return result;
    }

    // Compatibility with old interface
    isForbiddenMove(board, x, y) {
        return this.checkForbiddenMove(board, x, y).isForbidden;
    }

    // Check for Overline (more than 5 stones)
    checkLongConnection(board, x, y) {
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

        for (const [dx, dy] of directions) {
            let count = 1;

            // Positive direction
            for (let i = 1; i < 10; i++) {
                const nx = x + dx * i;
                const ny = y + dy * i;
                if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize) break;
                if (board[nx][ny] !== 1) break;
                count++;
            }

            // Negative direction
            for (let i = 1; i < 10; i++) {
                const nx = x - dx * i;
                const ny = y - dy * i;
                if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize) break;
                if (board[nx][ny] !== 1) break;
                count++;
            }

            if (count > 5) return true;
        }

        return false;
    }

    // Check for Double-Four (4-4)
    checkDoubleFour(board, x, y) {
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        let fourCount = 0;

        for (const [dx, dy] of directions) {
            if (this.isOpenFour(board, x, y, dx, dy) || this.isClosedFour(board, x, y, dx, dy)) {
                fourCount++;
            }
        }

        return fourCount >= 2;
    }

    // Check for Open-Four
    isOpenFour(board, x, y, dx, dy) {
        let line = this.getLine(board, x, y, dx, dy, 6);
        const patterns = ['011110'];  // Open-Four pattern
        return patterns.some(p => line.includes(p));
    }

    // Check for Closed-Four
    isClosedFour(board, x, y, dx, dy) {
        let line = this.getLine(board, x, y, dx, dy, 6);
        const patterns = ['211110', '011112', '11110', '01111', '10111', '11101', '11011'];
        return patterns.some(p => line.includes(p));
    }

    // Check for Double-Three (3-3)
    checkDoubleThree(board, x, y) {
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        let threeCount = 0;

        for (const [dx, dy] of directions) {
            if (this.isOpenThree(board, x, y, dx, dy)) {
                threeCount++;
            }
        }

        return threeCount >= 2;
    }

    // Check for Open-Three
    isOpenThree(board, x, y, dx, dy) {
        let line = this.getLine(board, x, y, dx, dy, 7);
        const patterns = ['001110', '011100', '010110', '011010'];  // Open-Three patterns
        return patterns.some(p => line.includes(p));
    }

    // Get the stone line in a certain direction
    getLine(board, x, y, dx, dy, length) {
        let line = '';
        const halfLen = Math.floor(length / 2);

        for (let i = -halfLen; i <= halfLen; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;

            if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize) {
                line += '2';  // Boundary treated as opponent
            } else {
                line += board[nx][ny].toString();
            }
        }

        return line;
    }
}

// Export
window.ForbiddenChecker = ForbiddenChecker;
