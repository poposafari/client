import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { KEY } from '../enums/key';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import { ListForm } from '../types';
import { eventBus } from '../core/event-bus';
import { EVENT } from '../enums/event';

export class ListUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private hideContainer!: Phaser.GameObjects.Container;
  private listContainer!: Phaser.GameObjects.Container;

  private etcUi!: Ui;
  private window!: Phaser.GameObjects.NineSlice;
  private texts: Phaser.GameObjects.Text[] = [];
  private textImages: Phaser.GameObjects.Image[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];
  private etcImages: Phaser.GameObjects.Image[] = [];
  private etcTexts: Phaser.GameObjects.Text[] = [];

  private start!: number;
  private lastStart!: number | null;
  private lastChoice!: number | null;
  private scale!: number;
  private etcScale!: number;

  private allItems: ListForm[] = [];
  private ItemPerList!: number;
  private windowWidth!: number;
  private windowHeight!: number;

  private readonly conetentHeight = 30;
  private readonly spacing = 5;

  constructor(scene: InGameScene, etcUi?: Ui) {
    super(scene);

    if (etcUi) this.etcUi = etcUi;
  }

  setup(): void {
    this.lastChoice = null;
    this.lastStart = null;
  }

  show(data?: any): void {
    this.renderList();

    this.container.setVisible(true);
    this.listContainer.setVisible(true);
    this.hideContainer.setVisible(true);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.listContainer.setVisible(false);
    this.hideContainer.setVisible(false);

    this.lastChoice = 0;
    this.lastStart = 0;
  }

  pause(onoff: boolean, data?: any): void {}

  async handleKeyInput(data?: any): Promise<string | number> {
    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT, KEY.CANCEL];
    const keyboard = KeyboardHandler.getInstance();

    let choice = this.lastChoice ? this.lastChoice : 0;
    this.start = this.lastStart ? this.lastStart : 0;

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
                prevChoice = 1;
                this.start--;
                this.renderList();
              }

              break;
            case KEY.DOWN:
              const totalItems = this.allItems.length;
              if (choice < Math.min(this.ItemPerList, totalItems) - 1) {
                choice++;
              } else if (this.start + this.ItemPerList < totalItems) {
                prevChoice = 5;
                this.start++;
                this.renderList();
              }
              break;
            case KEY.SELECT:
              this.lastChoice = choice;
              this.lastStart = this.start;

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

  resetChoice() {
    this.lastChoice = 0;
    this.lastStart = 0;
  }

  setupInfo(windowWidth: number, offsetX: number, offsetY: number, data: ListForm[], perList: number, halfScrollOffset: number, scale: number = 2, etcScale?: number) {
    const width = this.getWidth();
    const height = this.getHeight();

    this.allItems.push(...data);
    this.windowWidth = windowWidth;
    this.ItemPerList = perList;
    this.scale = scale;
    const lineHeight = this.conetentHeight + this.spacing;
    this.windowHeight = lineHeight * (perList + 2);

    if (etcScale) this.etcScale = etcScale;

    const centerX = width / 2;
    const centerY = height / 2;
    const listOffsetY = -this.windowHeight;

    this.container = this.createContainer(centerX + offsetX, centerY + offsetY);
    this.listContainer = this.createContainer(centerX + offsetX, centerY + offsetY + listOffsetY + halfScrollOffset);
    this.hideContainer = this.createContainer(centerX + offsetX, centerY + offsetY);

    const listWindow = addWindow(this.scene, TEXTURE.WINDOW_2, 0, 0, this.windowWidth / this.scale, this.windowHeight / this.scale, 16, 16, 16, 16);
    const hideWindow = addWindow(this.scene, TEXTURE.WINDOW_11, 0, 0, this.windowWidth / this.scale, this.windowHeight / this.scale, 16, 16, 16, 16);

    listWindow.setOrigin(0, 1);
    listWindow.setScale(this.scale);
    hideWindow.setOrigin(0, 1);
    hideWindow.setScale(this.scale);
    this.container.add(listWindow);
    this.hideContainer.add(hideWindow);

    this.container.setScale(this.scale);
    this.container.setVisible(false);
    this.container.setDepth(DEPTH.MENU);
    this.container.setScrollFactor(0);

    this.listContainer.setScale(this.scale);
    this.listContainer.setVisible(false);
    this.listContainer.setDepth(DEPTH.MENU + 1);
    this.listContainer.setScrollFactor(0);

    this.hideContainer.setScale(this.scale);
    this.hideContainer.setVisible(false);
    this.hideContainer.setDepth(DEPTH.MENU + 2);
    this.hideContainer.setScrollFactor(0);
  }

  private renderList() {
    this.cleanList();
    const lineHeight = this.conetentHeight + this.spacing;
    const items = this.allItems;
    const visibleItems = items.slice(this.start, this.start + this.ItemPerList);
    const beforeItem = items[this.start - 1];
    const afterItem = items[this.start + this.ItemPerList];

    let currentY = -lineHeight * (this.ItemPerList - 2);

    if (beforeItem) {
      const [text, textImage, etcText, etcImage, dummy] = this.createContent(beforeItem, currentY - lineHeight);
      this.listContainer.add(text);
      this.listContainer.add(textImage);
      this.listContainer.add(etcText);
      this.listContainer.add(etcImage);
      this.listContainer.add(dummy);
    }

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

        this.listContainer.add(text);
        this.listContainer.add(textImage);
        this.listContainer.add(etcText);
        this.listContainer.add(etcImage);
        this.listContainer.add(dummy);

        currentY += this.conetentHeight + this.spacing;
      }
    }

    if (afterItem) {
      const [text, textImage, etcText, etcImage, dummy] = this.createContent(afterItem, currentY);
      this.listContainer.add(text);
      this.listContainer.add(textImage);
      this.listContainer.add(etcText);
      this.listContainer.add(etcImage);
      this.listContainer.add(dummy);
    }
  }

  private cleanList() {
    if (this.listContainer) {
      this.listContainer.removeAll(true);
    }

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
