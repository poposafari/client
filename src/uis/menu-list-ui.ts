import { AUDIO, KEY, TEXTSTYLE, TEXTURE } from '../enums';
import { Keyboard } from '../core/manager/keyboard-manager';
import i18next from '../i18n';
import { InGameScene } from '../scenes/ingame-scene';
import { ListForm, MenuListSetting } from '../types';
import { getTextStyle, playEffectSound, Ui } from './ui';

export class MenuListUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private listContainer!: Phaser.GameObjects.Container;

  private windowWidth: number = 270;
  private info: ListForm[] = [];
  private etcUi!: Ui;
  private perList!: number;
  private window!: Phaser.GameObjects.NineSlice;
  private texts: Phaser.GameObjects.Text[] = [];
  private textImages: Phaser.GameObjects.Image[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];
  private etcImages: Phaser.GameObjects.Image[] = [];
  private etcTexts: Phaser.GameObjects.Text[] = [];
  private etcScale!: number;
  private scale!: number;
  private start!: number;
  private lastStart!: number | null;
  private lastChoice!: number | null;
  private isAllowLRCancel: boolean = false;

  private readonly contentHeight: number = 30;
  private readonly spacing: number = 10;

  constructor(scene: InGameScene, etcUi?: Ui) {
    super(scene);

    if (etcUi) this.etcUi = etcUi;
  }

  setup(data: MenuListSetting): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.info = data.info;
    this.lastChoice = null;
    this.lastStart = null;
    this.isAllowLRCancel = data.isAllowLRCancel || false;

    this.windowWidth = data.windowWidth;
    this.perList = data.per;
    this.etcScale = data.etcScale;
    this.scale = data.scale;

    this.container = this.createContainer(width / 2 + data.offsetX, height / 2 + data.offsetY);

    this.window = this.addWindow(data.window, 0, this.contentHeight + this.spacing + this.spacing, 0, 0, 16, 16, 16, 16);
    this.window.setOrigin(0, 1);
    this.window.setScale(this.scale);

    const totalHeight = this.contentHeight * this.perList + this.spacing * this.perList + this.spacing + this.spacing;

    this.window.setSize(this.windowWidth / this.scale, totalHeight / this.scale);

    this.container.add(this.window);

    this.container.setScale(this.scale);
    this.container.setVisible(false);
    this.container.setDepth(data.depth);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.renderList();
    this.container.setVisible(true);
  }

  protected onClean(): void {
    this.texts = [];
    this.textImages = [];
    this.dummys = [];
    this.etcImages = [];
    this.etcTexts = [];
    this.info = [];
    this.lastChoice = null;
    this.lastStart = null;
  }

  pause(onoff: boolean, data?: any): void {}

  setInfo(data: ListForm[]) {
    this.info = [];
    this.info = data;
    this.addCancel();
  }

  getInfo() {
    return this.info;
  }

  async handleKeyInput(data?: ListForm[]): Promise<string | number> {
    let choice = this.lastChoice ? this.lastChoice : 0;
    this.start = this.lastStart ? this.lastStart : 0;

    if (data) this.setInfo(data);

    this.show();

    const maxChoice = Math.min(this.perList, this.info.length) - 1;
    if (choice > maxChoice) {
      choice = maxChoice >= 0 ? maxChoice : 0;
      this.lastChoice = choice;
    }

    if (this.dummys[choice]) {
      this.dummys[choice].setTexture(TEXTURE.ARROW_B);
    }

    if (this.etcUi) this.etcUi.handleKeyInput(choice + this.start);

    return new Promise((resolve) => {
      Keyboard.setAllowKey([KEY.ARROW_UP, KEY.ARROW_DOWN, KEY.Z, KEY.ARROW_LEFT, KEY.ARROW_RIGHT, KEY.X, KEY.ENTER, KEY.ESC]);
      Keyboard.setKeyDownCallback((key) => {
        let prevChoice = choice;
        let scrolled = false;

        try {
          switch (key) {
            case KEY.ARROW_UP:
              if (choice > 0) {
                choice--;
              } else if (this.start > 0) {
                this.start--;
                this.renderList();
                scrolled = true;
                if (this.dummys[choice]) {
                  this.dummys[choice].setTexture(TEXTURE.ARROW_B);
                }
              }
              break;
            case KEY.ARROW_DOWN:
              const totalItems = this.info.length;
              if (choice < Math.min(this.perList, totalItems) - 1) {
                choice++;
              } else if (this.start + this.perList < totalItems) {
                this.start++;
                this.renderList();
                scrolled = true;
                if (this.dummys[choice]) {
                  this.dummys[choice].setTexture(TEXTURE.ARROW_B);
                }
              }
              break;
            case KEY.ARROW_LEFT:
              if (this.isAllowLRCancel) {
                Keyboard.setKeyDownCallback(() => {});
                return resolve('cancelL');
              }
              break;
            case KEY.ARROW_RIGHT:
              if (this.isAllowLRCancel) {
                Keyboard.setKeyDownCallback(() => {});
                return resolve('cancelR');
              }
              break;
            case KEY.ENTER:
            case KEY.Z:
              playEffectSound(this.scene, AUDIO.SELECT_0);

              if (choice + this.start === this.info.length - 1) {
                this.hide();
                Keyboard.setKeyDownCallback(() => {});
                return resolve(i18next.t('menu:cancelMenu'));
              } else {
                this.lastChoice = choice;
                this.lastStart = this.start;
              }

              if (!this.etcUi) this.hide();
              Keyboard.setKeyDownCallback(() => {});
              return resolve(choice + this.start);
            case KEY.ESC:
            case KEY.X:
              this.hide();
              Keyboard.setKeyDownCallback(() => {});
              return resolve(i18next.t('menu:cancelMenu'));
          }

          if (key === KEY.ARROW_UP || key === KEY.ARROW_DOWN) {
            if (choice !== prevChoice || scrolled) {
              playEffectSound(this.scene, AUDIO.SELECT_0);

              if (choice !== prevChoice) {
                if (this.dummys[prevChoice]) {
                  this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
                }
              }
              if (this.dummys[choice]) {
                this.dummys[choice].setTexture(TEXTURE.ARROW_B);
              }

              if (this.etcUi) this.etcUi.handleKeyInput(choice + this.start);
            }
          }
        } catch (error) {
          console.error(`Error handling key input: ${error}`);
        }
      });
    });
  }

  update(time?: number, delta?: number): void {}

  updateInfo(info: ListForm[]) {
    this.info = [];
    this.info.push(...info);
    this.addCancel();
  }

  updateWindow(texture: TEXTURE | string) {
    this.window.setTexture(texture);
  }

  updateContentColor(target: string, color: TEXTSTYLE) {
    const findIdx = this.info.findIndex((item) => item.name === target);

    if (this.texts[findIdx]) {
      this.texts[findIdx].setStyle(getTextStyle(color));
    }
    if (this.etcTexts[findIdx]) {
      this.etcTexts[findIdx].setStyle(getTextStyle(color));
    }
  }

  private addCancel() {
    this.info.push({ name: i18next.t('menu:cancelMenu'), nameImg: '', etc: '', etcImg: '' });
  }

  private cleanList() {
    this.texts.forEach((text) => text.destroy());
    this.textImages.forEach((image) => image.destroy());
    this.etcTexts.forEach((text) => text.destroy());
    this.dummys.forEach((dummy) => dummy.destroy());
    this.etcImages.forEach((image) => image.destroy());

    this.texts = [];
    this.textImages = [];
    this.etcTexts = [];
    this.dummys = [];
    this.etcImages = [];
  }

  private renderList(data?: any) {
    this.cleanList();
    const lineHeight = this.contentHeight + this.spacing;
    const items = this.info;
    const visibleItems = items.slice(this.start, this.start + this.perList);

    let currentY = -lineHeight * (this.perList - 2);

    for (const item of visibleItems) {
      if (item) {
        const [text, textImage, etcText, etcImage, dummy] = this.createContent(item, currentY) as [
          Phaser.GameObjects.Text,
          Phaser.GameObjects.Image,
          Phaser.GameObjects.Text,
          Phaser.GameObjects.Image,
          Phaser.GameObjects.Image,
        ];

        this.texts.push(text);
        this.textImages.push(textImage);
        this.etcTexts.push(etcText);
        this.etcImages.push(etcImage);
        this.dummys.push(dummy);

        this.container.add(text);
        this.container.add(textImage);
        this.container.add(etcText);
        this.container.add(etcImage);
        this.container.add(dummy);

        currentY += this.contentHeight + this.spacing;
      }
    }
  }

  private createContent(target: ListForm, y: number) {
    const textTexture = target.nameImg === '' ? TEXTURE.BLANK : target.nameImg;
    const etcTexture = target.etcImg === '' ? TEXTURE.BLANK : target.etcImg;

    const text = this.addText(+40, y, target.name, TEXTSTYLE.MESSAGE_BLACK);
    text.setOrigin(0, 1);
    const textImage = this.addImage(textTexture, 0, y);
    textImage.setOrigin(0, 1);
    const etcText = this.addText(this.windowWidth - 110, y, target.etc, TEXTSTYLE.MESSAGE_BLACK);
    etcText.setOrigin(0, 1);
    const etcImage = this.addImage(etcTexture, this.windowWidth - 125, y - 3);
    etcImage.setScale(this.etcScale ? this.etcScale : 1.6);
    etcImage.setOrigin(0, 1);
    const dummy = this.addImage(TEXTURE.BLANK, +20, y);
    dummy.setOrigin(0, 1);
    dummy.setScale(1.6);

    return [text, textImage, etcText, etcImage, dummy];
  }

  hide(): void {
    if (this.container) {
      this.container.setVisible(false);
    }
  }
}
