import { BGM, SFX } from '@poposafari/types';

export interface SeamlessLoopHandle {
  stop(): void;
}

export class AudioManager {
  // Volume (0.0 ~ 1.0)
  private masterVolume: number = 1.0;
  private bgmVolume: number = 0.1;
  private effectVolume: number = 0.1;

  private currentBgm: Phaser.Sound.WebAudioSound | null = null;
  private pausedBgm: Phaser.Sound.WebAudioSound | null = null;
  private pendingFadeOut: Phaser.Sound.WebAudioSound | null = null;

  private effectVolumeUpdaters = new Set<() => void>();

  constructor(private scene: Phaser.Scene) {}

  init(masterVolume: number, bgmVolume: number, effectVolume: number) {
    this.masterVolume = Phaser.Math.Clamp(masterVolume * 0.1, 0, 1);
    this.bgmVolume = Phaser.Math.Clamp(bgmVolume * 0.1, 0, 1);
    this.effectVolume = Phaser.Math.Clamp(effectVolume * 0.1, 0, 1);
  }

  public isAudible(): boolean {
    const ctx = (this.scene.sound as Phaser.Sound.WebAudioSoundManager).context;
    return ctx?.state === 'running';
  }

  public playEffect(key: SFX | string, options?: { rate?: number; detune?: number }): void {
    const volume = this.masterVolume * this.effectVolume;

    this.scene.sound.play(key as unknown as string, {
      volume,
      loop: false,
      rate: options?.rate,
      detune: options?.detune,
    });
  }

