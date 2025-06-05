import i18next from 'i18next';
import { getAllItems, Item } from '../data/items';
import { DEPTH } from '../enums/depth';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes-test';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, playSound, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { KEY } from '../enums/key';
import { KeyboardManager, MessageManager } from '../managers';
import { ShopChoiceUi } from './shop-choice-ui';
import { NpcObject } from '../object/npc-object';
import { Bag } from '../storage/bag';
import { PlayerInfo } from '../storage/player-info';
import { AUDIO } from '../enums/audio';

export class ShopUi extends Ui {
  private mode: OverworldMode;
  private npc!: NpcObject;
  private items: Item[] = [];
  private start!: number;
  private choice!: number;
  private buy!: number;
  private cost!: number;
  private inBag!: number;

  private container!: Phaser.GameObjects.Container;
  private scrollContainer!: Phaser.GameObjects.Container;
  private listContainer!: Phaser.GameObjects.Container;
  private descContainer!: Phaser.GameObjects.Container;
  private menuContainer!: Phaser.GameObjects.Container;

  private listWindow!: Phaser.GameObjects.NineSlice;
  private listNames: Phaser.GameObjects.Text[] = [];
  private listPrices: Phaser.GameObjects.Text[] = [];
  private listDummys: Phaser.GameObjects.NineSlice[] = [];
  private descWindow!: Phaser.GameObjects.NineSlice;
  private descIcon!: Phaser.GameObjects.Image;
  private descText!: Phaser.GameObjects.Text;
  private inBagText!: Phaser.GameObjects.Text;
  private buyText!: Phaser.GameObjects.Text;
  private costText!: Phaser.GameObjects.Text;

