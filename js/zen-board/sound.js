import { Player } from './types.js';

// Singleton AudioContext
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

// Create a static noise buffer for the "Click" transient (High Frequency)
const createNoiseBuffer = (ctx) => {
    if (noiseBuffer) return noiseBuffer;
    const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        // White noise
        data[i] = Math.random() * 2 - 1;
    }
    noiseBuffer = buffer;
    return buffer;
};

export const playStoneSound = (player) => {
    const ctx = initAudio();
    if (!ctx) return;

    const t = ctx.currentTime;

    // ------------------------------------------------------------------
    // UNIFIED STONE PHYSICS
    // Removed distinction between Black/White materials.
    // Using a balanced profile that sounds like a high-quality stone on solid wood.
    // ------------------------------------------------------------------

    // Subtle Pitch Randomization only (Natural variation of impact force)
    const randPitch = 1.0 + (Math.random() * 0.05 - 0.025);
    const randVel = 0.9 + Math.random() * 0.2;

    // Balanced Frequencies (Crisp Attack + Warm Body)
    const baseFreq = 950;
    const snapFreq = 4000;
    const bodyDecay = 0.1;

    // ------------------------------------------------------------------
    // LAYER 1: THE CRACK (Contact Noise - The "Tick")
    // ------------------------------------------------------------------
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = createNoiseBuffer(ctx);
    const noiseFilter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();

    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(snapFreq * randPitch, t);
    noiseFilter.Q.value = 1.0;

    noiseGain.gain.setValueAtTime(0, t);
    noiseGain.gain.linearRampToValueAtTime(0.5 * randVel, t + 0.002);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02); // Fast decay

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSrc.start(t);
    noiseSrc.stop(t + 0.05);

    // ------------------------------------------------------------------
    // LAYER 2: THE BODY (Resonance - The "Tone")
    // ------------------------------------------------------------------
    const oscBody = ctx.createOscillator();
    const gainBody = ctx.createGain();

    // Triangle wave gives a nice hollow-but-solid character
    oscBody.type = 'triangle';

    const mainFreq = baseFreq * randPitch;
    oscBody.frequency.setValueAtTime(mainFreq, t);
    // Drum head pitch drop effect
    oscBody.frequency.exponentialRampToValueAtTime(mainFreq - 40, t + bodyDecay);

    gainBody.gain.setValueAtTime(0, t);
    gainBody.gain.linearRampToValueAtTime(0.7 * randVel, t + 0.002);
    gainBody.gain.exponentialRampToValueAtTime(0.001, t + bodyDecay);

    const bodyFilter = ctx.createBiquadFilter();
    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.setValueAtTime(2500, t); // Balanced brightness

    oscBody.connect(bodyFilter);
    bodyFilter.connect(gainBody);
    gainBody.connect(ctx.destination);
    oscBody.start(t);
    oscBody.stop(t + 0.2);

    // ------------------------------------------------------------------
    // LAYER 3: THE THUD (Board Weight - The "Bum")
    // ------------------------------------------------------------------
    const oscRes = ctx.createOscillator();
    const gainRes = ctx.createGain();

    oscRes.type = 'sine';
    oscRes.frequency.setValueAtTime(150, t); // Deep wooden thud

    gainRes.gain.setValueAtTime(0, t);
    gainRes.gain.linearRampToValueAtTime(0.3 * randVel, t + 0.005);
    gainRes.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    oscRes.connect(gainRes);
    gainRes.connect(ctx.destination);
    oscRes.start(t);
    oscRes.stop(t + 0.15);
};
