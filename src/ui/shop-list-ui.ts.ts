import i18next from 'i18next';
import { getAllItems, Item } from '../data/items';
import { DEPTH } from '../enums/depth';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, Ui } from './ui';
import { KeyboardManager } from '../managers';
import { KEY } from '../enums/key';
import { NpcObject } from '../object/npc-object';

export class ShopListUi extends Ui {
  private mode: OverworldMode;
  private container!: Phaser.GameObjects.Container;
  private descContainer!: Phaser.GameObjects.Container;
  private purchasableItems: Item[] = [];
  private npc!: NpcObject;
  private lastChoice!: number | null;
  private lastPage!: number | null;

  private listWindow!: Phaser.GameObjects.NineSlice;
  private listWindowHeight!: number;
  private listNames: Phaser.GameObjects.Text[] = [];
  private listPrices: Phaser.GameObjects.Text[] = [];
  private listDummys: Phaser.GameObjects.Image[] = [];

  private descWindow!: Phaser.GameObjects.NineSlice;
  private descIcon!: Phaser.GameObjects.Image;
  private descText!: Phaser.GameObjects.Text;

  private pageWindow!: Phaser.GameObjects.NineSlice;
  private pageText!: Phaser.GameObjects.Text;

  private readonly fixedTopY: number = -400;
  private readonly ListPerPage: number = 13;
  private readonly listWindowWidth: number = 400;
  private readonly scale: number = 2;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();
    const contentHeight = 50;
    const spacing = 5;

    this.lastChoice = null;
    this.lastPage = null;

    this.container = this.scene.add.container(width / 2 + 400, height / 2);

    this.purchasableItems = this.getPurchasableItems();
    this.listWindowHeight = this.purchasableItems.length * (contentHeight + spacing);

    this.listWindow = addWindow(
      this.scene,
      TEXTURE.WINDOW_0,
      0,
      this.fixedTopY + this.listWindowHeight / this.scale,
      this.listWindowWidth / this.scale,
      this.listWindowHeight / this.scale,
      16,
      16,
      16,
      16,
    ).setScale(this.scale);

    this.pageWindow = addWindow(this.scene, TEXTURE.WINDOW_0, +140, this.fixedTopY - contentHeight + 15, 60, contentHeight / this.scale + 5, 16, 16, 16, 16).setScale(this.scale);
    this.pageText = addText(this.scene, +120, this.fixedTopY - contentHeight + 15, '', TEXTSTYLE.OVERWORLD_LIST).setOrigin(0, 0.5);

    this.descContainer = this.scene.add.container(-400, +350);
    this.descWindow = addWindow(this.scene, TEXTURE.WINDOW_0, 0, +100, 600, 80, 16, 16, 16, 16).setScale(this.scale);
    this.descIcon = addImage(this.scene, '', -500, +100).setScale(this.scale);
    this.descText = addText(this.scene, -400, +70, '', TEXTSTYLE.OVERWORLD_LIST).setOrigin(0, 0.5);

    this.descContainer.add(this.descWindow);
    this.descContainer.add(this.descIcon);
    this.descContainer.add(this.descText);

