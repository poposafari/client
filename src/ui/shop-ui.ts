import i18next from 'i18next';
import { getAllItems, Item } from '../data/items';
import { DEPTH } from '../enums/depth';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { KEY } from '../enums/key';
import { KeyboardManager } from '../managers';
import { ShopChoiceUi } from './shop-choice-ui';
import { NpcObject } from '../object/npc-object';

export class ShopUi extends Ui {
  private mode: OverworldMode;
  private shopChoiceUi: ShopChoiceUi;
  private npc!: NpcObject;
  private items: Item[] = [];
  private start!: number;
  private lastChoice!: number | null;
  private lastStart!: number | null;

  private container!: Phaser.GameObjects.Container;
  private listContainer!: Phaser.GameObjects.Container;
  private descContainer!: Phaser.GameObjects.Container;

  private arrowUp!: Phaser.GameObjects.Image;
  private arrowDown!: Phaser.GameObjects.Image;

  private window!: Phaser.GameObjects.NineSlice;
  private listNames: Phaser.GameObjects.Text[] = [];
  private listPrices: Phaser.GameObjects.Text[] = [];
  private listDummys: Phaser.GameObjects.Image[] = [];

  private descWindow!: Phaser.GameObjects.NineSlice;
  private descIcon!: Phaser.GameObjects.Image;
  private descText!: Phaser.GameObjects.Text;

  private readonly scale: number = 4;
  private readonly ITEMS_PER_PAGE = 12;
  private readonly contentHeight: number = 60;
  private readonly contentSpacing: number = 5;
  private readonly windowWidth = 450;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);

    this.mode = mode;
    this.shopChoiceUi = new ShopChoiceUi(this.scene, mode, this);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.shopChoiceUi.setup();

    this.container = this.scene.add.container(width / 2 + 400, height / 2 - 200);
    this.listContainer = this.scene.add.container(0, 0);
    this.descContainer = this.scene.add.container(0, +650);

    this.arrowUp = addImage(this.scene, TEXTURE.ARROW_RED, +220, -190).setFlipY(true);
    this.arrowDown = addImage(this.scene, TEXTURE.ARROW_RED, +220, +570);
    this.arrowUp.setScale(2).setVisible(false);
    this.arrowDown.setScale(2).setVisible(false);

    this.window = addWindow(this.scene, TEXTURE.WINDOW_1, 0, 0, 0, 0, 8, 8, 8, 8).setScale(this.scale);

    this.descWindow = addWindow(this.scene, TEXTURE.WINDOW_1, -370, +10, 300, 35, 8, 8, 8, 8).setScale(this.scale);
    this.descIcon = addImage(this.scene, TEXTURE.BLANK, -880, +10).setScale(2);
    this.descText = addText(this.scene, -800, 0, ``, TEXTSTYLE.ITEM_LIST).setOrigin(0, 0.5);
    this.descContainer.add(this.descWindow);
    this.descContainer.add(this.descIcon);
    this.descContainer.add(this.descText);

    this.container.add(this.window);
    this.container.add(this.arrowUp);
    this.container.add(this.arrowDown);
    this.container.add(this.listContainer);
    this.container.add(this.descContainer);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE);
    this.container.setScrollFactor(0);
  }

  show(data?: NpcObject): void {
    if (data) {
      this.npc = data;
    }
    this.items = this.getPurchasableItems();

    this.start = 0;
    this.lastStart = null;
    this.lastChoice = null;

    this.renderWindow();

    this.container.setVisible(true);
    this.pause(false);
  }

  clean(data?: any): void {
    this.cleanWindow();
    this.container.setVisible(false);
    this.pause(true);
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  update(time: number, delta: number): void {}

  private block() {}

  private unblock() {
    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT, KEY.CANCEL];
    const keyboardManager = KeyboardManager.getInstance();

    let choice = this.lastChoice ? this.lastChoice : 0;
    this.start = this.lastStart ? this.lastStart : 0;

    this.listDummys[choice].setTexture(TEXTURE.ARROW_B_R);
    this.renderDesc(this.items[choice + this.start].key);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback((key) => {
      let prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            if (choice > 0) {
              choice--;
            } else if (this.start > 0) {
              prevChoice = 1;
              this.start--;
              this.renderWindow();
            }
            break;
          case KEY.DOWN:
            if (choice < Math.min(this.ITEMS_PER_PAGE, this.items.length) - 1) {
              choice++;
            } else if (this.start + this.ITEMS_PER_PAGE < this.items.length) {
              prevChoice = this.ITEMS_PER_PAGE - 2;
              this.start++;
              this.renderWindow();
            }
            break;
          case KEY.SELECT:
            const target = this.items[choice + this.start];
            this.lastChoice = choice;
            this.lastStart = this.start;
            this.shopChoiceUi.show({ npc: this.npc, item: target });
            break;
          case KEY.CANCEL:
            this.listDummys[choice].setTexture(TEXTURE.BLANK);
            this.clean();
            this.mode.popUiStack();
            break;
        }
        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            this.renderDesc(this.items[choice + this.start].key);
            this.listDummys[prevChoice].setTexture(TEXTURE.BLANK);
            this.listDummys[choice].setTexture(TEXTURE.ARROW_B_R);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private cleanWindow() {
    if (this.listContainer) {
      this.listContainer.removeAll(true);
    }

    this.listNames.forEach((text) => text.destroy());
    this.listPrices.forEach((text) => text.destroy());
    this.listDummys.forEach((image) => image.destroy());

    this.listNames = [];
    this.listPrices = [];
    this.listDummys = [];
  }

  private renderWindow() {
    const point = 620;
    const calcHeight = (this.ITEMS_PER_PAGE * (this.contentHeight + this.contentSpacing)) / this.scale;

    let currentY = 0;

    this.cleanWindow();

    this.window.setSize(this.windowWidth / this.scale, calcHeight);
    this.window.setPosition(0, calcHeight);

    const visibleItems = this.items.slice(this.start, this.start + this.ITEMS_PER_PAGE);

    if (this.start <= 0) this.arrowUp.setVisible(false);
    if (this.start > 0) this.arrowUp.setVisible(true);

    if (this.start + this.ITEMS_PER_PAGE >= this.items.length) this.arrowDown.setVisible(false);
    else this.arrowDown.setVisible(true);

    for (const item of visibleItems) {
      const additionalCalc = point - this.ITEMS_PER_PAGE * (this.contentHeight + this.contentSpacing);
      const name = addText(this.scene, -190, currentY + additionalCalc, i18next.t(`item:${item.key}.name`), TEXTSTYLE.ITEM_LIST).setOrigin(0, 0.5);
      const price = addText(this.scene, +120, currentY + additionalCalc, '$ ' + item.price.toString(), TEXTSTYLE.ITEM_LIST).setOrigin(0, 0.5);
      const dummy = addImage(this.scene, TEXTURE.BLANK, -200, currentY + additionalCalc).setScale(1.4);

      this.listNames.push(name);
      this.listPrices.push(price);
      this.listDummys.push(dummy);

      this.listContainer.add(name);
      this.listContainer.add(price);
      this.listContainer.add(dummy);

      currentY += this.contentHeight + this.contentSpacing;
    }
  }

  private getPurchasableItems(): Item[] {
    return getAllItems().filter((item) => item.purchasable);
  }

  private renderDesc(key: string) {
    this.descIcon.setTexture(`item${key}`);
    this.descText.setText(i18next.t(`item:${key}.description`));
  }
}
