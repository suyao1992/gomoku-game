// 棋盘渲染模块
class BoardRenderer {
    constructor(canvas, gridSize = 15) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = gridSize;
        this.updateDimensions();
    }

    // 更新尺寸计算（响应式布局需要）
    updateDimensions() {
        this.cellSize = this.canvas.width / this.gridSize;
        this.padding = this.cellSize / 2;
    }

    draw(board, history, winningLine) {
        // 每次绘制前更新尺寸，确保与点击检测一致
        this.updateDimensions();

        this.drawBackground();
        this.drawGrid();
        this.drawStarPoints();
        this.drawPieces(board, history, winningLine);
        if (winningLine && winningLine.length >= 5) {
            this.drawWinningLine(winningLine);
        }
    }

    drawBackground() {
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        const size = this.canvas.width;
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 1;

        for (let i = 0; i < this.gridSize; i++) {
            const pos = this.padding + i * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding, pos);
            this.ctx.lineTo(size - this.padding, pos);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(pos, this.padding);
            this.ctx.lineTo(pos, size - this.padding);
            this.ctx.stroke();
        }
    }

    drawStarPoints() {
        this.ctx.fillStyle = '#8B4513';
        const points = [3, 7, 11];
        points.forEach(x => points.forEach(y => {
            this.ctx.beginPath();
            this.ctx.arc(
                this.padding + x * this.cellSize,
                this.padding + y * this.cellSize,
                4, 0, Math.PI * 2
            );
            this.ctx.fill();
        }));
    }

    drawPieces(board, history, winningLine) {
        // 防御性检查：确保board已初始化
        if (!board || !board.length) return;

        for (let i = 0; i < this.gridSize; i++) {
            if (!board[i]) continue;  // 跳过未初始化的行
            for (let j = 0; j < this.gridSize; j++) {
                if (board[i][j] !== 0) {
                    const isLast = history.length > 0 &&
                        history[history.length - 1].x === i &&
                        history[history.length - 1].y === j;
                    const isWin = winningLine && winningLine.some(p => p.x === i && p.y === j);
                    this.drawPiece(i, j, board[i][j], false, isLast, isWin);
                }
            }
        }
    }

    drawPiece(x, y, player, isPreview = false, isLast = false, isWin = false) {
        const ctx = this.ctx;
        const px = this.padding + x * this.cellSize;
        const py = this.padding + y * this.cellSize;
        const radius = this.cellSize * 0.4;

        ctx.save();
        if (isPreview) ctx.globalAlpha = 0.5;

        // 阴影效果
        if (isWin) {
            ctx.shadowColor = 'rgba(255, 215, 0, 1)';
            ctx.shadowBlur = 25;
        } else if (isLast) {
            ctx.shadowColor = player === 1 ? 'rgba(100, 100, 255, 0.8)' : 'rgba(255, 200, 100, 0.8)';
            ctx.shadowBlur = 15;
        }

        // 棋子阴影
        ctx.beginPath();
        ctx.arc(px + 2, py + 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();
        ctx.shadowBlur = 0;

        // 棋子本体
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(px - 5, py - 5, 0, px, py, radius);
        if (player === 1) {
            gradient.addColorStop(0, '#4a4a4a');
            gradient.addColorStop(1, '#000000');
        } else {
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(1, '#d0d0d0');
        }
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = isWin ? 'gold' : (player === 1 ? '#000' : '#888');
        ctx.lineWidth = isWin ? 3 : 1;
        ctx.stroke();
        if (isLast) {
            // Last move marker (Red Triangle)
            ctx.beginPath();
            const triangleSize = radius * 0.5;
            const ty = py - triangleSize * 0.3; // Slight offset to center visually

            ctx.moveTo(px, ty - triangleSize); // Top
            ctx.lineTo(px - triangleSize * 0.866, ty + triangleSize * 0.5); // Bottom Left
            ctx.lineTo(px + triangleSize * 0.866, ty + triangleSize * 0.5); // Bottom Right
            ctx.closePath();

            ctx.fillStyle = '#ff3333';
            ctx.fill();

            // Add a small shadow/glow to the marker itself
            ctx.shadowColor = 'red';
            ctx.shadowBlur = 5;
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset
        }

        ctx.restore();
    }

    drawPreview(x, y, player) {
        this.drawPiece(x, y, player, true);
    }

    drawWinningLine(line) {
        if (line.length < 2) return;
        const ctx = this.ctx;

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(255, 215, 0, 1)';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(
            this.padding + line[0].x * this.cellSize,
            this.padding + line[0].y * this.cellSize
        );
        ctx.lineTo(
            this.padding + line[line.length - 1].x * this.cellSize,
            this.padding + line[line.length - 1].y * this.cellSize
        );
        ctx.stroke();
        ctx.restore();
    }

    getGridPosition(e) {
        const rect = this.canvas.getBoundingClientRect();

        // 动态计算cellSize和padding，解决响应式布局问题
        const currentCellSize = this.canvas.width / this.gridSize;
        const currentPadding = currentCellSize / 2;

        let clientX, clientY;

        // 兼容触摸事件
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const x = (clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (clientY - rect.top) * (this.canvas.height / rect.height);
        const gx = Math.round((x - currentPadding) / currentCellSize);
        const gy = Math.round((y - currentPadding) / currentCellSize);

        if (gx >= 0 && gx < this.gridSize && gy >= 0 && gy < this.gridSize) {
            return { x: gx, y: gy };
        }
        return null;
    }

    // 高亮禁手点（红色警示）
    highlightForbiddenPoint(x, y) {
        const ctx = this.ctx;
        const px = this.padding + x * this.cellSize;
        const py = this.padding + y * this.cellSize;
        const radius = this.cellSize * 0.45;

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = 4;
        ctx.shadowColor = 'rgba(255, 0, 0, 0.6)';
        ctx.shadowBlur = 15;

        // 绘制X标记
        ctx.beginPath();
        ctx.moveTo(px - radius * 0.7, py - radius * 0.7);
        ctx.lineTo(px + radius * 0.7, py + radius * 0.7);
        ctx.moveTo(px + radius * 0.7, py - radius * 0.7);
        ctx.lineTo(px - radius * 0.7, py + radius * 0.7);
        ctx.stroke();

        ctx.restore();
    }

    // 高亮推荐落点（数据视图技能）
    highlightRecommendedPoints(points) {
        const ctx = this.ctx;

        points.forEach((point, index) => {
            const px = this.padding + point.x * this.cellSize;
            const py = this.padding + point.y * this.cellSize;
            const radius = this.cellSize * 0.35;

            ctx.save();

            // 根据排名使用不同颜色
            const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];  // 金银铜
            const color = colors[index] || '#4CAF50';

            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;

            // 绘制圆环
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.stroke();

            // 绘制序号
            ctx.fillStyle = color;
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 0;
            ctx.fillText((index + 1).toString(), px, py);

            ctx.restore();
        });
    }
}

window.BoardRenderer = BoardRenderer;
