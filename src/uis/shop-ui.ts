import i18next from 'i18next';
import { getAllItems, Item } from '../data/items';
import { DEPTH } from '../enums/depth';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { ListForm } from '../types';
import { ListUi } from './list-ui';
import { addImage, addText, addWindow, Ui } from './ui';
import { KEY } from '../enums/key';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import { Bag } from '../storage/bag';
import { eventBus } from '../core/event-bus';
import { EVENT } from '../enums/event';
import { replacePercentSymbol } from '../utils/string-util';
import { buyItemApi } from '../api';
import { PlayerInfo } from '../storage/player-info';
import { MODE } from '../enums/mode';

export class ShopUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private menuContainer!: Phaser.GameObjects.Container;

  private list: ListUi;
  private descUi: ShopDescUi;
  private targetItem!: Item;
  private buy!: number;
  private cost!: number;
  private inBag!: number;
  private items: Item[] = [];

  private inBagText!: Phaser.GameObjects.Text;
  private buyText!: Phaser.GameObjects.Text;
  private costText!: Phaser.GameObjects.Text;

  private readonly minBuy: number = 1;
  private readonly maxBuy: number = 99;
  private readonly scale: number = 2.4;
  private readonly descWindowWidth = 1238;
  private readonly descWindowHeight = 160;

  constructor(scene: InGameScene) {
    super(scene);
    this.descUi = new ShopDescUi(scene);
    this.list = new ListUi(scene, this.descUi);

    eventBus.on(EVENT.PURCHASE_NO_ITEM, () => {
      this.handleKeyInput();
    });

    eventBus.on(EVENT.PURCHASE_YES_ITEM, async () => {
      const ret = await buyItemApi({ item: this.targetItem.key, stock: this.buy });

      if (ret?.success) {
        const playerInfo = PlayerInfo.getInstance();
        const bag = Bag.getInstance();

        playerInfo.setCandy(ret.data.candy);
        bag.addItems(ret.data.item, ret.data.stock, ret.data.category);

        eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, [
          {
            type: 'default',
            format: 'talk',
            content: i18next.t(`npc:npc002_2`),
            speed: 10,
          },
          {
            type: 'default',
            format: 'talk',
            content: replacePercentSymbol(i18next.t(`message:putPocket`), [
              PlayerInfo.getInstance().getNickname(),
              i18next.t(`item:${this.targetItem.key}.name`),
              i18next.t(`menu:${ret.data.category}`),
            ]),
            speed: 10,
            end: EVENT.PURCHASE_SUCCESS_ITEM,
          },
        ]);
      }
    });

    eventBus.on(EVENT.PURCHASE_SUCCESS_ITEM, () => {
      this.handleKeyInput();
      eventBus.emit(EVENT.HUD_CANDY_UPDATE);
    });
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.inBag = 0;
    this.buy = this.minBuy;
    this.cost = 0;
    this.items = this.getPurchasableItems();

    this.list.setupInfo(400, +35, +315, this.createListForm(), 12, 385, 1.5);

    this.descUi.setup(this.items);
    this.setupMenu(width, height);

    this.menuContainer.setVisible(false);
    this.menuContainer.setDepth(DEPTH.MENU + 1);
    this.menuContainer.setScrollFactor(0);
  }

  show(data?: any): void {
    this.list.show();
    this.descUi.show();

    this.handleKeyInput();
  }

  clean(data?: any): void {}

  pause(onoff: boolean, data?: any): void {}

  async handleKeyInput(data?: any) {
    const ret = await this.list.handleKeyInput();

    if (typeof ret === 'number' && ret >= 0) {
      this.handleMenuKeyInput(this.items[ret]);
    } else if (ret === i18next.t('menu:cancelMenu')) {
      this.descUi.clean();
      eventBus.emit(EVENT.POP_MODE);
      eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, [
        {
          type: 'default',
          format: 'talk',
          content: i18next.t('npc:npc002_4'),
          speed: 10,
        },
      ]);
      eventBus.emit(EVENT.FINISH_TALK);
    }
  }

  private handleMenuKeyInput(item: Item) {
    const keys = [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];
    const keyboard = KeyboardHandler.getInstance();
    const bag = Bag.getInstance().getItem(item.key);
    this.targetItem = item;

    this.buy = this.minBuy;
    this.cost = this.buy * item.price;

    if (bag) this.inBagText.setText(bag.getStock().toString());
    else this.inBagText.setText('0');

    this.menuContainer.setVisible(true);
    this.renderMenu();

    keyboard.setAllowKey(keys);
    keyboard.setKeyDownCallback(async (key) => {
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
            eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, [
              {
                type: 'default',
                format: 'question',
                content: replacePercentSymbol(i18next.t(`npc:npc002_1`), [i18next.t(`item:${item.key}.name`), this.buy, this.cost]),
                speed: 10,
                questionYes: EVENT.PURCHASE_YES_ITEM,
                questionNo: EVENT.PURCHASE_NO_ITEM,
              },
            ]);
            break;
          case KEY.CANCEL:
            this.menuContainer.setVisible(false);
            this.handleKeyInput();
            break;
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  update(time?: number, delta?: number): void {}

  private setupMenu(width: number, height: number) {
    this.menuContainer = this.scene.add.container(width / 2 - 55, height / 2 + 255);

    const inBagWindow = addWindow(this.scene, TEXTURE.WINDOW_2, -435, 0, 280 / this.scale, 120 / this.scale, 16, 16, 16, 16);
    inBagWindow.setScale(this.scale);
    const inBagIcon = addImage(this.scene, TEXTURE.MENU_BAG_BOY, -490, 0);
    inBagIcon.setScale(3);
    const inBagTextSymbol = addText(this.scene, -440, 0, 'x', TEXTSTYLE.DEFAULT_BLACK);
    this.inBagText = addText(this.scene, -420, 0, `${this.inBag}`, TEXTSTYLE.DEFAULT_BLACK).setOrigin(0, 0.5);
    const costWindow = addWindow(this.scene, TEXTURE.WINDOW_2, -105, 0, 345 / this.scale, 120 / this.scale, 16, 16, 16, 16);
    costWindow.setScale(this.scale);
    const buySymbol = addText(this.scene, -225, 0, 'x', TEXTSTYLE.DEFAULT_BLACK);
    this.buyText = addText(this.scene, -190, 0, `${this.buy}`, TEXTSTYLE.DEFAULT_BLACK);
    const buyArrowDown = addImage(this.scene, TEXTURE.ARROW_RED, -190, -30).setFlipY(true);
    const buyArrowUp = addImage(this.scene, TEXTURE.ARROW_RED, -190, 30);
    const costIcon = addImage(this.scene, TEXTURE.MENU_CANDY, -110, 0).setScale(2.4);
    const costSymbol = addText(this.scene, -70, 0, 'x', TEXTSTYLE.DEFAULT_BLACK);
    this.costText = addText(this.scene, -50, 0, `${this.cost}`, TEXTSTYLE.DEFAULT_BLACK);
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

  private getPurchasableItems(): Item[] {
    return getAllItems().filter((item) => item.purchasable);
  }

  private createListForm(): ListForm[] {
    const ret: ListForm[] = [];
    const candyIcon = TEXTURE.MENU_CANDY;

    for (const item of this.items) {
      ret.push({
        name: i18next.t(`item:${item.key}.name`),
        nameImg: '',
        etc: `x${item.price}`,
        etcImg: candyIcon,
      });
    }

    return ret;
  }

  private renderMenu() {
    this.buyText.setText(this.buy.toString());
    this.costText.setText((this.buy * this.cost).toString());
  }

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
}

export class ShopDescUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private items: Item[] = [];
  private icon!: Phaser.GameObjects.Image;
  private text!: Phaser.GameObjects.Text;

  private readonly scale: number = 2.4;
  private readonly descWindowWidth = 1265;
  private readonly descWindowHeight = 170;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    if (data) this.items = data;

    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2 + 420);

    const window = addWindow(this.scene, TEXTURE.WINDOW_2, 0, 0, this.descWindowWidth / this.scale, this.descWindowHeight / this.scale, 16, 16, 16, 16);
    window.setScale(this.scale);
    this.icon = addImage(this.scene, `item000`, -520, 0);
    this.text = addText(this.scene, -440, -55, '', TEXTSTYLE.MESSAGE_BLACK);

    this.icon.setScale(2);
    this.text.setOrigin(0, 0);
    this.text.setScale(0.8);

    this.container.add(window);
    this.container.add(this.icon);
    this.container.add(this.text);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.MENU + 1);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.handleKeyInput(0);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any) {
    const item = this.items[data];

    this.icon.setTexture(`item${item.key}`);
    this.text.setText(i18next.t(`item:${item.key}.description`));
  }

  update(time?: number, delta?: number): void {}
}