  public playEffectAwaitable(
    key: SFX | string,
    options?: { rate?: number; detune?: number },
  ): Promise<void> {
    const volume = this.masterVolume * this.effectVolume;
    const sound = this.scene.sound.add(key as unknown as string, {
      volume,
      loop: false,
      rate: options?.rate,
      detune: options?.detune,
    }) as Phaser.Sound.WebAudioSound;

    return new Promise<void>((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        sound.destroy();
        resolve();
      };
      sound.once('complete', finish);
      sound.once('stop', finish);
      sound.play();
      const fallbackMs = Math.max(300, Math.ceil((sound.duration || 1) * 1000) + 100);
      this.scene.time.delayedCall(fallbackMs, finish);
    });
  }

  public playEffectLoop(
    key: SFX | string,
    options?: { rate?: number; detune?: number },
  ): Phaser.Sound.WebAudioSound {
    const volume = this.masterVolume * this.effectVolume;
    const sound = this.scene.sound.add(key as unknown as string, {
      volume,
      loop: true,
      rate: options?.rate,
      detune: options?.detune,
    }) as Phaser.Sound.WebAudioSound;
    sound.play();
    return sound;
  }

  public stopEffectLoop(sound: Phaser.Sound.WebAudioSound | null): void {
    if (!sound) return;
    if (sound.isPlaying) sound.stop();
    sound.destroy();
  }

  public playEffectSeamlessLoop(
    key: SFX | string,
    options?: { rate?: number; detune?: number; overlapMs?: number },
  ): SeamlessLoopHandle {
    const getVolume = (): number => this.masterVolume * this.effectVolume;
    const rate = options?.rate ?? 1;
    const overlapMs = options?.overlapMs ?? 300;

    let stopped = false;
    let timer: Phaser.Time.TimerEvent | null = null;
    let current: Phaser.Sound.WebAudioSound | null = null;
    const active = new Set<Phaser.Sound.WebAudioSound>();

    const updateVolume = (): void => {
      if (current && current.isPlaying) current.setVolume(getVolume());
    };
    this.effectVolumeUpdaters.add(updateVolume);

    const playNext = (): void => {
      if (stopped) return;

      const previous = current;
      const sound = this.scene.sound.add(key as unknown as string, {
        volume: getVolume(),
        loop: false,
        rate,
        detune: options?.detune,
      }) as Phaser.Sound.WebAudioSound;

      active.add(sound);
      const cleanup = (): void => {
        active.delete(sound);
        this.scene.tweens.killTweensOf(sound);
        sound.destroy();
      };
      sound.once('complete', cleanup);
      sound.once('stop', cleanup);
      sound.play();
      current = sound;

      if (previous && previous.isPlaying) {
        this.scene.tweens.add({
          targets: previous,
          volume: 0,
          duration: overlapMs,
          ease: 'Linear',
          onComplete: () => {
            if (previous.isPlaying) previous.stop();
          },
        });
      }

      const durationMs = Math.ceil(((sound.duration || 1) * 1000) / rate);
      const nextDelay = Math.max(10, durationMs - overlapMs);
      timer = this.scene.time.delayedCall(nextDelay, playNext);
    };

    playNext();

    return {
      stop: (): void => {
        stopped = true;
        this.effectVolumeUpdaters.delete(updateVolume);
        if (timer) {
          timer.remove(false);
          timer = null;
        }
        for (const s of active) {
          this.scene.tweens.killTweensOf(s);
          if (s.isPlaying) s.stop();
          s.destroy();
        }
        active.clear();
        current = null;
      },
    };
  }

  public stopEffect(key: SFX | string): void {
    this.scene.sound.stopByKey(key as unknown as string);
  }

  public playBackground(key: BGM, duration: number = 1000): void {
    if (this.currentBgm && this.currentBgm.key === (key as unknown as string)) {
      if (!this.currentBgm.isPlaying) {
        this.currentBgm.resume();
      }
      return;
    }

    this.stopBackground();

    if (this.pausedBgm) {
      this.pausedBgm.destroy();
      this.pausedBgm = null;
    }

    const targetVolume = this.masterVolume * this.bgmVolume;

    this.currentBgm = this.scene.sound.add(key as unknown as string, {
      volume: 0,
      loop: true,
    }) as Phaser.Sound.WebAudioSound;

    this.currentBgm.setVolume(0);
    this.currentBgm.play();

    if (targetVolume <= 0) {
      return;
    }

    this.scene.tweens.add({
      targets: this.currentBgm,
      volume: { from: 0, to: targetVolume },
      duration,
      ease: 'Linear',
    });
  }

  public playInterruptBackground(key: BGM): void {
    if (this.currentBgm && this.currentBgm.isPlaying) {
      this.currentBgm.pause();
      this.pausedBgm = this.currentBgm;
      this.currentBgm = null;
    }

    const volume = this.masterVolume * this.bgmVolume;

    const interruptSound = this.scene.sound.add(key as unknown as string, {
      volume,
      loop: false,
    }) as Phaser.Sound.WebAudioSound;

    this.currentBgm = interruptSound;
    interruptSound.play();

    interruptSound.once('complete', () => {
      this.finishInterrupt();
    });
  }

  private finishInterrupt(): void {
    if (this.currentBgm) {
      this.currentBgm.destroy();
      this.currentBgm = null;
    }

    if (this.pausedBgm) {
      this.currentBgm = this.pausedBgm;
      this.pausedBgm = null;

      this.currentBgm.setVolume(this.masterVolume * this.bgmVolume);
      this.currentBgm.resume();
    }
  }

  public pauseBackground(): void {
    if (this.currentBgm && this.currentBgm.isPlaying) {
      this.currentBgm.pause();
    }
  }

  public resumeBackground(): void {
    if (this.currentBgm && !this.currentBgm.isPlaying) {
      this.currentBgm.resume();
    }
  }

  public stopBackground(fadeDurationMs: number = 0): void {
    if (!this.currentBgm) return;
    const bgm = this.currentBgm;
    this.currentBgm = null;
    this.scene.tweens.killTweensOf(bgm);
    if (fadeDurationMs <= 0 || this.masterVolume * this.bgmVolume <= 0) {
      bgm.stop();
      bgm.destroy();
      return;
    }
    this.pendingFadeOut = bgm;
    this.scene.tweens.add({
      targets: bgm,
      volume: 0,
      duration: fadeDurationMs,
      ease: 'Linear',
      onComplete: () => {
        if (this.pendingFadeOut === bgm) {
          this.pendingFadeOut = null;
        }
        bgm.stop();
        bgm.destroy();
      },
    });
  }

  public setMasterVolume(value: number): void {
    this.masterVolume = Phaser.Math.Clamp(value * 0.1, 0, 1);
    this.updateCurrentBgmVolume();
    this.updateActiveEffectVolumes();
  }

  public setBgmVolume(value: number): void {
    this.bgmVolume = Phaser.Math.Clamp(value * 0.1, 0, 1);
    this.updateCurrentBgmVolume();
  }

  public setEffectVolume(value: number): void {
    this.effectVolume = Phaser.Math.Clamp(value * 0.1, 0, 1);
    this.updateActiveEffectVolumes();
  }

  private updateActiveEffectVolumes(): void {
    for (const update of this.effectVolumeUpdaters) update();
  }

  private updateCurrentBgmVolume(): void {
    if (this.currentBgm) {
      this.scene.tweens.killTweensOf(this.currentBgm);
      this.currentBgm.setVolume(this.masterVolume * this.bgmVolume);
    }
    if (this.pendingFadeOut && this.masterVolume * this.bgmVolume <= 0) {
      const bgm = this.pendingFadeOut;
      this.pendingFadeOut = null;
      this.scene.tweens.killTweensOf(bgm);
      bgm.stop();
      bgm.destroy();
    }
  }
}
