import React, { useState } from 'react';
import { Player } from './types.js';
import Stone from './Stone.jsx';

const Board = ({
    board,
    onCellClick,
    lastMove,
    currentPlayer,
    winner,
    winningLine
}) => {
    const [hoverPos, setHoverPos] = useState(null);

    const isWinningCell = (row, col) => {
        return winningLine?.some(p => p.row === row && p.col === col) ?? false;
    };

    const handleCellHover = (row, col) => {
        if (!winner && board[row][col] === Player.None) {
            setHoverPos({ row, col });
        }
    };

    // KAYA WOOD TEXTURE & STYLING
    const boardStyle = {
        backgroundColor: '#e6b45c',
        backgroundImage: `
      /* Vignette */
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 45%, rgba(60, 40, 20, 0.25) 100%),
      /* Micro-Noise */
      repeating-linear-gradient(90deg, rgba(140, 90, 40, 0.06) 0px, rgba(140, 90, 40, 0.06) 1px, transparent 1px, transparent 3px),
      /* Masame (Straight Grain) */
      repeating-linear-gradient(90deg, transparent 0px, transparent 4px, rgba(100, 60, 20, 0.03) 5px, transparent 8px, rgba(100, 60, 20, 0.04) 9px, transparent 14px)
    `,
        boxShadow: 'inset 0 0 60px rgba(60, 30, 10, 0.4), 0 25px 50px -12px rgba(0, 0, 0, 0.65)'
    };

    // Grid constants
    const GRID_SIZE = 15;
    const STAR_POINTS = [3, 7, 11];

    return (
        // Perspective Container (The Camera)
        <div
            className="relative w-full max-w-[600px] aspect-square select-none"
            style={{ perspective: '1200px' }}
            onContextMenu={(e) => e.preventDefault()}
        >

            {/* 3D Transformed Board Object 
          Removed dynamic tilt. Fixed at rotateX(25deg) for a solid, grounded look.
      */}
            <div className="w-full h-full relative preserve-3d"
                style={{
                    transform: 'rotateX(25deg) translateZ(-50px)',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.5s ease-out'
                }}>

                {/* Board Thickness (The "Dun") 
            Added repeating gradient to simulate end-grain wood texture on sides
        */}
                <div className="absolute inset-0 bg-[#8c6038] translate-y-6 rounded-lg shadow-2xl"
                    style={{
                        transform: 'translateZ(-15px)',
                        backgroundImage: `
                 linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6)),
                 repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 4px)
               `
                    }}></div>

                {/* Main Board Surface */}
                <div className="absolute inset-0 rounded-sm border-t border-white/20 flex items-center justify-center"
                    style={{ ...boardStyle, transform: 'translateZ(0)' }}>

                    {/* Interactive Grid Container */}
                    <div className="relative w-[92%] h-[92%] grid grid-rows-[repeat(15,minmax(0,1fr))] grid-cols-[repeat(15,minmax(0,1fr))]">

                        {/* SVG Grid Overlay */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0"
                            width="100%" height="100%"
                            xmlns="http://www.w3.org/2000/svg">

                            {/* Draw Lines */}
                            {Array.from({ length: GRID_SIZE }).map((_, i) => {
                                const pos = (i + 0.5) * (100 / GRID_SIZE);
                                const start = (0.5) * (100 / GRID_SIZE);
                                const end = (GRID_SIZE - 0.5) * (100 / GRID_SIZE);

                                return (
                                    <React.Fragment key={i}>
                                        <line
                                            x1={`${pos}%`} y1={`${start}%`}
                                            x2={`${pos}%`} y2={`${end}%`}
                                            stroke="rgba(43, 29, 18, 0.85)"
                                            strokeWidth="1.5"
                                            style={{ mixBlendMode: 'multiply' }}
                                        />
                                        <line
                                            x1={`${start}%`} y1={`${pos}%`}
                                            x2={`${end}%`} y2={`${pos}%`}
                                            stroke="rgba(43, 29, 18, 0.85)"
                                            strokeWidth="1.5"
                                            style={{ mixBlendMode: 'multiply' }}
                                        />
                                    </React.Fragment>
                                );
                            })}

                            {/* Star Points */}
                            {STAR_POINTS.map(row =>
                                STAR_POINTS.map(col => (
                                    <circle
                                        key={`${row}-${col}`}
                                        cx={`${(col + 0.5) * (100 / GRID_SIZE)}%`}
                                        cy={`${(row + 0.5) * (100 / GRID_SIZE)}%`}
                                        r="3.5"
                                        fill="#2b1d12"
                                        style={{ mixBlendMode: 'multiply' }}
                                    />
                                ))
                            )}
                        </svg>

                        {/* Interactive Cells */}
                        {board.map((rowArr, rIndex) => (
                            rowArr.map((cellState, cIndex) => {
                                const isLast = lastMove?.row === rIndex && lastMove?.col === cIndex;
                                const isWin = isWinningCell(rIndex, cIndex);

                                // Ghost stone logic
                                const isGhost = hoverPos?.row === rIndex && hoverPos?.col === cIndex && !winner && cellState === Player.None;

                                // "Cinema Mode" Logic
                                // If there is a winner, but THIS cell is not part of the winning line, we dim it.
                                // We also check if there is a stone here to apply the effect to.
                                const isDimmed = winner && !isWin && cellState !== Player.None;

                                return (
                                    <div
                                        key={`${rIndex}-${cIndex}`}
                                        className={`relative w-full h-full flex items-center justify-center z-10 cursor-pointer transition-all duration-1000 ease-in-out`}
                                        style={{
                                            transformStyle: 'preserve-3d',
                                            // If it's a winning cell, we LEVITATE it (translateZ). 
                                            // If it's dimmed, we shrink it slightly.
                                            transform: isWin
                                                ? 'translateZ(12px) scale(1.05)'
                                                : (isDimmed ? 'scale(0.95)' : 'translateZ(0)'),
                                            // If dimmed, reduce opacity and blur slightly for depth of field effect
                                            opacity: isDimmed ? 0.4 : 1,
                                            filter: isDimmed ? 'grayscale(0.4) blur(0.5px)' : 'none'
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCellClick({ row: rIndex, col: cIndex });
                                        }}
                                        onMouseEnter={() => handleCellHover(rIndex, cIndex)}
                                    >
                                        {isWin && (
                                            /* The Golden Aura (Kintsugi Glow) - Replaced simple white pulse with warm amber/gold */
                                            <div className="absolute w-[85%] h-[85%] rounded-full animate-pulse-slow"
                                                style={{
                                                    background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)',
                                                    boxShadow: '0 0 25px 8px rgba(251, 191, 36, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.4)',
                                                    transform: 'translateZ(-1px)', // Sit just behind the stone
                                                }}
                                            />
                                        )}

                                        <Stone player={cellState} isLastMove={isLast} />

                                        {isGhost && (
                                            <Stone player={currentPlayer} isLastMove={false} isGhost={true} />
                                        )}
                                    </div>
                                );
                            })
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Board;
