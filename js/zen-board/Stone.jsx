import React, { useMemo } from 'react';
import { Player } from './types.js';

const Stone = ({ player, isLastMove, isGhost = false }) => {
    if (player === Player.None) return null;

    // --------------------------------------------------------------------------
    // NATURAL VARIATION ENGINE
    // Calculate subtle random variations once on mount. 
    // This simulates that no two stones are placed at the exact same angle 
    // and light hits them slightly differently.
    // --------------------------------------------------------------------------
    const variations = useMemo(() => {
        // A deterministic-ish seed for SSR consistency if needed, or just random
        // Using random here is fine for client-side visual flair.
        return {
            lightX: 25 + Math.random() * 15, // Light source between 25% and 40% X
            lightY: 25 + Math.random() * 15, // Light source between 25% and 40% Y
            rotation: Math.random() * 360,   // Random rotation for texture
        };
    }, []);

    // Stone positioning
    const baseClasses = "absolute inset-0 m-auto w-[90%] h-[90%] rounded-full transition-transform duration-300 pointer-events-none";

    // --------------------------------------------------------------------------
    // VISUAL DESIGN SYSTEM: "Slate & Matte Shell" 
    // --------------------------------------------------------------------------

    // --- BLACK STONE: "Nachi-guro" (Polished Slate) ---
    const blackStyle = {
        // Dynamic light position based on variations
        background: `radial-gradient(circle at ${variations.lightX}% ${variations.lightY}%, #3a3a3a 0%, #0a0a0a 45%, #000000 100%)`,
        boxShadow: `
      inset 1px 1px 2px rgba(255, 255, 255, 0.2), 
      inset -1px -1px 4px rgba(255, 255, 255, 0.05),
      0px 0px 1px rgba(0,0,0,0.8)
    `,
    };

    // --- WHITE STONE: "Matte Hamaguri" (Frosted/Matte Shell) ---
    const whiteStyle = {
        // Dynamic light position
        background: `radial-gradient(circle at ${variations.lightX}% ${variations.lightY}%, #ffffff 0%, #f7f4ed 45%, #e0d8c8 100%)`,
        boxShadow: `
      inset 0px 2px 15px rgba(255, 255, 255, 0.8), 
      inset -2px -4px 10px rgba(170, 160, 130, 0.3), 
      0px 1px 3px rgba(0, 0, 0, 0.2)
    `,
    };

    const stoneStyle = player === Player.Black ? blackStyle : whiteStyle;
    const shadowOpacity = player === Player.White ? 0.3 : 0.6;

    // --------------------------------------------------------------------------
    // GHOST STONE
    // --------------------------------------------------------------------------
    if (isGhost) {
        return (
            <div
                className={`${baseClasses}`}
                style={{
                    ...stoneStyle,
                    // Ghost doesn't need random variation, keep it standard to denote "potential"
                    background: player === Player.Black
                        ? 'radial-gradient(circle at 30% 30%, #3a3a3a 0%, #0a0a0a 100%)'
                        : 'radial-gradient(circle at 30% 30%, #ffffff 0%, #e0d8c8 100%)',
                    opacity: 0.6, // Slightly clearer than before
                    transform: 'scale(0.88)', // <--- CHANGED: Slightly smaller than real stone (0.88 vs 1.0)
                    boxShadow: 'none',
                    filter: player === Player.Black ? 'brightness(1.5)' : 'opacity(0.8)'
                }}
            />
        );
    }

    // --------------------------------------------------------------------------
    // REAL STONE RENDERING (With Drop Animation)
    // --------------------------------------------------------------------------
    return (
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>

            {/* 1. PHYSICAL DROP SHADOW (Animated) */}
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

            {/* 2. THE STONE BODY (Animated) */}
            <div
                className={`${baseClasses} z-10`}
                style={{
                    ...stoneStyle,
                    animation: 'stone-drop 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) backwards'
                }}
            >
                {/* --- BLACK STONE EFFECTS --- */}
                {player === Player.Black && (
                    <React.Fragment>
                        {/* Specular highlight variation */}
                        <div
                            className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-100 pointer-events-none"
                            style={{ transform: `rotate(${variations.rotation}deg)` }}
                        />
                        {/* The main sharp reflection */}
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

                {/* --- WHITE STONE EFFECTS --- */}
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

                {/* 3. LAST MOVE MARKER (Delayed appearance) */}
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

export default Stone;
