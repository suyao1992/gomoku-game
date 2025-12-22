// 音频管理模块
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.bgmPlaying = false;
        this.bgmAudio = null;
        this.audioUnlocked = false;
        this.currentTrack = 0;
        this.masterVolume = 0.5; // 主音量 0-1
        this.masterVolume = 0.5; // 主音量 0-1
        this.bgmTracks = []; // Default BGM removed as per user request
        this.musicBtn = null;
        this.init();
    }

    init() {
        // AudioContext creation deferred to user interaction
        this.audioContext = null;
    }

    // 设置主音量
    setVolume(value) {
        this.masterVolume = Math.max(0, Math.min(1, value));
        if (this.bgmAudio) {
            this.bgmAudio.volume = this.masterVolume * 0.6; // BGM稍低一些
        }
    }

    // 获取当前音量
    getVolume() {
        return this.masterVolume;
    }

    setMusicButton(btn) {
        this.musicBtn = btn;
    }

    setupAutoPlay(callback) {
        const unlockAudio = () => {
            if (!this.audioUnlocked) {
                this.audioUnlocked = true;

                // Create AudioContext on first interaction if not exists
                if (!this.audioContext) {
                    try {
                        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    } catch (e) {
                        console.log('AudioContext not supported');
                        return;
                    }
                }

                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                this.currentTrack = 0;
                // this.startBGM(); // User requested to remove default BGM
                if (callback) callback();
            }
        };
        ['click', 'touchstart', 'keydown'].forEach(event => {
            document.addEventListener(event, unlockAudio, { once: true });
        });
    }

    toggleBGM() {
        this.bgmPlaying ? this.stopBGM() : this.startBGM();
    }

    startBGM() {
        if (this.bgmTracks.length === 0) return; // No tracks to play

        this.bgmPlaying = true;
        if (this.musicBtn) {
            this.musicBtn.textContent = '🔊 音乐';
            this.musicBtn.classList.add('playing');
        }
        this.currentTrack = Math.floor(Math.random() * this.bgmTracks.length);
        this.playBGMTrack();
    }

    playBGMTrack() {
        if (!this.bgmPlaying) return;
        if (this.bgmAudio) {
            this.bgmAudio.pause();
            this.bgmAudio = null;
        }
        this.bgmAudio = new Audio(this.bgmTracks[this.currentTrack]);
        this.bgmAudio.volume = this.masterVolume * 0.6; // 使用masterVolume
        this.bgmAudio.play().catch(e => console.log('音乐播放失败:', e));
        this.bgmAudio.onended = () => {
            if (this.bgmPlaying) {
                this.currentTrack = (this.currentTrack + 1) % this.bgmTracks.length;
                this.playBGMTrack();
            }
        };
    }

    stopBGM() {
        console.log('[Audio] Stopping BGM...');
        this.bgmPlaying = false;

        if (this.musicBtn) {
            this.musicBtn.textContent = '🔇 音乐';
            this.musicBtn.classList.remove('playing');
        }

        if (this.bgmAudio) {
            try {
                this.bgmAudio.pause();
                this.bgmAudio.currentTime = 0; // Reset time
            } catch (e) {
                console.warn('[Audio] Error pausing BGM:', e);
            }
            this.bgmAudio.onended = null; // 清除缓冲
            this.bgmAudio.src = '';        // 释放资源
            this.bgmAudio.load();          // 强制释放
            this.bgmAudio = null;
        }
    }

    playSound(freq, duration = 0.1, volume = 0.3) {
        if (!this.audioContext) return; // Should be initialized by interaction
        // Safety check if context was closed or not created
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(() => { });
        }
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        // 应用主音量
        const actualVolume = volume * this.masterVolume;
        gain.gain.setValueAtTime(actualVolume, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + duration);
    }

    // 预设音效
    playHover() { this.playSound(800, 0.15, 0.5); }
    playPlace() { this.playSound(800, 0.1, 0.3); }
    playCountdown() { this.playSound(440, 0.15, 0.2); }
    playStart() { this.playSound(880, 0.3, 0.3); }
    playRPSSelect() { this.playSound(500, 0.1, 0.25); }
    playClick() { this.playSound(600, 0.08, 0.35); } // 对话框点击音效

    playWin() {
        [523, 659, 784, 1047].forEach((freq, i) => {
            setTimeout(() => this.playSound(freq, 0.3, 0.3), i * 150);
        });
    }

    playUndo() {
        if (!this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.15);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.15);
    }

    // ============ 联机对战音效 ============

    // 匹配成功音效 (欢快的上升音阶)
    playMatchSuccess() {
        [523, 659, 784, 880, 1047].forEach((freq, i) => {
            setTimeout(() => this.playSound(freq, 0.15, 0.35), i * 100);
        });
    }

    // 对手落子音效 (稍低的音调)
    playOpponentMove() {
        this.playSound(500, 0.1, 0.25);
    }

    // 失败音效 (下降音阶)
    playLose() {
        [392, 349, 330, 262].forEach((freq, i) => {
            setTimeout(() => this.playSound(freq, 0.25, 0.3), i * 180);
        });
    }

    // 收到消息音效
    playMessage() {
        this.playSound(700, 0.08, 0.2);
        setTimeout(() => this.playSound(900, 0.1, 0.25), 80);
    }

    // 对手离开音效
    playOpponentLeft() {
        this.playSound(400, 0.3, 0.3);
        setTimeout(() => this.playSound(300, 0.4, 0.25), 150);
    }

    /**
     * 清理所有资源 - 防止内存泄漏
     * 应在页面卸载或AudioManager实例被销毁时调用
     */
    cleanup() {
        // 1. 停止并释放BGM
        this.stopBGM();

        // 2. 关闭AudioContext
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close().catch(() => { });
            this.audioContext = null;
        }

        // 3. 重置状态
        this.audioUnlocked = false;
        this.bgmPlaying = false;

        console.log('[Audio] Cleanup completed');
    }
}

// 导出为全局变量
window.AudioManager = AudioManager;
