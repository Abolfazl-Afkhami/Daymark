// src/lib/audio/focus-audio.ts

class FocusAudioEngine {
  private ctx: AudioContext | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * شروع پخش صدای Brown Noise برای تمرکز عمیق
   */
  public startBrownNoise(volume = 0.15) {
    this.initContext();
    if (!this.ctx || this.isPlaying) return;

    const bufferSize = this.ctx.sampleRate * 5; // بافر ۵ ثانیه‌ای حلقه‌ای
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      const sample = (lastOut + 0.02 * white) / 1.02;
      lastOut = sample;
      data[i] = sample * 3.5; // نرمال‌سازی دامنه
    }

    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = buffer;
    this.noiseSource.loop = true;

    // فیلتر پایین‌گذر برای گرم و ملایم شدن صدا
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 1.2); // Fade-in ملایم

    this.noiseSource.connect(filter);
    filter.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    this.noiseSource.start(0);
    this.isPlaying = true;
  }

  /**
   * توقف پخش صدای محیطی
   */
  public stopBrownNoise() {
    if (!this.isPlaying || !this.noiseSource || !this.ctx || !this.gainNode) {
      this.isPlaying = false;
      return;
    }
    try {
      this.gainNode.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
      setTimeout(() => {
        this.noiseSource?.stop();
        this.noiseSource?.disconnect();
        this.noiseSource = null;
        this.isPlaying = false;
      }, 420);
    } catch {
      this.isPlaying = false;
    }
  }

  /**
   * پخش زنگ ملایم پایان جلسه تمرکز + ارسال نوتیفیکیشن ویندوز
   */
  public notifySessionComplete(
    title = 'پایان جلسه تمرکز!',
    body = 'خسته نباشید! زمان ثبت نتیجه و استراحت است.'
  ) {
    this.stopBrownNoise();
    this.initContext();

    if (this.ctx) {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // آکورد C5 - E5 - G5
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.18);
        gain.gain.setValueAtTime(0.2, now + idx * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.9);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.18);
        osc.stop(now + idx * 0.18 + 0.95);
      });
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') new Notification(title, { body });
        });
      }
    }
  }
}

export const focusAudio = new FocusAudioEngine();