  private readonly listWindowWidth = 500;
  private readonly contentHeight = 40;
  private readonly spacing = 5;
  private readonly ItemsPerList = 12;
  private readonly scale = 2.5;
  private readonly descWindowWidth = 1145;
  private readonly descWindowHeight = 160;
  private readonly minBuy: number = 1;
  private readonly maxBuy: number = 99;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);

    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();
    this.start = 0;
    this.inBag = 0;
    this.buy = this.minBuy;
    this.cost = 0;

    this.container = this.scene.add.container(width / 2 + 320, height / 2 + 10);
    this.listContainer = this.scene.add.container(width / 2 + 320, height / 2 - 106.5);
    this.scrollContainer = this.scene.add.container(width / 2 + 320, height / 2 + 10);

    this.setupDesc(width, height);
    this.setupMenu(width, height);

    this.listWindow = addWindow(
      this.scene,
      TEXTURE.WINDOW_5,
      0,
      0,
      this.listWindowWidth / this.scale,
      (this.ItemsPerList * (this.contentHeight + this.spacing) + this.spacing * 15) / this.scale,
      16,
      16,
      16,
      16,
    );

    const hideWindow = addWindow(
      this.scene,
      TEXTURE.WINDOW_8,
      0,
      0,
      this.listWindowWidth / this.scale,
      (this.ItemsPerList * (this.contentHeight + this.spacing) + this.spacing * 15) / this.scale,
      16,
      16,
      16,
      16,
    );

    this.container.add(this.listWindow);

    this.scrollContainer.add(hideWindow);

    this.container.setScale(this.scale);
    this.scrollContainer.setScale(this.scale);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE);
    this.container.setScrollFactor(0);

    this.scrollContainer.setVisible(false);
    this.scrollContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.scrollContainer.setScrollFactor(0);

    this.listContainer.setVisible(false);
    this.listContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.listContainer.setScrollFactor(0);

    this.descContainer.setVisible(false);
    this.descContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.descContainer.setScrollFactor(0);

    this.menuContainer.setVisible(false);
    this.menuContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.menuContainer.setScrollFactor(0);
  }

  show(data?: NpcObject): void {
    if (data) this.npc = data;

    this.container.setVisible(true);
    this.scrollContainer.setVisible(true);
    this.listContainer.setVisible(true);
    this.descContainer.setVisible(true);

    this.items = this.getPurchasableItems();

    this.renderList();
    this.handleKeyInput();
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.scrollContainer.setVisible(false);
    this.listContainer.setVisible(false);
    this.descContainer.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}

  private handleKeyInput() {
    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT, KEY.CANCEL];
    const keyboardManager = KeyboardManager.getInstance();

    this.start = this.start ? this.start : 0;
    this.choice = this.choice ? this.choice : 0;

    this.listDummys[this.choice].setTexture(TEXTURE.WINDOW_6);
    this.updateDesc(this.items[this.choice + this.start]);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback(async (key) => {
      let prevChoice = this.choice;

      try {
        switch (key) {
          case KEY.UP:
            if (this.choice > 0) {
              this.choice--;
            } else if (this.start > 0) {
              prevChoice = 1;
              this.start--;
              this.renderList();
            }
            break;
          case KEY.DOWN:
            if (this.choice < Math.min(this.ItemsPerList, this.items.length) - 1) {
              this.choice++;
            } else if (this.start + this.ItemsPerList < this.items.length) {
              prevChoice = this.ItemsPerList - 2;
              this.start++;
              this.renderList();
            }
            break;
          case KEY.SELECT:
            playSound(this.scene, AUDIO.BAG_SELECT);
            this.menuContainer.setVisible(true);
            this.handleMenuKeyInput(this.items[this.choice + this.start]);
            break;
          case KEY.CANCEL:
            playSound(this.scene, AUDIO.BAG_CLOSE);

            this.mode.popUiStack();
            this.mode.setOverworldUiBlock(false);
            this.clean();
            await this.mode.startMessage(this.npc.reactionScript({ messageType: 'talk', talkType: 'end', etc: null }));
            break;
        }

        if (key === KEY.UP || key === KEY.DOWN) {
          if (this.choice !== prevChoice) {
            playSound(this.scene, AUDIO.BAG_DECISON);
            this.updateDesc(this.items[this.choice + this.start]);
            this.listDummys[prevChoice].setTexture(TEXTURE.BLANK);
            this.listDummys[this.choice].setTexture(TEXTURE.WINDOW_6);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private handleMenuKeyInput(item: Item) {
    const keys = [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];
    const keyboardManager = KeyboardManager.getInstance();
    const bag = Bag.getInstance().getItem(item.key);

    this.inBag = 0;
    this.buy = this.minBuy;
    this.cost = this.buy * item.price;

    if (bag) this.inBagText.setText(bag.getStock().toString());
    else this.inBagText.setText('0');

    this.renderMenu();

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback(async (key) => {
      try {
        switch (key) {
          case KEY.UP:
            this.changeBuy(1);
            break;
          case KEY.DOWN:
            this.changeBuy(-1);
            break;
          case KEY.LEFT:
            this.changeBuy(-10);
            break;
          case KEY.RIGHT:
            this.changeBuy(10);
            break;
          case KEY.SELECT:
            this.menuContainer.setVisible(false);
            await this.mode
              .startMessage(this.npc.reactionScript({ messageType: 'question', talkType: 'action', etc: [`${i18next.t(`item:${item.key}.name`)}`, `${this.buy}`, `${this.buy * this.cost}`] }))
              .then(async (result) => {
                if (result) {
                  const ret = (await this.mode.buyItem(item.key, this.buy)) as any;
                  if (ret === 'not-enough-money') {
                    await this.mode.startMessage(this.npc.reactionScript({ messageType: 'talk', talkType: 'reject', etc: null }));
                  } else if (ret === 'exceed-max-stock') {
                    const message = MessageManager.getInstance();
                    await message.show(this, [{ type: 'sys', format: 'talk', content: i18next.t('message:exceed_max_item') }]);
                  } else {
                    playSound(this.scene, AUDIO.BUY);
                    const bag = Bag.getInstance();
                    PlayerInfo.getInstance().setCandy(ret.candy);
                    bag.removeItem(ret.item);
                    bag.addItems(ret.item, ret.stock, ret.category);
                    this.mode.updateHUDUi();
                    await this.mode.startMessage(this.npc.reactionScript({ messageType: 'talk', talkType: 'accept', etc: null }));
                  }
                }
              });
            this.mode.setOverworldUiBlock(true);
            this.handleKeyInput();
            break;
          case KEY.CANCEL:
            playSound(this.scene, AUDIO.BAG_CLOSE);

            this.menuContainer.setVisible(false);
            this.handleKeyInput();
            break;
        }
        if (key === KEY.UP || key === KEY.DOWN || key === KEY.LEFT || key === KEY.RIGHT) {
          playSound(this.scene, AUDIO.BAG_DECISON);
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private block() {}

  private unblock() {}

  private cleanWindow() {}

  private changeBuy(amount: number) {
    let newBuy = this.buy + amount;

    if (newBuy < this.minBuy) {
      newBuy = this.minBuy;
    } else if (newBuy > this.maxBuy) {
      newBuy = this.maxBuy;
    }

    if (this.buy !== newBuy) {
      this.buy = newBuy;
      this.renderMenu();
    }
  }

  private renderMenu() {
    this.buyText.setText(this.buy.toString());
    this.costText.setText((this.buy * this.cost).toString());
  }

  private renderList() {
    const point = 410;
    let currentY = 0;

    this.cleanList();

    const visibleItems = this.items.slice(this.start, this.start + this.ItemsPerList);

    const beforeItem = this.items[this.start - 1];
    const afterItem = this.items[this.start + this.ItemsPerList];
    const adjustPosY = point - this.ItemsPerList * (this.contentHeight + this.spacing);

    if (beforeItem) {
      const [name, price, dummy, icon] = this.createListWindow(beforeItem, -175);

      this.listContainer.add(name);
      this.listContainer.add(price);
      this.listContainer.add(dummy);
      this.listContainer.add(icon);
    }

    if (afterItem) {
      const [name, price, dummy, icon] = this.createListWindow(afterItem, +410);

      this.listContainer.add(name);
      this.listContainer.add(price);
      this.listContainer.add(dummy);
      this.listContainer.add(icon);
    }

    for (const item of visibleItems) {
      const [name, price, dummy, icon] = this.createListWindow(item, currentY + adjustPosY) as [
        Phaser.GameObjects.Text,
        Phaser.GameObjects.Text,
        Phaser.GameObjects.NineSlice,
        Phaser.GameObjects.Image,
      ];

      this.listNames.push(name);
      this.listPrices.push(price);
      this.listDummys.push(dummy);

      this.listContainer.add(name);
      this.listContainer.add(price);
      this.listContainer.add(dummy);
      this.listContainer.add(icon);

      currentY += this.contentHeight + this.spacing;
    }
  }

  private createListWindow(item: Item, y: number) {
    const name = addText(this.scene, -220, y, i18next.t(`item:${item.key}.name`), TEXTSTYLE.ITEM_LIST).setOrigin(0, 0.5);
    const price = addText(this.scene, +170, y, 'x' + item.price.toString(), TEXTSTYLE.ITEM_LIST).setOrigin(0, 0.5);
    const dummy = addWindow(this.scene, TEXTURE.BLANK, -1, y, (this.listWindowWidth - 25) / this.scale, (this.contentHeight + this.spacing) / this.scale, 16, 16, 16, 16).setScale(this.scale);
    const icon = addImage(this.scene, TEXTURE.MENU_CANDY, +150, y).setScale(2);

    return [name, price, dummy, icon];
  }

  private setupDesc(width: number, height: number) {
    this.descContainer = this.scene.add.container(width / 2, height / 2 + 420);

    this.descWindow = addWindow(this.scene, TEXTURE.WINDOW_5, 0, 0, this.descWindowWidth / this.scale, this.descWindowHeight / this.scale, 16, 16, 16, 16);
    this.descWindow.setScale(this.scale);
    this.descIcon = addImage(this.scene, `item001`, -480, 0).setScale(1.8);
    this.descText = addText(this.scene, -410, -45, '', TEXTSTYLE.DEFAULT_BLACK).setOrigin(0, 0);

    this.descContainer.add(this.descWindow);
    this.descContainer.add(this.descIcon);
    this.descContainer.add(this.descText);
  }

  private setupMenu(width: number, height: number) {
    this.menuContainer = this.scene.add.container(width / 2, height / 2 + 260);

    const inBagWindow = addWindow(this.scene, TEXTURE.WINDOW_5, -445, 0, 250 / this.scale, 116 / this.scale, 16, 16, 16, 16);
    inBagWindow.setScale(this.scale);
    const inBagIcon = addImage(this.scene, TEXTURE.MENU_BAG_BOY, -500, 0);
    inBagIcon.setScale(3);
    const inBagTextSymbol = addText(this.scene, -450, 0, 'x', TEXTSTYLE.DEFAULT_BLACK);
    this.inBagText = addText(this.scene, -430, 0, `x ${this.inBag}`, TEXTSTYLE.DEFAULT_BLACK).setOrigin(0, 0.5);
    const costWindow = addWindow(this.scene, TEXTURE.WINDOW_5, -125, 0, 345 / this.scale, 116 / this.scale, 16, 16, 16, 16);
    costWindow.setScale(this.scale);
    const buySymbol = addText(this.scene, -245, 0, 'x', TEXTSTYLE.DEFAULT_BLACK);
    this.buyText = addText(this.scene, -210, 0, `${this.buy}`, TEXTSTYLE.DEFAULT_BLACK);
    const buyArrowDown = addImage(this.scene, TEXTURE.ARROW_RED, -210, -30).setFlipY(true);
    const buyArrowUp = addImage(this.scene, TEXTURE.ARROW_RED, -210, 30);
    const costIcon = addImage(this.scene, TEXTURE.MENU_CANDY, -130, 0).setScale(2.4);
    const costSymbol = addText(this.scene, -90, 0, 'x', TEXTSTYLE.DEFAULT_BLACK);
    this.costText = addText(this.scene, -70, 0, `${this.cost}`, TEXTSTYLE.DEFAULT_BLACK);
    this.costText.setOrigin(0, 0.5);

    this.menuContainer.add(inBagWindow);
    this.menuContainer.add(costWindow);
    this.menuContainer.add(inBagIcon);
    this.menuContainer.add(inBagTextSymbol);
    this.menuContainer.add(this.inBagText);
    this.menuContainer.add(this.buyText);
    this.menuContainer.add(buySymbol);
    this.menuContainer.add(buyArrowUp);
    this.menuContainer.add(buyArrowDown);
    this.menuContainer.add(costIcon);
    this.menuContainer.add(costSymbol);
    this.menuContainer.add(this.costText);
  }

  private updateDesc(item: Item) {
    this.descIcon.setTexture(`item${item.key}`);
    this.descText.setText(i18next.t(`item:${item.key}.description`));
  }

  private cleanList() {
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

  private getPurchasableItems(): Item[] {
    return getAllItems().filter((item) => item.purchasable);
  }
}
