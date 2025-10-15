import { buyItemApi } from '../api';
import { eventBus } from '../core/event-bus';
import { GM } from '../core/game-manager';
import { getAllItems } from '../data';
import { DEPTH, EVENT, HttpErrorCode, ItemData, KEY, TEXTSTYLE, TEXTURE } from '../enums';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import i18next from '../i18n';
import { InGameScene } from '../scenes/ingame-scene';
import { BagStorage } from '../storage';
import { BuyItemRes, ListForm } from '../types';
import { replacePercentSymbol } from '../utils/string-util';
import { MenuListUi } from './menu-list-ui';
import { NoticeUi } from './notice-ui';
import { QuestionMessageUi } from './question-message-ui';
import { TalkMessageUi } from './talk-message-ui';
import { addImage, addText, addWindow, Ui } from './ui';

export class ShopUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private menuContainer!: Phaser.GameObjects.Container;

  private list: MenuListUi;
  private descUi: ShopDescUi;
  private talkMessageUi: TalkMessageUi;
  private questionMessageUi: QuestionMessageUi;
  private noticeUi: NoticeUi;
  private targetItem!: ItemData;
  private buy!: number;
  private cost!: number;
  private inBag!: number;
  private items: ItemData[] = [];
  private screen!: Phaser.GameObjects.Image;

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
    this.list = new MenuListUi(scene, this.descUi);
    this.talkMessageUi = new TalkMessageUi(scene);
    this.questionMessageUi = new QuestionMessageUi(scene);
    this.noticeUi = new NoticeUi(scene);
  }

  setup(data: string[]): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.talkMessageUi.setup();
    this.questionMessageUi.setup();
    this.noticeUi.setup();

    this.inBag = 0;
    this.buy = this.minBuy;
    this.cost = 0;
    this.items = this.getPurchasableItems(data);

    this.container = this.createContainer(width / 2, height / 2);

    this.list.setup({ scale: 1.5, etcScale: 2, windowWidth: 550, offsetX: +100, offsetY: +100, depth: DEPTH.MENU + 1, per: 10, info: [], window: TEXTURE.BLANK });

    this.screen = addImage(this.scene, TEXTURE.SHOP_SCREEN, +120, 0);
    this.screen.setScale(2.8);

    this.descUi.setup(this.items);
    this.setupMenu(width, height);

    this.container.add(this.screen);

    this.menuContainer.setVisible(false);
    this.menuContainer.setDepth(DEPTH.MENU + 1);
    this.menuContainer.setScrollFactor(0);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.MENU);
    this.container.setScrollFactor(0);
  }

  async show(data?: any): Promise<'cancel'> {
    this.descUi.show();
    this.container.setVisible(true);
    this.list.updateInfo(this.createListForm());

    while (true) {
      const selectedItemIndex = await this.list.handleKeyInput();

      if (typeof selectedItemIndex !== 'number' || selectedItemIndex < 0) {
        this.container.setVisible(false);
        break;
      }

      const selectedItem = this.items[selectedItemIndex];

      const buyResult = await this.promptForQuantity(selectedItem);
    }

    this.descUi.clean();
    return 'cancel';
  }

  private promptForQuantity(item: ItemData): Promise<'purchased' | 'cancel'> {
    return new Promise((resolve) => {
      const keyboard = KeyboardHandler.getInstance();
      const keys = [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];

      const bag = BagStorage.getInstance().getItem(item.key);
      this.buy = this.minBuy;

      this.inBagText.setText(bag ? bag.getStock().toString() : '0');
      this.menuContainer.setVisible(true);
      this.renderMenu(item);

      keyboard.setAllowKey(keys);
      keyboard.setKeyDownCallback(async (key) => {
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
            await this.questionMessageUi.show({
              type: 'default',
              content: replacePercentSymbol(i18next.t(`npc:npc002_1`), [i18next.t(`item:${item.key}.name`), this.buy, item.price * this.buy]),
              speed: GM.getUserOption()?.getTextSpeed()!,
              yes: async () => {
                const ret = await buyItemApi({ item: item.key, stock: this.buy });

                console.log(ret);

                if (ret?.result) {
                  const data = ret.data as BuyItemRes;

                  GM.updateUserData({ candy: data.candy });
                  eventBus.emit(EVENT.HUD_CANDY_UPDATE);
                  BagStorage.getInstance().addItems(data.idx, data.item, data.stock, data.category);

                  await this.talkMessageUi.show({
                    type: 'default',
                    content: i18next.t('npc:npc002_2'),
                    speed: GM.getUserOption()?.getTextSpeed()!,
                  });

                  console.log('??');

                  resolve('purchased');
                } else {
                  if (ret?.data === HttpErrorCode.NOT_ENOUGH_CANDY) {
                    await this.talkMessageUi.show({
                      type: 'default',
                      content: i18next.t('npc:npc002_3'),
                      speed: GM.getUserOption()?.getTextSpeed()!,
                    });
                  } else if (ret?.data === HttpErrorCode.INGAME_ITEM_STOCK_LIMIT_EXCEEDED) {
                    await this.noticeUi.show([{ content: i18next.t('message:warn_max_stock') }]);
                  } else if (ret?.data === HttpErrorCode.NOT_PURCHASABLE_INGAME_ITEM) {
                    await this.noticeUi.show([{ content: i18next.t('message:warn_not_purchasable_item') }]);
                  }
                  resolve('cancel');
                }
              },
              no: async () => {
                resolve('cancel');
              },
            });
            break;
          case KEY.CANCEL:
            this.menuContainer.setVisible(false);
            resolve('cancel');
            break;
        }
        if ([KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT].includes(key)) {
          this.renderMenu(item);
        }
      });
    });
  }

  clean(data?: any): void {
    this.talkMessageUi.clean();
    this.questionMessageUi.clean();
    this.noticeUi.clean();
    this.list.clean();
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  private setupMenu(width: number, height: number) {
    this.menuContainer = this.scene.add.container(width / 2 - 35, height / 2 + 165);

    const inBagWindow = addWindow(this.scene, TEXTURE.WINDOW_MENU, -435, 0, 280 / this.scale, 120 / this.scale, 16, 16, 16, 16);
    inBagWindow.setScale(this.scale);
    const inBagIcon = addImage(this.scene, TEXTURE.ICON_BAG_M, -490, 0);
    inBagIcon.setScale(3);
    const inBagTextSymbol = addText(this.scene, -440, 0, 'x', TEXTSTYLE.DEFAULT_BLACK);
    this.inBagText = addText(this.scene, -420, 0, `${this.inBag}`, TEXTSTYLE.DEFAULT_BLACK).setOrigin(0, 0.5);
    const costWindow = addWindow(this.scene, TEXTURE.WINDOW_MENU, -105, 0, 345 / this.scale, 120 / this.scale, 16, 16, 16, 16);
    costWindow.setScale(this.scale);
    const buySymbol = addText(this.scene, -225, 0, 'x', TEXTSTYLE.DEFAULT_BLACK);
    this.buyText = addText(this.scene, -190, 0, `${this.buy}`, TEXTSTYLE.DEFAULT_BLACK);
    const buyArrowDown = addImage(this.scene, TEXTURE.ARROW_R, -190, -30).setFlipY(true);
    const buyArrowUp = addImage(this.scene, TEXTURE.ARROW_R, -190, 30);
    const costIcon = addImage(this.scene, TEXTURE.ICON_CANDY, -110, 0).setScale(2.4);
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

  private getPurchasableItems(targets: string[]): ItemData[] {
    return getAllItems().filter((item) => targets.includes(item.key) && item.purchasable);
  }

  private createListForm(): ListForm[] {
    const ret: ListForm[] = [];
    const candyIcon = TEXTURE.ICON_CANDY;

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

  private renderMenu(item: ItemData) {
    this.buyText.setText(this.buy.toString());
    this.costText.setText((this.buy * item.price).toString());
  }

  private changeBuy(amount: number) {
    let newBuy = this.buy + amount;
    newBuy = Math.max(this.minBuy, Math.min(newBuy, this.maxBuy));
    this.buy = newBuy;
  }
}

export class ShopDescUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private items: ItemData[] = [];
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

    this.container = this.createContainer(width / 2 - 200, height / 2 + 400);

    this.icon = addImage(this.scene, `item000`, -365, 0);
    this.text = addText(this.scene, -250, -65, '', TEXTSTYLE.MESSAGE_WHITE);

    this.icon.setScale(2);
    this.text.setOrigin(0, 0);
    this.text.setScale(1);

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

    if (!item) return;

    this.icon.setTexture(`item${item.key}`);
    this.text.setText(i18next.t(`item:${item.key}.description`));
  }

  update(time?: number, delta?: number): void {}
}
