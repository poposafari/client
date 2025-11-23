import { TextSpeed } from '../../enums';
import { updateBackgroundVolume } from '../../uis/ui';
import { changeTextSpeedToDigit } from '../../utils/string-util';
import { SocketIO } from '../manager/socket-manager';

export class PlayerOption {
  private static instance: PlayerOption;

  private textSpeed: number;
  private backgroundVolume: number;
  private effectVolume: number;
  private frame: number = 0;
  private tutorial: boolean;

  private bagTutorialOnClient: boolean = true;
  private pcTutorialOnClient: boolean = true;
  private battleTutorialOnClient: boolean = true;
  private safariTutorialOnClient: boolean = true;
  private overworldTutorialOnClient: boolean = true;

  constructor(textSpeed: number = 2, backgroundVolume: number = 1, effectVolume: number = 1, frame: number = 0, tutorial: boolean = true) {
    this.textSpeed = textSpeed;
    this.backgroundVolume = backgroundVolume;
    this.effectVolume = effectVolume;
    this.frame = frame;
    this.tutorial = tutorial;
  }

  static getInstance(): PlayerOption {
    if (!PlayerOption.instance) {
      PlayerOption.instance = new PlayerOption();
    }
    return PlayerOption.instance;
  }

  init() {}

  getTutorial(): boolean {
    return this.tutorial;
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
    updateBackgroundVolume(this.backgroundVolume);
  }

  setEffectVolume(effectVolume: number): void {
    this.effectVolume = effectVolume;
  }

  setFrame(frame: number): void {
    this.frame = frame;
  }

  setTutorial(tutorial: boolean): void {
    this.tutorial = tutorial;

    this.bagTutorialOnClient = tutorial;
    this.pcTutorialOnClient = tutorial;
    this.battleTutorialOnClient = tutorial;
    this.safariTutorialOnClient = tutorial;
    this.overworldTutorialOnClient = tutorial;
  }

  setClientTutorial(onoff: boolean, type: 'bag' | 'pc' | 'battle' | 'safari' | 'overworld'): void {
    switch (type) {
      case 'bag':
        this.bagTutorialOnClient = onoff;
        break;
      case 'pc':
        this.pcTutorialOnClient = onoff;
        break;
      case 'battle':
        this.battleTutorialOnClient = onoff;
        break;
      case 'safari':
        this.safariTutorialOnClient = onoff;
        break;
      case 'overworld':
        this.overworldTutorialOnClient = onoff;
        break;
    }

    if (!this.bagTutorialOnClient && !this.pcTutorialOnClient && !this.safariTutorialOnClient && !this.battleTutorialOnClient) {
      this.tutorial = false;

      SocketIO.changeOption({
        textSpeed: changeTextSpeedToDigit(Option.getTextSpeed() as number),
        frame: Option.getFrame('number') as number,
        backgroundVolume: (Option.getBackgroundVolume()! as number) * 10,
        effectVolume: (Option.getEffectVolume()! as number) * 10,
        tutorial: Option.getTutorial() as boolean,
      });
    }
  }

  getClientTutorial(type: 'bag' | 'pc' | 'battle' | 'safari' | 'overworld'): boolean {
    switch (type) {
      case 'bag':
        return this.bagTutorialOnClient;
      case 'pc':
        return this.pcTutorialOnClient;
      case 'battle':
        return this.battleTutorialOnClient;
      case 'safari':
        return this.safariTutorialOnClient;
      case 'overworld':
        return this.overworldTutorialOnClient;
    }
  }

  clear() {
    this.textSpeed = 2;
    this.backgroundVolume = 1;
    this.effectVolume = 1;
    this.frame = 0;
    this.tutorial = true;

    this.bagTutorialOnClient = true;
    this.pcTutorialOnClient = true;
    this.battleTutorialOnClient = true;
    this.safariTutorialOnClient = true;
    this.overworldTutorialOnClient = true;
  }
}

export const Option = PlayerOption.getInstance();
