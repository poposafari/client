import { GM } from '../core/game-manager';
import { ANIMATION, AUDIO, DEPTH, KEY, TEXTSTYLE, TEXTURE } from '../enums';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import { InGameScene } from '../scenes/ingame-scene';
import { Talk } from '../types';
import { addText, addWindow, createSprite, getTextStyle, playSound, Ui } from './ui';

export class TalkMessageUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private endMarkContainer!: Phaser.GameObjects.Container;

  private window!: Phaser.GameObjects.NineSlice;
  private text!: Phaser.GameObjects.Text;
  private endMark!: Phaser.GameObjects.Sprite;
  private endMarkTexture!: TEXTURE | string;

  private readonly scale: number = 2;
  private readonly messageWindowWidth: number = 950;
  private readonly messageWindowHeight: number = 120;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2 + 410);

    this.window = addWindow(this.scene, GM.getMsgWindow(), 0, 0, this.messageWindowWidth / this.scale, this.messageWindowHeight / this.scale, 16, 16, 16, 16).setScale(this.scale);
    this.text = addText(this.scene, -440, -35, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0);

    this.container.add(this.window);
    this.container.add(this.text);

    this.container.setScale(this.scale);
    this.container.setVisible(false);
    this.container.setDepth(DEPTH.MESSAGE);
    this.container.setScrollFactor(0);

    this.endMarkContainer = this.createContainer(width / 2 + 830, height / 2 + 410);
    this.endMark = createSprite(this.scene, TEXTURE.PAUSE_B, 0, 0);

    this.endMarkContainer.add(this.endMark);

    this.endMarkContainer.setScale(this.scale);
    this.endMarkContainer.setVisible(false);
    this.endMarkContainer.setDepth(DEPTH.MESSAGE + 1);
    this.endMarkContainer.setScrollFactor(0);
  }

  async show(data: Talk): Promise<boolean> {
    if (data.type === 'sys') {
      this.window.setTexture(TEXTURE.WINDOW_SYS);
      this.text.setStyle(getTextStyle(TEXTSTYLE.MESSAGE_WHITE));
      this.endMarkTexture = ANIMATION.PAUSE_W;
    } else {
      this.window.setTexture(GM.getUserOption() ? (GM.getUserOption()!.getFrame('text') as string) : TEXTURE.WINDOW_0);
      this.text.setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLACK));
      this.endMarkTexture = ANIMATION.PAUSE_B;
    }

    this.container.setVisible(true);

    const keyboard = KeyboardHandler.getInstance();
    keyboard.setAllowKey([KEY.SELECT]);
    playSound(this.scene, AUDIO.SELECT_0, GM.getUserOption()?.getEffectVolume());

    await this.showText(data);

    return new Promise((resolve) => {
      this.showEndMark(true);
      keyboard.setKeyDownCallback((key) => {
        if (key === KEY.SELECT) {
          this.clean();
          this.showEndMark(false);
          KeyboardHandler.getInstance().clearCallbacks();
          if (data.end) data.end();
          resolve(true);
        }
      });
    });
  }

  clean(data?: any): void {
    this.text.text = '';

    this.container.setVisible(false);
    this.endMarkContainer.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]): void {}

  update(time?: number, delta?: number): void {}

  private async showText(talk: Talk) {
    const text = talk.content.split('');
    let index = 0;
    let speed = talk.speed;

    return new Promise((resolve) => {
      const addNextChar = () => {
        if (index < text.length) {
          this.text.text += text[index];
          index++;
          this.scene.time.delayedCall(speed, addNextChar, [], this);
        } else {
          resolve(true);
        }
      };
      addNextChar();
    });
  }

  private showEndMark(onoff: boolean) {
    if (onoff) {
      this.endMarkContainer.setVisible(true);
      this.endMark.anims.play(this.endMarkTexture);
    } else {
      this.endMarkContainer.setVisible(false);
      this.endMark.anims.stop();
    }
  }
}
