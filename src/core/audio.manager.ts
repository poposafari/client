import { BGM, SFX } from '@poposafari/types';

export class AudioManager {
  // Volume (0.0 ~ 1.0)
  private masterVolume: number = 1.0;
  private bgmVolume: number = 0.1;
  private effectVolume: number = 0.1;

  private currentBgm: Phaser.Sound.WebAudioSound | null = null;
  private pausedBgm: Phaser.Sound.WebAudioSound | null = null;

  constructor(private scene: Phaser.Scene) {}

  init(masterVolume: number, bgmVolume: number, effectVolume: number) {
    this.masterVolume = Phaser.Math.Clamp(masterVolume * 0.1, 0, 1);
    this.bgmVolume = Phaser.Math.Clamp(bgmVolume * 0.1, 0, 1);
    this.effectVolume = Phaser.Math.Clamp(effectVolume * 0.1, 0, 1);
  }

  public playEffect(key: SFX): void {
    const volume = this.masterVolume * this.effectVolume;

    this.scene.sound.play(key as unknown as string, {
      volume,
      loop: false,
    });
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

    this.currentBgm.play();

    this.scene.tweens.add({
      targets: this.currentBgm,
      volume: targetVolume,
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

  public stopBackground(): void {
    if (this.currentBgm) {
      this.scene.tweens.killTweensOf(this.currentBgm);
      this.currentBgm.stop();
      this.currentBgm.destroy();
      this.currentBgm = null;
    }
  }

  public setMasterVolume(value: number): void {
    this.masterVolume = Phaser.Math.Clamp(value * 0.1, 0, 1);
    this.updateCurrentBgmVolume();
  }

  public setBgmVolume(value: number): void {
    this.bgmVolume = Phaser.Math.Clamp(value * 0.1, 0, 1);
    this.updateCurrentBgmVolume();
  }

  public setEffectVolume(value: number): void {
    this.effectVolume = Phaser.Math.Clamp(value * 0.1, 0, 1);
  }

  private updateCurrentBgmVolume(): void {
    if (this.currentBgm) {
      this.scene.tweens.killTweensOf(this.currentBgm);
      this.currentBgm.setVolume(this.masterVolume * this.bgmVolume);
    }
  }
}
