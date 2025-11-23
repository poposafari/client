import { AUDIO } from '../../enums';
import { InGameScene } from '../../scenes/ingame-scene';
import { LoadingScene } from '../../scenes/load-scene';

export enum SOUND_TYPE {
  BACKGROUND = 'background',
  EFFECT = 'effect',
}

export enum EFFECT_PRIORITY {
  LOW = 'low',
  HIGH = 'high',
}

export class SoundManager {
  private static instance: SoundManager;
  private scene: InGameScene | LoadingScene | null = null;
  private currentBackgroundMusic: Phaser.Sound.BaseSound | null = null;
  private backgroundMusicPaused: boolean = false;
  private backgroundMusicPosition: number = 0;
  private effectSounds: Map<string, Phaser.Sound.BaseSound> = new Map();

  private effectPriorityMap: Map<AUDIO, EFFECT_PRIORITY> = new Map([
    // 우선순위 높음 (배경음악 일시정지 O)
    [AUDIO.CONG, EFFECT_PRIORITY.HIGH],
    [AUDIO.EVOL, EFFECT_PRIORITY.HIGH],
    [AUDIO.HATCH, EFFECT_PRIORITY.HIGH],
    [AUDIO.GET_0, EFFECT_PRIORITY.HIGH],

    // 우선순위 낮음 (배경음악 일시정지 X)
    [AUDIO.REWARD, EFFECT_PRIORITY.LOW],
    [AUDIO.SELECT_0, EFFECT_PRIORITY.LOW],
    [AUDIO.SELECT_1, EFFECT_PRIORITY.LOW],
    [AUDIO.SELECT_2, EFFECT_PRIORITY.LOW],
    [AUDIO.OPEN_0, EFFECT_PRIORITY.LOW],
    [AUDIO.OPEN_1, EFFECT_PRIORITY.LOW],
    [AUDIO.CANCEL_0, EFFECT_PRIORITY.LOW],
    [AUDIO.CANCEL_1, EFFECT_PRIORITY.LOW],
    [AUDIO.BUY, EFFECT_PRIORITY.LOW],
    [AUDIO.JUMP, EFFECT_PRIORITY.LOW],
    [AUDIO.REACTION_0, EFFECT_PRIORITY.LOW],
    [AUDIO.THROW, EFFECT_PRIORITY.LOW],
    [AUDIO.DOOR_ENTER_0, EFFECT_PRIORITY.LOW],
    [AUDIO.DOOR_ENTER_1, EFFECT_PRIORITY.LOW],
    [AUDIO.DOOR_ENTER_2, EFFECT_PRIORITY.LOW],
    [AUDIO.BALL_ENTER, EFFECT_PRIORITY.LOW],
    [AUDIO.BALL_EXIT, EFFECT_PRIORITY.LOW],
    [AUDIO.BUZZER, EFFECT_PRIORITY.LOW],
    [AUDIO.FLEE, EFFECT_PRIORITY.LOW],
    [AUDIO.EVOL_INTRO, EFFECT_PRIORITY.LOW],
    [AUDIO.BALL_CATCH, EFFECT_PRIORITY.LOW],
    [AUDIO.BALL_DROP, EFFECT_PRIORITY.LOW],
    [AUDIO.BALL_SHAKE, EFFECT_PRIORITY.LOW],
    [AUDIO.SHINY, EFFECT_PRIORITY.LOW],
  ]);

  private constructor() {}

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  init(scene: InGameScene | LoadingScene): void {
    this.scene = scene;
  }

  private validateSoundKey(key: string): boolean {
    if (!this.scene) {
      console.warn('Scene is not set');
      return false;
    }

    if (!this.scene.cache.audio.exists(key)) {
      console.warn(`Sound '${key}' not found in cache`);
      return false;
    }

    return true;
  }

