// ========== 禁手检测模块 ==========
// 从 game.js 提取，负责五子棋禁手检测逻辑

class ForbiddenChecker {
    constructor(gridSize = 15) {
        this.gridSize = gridSize;
    }

    // 检查是否为禁手，返回详细信息
    checkForbiddenMove(board, x, y) {
        // 临时放置棋子进行检测
        board[x][y] = 1;  // 黑棋

        let result = { isForbidden: false, type: null };

        if (this.checkLongConnection(board, x, y)) {
            result = { isForbidden: true, type: 'overline' };
        } else if (this.checkDoubleFour(board, x, y)) {
            result = { isForbidden: true, type: 'doubleFour' };
        } else if (this.checkDoubleThree(board, x, y)) {
            result = { isForbidden: true, type: 'doubleThree' };
        }

        // 移除临时棋子
        board[x][y] = 0;

        return result;
    }

    // 旧接口兼容
    isForbiddenMove(board, x, y) {
        return this.checkForbiddenMove(board, x, y).isForbidden;
    }

    // 检查长连禁手（超过5子）
    checkLongConnection(board, x, y) {
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

        for (const [dx, dy] of directions) {
            let count = 1;

            // 正方向
            for (let i = 1; i < 10; i++) {
                const nx = x + dx * i;
                const ny = y + dy * i;
                if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize) break;
                if (board[nx][ny] !== 1) break;
                count++;
            }

            // 反方向
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

    // 检查双四禁手
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

    // 检查活四
    isOpenFour(board, x, y, dx, dy) {
        let line = this.getLine(board, x, y, dx, dy, 6);
        const patterns = ['011110'];  // 活四模式
        return patterns.some(p => line.includes(p));
    }

    // 检查冲四
    isClosedFour(board, x, y, dx, dy) {
        let line = this.getLine(board, x, y, dx, dy, 6);
        const patterns = ['211110', '011112', '11110', '01111', '10111', '11101', '11011'];
        return patterns.some(p => line.includes(p));
    }

    // 检查双三禁手
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

    // 检查活三
    isOpenThree(board, x, y, dx, dy) {
        let line = this.getLine(board, x, y, dx, dy, 7);
        const patterns = ['001110', '011100', '010110', '011010'];  // 活三模式
        return patterns.some(p => line.includes(p));
    }

    // 获取某方向的棋子线
    getLine(board, x, y, dx, dy, length) {
        let line = '';
        const halfLen = Math.floor(length / 2);

        for (let i = -halfLen; i <= halfLen; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;

            if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize) {
                line += '2';  // 边界视为对手
            } else {
                line += board[nx][ny].toString();
            }
        }

        return line;
    }
}

// 导出
window.ForbiddenChecker = ForbiddenChecker;
