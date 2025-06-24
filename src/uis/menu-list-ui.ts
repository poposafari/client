import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { KEY } from '../enums/key';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import { eventBus } from '../core/event-bus';
import { EVENT } from '../enums/event';
import { ListForm } from '../types';

interface MenuListSetting {
  scale: number;
  etcScale: number;
  windowWidth: number;
  offsetX: number;
  offsetY: number;
  depth: number;
  per: number;
  info: ListForm[];
}

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

  private readonly contentHeight: number = 30;
  private readonly spacing: number = 10;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data: MenuListSetting): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.info = data.info;
    this.addCancel();
    this.lastChoice = null;
    this.lastStart = null;

    this.windowWidth = data.windowWidth;
    this.perList = data.per;
    this.etcScale = data.etcScale;
    this.scale = data.scale;

    this.container = this.createContainer(width / 2 + data.offsetX, height / 2 + data.offsetY);

    this.window = addWindow(this.scene, TEXTURE.WINDOW_2, 0, this.contentHeight + this.spacing + this.spacing, 0, 0, 16, 16, 16, 16);
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

  clean(data?: any): void {
    this.container.setVisible(false);

    this.lastChoice = 0;
    this.lastStart = 0;
  }

  pause(onoff: boolean, data?: any): void {}

  setInfo(data: ListForm[]) {
    this.info = [];
    this.info = data;
    this.addCancel();
  }

  async handleKeyInput(data?: ListForm[]): Promise<string | number> {
    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT, KEY.CANCEL];
    const keyboard = KeyboardHandler.getInstance();

    let choice = this.lastChoice ? this.lastChoice : 0;
    this.start = this.lastStart ? this.lastStart : 0;

    if (data) this.setInfo(data);

    this.show();

    this.dummys[choice].setTexture(TEXTURE.ARROW_B_R);

    return new Promise((resolve) => {
      keyboard.setAllowKey(keys);
      keyboard.setKeyDownCallback((key) => {
        let prevChoice = choice;

        eventBus.emit(EVENT.PLAY_SOUND, this.scene, key);

        try {
          switch (key) {
            case KEY.UP:
              if (choice > 0) {
                choice--;
              } else if (this.start > 0) {
                this.start--;
                this.renderList();
                this.dummys[choice].setTexture(TEXTURE.ARROW_B_R);
              }
              break;
            case KEY.DOWN:
              const totalItems = this.info.length;
              if (choice < Math.min(this.perList, totalItems) - 1) {
                choice++;
              } else if (this.start + this.perList < totalItems) {
                this.start++;
                this.renderList();
                this.dummys[choice].setTexture(TEXTURE.ARROW_B_R);
              }
              break;
            case KEY.SELECT:
              this.lastChoice = choice;
              this.lastStart = this.start;

              if (choice + this.start === this.info.length - 1) {
                this.clean();
                return resolve(i18next.t('menu:cancelMenu'));
              }

              if (!this.etcUi) this.clean();

              return resolve(choice + this.start);
            case KEY.CANCEL:
              this.clean();
              return resolve(i18next.t('menu:cancelMenu'));
          }

          if (key === KEY.UP || key === KEY.DOWN) {
            if (choice !== prevChoice) {
              this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
              this.dummys[choice].setTexture(TEXTURE.ARROW_B_R);

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
    const beforeItem = items[this.start - 1];
    const afterItem = items[this.start + this.perList];

    let currentY = -lineHeight * (this.perList - 2);

    // if (beforeItem) {
    //   const [text, textImage, etcText, etcImage, dummy] = this.createContent(beforeItem, currentY - lineHeight);
    //   this.listContainer.add(text);
    //   this.listContainer.add(textImage);
    //   this.listContainer.add(etcText);
    //   this.listContainer.add(etcImage);
    //   this.listContainer.add(dummy);
    // }

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

    // if (afterItem) {
    //   const [text, textImage, etcText, etcImage, dummy] = this.createContent(afterItem, currentY);
    //   this.listContainer.add(text);
    //   this.listContainer.add(textImage);
    //   this.listContainer.add(etcText);
    //   this.listContainer.add(etcImage);
    //   this.listContainer.add(dummy);
    // }
  }

  private createContent(target: ListForm, y: number) {
    const textTexture = target.nameImg === '' ? TEXTURE.BLANK : target.nameImg;
    const etcTexture = target.etcImg === '' ? TEXTURE.BLANK : target.etcImg;

    const text = addText(this.scene, +40, y, target.name, TEXTSTYLE.MESSAGE_BLACK);
    text.setOrigin(0, 1);
    const textImage = addImage(this.scene, textTexture, 0, y);
    textImage.setOrigin(0, 1);
    const etcText = addText(this.scene, this.windowWidth - 85, y, target.etc, TEXTSTYLE.MESSAGE_BLACK);
    etcText.setOrigin(0, 1);
    const etcImage = addImage(this.scene, etcTexture, this.windowWidth - 125, y - 3);
    etcImage.setScale(this.etcScale ? this.etcScale : 1.6);
    etcImage.setOrigin(0, 1);
    const dummy = addImage(this.scene, TEXTURE.BLANK, +20, y);
    dummy.setOrigin(0, 1);
    dummy.setScale(1.6);

    return [text, textImage, etcText, etcImage, dummy];
  }
}
