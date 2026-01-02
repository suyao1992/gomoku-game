import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';

// ==========================================
// TYPES
// ==========================================
const Player = {
    None: 0,
    Black: 1,
    White: 2
};

// ==========================================
// SOUND ENGINE (Web Audio API)
// ==========================================
let audioCtx = null;
let noiseBuffer = null;

const initAudio = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
};

const createNoiseBuffer = (ctx) => {
    if (noiseBuffer) return noiseBuffer;
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    noiseBuffer = buffer;
    return buffer;
};

const playStoneSound = (player) => {
    try {
        const ctx = initAudio();
        if (!ctx) return;

        const t = ctx.currentTime;
        const randPitch = 1.0 + (Math.random() * 0.05 - 0.025);
        const randVel = 0.9 + Math.random() * 0.2;
        const baseFreq = 950;
        const snapFreq = 4000;
        const bodyDecay = 0.1;

        // Layer 1: Crack
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = createNoiseBuffer(ctx);
        const noiseFilter = ctx.createBiquadFilter();
        const noiseGain = ctx.createGain();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(snapFreq * randPitch, t);
        noiseFilter.Q.value = 1.0;
        noiseGain.gain.setValueAtTime(0, t);
        noiseGain.gain.linearRampToValueAtTime(0.5 * randVel, t + 0.002);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
        noiseSrc.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noiseSrc.start(t);
        noiseSrc.stop(t + 0.05);

        // Layer 2: Body
        const oscBody = ctx.createOscillator();
        const gainBody = ctx.createGain();
        oscBody.type = 'triangle';
        const mainFreq = baseFreq * randPitch;
        oscBody.frequency.setValueAtTime(mainFreq, t);
        oscBody.frequency.exponentialRampToValueAtTime(mainFreq - 40, t + bodyDecay);
        gainBody.gain.setValueAtTime(0, t);
        gainBody.gain.linearRampToValueAtTime(0.7 * randVel, t + 0.002);
        gainBody.gain.exponentialRampToValueAtTime(0.001, t + bodyDecay);
        const bodyFilter = ctx.createBiquadFilter();
        bodyFilter.type = 'lowpass';
        bodyFilter.frequency.setValueAtTime(2500, t);
        oscBody.connect(bodyFilter);
        bodyFilter.connect(gainBody);
        gainBody.connect(ctx.destination);
        oscBody.start(t);
        oscBody.stop(t + 0.2);

        // Layer 3: Thud
        const oscRes = ctx.createOscillator();
        const gainRes = ctx.createGain();
        oscRes.type = 'sine';
        oscRes.frequency.setValueAtTime(150, t);
        gainRes.gain.setValueAtTime(0, t);
        gainRes.gain.linearRampToValueAtTime(0.3 * randVel, t + 0.005);
        gainRes.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        oscRes.connect(gainRes);
        gainRes.connect(ctx.destination);
        oscRes.start(t);
        oscRes.stop(t + 0.15);
    } catch (e) {
        console.warn("Audio play failed", e);
    }
};