    this.container.add(this.listWindow);
    this.container.add(this.pageWindow);
    this.container.add(this.pageText);
    this.container.add(this.pageText);
    this.container.add(this.descContainer);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE);
    this.container.setScrollFactor(0);

    this.renderPage(1);
  }

  show(data?: NpcObject): void {
    if (data) {
      this.npc = data;
    }
    this.container.setVisible(true);
    this.pause(false);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
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
    let end = this.ListPerPage - 1;
    let choice = this.lastChoice ? this.lastChoice : start;
    let currentPage = this.lastPage ? this.lastPage : 1;
    // console.log('lastChoice:' + this.lastChoice, 'lastPage:' + this.lastPage);
    // console.log('choice:' + choice, 'currentPage:' + currentPage);
    const totalPages = Math.ceil(this.purchasableItems.length / this.ListPerPage);
    const globalChoice = (currentPage - 1) * this.ListPerPage + choice;

    this.listDummys[globalChoice].setTexture(TEXTURE.ARROW_W_R);

    this.descIcon.setTexture(`item${this.purchasableItems[globalChoice].key}`);
    this.descText.setText(i18next.t(`item:${this.purchasableItems[globalChoice].key}.description`));

    this.updatePageText(currentPage);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback(async (key) => {
      const prevChoice = choice;
      const prevPage = currentPage;
      try {
        switch (key) {
          case KEY.UP:
            if (choice > start) choice--;
            break;
          case KEY.DOWN:
            if (choice < end && choice < this.purchasableItems.length - 1 - (currentPage - 1) * this.ListPerPage) {
              choice++;
            }
            break;
          case KEY.LEFT:
            if (currentPage > 1) {
              currentPage--;
            }
            break;
          case KEY.RIGHT:
            if (currentPage < totalPages) {
              currentPage++;
            }
            break;
          case KEY.SELECT:
            if (this.purchasableItems.length <= 0) return;
            const globalChoice = (currentPage - 1) * this.ListPerPage + choice;
            const targetItem = this.purchasableItems[globalChoice];
            this.mode.addUiStackOverlap('ShopChoiceUi', { npc: this.npc, item: targetItem.key, cost: targetItem.price });
            break;
          case KEY.CANCEL:
            this.lastChoice = null;
            this.lastPage = null;
            this.clean();
            this.mode.pauseOverworldSystem(false);
            this.mode.popUiStack();
            this.listDummys[choice].setTexture(TEXTURE.BLANK);
            this.renderPage(1);
          default:
            console.error(`Unhandled key: ${key}`);
            break;
        }
        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            this.lastChoice = choice;
            this.listDummys[prevChoice].setTexture(TEXTURE.BLANK);
            this.listDummys[choice].setTexture(TEXTURE.ARROW_W_R);
            this.renderDesc(this.purchasableItems[(currentPage - 1) * this.ListPerPage + choice].key);
          }
        }
        if (key === KEY.LEFT || key === KEY.RIGHT) {
          if (currentPage !== prevPage) {
            this.lastPage = currentPage;
            this.renderPage(currentPage);
            choice = 0;
            this.renderDesc(this.purchasableItems[(currentPage - 1) * this.ListPerPage + choice].key);
            this.listDummys[choice].setTexture(TEXTURE.ARROW_W_R);
            this.updatePageText(currentPage);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private getPurchasableItems(): Item[] {
    return getAllItems().filter((item) => item.purchasable);
  }

  private renderPage(page: number) {
    const startIdx = (page - 1) * this.ListPerPage;
    const endIdx = Math.min(startIdx + this.ListPerPage, this.purchasableItems.length);

    this.cleanPage();

    const contentHeight = 50;
    const spacing = 5;
    const totalCnt = endIdx - startIdx;
    const calcHeight = (totalCnt * (contentHeight + spacing)) / this.scale;
    this.listWindow.setSize(this.listWindowWidth / this.scale, calcHeight);
    this.listWindow.setPosition(0, this.fixedTopY + calcHeight);

    let currentY = 0;

    for (let i = startIdx; i < endIdx; i++) {
      const item = this.purchasableItems[i];
      const name = addText(this.scene, -160, this.fixedTopY + currentY + 25, i18next.t(`item:${item.key}.name`), TEXTSTYLE.OVERWORLD_LIST).setOrigin(0, 0.5);
      const price = addText(this.scene, +100, this.fixedTopY + currentY + 25, '$' + item.price.toString(), TEXTSTYLE.OVERWORLD_LIST).setOrigin(0, 0.5);
      const dummy = addImage(this.scene, TEXTURE.BLANK, -175, this.fixedTopY + currentY + 25).setScale(1.8);

      this.listNames.push(name);
      this.listPrices.push(price);
      this.listDummys.push(dummy);

      currentY += contentHeight + spacing;
    }

    this.container.add(this.listNames);
    this.container.add(this.listPrices);
    this.container.add(this.listDummys);
  }

  private renderDesc(key: string) {
    this.descIcon.setTexture(`item${key}`);
    this.descText.setText(i18next.t(`item:${key}.description`));
  }

  private updatePageText(currentPage: number): void {
    const totalPages = Math.ceil(this.purchasableItems.length / this.ListPerPage);
    this.pageText.setText(`${currentPage}/${totalPages}`);
  }

  private cleanPage() {
    this.listNames.forEach((name) => name.destroy());
    this.listDummys.forEach((dummy) => dummy.destroy());
    this.listPrices.forEach((price) => price.destroy());

    this.listNames = [];
    this.listDummys = [];
    this.listPrices = [];
  }
}
