import { buyItemApi } from '../api';
import { Event } from '../core/manager/event-manager';
import { getAllItems } from '../data';
import { DEPTH, EVENT, HttpErrorCode, ItemData, KEY, MessageEndDelay, TEXTSTYLE, TEXTURE } from '../enums';
import { KeyboardManager } from '../core/manager/keyboard-manager';
import i18next from '../i18n';
import { InGameScene } from '../scenes/ingame-scene';
import { BuyItemRes, ListForm } from '../types';
import { MenuListUi } from './menu-list-ui';
import { NoticeUi } from './notice-ui';
import { QuestionMessageUi } from './question-message-ui';
import { TalkMessageUi } from './talk-message-ui';
import { Ui } from './ui';
import { Bag } from '../core/storage/bag-storage';
import { replacePercentSymbol } from '../utils/string-util';
import { Option } from '../core/storage/player-option';
import { PlayerGlobal } from '../core/storage/player-storage';
import { ErrorCode } from '../core/errors';
import { OVERWORLD_ZOOM } from '../constants';

export class ShopUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private menuContainer!: Phaser.GameObjects.Container;

  private list: MenuListUi;
  private productList: string[] = [];
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
  private isProcessing: boolean = false;

  private inBagText!: Phaser.GameObjects.Text;
  private buyText!: Phaser.GameObjects.Text;
  private costText!: Phaser.GameObjects.Text;

  private readonly minBuy: number = 1;
  private readonly maxBuy: number = 99;
  private readonly scale: number = 2;
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
    this.productList = data;

    this.talkMessageUi.setup(OVERWORLD_ZOOM);
    this.questionMessageUi.setup(OVERWORLD_ZOOM);
    this.noticeUi.setup(OVERWORLD_ZOOM);

    this.inBag = 0;
    this.buy = this.minBuy;
    this.cost = 0;
    this.items = this.getPurchasableItems(data);

    this.container = this.createContainer(width / 2, height / 2);

    this.list.setup({ scale: 1.2, etcScale: 2, windowWidth: 470, offsetX: +48, offsetY: +70, depth: DEPTH.MENU + 1, per: 9, info: [], window: TEXTURE.BLANK });

    this.screen = this.addImage(TEXTURE.SHOP_SCREEN, +70, 0);
    this.screen.setScale(1.9);

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

    this.descUi.hide();
    return 'cancel';
  }

  private promptForQuantity(item: ItemData): Promise<'purchased' | 'cancel'> {
    return new Promise((resolve) => {
      const keyboard = KeyboardManager.getInstance();
      const keys = [KEY.ARROW_UP, KEY.ARROW_DOWN, KEY.ARROW_LEFT, KEY.ARROW_RIGHT, KEY.Z, KEY.X, KEY.ENTER, KEY.ESC];

      const bag = Bag.getItem(item.key);
      this.buy = this.minBuy;

      this.inBagText.setText(bag ? bag.getStock().toString() : '0');
      this.menuContainer.setVisible(true);
      this.renderMenu(item);

      keyboard.setAllowKey(keys);
      keyboard.setKeyDownCallback(async (key) => {
        if (this.isProcessing) return;

        switch (key) {
          case KEY.ARROW_UP:
            this.changeBuy(1);
            break;
          case KEY.ARROW_DOWN:
            this.changeBuy(-1);
            break;
          case KEY.ARROW_LEFT:
            this.changeBuy(-10);
            break;
          case KEY.ARROW_RIGHT:
            this.changeBuy(10);
            break;
          case KEY.ENTER:
          case KEY.Z:
            this.isProcessing = true;
            this.menuContainer.setVisible(false);
            await this.questionMessageUi
              .show({
                type: 'default',
                content: replacePercentSymbol(i18next.t(`npc:shop_1`), [i18next.t(`item:${item.key}.name`), this.buy, item.price * this.buy]),
                speed: Option.getTextSpeed()!,
                yes: async () => {
                  const ret = await buyItemApi({ item: item.key, stock: this.buy });

                  if (ret?.result) {
                    const data = ret.data as BuyItemRes;
                    PlayerGlobal.updateData({ candy: data.candy });
                    Bag.addItems(data.idx, data.item, data.stock, data.category);
                    Bag.getItem(item.key)?.setStock(data.stock);

                    await this.talkMessageUi.show({
                      type: 'default',
                      content: i18next.t('npc:shop_2'),
                      speed: Option.getTextSpeed()!,
                      endDelay: MessageEndDelay.DEFAULT,
                    });
                    resolve('purchased');
                  } else {
                    if (ret?.data === ErrorCode.NOT_ENOUGH_CANDY) {
                      await this.talkMessageUi.show({
                        type: 'default',
                        content: i18next.t('npc:shop_3'),
                        speed: Option.getTextSpeed()!,
                        endDelay: MessageEndDelay.DEFAULT,
                      });
                    } else if (ret?.data === ErrorCode.INGAME_ITEM_STOCK_LIMIT_EXCEEDED) {
                      await this.noticeUi.show({ content: i18next.t('message:warn_max_stock'), window: TEXTURE.WINDOW_NOTICE_0 });
                    } else if (ret?.data === ErrorCode.NOT_PURCHASABLE_INGAME_ITEM) {
                      await this.noticeUi.show({ content: i18next.t('message:warn_not_purchasable_item'), window: TEXTURE.WINDOW_NOTICE_0 });
                    }
                    resolve('cancel');
                  }
                },
                no: async () => {
                  resolve('cancel');
                },
              })
              .finally(() => {
                this.isProcessing = false;
              });
            break;
          case KEY.ESC:
          case KEY.X:
            this.menuContainer.setVisible(false);
            resolve('cancel');
            break;
        }
        if ([KEY.ARROW_UP, KEY.ARROW_DOWN, KEY.ARROW_LEFT, KEY.ARROW_RIGHT].includes(key)) {
          this.renderMenu(item);
        }
      });
    });
  }

  protected onClean(): void {
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
    this.menuContainer = this.createTrackedContainer(width / 2, height / 2 + 110);

    const inBagWindow = this.addWindow(TEXTURE.WINDOW_MENU, -400, 0, 180 / this.scale, 110 / this.scale, 16, 16, 16, 16);
    inBagWindow.setScale(this.scale);
    const inBagIcon = this.addImage(TEXTURE.ICON_BAG_M, -440, 0);
    inBagIcon.setScale(2);
    const inBagTextSymbol = this.addText(-400, 0, 'x', TEXTSTYLE.DEFAULT_BLACK);
    this.inBagText = this.addText(-380, 0, `${this.inBag}`, TEXTSTYLE.DEFAULT_BLACK).setOrigin(0, 0.5);
    const costWindow = this.addWindow(TEXTURE.WINDOW_MENU, -140, 0, 330 / this.scale, 110 / this.scale, 16, 16, 16, 16);
    costWindow.setScale(this.scale);
    const buySymbol = this.addText(-260, 0, 'x', TEXTSTYLE.DEFAULT_BLACK);
    this.buyText = this.addText(-220, 0, `${this.buy}`, TEXTSTYLE.DEFAULT_BLACK);
    const buyArrowDown = this.addImage(TEXTURE.ARROW_R, -220, -30).setFlipY(true);
    const buyArrowUp = this.addImage(TEXTURE.ARROW_R, -220, 30);
    const costIcon = this.addImage(TEXTURE.ICON_CANDY, -150, 0).setScale(2.4);
    const costSymbol = this.addText(-110, 0, 'x', TEXTSTYLE.DEFAULT_BLACK);
    this.costText = this.addText(-90, 0, `${this.cost}`, TEXTSTYLE.DEFAULT_BLACK);
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

    this.container = this.createContainer(width / 2, height / 2 + 270);

    this.icon = this.addImage(`item000`, -395, 0);
    this.text = this.addText(-310, -40, '', TEXTSTYLE.MESSAGE_WHITE);

    this.icon.setScale(1.5);
    this.text.setOrigin(0, 0);
    this.text.setScale(0.6);

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

  protected onClean(): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any) {
    const item = this.items[data];

    if (!item) return;

    this.icon.setTexture(`item${item.key}`);
    this.text.setText(i18next.t(`item:${item.key}.description`));
  }

  hide(): void {
    this.container.setVisible(false);
  }

  update(time?: number, delta?: number): void {}
}
