import { Language, OPTION_KEY, OptionKey, TEXTURE } from '@poposafari/types';
import { AudioManager } from './audio.manager';
import { debugLog } from '@poposafari/utils';

export const LanguageItmes = ['en', 'ko', 'jp'];

export class OptionManager {
  private option: Record<OptionKey, any> = {
    [OptionKey.TEXT_SPEED]: 2,
    [OptionKey.MASTER_VOLUME]: 3,
    [OptionKey.SFX_VOLUME]: 3,
    [OptionKey.BGM_VOLUME]: 3,
    [OptionKey.WINDOW]: 0,
    [OptionKey.PC_TUTORIAL]: 0,
    [OptionKey.BATTLE_TUTORIAL]: 0,
    [OptionKey.BAG_TUTORIAL]: 0,
    [OptionKey.SAFFARI_TUTORIAL]: 0,
    [OptionKey.LANGUAGE]: 0,
  };

  private readonly WINDOWS = [
    TEXTURE.WINDOW_0,
    TEXTURE.WINDOW_1,
    TEXTURE.WINDOW_2,
    TEXTURE.WINDOW_3,
  ];

  private REQUIRED_OPTION_KEYS = new Set<OptionKey>(Object.values(OptionKey));

  constructor(private audio: AudioManager) {
    this.init();
    this.audio.init(
      this.option[OptionKey.MASTER_VOLUME],
      this.option[OptionKey.BGM_VOLUME],
      this.option[OptionKey.SFX_VOLUME],
    );
  }

  init() {
    const jsonString = localStorage.getItem(OPTION_KEY);

    if (!jsonString) {
      this.saveToCache();
    } else {
      if (!this.validateCache(JSON.parse(jsonString))) {
        this.saveToCache();
      } else {
        this.option = JSON.parse(jsonString);

        this.audio.setMasterVolume(this.option[OptionKey.MASTER_VOLUME] / 10);
        this.audio.setEffectVolume(this.option[OptionKey.SFX_VOLUME] / 10);
        this.audio.setBgmVolume(this.option[OptionKey.BGM_VOLUME] / 10);
      }
    }
  }

  saveToCache() {
    debugLog('saveToCache', this.option);
    localStorage.setItem(OPTION_KEY, JSON.stringify(this.option));
  }

  validateOption(key: OptionKey, value: any) {
    switch (key) {
      case OptionKey.TEXT_SPEED:
        return value >= 0 && value <= 2;
      case OptionKey.MASTER_VOLUME:
        return value >= 0 && value <= 10;
      case OptionKey.SFX_VOLUME:
        return value >= 0 && value <= 10;
      case OptionKey.BGM_VOLUME:
        return value >= 0 && value <= 10;
      case OptionKey.WINDOW:
        return value >= 0 && value <= 3;
      case OptionKey.PC_TUTORIAL:
        return value >= 0 && value <= 1;
      case OptionKey.BATTLE_TUTORIAL:
        return value >= 0 && value <= 1;
      case OptionKey.BAG_TUTORIAL:
        return value >= 0 && value <= 1;
      case OptionKey.SAFFARI_TUTORIAL:
        return value >= 0 && value <= 1;
      case OptionKey.LANGUAGE:
        return value >= 0 && value < LanguageItmes.length;
      default:
        return false;
    }
  }

  validateCache(obj: unknown): obj is Record<OptionKey, any> {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return false;
    const o = obj as Record<string, unknown>;
    const keys = Object.keys(o);
    if (keys.length !== this.REQUIRED_OPTION_KEYS.size) return false;
    for (const k of keys) {
      if (!this.REQUIRED_OPTION_KEYS.has(k as OptionKey)) return false;
    }
    for (const key of this.REQUIRED_OPTION_KEYS) {
      if (!Object.prototype.hasOwnProperty.call(o, key)) return false;
      if (!this.validateOption(key, o[key])) return false;
    }
    return true;
  }

  updateOption(key: OptionKey, value: number | Language) {
    if (!this.validateOption(key, value)) return;

    this.option[key] = value;

    if (key === OptionKey.MASTER_VOLUME && typeof value === 'number') {
      this.audio.setMasterVolume(value);
    } else if (key === OptionKey.SFX_VOLUME && typeof value === 'number') {
      this.audio.setEffectVolume(value);
    } else if (key === OptionKey.BGM_VOLUME && typeof value === 'number') {
      this.audio.setBgmVolume(value);
    }
  }

  getOption(key: OptionKey) {
    return this.option[key];
  }

  getTextSpeed() {
    const textSpeed = this.option[OptionKey.TEXT_SPEED];

    if (textSpeed === 1) return 25;
    if (textSpeed === 2) return 10;

    return 50;
  }

  getWindow() {
    const window = this.option[OptionKey.WINDOW];

    return this.WINDOWS[window];
  }
}