  playBackgroundMusic(key: AUDIO | string, volume: number = 1): void {
    if (!this.scene) return;
    if (!this.validateSoundKey(key)) return;
    if (this.currentBackgroundMusic && this.currentBackgroundMusic.key === key && this.currentBackgroundMusic.isPlaying) return;

    this.stopBackgroundMusic();
    this.currentBackgroundMusic = this.scene.sound.add(key, {
      volume: volume,
      loop: true,
    }) as Phaser.Sound.BaseSound;

    this.currentBackgroundMusic.play();
    this.backgroundMusicPaused = false;
  }

  stopBackgroundMusic(): void {
    if (this.currentBackgroundMusic) {
      this.currentBackgroundMusic.stop();
      this.currentBackgroundMusic.destroy();
      this.currentBackgroundMusic = null;
    }
    this.backgroundMusicPaused = false;
    this.backgroundMusicPosition = 0;
  }

  pauseBackgroundMusic(): void {
    if (this.currentBackgroundMusic && this.currentBackgroundMusic.isPlaying) {
      this.backgroundMusicPosition = (this.currentBackgroundMusic as any).seek || 0;
      this.currentBackgroundMusic.pause();
      this.backgroundMusicPaused = true;
    }
  }

  resumeBackgroundMusic(): void {
    if (this.currentBackgroundMusic && this.backgroundMusicPaused) {
      this.currentBackgroundMusic.resume();
      this.backgroundMusicPaused = false;
    }
  }

  playEffectSound(key: AUDIO | string, volume: number = 1): void {
    if (!this.scene) return;
    if (!this.validateSoundKey(key)) return;

    const priority = this.effectPriorityMap.get(key as AUDIO) || EFFECT_PRIORITY.LOW;

    // 우선순위가 높은 이펙트 사운드라면? 배경음악을 일시정지
    if (priority === EFFECT_PRIORITY.HIGH && this.currentBackgroundMusic && this.currentBackgroundMusic.isPlaying) {
      this.pauseBackgroundMusic();
    }

    const effectSound = this.scene.sound.add(key, {
      volume: volume,
      loop: false,
    }) as Phaser.Sound.BaseSound;

    if (priority === EFFECT_PRIORITY.HIGH) {
      effectSound.on('complete', () => {
        this.resumeBackgroundMusic();
      });
    }

    effectSound.play();
    this.effectSounds.set(key, effectSound);

    effectSound.on('complete', () => {
      this.effectSounds.delete(key);
    });
  }

  pauseAllSounds(): void {
    if (this.scene) {
      this.scene.sound.pauseAll();
    }
  }

  resumeAllSounds(): void {
    if (this.scene) {
      this.scene.sound.resumeAll();
    }
  }

  stopAllSounds(): void {
    if (this.scene) {
      this.scene.sound.stopAll();
    }
    this.stopBackgroundMusic();
    this.effectSounds.clear();
  }

  setBackgroundVolume(volume: number): void {
    if (this.currentBackgroundMusic) {
      (this.currentBackgroundMusic as any).setVolume(volume);
    }
  }

  updateBackgroundVolume(volume: number): void {
    const checkVolume = Math.max(0, Math.min(10, volume));

    if (this.currentBackgroundMusic && this.currentBackgroundMusic.isPlaying) {
      const normalizedVolume = checkVolume / 10;
      (this.currentBackgroundMusic as any).setVolume(normalizedVolume);
    }
  }

  setEffectVolume(volume: number): void {
    this.effectSounds.forEach((sound) => {
      (sound as any).setVolume(volume);
    });
  }

  getCurrentBackgroundMusic(): Phaser.Sound.BaseSound | null {
    return this.currentBackgroundMusic;
  }

  isBackgroundMusicPlaying(): boolean {
    return this.currentBackgroundMusic !== null && this.currentBackgroundMusic.isPlaying;
  }

  isBackgroundMusicPaused(): boolean {
    return this.backgroundMusicPaused;
  }

  getCurrentBackgroundVolume(): number {
    if (this.currentBackgroundMusic) {
      const currentVolume = (this.currentBackgroundMusic as any).volume || 0;
      return Math.round(currentVolume * 10);
    }
    return 0;
  }
}

export const Sound = SoundManager.getInstance();
