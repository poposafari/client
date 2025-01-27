import i18next from 'i18next';
import { getItem, items } from '../data/items';
import { DEPTH } from '../enums/depth';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, Ui } from './ui';
import { KEY } from '../enums/key';
import { KeyboardManager } from '../managers';

export class OverworldShopListUi extends Ui {
  private mode: OverworldMode;
  private container!: Phaser.GameObjects.Container;
  private containerBottom!: Phaser.GameObjects.Container;
  private window!: Phaser.GameObjects.NineSlice;
  private texts: Phaser.GameObjects.Text[] = [];
  private prices: Phaser.GameObjects.Text[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];
  private desc!: Phaser.GameObjects.Text;
  private icon!: Phaser.GameObjects.Image;
  private page!: Phaser.GameObjects.Text;
  private readonly scale: number = 2;
  private readonly contentHeight: number = 50;
  private readonly contentSpacing: number = 2;
  private readonly fixedTopY: number = -400;
  private readonly minWindowHeight = 50;
  private readonly windowWidth = 400;
  private readonly LIST_PER_PAGE: number = 13;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();
    const totalContentsHeight = this.getShopItems().length * (this.contentHeight + this.contentSpacing) - this.contentSpacing;
    const windowHeight = Math.max(totalContentsHeight, this.minWindowHeight);

    this.window = addWindow(this.scene, TEXTURE.WINDOW_6, 0, this.fixedTopY + windowHeight / this.scale, this.windowWidth / this.scale, windowHeight / this.scale, 16, 16, 16, 16).setScale(this.scale);
    const windowPage = addWindow(this.scene, TEXTURE.WINDOW_6, +140, this.fixedTopY - this.contentHeight + 15, 60, this.contentHeight / this.scale + 5, 16, 16, 16, 16).setScale(this.scale);

    this.container = this.scene.add.container(width / 2 + 320, height / 2 + 100);
    this.containerBottom = this.scene.add.container(width / 2, height / 2 + 450);

    const windowDesc = addWindow(this.scene, TEXTURE.WINDOW_6, 0, 0, 520, 70, 16, 16, 16, 16).setScale(this.scale);

    this.getShopItems().forEach((key, index) => {
      const item = getItem(key);
      if (item) {
        const yPosition = this.fixedTopY + this.contentHeight / this.scale + index * (this.contentHeight + this.contentSpacing);
        const nameText = addText(this.scene, -180, yPosition, item.name, TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5);
        const priceText = addText(this.scene, 0, yPosition, item.price.toString(), TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5);
        const dummy = addImage(this.scene, TEXTURE.BLANK, 0, yPosition).setScale(this.scale);

        this.texts.push(nameText);
        this.prices.push(priceText);
        this.dummys.push(dummy);
      }
    });

    this.desc = addText(this.scene, -400, -30, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5);
    this.icon = addImage(this.scene, TEXTURE.BLANK, -450, 0).setScale(1.5);

    const cancelText = addText(this.scene, -120, this.fixedTopY - this.contentHeight + 30, i18next.t('sys:selectOrCancelGuide'), TEXTSTYLE.INPUT_GUIDE);
    this.page = addText(this.scene, +140, this.fixedTopY - this.contentHeight + 15, ``, TEXTSTYLE.MESSAGE_BLACK);

