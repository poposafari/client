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
  private textObjects: Phaser.GameObjects.Text[] = [];

  private readonly scale: number = 2;
  private readonly messageWindowWidth: number = 960;
  private readonly messageWindowHeight: number = 130;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2 + 410);

    this.window = addWindow(this.scene, TEXTURE.WINDOW_MENU, 0, 0, this.messageWindowWidth / this.scale, this.messageWindowHeight / this.scale, 16, 16, 16, 16).setScale(this.scale);
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

    // BBCode 텍스트 객체들 정리
    this.textObjects.forEach((obj) => obj.destroy());
    this.textObjects = [];

    this.container.setVisible(false);
    this.endMarkContainer.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]): void {}

  update(time?: number, delta?: number): void {}

  private async showText(talk: Talk) {
    const content = talk.content;
    const speed = talk.speed;

    const segments = this.parseBBCode(content);

    let currentX = -440;
    let currentY = -37;
    const startX = -440;
    const lineHeight = 35;
    const currentStyle = this.text.style.color;

    return new Promise((resolve) => {
      let segmentIndex = 0;
      let charIndex = 0;

      const addNextChar = () => {
        if (segmentIndex >= segments.length) {
          resolve(true);
          return;
        }

        const segment = segments[segmentIndex];

        if (charIndex === 0) {
          const style = segment.isSpecial ? TEXTSTYLE.MESSAGE_BLUE : TEXTSTYLE.MESSAGE_BLACK;
          const textObj = addText(this.scene, currentX, currentY, '', style).setOrigin(0, 0);
          this.container.add(textObj);
          this.textObjects.push(textObj);
        }

        const currentTextObj = this.textObjects[this.textObjects.length - 1];
        const char = segment.text[charIndex];

        if (char === '\n') {
          currentY += lineHeight;
          currentX = startX;
          charIndex++;

          if (charIndex < segment.text.length) {
            const style = segment.isSpecial ? TEXTSTYLE.MESSAGE_BLUE : TEXTSTYLE.MESSAGE_BLACK;
            const newTextObj = addText(this.scene, currentX, currentY, '', style).setOrigin(0, 0);
            this.container.add(newTextObj);
            this.textObjects.push(newTextObj);
          }
        } else {
          currentTextObj.text += char;
          charIndex++;
        }

        if (charIndex >= segment.text.length) {
          if (!segment.text.endsWith('\n')) {
            currentX += currentTextObj.displayWidth;
          }
          segmentIndex++;
          charIndex = 0;
        }

        this.scene.time.delayedCall(speed, addNextChar, [], this);
      };

      addNextChar();
    });
  }

  private parseBBCode(content: string): { text: string; isSpecial: boolean }[] {
    const segments: { text: string; isSpecial: boolean }[] = [];
    const regex = /\[blue\](.*?)\[\/blue\]/g;

    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const normalText = content.substring(lastIndex, match.index);
        segments.push({ text: normalText, isSpecial: false });
      }

      segments.push({ text: match[1], isSpecial: true });

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      segments.push({ text: content.substring(lastIndex), isSpecial: false });
    }

    return segments;
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
