import { WeatherId } from '../data/weatherWords';

class ClassroomSoundEngine {
  private ctx: AudioContext | null = null;
  private isBgmPlaying: boolean = false;
  private isSfxEnabled: boolean = true;
  private bgmTimer: number | null = null;
  private stepIndex: number = 0;
  private bgmVolume: number = 0.14;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getBgmState(): boolean {
    return this.isBgmPlaying;
  }

  public getSfxState(): boolean {
    return this.isSfxEnabled;
  }

  public setSfxEnabled(enabled: boolean): void {
    this.isSfxEnabled = enabled;
  }

  public toggleBgm(): boolean {
    if (this.isBgmPlaying) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    return this.isBgmPlaying;
  }

  public startBgm(): void {
    if (this.isBgmPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.isBgmPlaying = true;
    this.stepIndex = 0;

    // A cheerful, relaxing music-box / kalimba melody in C major pentatonic
    // Frequencies in Hz: C5=523.25, D5=587.33, E5=659.25, G5=783.99, A5=880.00, C6=1046.50
    // Bass accompaniment: C4=261.63, G3=196.00, A3=220.00, F3=174.61
    const melodyPattern: Array<{ lead: number | null; bass: number | null; dur: number }> = [
      { lead: 523.25, bass: 261.63, dur: 0.32 },
      { lead: 659.25, bass: null, dur: 0.32 },
      { lead: 783.99, bass: 392.00, dur: 0.32 },
      { lead: 659.25, bass: null, dur: 0.32 },
      { lead: 880.00, bass: 220.00, dur: 0.32 },
      { lead: 783.99, bass: null, dur: 0.32 },
      { lead: 659.25, bass: 329.63, dur: 0.45 },
      { lead: null, bass: null, dur: 0.32 },

      { lead: 587.33, bass: 174.61, dur: 0.32 },
      { lead: 659.25, bass: null, dur: 0.32 },
      { lead: 783.99, bass: 261.63, dur: 0.32 },
      { lead: 523.25, bass: null, dur: 0.32 },
      { lead: 587.33, bass: 196.00, dur: 0.32 },
      { lead: 659.25, bass: null, dur: 0.32 },
      { lead: 523.25, bass: 261.63, dur: 0.52 },
      { lead: null, bass: null, dur: 0.32 },
    ];

    const playStep = () => {
      if (!this.isBgmPlaying) return;
      const audioCtx = this.getContext();
      if (!audioCtx) return;

      const note = melodyPattern[this.stepIndex % melodyPattern.length];
      this.stepIndex += 1;

      const now = audioCtx.currentTime;

      if (note.lead) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.lead, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(this.bgmVolume, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + note.dur);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + note.dur + 0.03);
      }

      if (note.bass) {
        const bassOsc = audioCtx.createOscillator();
        const bassGain = audioCtx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(note.bass, now);

        bassGain.gain.setValueAtTime(0.001, now);
        bassGain.gain.linearRampToValueAtTime(this.bgmVolume * 0.55, now + 0.03);
        bassGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.55);

        bassOsc.connect(bassGain);
        bassGain.connect(audioCtx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 0.6);
      }
    };

    playStep();
    this.bgmTimer = window.setInterval(playStep, 360);
  }

  public stopBgm(): void {
    this.isBgmPlaying = false;
    if (this.bgmTimer !== null) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  public playSfx(type: 'pop' | 'correct' | 'wrong' | 'bingo' | 'countdown'): void {
    if (!this.isSfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'correct') {
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.07);
        gain.gain.setValueAtTime(0.001, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.07 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.26);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.28);
      });
    } else if (type === 'wrong') {
      const freqs = [330, 261.63];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.11);
        gain.gain.setValueAtTime(0.16, now + idx * 0.11);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.11);
        osc.stop(now + idx * 0.11 + 0.2);
      });
    } else if (type === 'bingo') {
      const fanfare = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
      const times = [0, 0.1, 0.2, 0.3, 0.45, 0.58];
      fanfare.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + times[idx]);
        gain.gain.setValueAtTime(0.25, now + times[idx]);
        gain.gain.exponentialRampToValueAtTime(0.001, now + times[idx] + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + times[idx]);
        osc.stop(now + times[idx] + 0.34);
      });
    } else if (type === 'countdown') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    }
  }

  public playWeatherSound(weather: WeatherId): void {
    if (!this.isSfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (weather === 'sunny') {
      // Cheerful bird-like double chirp + warm shimmer
      [880, 1174.66, 1318.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + i * 0.09 + 0.07);
        gain.gain.setValueAtTime(0.18, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.2);
      });
    } else if (weather === 'rainy') {
      // Gentle water-drop plucks
      [698.46, 880, 1046.5, 783.99, 987.77].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.065);
        gain.gain.setValueAtTime(0.15, now + i * 0.065);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.065 + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.065);
        osc.stop(now + i * 0.065 + 0.09);
      });
    } else if (weather === 'windy') {
      // Sweeping breeze glide
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.22);
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.45);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (weather === 'stormy') {
      // Dramatic low timpani rumble + electric spark
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.42);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.44);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.46);
    } else if (weather === 'snowy') {
      // Sparkling high bell chimes
      [1046.5, 1318.5, 1567.98, 2093.0].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.14, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.27);
      });
    } else if (weather === 'cloudy') {
      // Soft dreamy chord
      [392.0, 493.88, 587.33].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.42);
      });
    }
  }

  public speakText(text: string, rate: number = 0.88): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      utterance.pitch = 1.08;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Natural'))) ||
        voices.find((v) => v.lang.startsWith('en'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Gently duck BGM while speaking so kids hear pronunciation clearly
      const prevVolume = this.bgmVolume;
      this.bgmVolume = 0.04;
      utterance.onend = () => {
        this.bgmVolume = prevVolume;
      };
      utterance.onerror = () => {
        this.bgmVolume = prevVolume;
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore if speechSynthesis is restricted
    }
  }
}

export const soundEngine = new ClassroomSoundEngine();