    this.container.add(this.window);
    this.container.add(windowPage);
    this.container.add(this.texts);
    this.container.add(this.prices);
    this.container.add(this.dummys);
    this.container.add(cancelText);
    this.container.add(this.page);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI + 1);
    this.container.setScrollFactor(0);

    this.containerBottom.add(windowDesc);
    this.containerBottom.add(this.desc);
    this.containerBottom.add(this.icon);

    this.containerBottom.setVisible(false);
    this.containerBottom.setDepth(DEPTH.OVERWORLD_UI + 2);
    this.containerBottom.setScrollFactor(0);

    this.renderPage(1);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.containerBottom.setVisible(true);
    this.pause(false);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.containerBottom.setVisible(false);
    this.pause(true);
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  update(time: number, delta: number): void {}

  private block() {}

  private unblock() {
    const keys = [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];
    const keyboardManager = KeyboardManager.getInstance();

    let start = 0;
    let end = this.LIST_PER_PAGE - 1;
    let choice = start;
    let currentPage = 1;
    const totalPages = Math.ceil(this.getShopItems().length / this.LIST_PER_PAGE);

    this.dummys[choice].setTexture(TEXTURE.ARROW_B_R);
    this.updateItemDesc((currentPage - 1) * this.LIST_PER_PAGE + choice);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback(async (key) => {
      const prevChoice = choice;
      const prevPage = currentPage;

      try {
        switch (key) {
          case KEY.UP:
            if (choice > start) {
              choice--;
            }
            break;
          case KEY.DOWN:
            if (choice < end && choice < this.getShopItems().length - 1 - (currentPage - 1) * this.LIST_PER_PAGE) {
              choice++;
            }
            break;
          case KEY.LEFT:
            if (currentPage > 1) {
              currentPage--;
              this.renderPage(currentPage);
              choice = 0;
              this.updateItemDesc((currentPage - 1) * this.LIST_PER_PAGE + choice);
              this.dummys[choice].setTexture(TEXTURE.ARROW_B_R);
            }
            break;
          case KEY.RIGHT:
            if (currentPage < totalPages) {
              currentPage++;
              this.renderPage(currentPage);
              choice = 0;
              this.updateItemDesc((currentPage - 1) * this.LIST_PER_PAGE + choice);
              this.dummys[choice].setTexture(TEXTURE.ARROW_B_R);
            }
            break;
          case KEY.SELECT:
            const target = this.getShopItems()[(currentPage - 1) * this.LIST_PER_PAGE + choice];
            const item = getItem(target);

            break;
          case KEY.CANCEL:
            this.clean();
            this.dummys[choice].setTexture(TEXTURE.BLANK);
            this.mode.pauseOverworldSystem(false);
            this.mode.popUiStack();
        }
        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
            this.dummys[choice].setTexture(TEXTURE.ARROW_B_R);
            this.updateItemDesc((currentPage - 1) * this.LIST_PER_PAGE + choice);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private renderPage(page: number) {
    const startIdx = (page - 1) * this.LIST_PER_PAGE;
    const endIdx = Math.min(startIdx + this.LIST_PER_PAGE, this.getShopItems().length);

    this.texts.forEach((text) => text.destroy());
    this.dummys.forEach((dummy) => dummy.destroy());
    this.prices.forEach((price) => price.destroy());

    this.texts = [];
    this.dummys = [];
    this.prices = [];
    this.desc.setText('');

    const totalItems = endIdx - startIdx;
    const minWindowHeight = this.contentHeight + this.contentSpacing + this.contentSpacing + this.contentSpacing;
    const calculatedHeight = totalItems * (this.contentHeight + this.contentSpacing) - this.contentSpacing + this.contentSpacing;

    const windowHeight = Math.max(calculatedHeight, minWindowHeight);
    this.window.setSize(this.windowWidth / this.scale, windowHeight / this.scale);
    this.window.setPosition(0, this.fixedTopY + windowHeight / this.scale);

    for (let i = startIdx; i < endIdx; i++) {
      const item = getItem(this.getShopItems()[i]);
      if (item) {
        const yPosition = this.fixedTopY + this.contentHeight / 2 + (i - startIdx) * (this.contentHeight + this.contentSpacing);
        const text = addText(this.scene, -170, yPosition + this.contentSpacing, item.name, TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5);
        const price = addText(this.scene, +115, yPosition + this.contentSpacing, item.price.toString(), TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5);
        const dummy = addImage(this.scene, TEXTURE.BLANK, -180, yPosition).setScale(1.4);

        this.texts.push(text);
        this.prices.push(price);
        this.dummys.push(dummy);
      }
    }

    this.container.add(this.texts);
    this.container.add(this.prices);
    this.container.add(this.dummys);

    this.updatePageText(page);
  }

  private updateItemDesc(index: number) {
    const key = this.getShopItems()[index];
    const item = getItem(key);

    if (!item) return;
    this.desc.setText(item?.description);
    this.icon.setTexture(`item${key}`);
  }

  private updatePageText(currentPage: number): void {
    const totalPages = Math.ceil(this.getShopItems().length / this.LIST_PER_PAGE);
    this.page.setText(`${currentPage}/${totalPages}`);
  }

  private getShopItems() {
    let ret = ['002', '003', '004', '002', '003', '004', '002', '003', '004', '002', '003', '004', '002', '003', '001'];
    return ret;
  }
}
