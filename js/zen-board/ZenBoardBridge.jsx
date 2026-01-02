import React from 'react';
import ReactDOM from 'react-dom/client';
import Board from './Board.jsx';
import { playStoneSound } from './sound.js';
import { Player } from './types.js';

let root = null;
let clickHandler = null;

// Expose to window for Vanilla JS access
window.ZenBoard = {
    init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error("ZenBoard container not found:", containerId);
            return;
        }
        root = ReactDOM.createRoot(container);
        console.log("React ZenBoard initialized");
    },

    // state: { board, history, winningLine, currentPlayer, ghostPlayer }
    render(gameState) {
        if (!root) return;

        const { board, history, winningLine, currentPlayer, ghostPlayer } = gameState;

        // Transform lastMove
        let lastMove = null;
        if (history && history.length > 0) {
            const last = history[history.length - 1];
            lastMove = { row: last.x, col: last.y };
        }

        // Transform winningLine
        // game.js winningLine is array of {x,y}
        let formattedWinningLine = null;
        if (winningLine) {
            formattedWinningLine = winningLine.map(pt => ({ row: pt.x, col: pt.y }));
        }

        // Determine winner
        let winner = null;
        if (formattedWinningLine) {
            if (history && history.length > 0) {
                const last = history[history.length - 1];
                winner = last.player;
            }
        }

        root.render(
            <Board
                board={board}
                onCellClick={(pos) => {
                    // pos is {row, col}
                    if (clickHandler) clickHandler(pos.row, pos.col);
                }}
                lastMove={lastMove}
                currentPlayer={ghostPlayer || currentPlayer}
                winner={winner}
                winningLine={formattedWinningLine}
            />
        );
    },

    setClickHandler(fn) {
        clickHandler = fn;
    },

    playStoneSound(player) {
        playStoneSound(player);
    }
};
