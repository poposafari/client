import { DEPTH, TEXTSTYLE, TEXTURE } from '../enums';
import { Option } from '../core/storage/player-option';
import { InGameScene } from '../scenes/ingame-scene';
import { addText, addWindow, getTextStyle, Ui } from './ui';
import { DEFAULT_ZOOM } from '../constants';

export abstract class MessageUi extends Ui {
  protected container!: Phaser.GameObjects.Container;
  protected window!: Phaser.GameObjects.NineSlice;
  protected text!: Phaser.GameObjects.Text;
  protected textObjects: Phaser.GameObjects.Text[] = [];

  protected currentX = 0;
  protected currentY = 0;
  protected startX = 0;
  protected lineHeight = 0;
  protected textScale = 0;

  protected readonly scale_0: number = 2;
  protected readonly messageWindowWidth_0: number = 960;
  protected readonly messageWindowHeight_0: number = 130;
  protected readonly containerY_0: number = 410;

  protected readonly scale_1: number = 1.5;
  protected readonly messageWindowWidth_1: number = 853;
  protected readonly messageWindowHeight_1: number = 110;
  protected readonly containerY_1: number = 278;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const zoom = typeof data === 'number' ? data : DEFAULT_ZOOM;
    this.setupMessageContainer(zoom);
  }

  protected setupMessageContainer(zoom: number = 1): void {
    const width = this.getWidth();
    const height = this.getHeight();

    if (zoom === 1.5) {
      this.currentX = -395;
      this.currentY = -30;
      this.startX = -395;
      this.lineHeight = 30;
      this.textScale = 0.43;

      this.container = this.createTrackedContainer(width / 2, height / 2 + this.containerY_1);
      this.window = this.addWindow(TEXTURE.WINDOW_MENU, 0, 0, this.messageWindowWidth_1 / this.scale_1, this.messageWindowHeight_1 / this.scale_1, 16, 16, 16, 16).setScale(this.scale_1);
      this.text = this.addText(this.currentX, this.currentY, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0);
      this.text.setScale(0.1);
      this.container.setScale(this.scale_1);
    } else {
      this.currentX = -440;
      this.currentY = -37;
      this.startX = -440;
      this.lineHeight = 35;
      this.textScale = 0.5;

      this.container = this.createTrackedContainer(width / 2, height / 2 + this.containerY_0);
      this.window = this.addWindow(TEXTURE.WINDOW_MENU, 0, 0, this.messageWindowWidth_0 / this.scale_0, this.messageWindowHeight_0 / this.scale_0, 16, 16, 16, 16).setScale(this.scale_0);
      this.text = this.addText(-440, -35, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0);
      this.container.setScale(this.scale_0);
    }

    this.container.add(this.window);
    this.container.add(this.text);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.MESSAGE);
    this.container.setScrollFactor(0);
  }

  setTextPosition(x: number, y: number): void {
    this.text.setPosition(x, y);
  }

  protected onClean(): void {
    this.text.text = '';
    this.textObjects.forEach((obj) => obj.destroy());
    this.textObjects = [];
  }

  protected setMessageStyle(type: 'sys' | 'default'): void {
    if (type === 'sys') {
      this.window.setTexture(TEXTURE.WINDOW_SYS);
      this.text.setStyle(getTextStyle(TEXTSTYLE.MESSAGE_WHITE));
    } else {
      this.window.setTexture(Option.getFrame('text') as string);
      this.text.setStyle(getTextStyle(TEXTSTYLE.MESSAGE_BLACK));
    }
  }

  protected parseBBCode(content: string): { text: string; isSpecial: boolean }[] {
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

  protected async showText(content: string, speed: number): Promise<void> {
    const segments = this.parseBBCode(content);

    let currentX = this.currentX;
    let currentY = this.currentY;
    const startX = this.startX;
    const lineHeight = this.lineHeight;

    return new Promise((resolve) => {
      let segmentIndex = 0;
      let charIndex = 0;

      const addNextChar = () => {
        if (segmentIndex >= segments.length) {
          resolve();
          return;
        }

        const segment = segments[segmentIndex];

        if (charIndex === 0) {
          const style = segment.isSpecial ? TEXTSTYLE.MESSAGE_BLUE : TEXTSTYLE.MESSAGE_BLACK;
          const textObj = this.addText(currentX, currentY, '', style).setOrigin(0, 0).setScale(this.textScale);
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
            const newTextObj = this.addText(currentX, currentY, '', style).setOrigin(0, 0).setScale(this.textScale);
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

  pause(onoff: boolean, data?: any): void {}
  handleKeyInput(...data: any[]): void {}
  update(time?: number, delta?: number): void {}
}
