import { TextSpeed } from '../enums';

export class PlayerOption {
  private textSpeed: number;
  private backgroundVolume: number;
  private effectVolume: number;
  private frame: number = 0;

  constructor(textSpeed: number, backgroundVolume: number, effectVolume: number, frame: number) {
    this.textSpeed = textSpeed;
    this.backgroundVolume = backgroundVolume;
    this.effectVolume = effectVolume;
    this.frame = frame;
  }

  getTextSpeed(): number {
    let ret = TextSpeed.SLOW;

    switch (this.textSpeed) {
      case 0:
        ret = TextSpeed.SLOW;
        break;
      case 1:
        ret = TextSpeed.MID;
        break;
      case 2:
        ret = TextSpeed.FAST;
        break;
    }

    return ret;
  }

  getBackgroundVolume(): number {
    return parseFloat((this.backgroundVolume * 0.1).toFixed(1));
  }

  getEffectVolume(): number {
    return parseFloat((this.effectVolume * 0.1).toFixed(1));
  }

  getFrame(type: 'text' | 'number'): string | number {
    if (type === 'text') return `window_${this.frame}`;
    else return this.frame;
  }

  setTextSpeed(textSpeed: number): void {
    this.textSpeed = textSpeed;
  }

  setBackgroundVolume(backgroundVolume: number): void {
    this.backgroundVolume = backgroundVolume;
  }

  setEffectVolume(effectVolume: number): void {
    this.effectVolume = effectVolume;
  }

  setFrame(frame: number): void {
    this.frame = frame;
  }
}