// ==========================================
// COMPONENT: STONE
// ==========================================
const Stone = ({ player, isLastMove, isGhost = false }) => {
    if (player === Player.None) return null;

    const variations = useMemo(() => {
        return {
            lightX: 25 + Math.random() * 15,
            lightY: 25 + Math.random() * 15,
            rotation: Math.random() * 360,
        };
    }, []);

    const baseClasses = "absolute inset-0 m-auto w-[90%] h-[90%] rounded-full transition-transform duration-300 pointer-events-none";

    const blackStyle = {
        background: `radial-gradient(circle at ${variations.lightX}% ${variations.lightY}%, #3a3a3a 0%, #0a0a0a 45%, #000000 100%)`,
        boxShadow: `
      inset 1px 1px 2px rgba(255, 255, 255, 0.2), 
      inset -1px -1px 4px rgba(255, 255, 255, 0.05),
      0px 0px 1px rgba(0,0,0,0.8)
    `,
    };

    const whiteStyle = {
        background: `radial-gradient(circle at ${variations.lightX}% ${variations.lightY}%, #ffffff 0%, #f7f4ed 45%, #e0d8c8 100%)`,
        boxShadow: `
      inset 0px 2px 15px rgba(255, 255, 255, 0.8), 
      inset -2px -4px 10px rgba(170, 160, 130, 0.3), 
      0px 1px 3px rgba(0, 0, 0, 0.2)
    `,
    };

    const stoneStyle = player === Player.Black ? blackStyle : whiteStyle;
    const shadowOpacity = player === Player.White ? 0.3 : 0.6;

    if (isGhost) {
        return (
            <div
                className={`${baseClasses}`}
                style={{
                    ...stoneStyle,
                    background: player === Player.Black
                        ? 'radial-gradient(circle at 30% 30%, #3a3a3a 0%, #0a0a0a 100%)'
                        : 'radial-gradient(circle at 30% 30%, #ffffff 0%, #e0d8c8 100%)',
                    opacity: 0.6,
                    transform: 'scale(0.88)',
                    boxShadow: 'none',
                    filter: player === Player.Black ? 'brightness(1.5)' : 'opacity(0.8)'
                }}
            />
        );
    }

    return (
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
            <div
                className={`absolute w-[86%] h-[86%] rounded-full ${player === Player.White ? 'bg-[#5c4d3c]' : 'bg-black'}`}
                style={{
                    '--shadow-opacity': shadowOpacity,
                    transform: 'translate(10%, 15%) scale(1)',
                    filter: 'blur(4px)',
                    opacity: shadowOpacity,
                    zIndex: 0,
                    animation: 'shadow-drop 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) backwards'
                }}
            />

            <div
                className={`${baseClasses} z-10`}
                style={{
                    ...stoneStyle,
                    animation: 'stone-drop 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) backwards'
                }}
            >
                {player === Player.Black && (
                    <React.Fragment>
                        <div
                            className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-100 pointer-events-none"
                            style={{ transform: `rotate(${variations.rotation}deg)` }}
                        />
                        <div
                            className="absolute w-[50%] h-[30%] bg-gradient-to-b from-white/10 to-transparent rounded-full blur-[2px]"
                            style={{
                                top: `${variations.lightY * 0.2}%`,
                                left: `${variations.lightX * 0.3}%`,
                                transform: 'rotate(-45deg)'
                            }}
                        />
                    </React.Fragment>
                )}

                {player === Player.White && (
                    <React.Fragment>
                        <div
                            className="absolute w-[60%] h-[50%] bg-gradient-to-br from-white to-transparent rounded-full opacity-60 blur-[6px]"
                            style={{
                                top: `${variations.lightY * 0.15}%`,
                                left: `${variations.lightX * 0.15}%`
                            }}
                        />
                        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_2px_rgba(255,255,255,0.4)] pointer-events-none" />
                    </React.Fragment>
                )}

                {isLastMove && (
                    <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
              flex items-center justify-center rounded-full shadow-sm animate-fade-in
              ${player === Player.Black
                            ? 'w-2 h-2 bg-[#ff3333] shadow-[0_0_8px_rgba(255,50,50,0.8)]'
                            : 'w-2 h-2 bg-[#cc0000] shadow-[0_0_5px_rgba(200,0,0,0.4)]'
                        }
            `}
                        style={{ animation: 'fade-in 0.2s ease-out 0.45s backwards' }}>
                    </div>
                )}
            </div>
        </div>
    );
};

// ==========================================
// COMPONENT: BOARD
// ==========================================
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

    const boardStyle = {
        backgroundColor: '#e6b45c',
        backgroundImage: `
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 45%, rgba(60, 40, 20, 0.25) 100%),
      repeating-linear-gradient(90deg, rgba(140, 90, 40, 0.06) 0px, rgba(140, 90, 40, 0.06) 1px, transparent 1px, transparent 3px),
      repeating-linear-gradient(90deg, transparent 0px, transparent 4px, rgba(100, 60, 20, 0.03) 5px, transparent 8px, rgba(100, 60, 20, 0.04) 9px, transparent 14px)
    `,
        boxShadow: 'inset 0 0 60px rgba(60, 30, 10, 0.4), 0 25px 50px -12px rgba(0, 0, 0, 0.65)'
    };

    const GRID_SIZE = 15;
    const STAR_POINTS = [3, 7, 11];

    return (
        <div
            className="relative w-full max-w-[600px] aspect-square select-none"
            style={{ perspective: '1200px' }}
            onContextMenu={(e) => e.preventDefault()}
        >
            <div className="w-full h-full relative preserve-3d"
                style={{
                    transform: 'rotateX(25deg) translateZ(-50px)',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.5s ease-out'
                }}>

                <div className="absolute inset-0 bg-[#8c6038] translate-y-6 rounded-lg shadow-2xl"
                    style={{
                        transform: 'translateZ(-15px)',
                        backgroundImage: `
                 linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6)),
                 repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 4px)
               `
                    }}></div>

                <div className="absolute inset-0 rounded-sm border-t border-white/20 flex items-center justify-center"
                    style={{ ...boardStyle, transform: 'translateZ(0)' }}>

                    <div className="relative w-[92%] h-[92%] grid grid-rows-[repeat(15,minmax(0,1fr))] grid-cols-[repeat(15,minmax(0,1fr))]">

                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0"
                            width="100%" height="100%"
                            xmlns="http://www.w3.org/2000/svg">
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

                        {board.map((rowArr, rIndex) => (
                            rowArr.map((cellState, cIndex) => {
                                const isLast = lastMove?.row === rIndex && lastMove?.col === cIndex;
                                const isWin = isWinningCell(rIndex, cIndex);
                                const isGhost = hoverPos?.row === rIndex && hoverPos?.col === cIndex && !winner && cellState === Player.None;
                                const isDimmed = winner && !isWin && cellState !== Player.None;

                                return (
                                    <div
                                        key={`${rIndex}-${cIndex}`}
                                        className={`relative w-full h-full flex items-center justify-center z-10 cursor-pointer transition-all duration-1000 ease-in-out`}
                                        style={{
                                            transformStyle: 'preserve-3d',
                                            transform: isWin
                                                ? 'translateZ(12px) scale(1.05)'
                                                : (isDimmed ? 'scale(0.95)' : 'translateZ(0)'),
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
                                            <div className="absolute w-[85%] h-[85%] rounded-full animate-pulse-slow"
                                                style={{
                                                    background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)',
                                                    boxShadow: '0 0 25px 8px rgba(251, 191, 36, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.4)',
                                                    transform: 'translateZ(-1px)',
                                                }}
                                            />
                                        )}
                                        <Stone player={cellState} isLastMove={isLast} />
                                        {isGhost && <Stone player={currentPlayer} isLastMove={false} isGhost={true} />}
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

// ==========================================
// BRIDGE
// ==========================================
let root = null;
let clickHandler = null;

window.ZenBoard = {
    init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error("ZenBoard container not found:", containerId);
            return;
        }
        root = ReactDOM.createRoot(container);
        console.log("React ZenBoard initialized (Bundle)");
    },

    render(gameState) {
        if (!root) return;

        const { board, history, winningLine, currentPlayer } = gameState;

        let lastMove = null;
        if (history && history.length > 0) {
            const last = history[history.length - 1];
            lastMove = { row: last.x, col: last.y };
        }

        let formattedWinningLine = null;
        if (winningLine) {
            formattedWinningLine = winningLine.map(pt => ({ row: pt.x, col: pt.y }));
        }

        let winner = null;
        if (formattedWinningLine && history && history.length > 0) {
            const last = history[history.length - 1];
            winner = last.player;
        }

        root.render(
            <Board
                board={board}
                onCellClick={(pos) => {
                    if (clickHandler) clickHandler(pos.row, pos.col);
                }}
                lastMove={lastMove}
                currentPlayer={currentPlayer}
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
