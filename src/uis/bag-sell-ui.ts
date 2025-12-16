import { sellItemApi } from '../api';
import { ErrorCode } from '../core/errors';
import { Event } from '../core/manager/event-manager';
import { Game } from '../core/manager/game-manager';
import { Keyboard } from '../core/manager/keyboard-manager';
import { Bag } from '../core/storage/bag-storage';
import { Option } from '../core/storage/player-option';
import { PlayerGlobal } from '../core/storage/player-storage';
import { getItemData, ItemData } from '../data';
import { AUDIO, DEPTH, EVENT, ItemCategory, KEY, MessageEndDelay, TEXTSTYLE, TEXTURE, UI } from '../enums';
import i18next from '../i18n';
import { PlayerItem } from '../obj/player-item';
import { InGameScene } from '../scenes/ingame-scene';
import { ListForm, SellItemRes } from '../types';
import { replacePercentSymbol } from '../utils/string-util';
import { BagBaseUi } from './bag-base-ui';
import { DummyMessageUi } from './dummy-message-ui';
import { MenuListUi } from './menu-list-ui';
import { QuestionMessageUi } from './question-message-ui';
import { TalkMessageUi } from './talk-message-ui';
import { playEffectSound, Ui } from './ui';

export class BagSellUi extends BagBaseUi {
  private list!: MenuListUi;
  private items: PlayerItem[] = [];
  private currentPage: number = 0;
  private sellMenuUi!: BagSellMenuUi;

  constructor(scene: InGameScene) {
    super(scene);

    this.list = new MenuListUi(scene, this.descUi);
    this.sellMenuUi = new BagSellMenuUi(scene);
  }

  setup(data?: any): void {
    super.setup();

    this.list.setup({ scale: 2, etcScale: 2, windowWidth: 590, offsetX: -240, offsetY: +130, depth: DEPTH.MENU + 1, per: 9, info: [], window: TEXTURE.BLANK, isAllowLRCancel: true });
    this.sellMenuUi.setup();
  }

  async show(data?: any): Promise<void> {
    super.show();

    this.getItems(0);

    this.descUi.show(this.items);
    await this.handleKeyInput();
  }

  async handleKeyInput(...data: any[]): Promise<void> {
    this.list.updateInfo(this.createListForm());

    while (true) {
      Keyboard.setKeyDownCallback(() => {});
      try {
        const selectedItemIndex = await this.list.handleKeyInput();

        if (typeof selectedItemIndex !== 'number' || selectedItemIndex < 0) {
          if (typeof selectedItemIndex === 'string' && selectedItemIndex === 'cancelL') {
            const prevPage = this.currentPage;
            this.currentPage = this.currentPage > 0 ? this.currentPage - 1 : this.pocketTitles.length - 1;
            this.runSwitchPocketAnimation(prevPage, this.currentPage);
            this.getItems(this.currentPage);
            this.list.updateInfo(this.createListForm());
            this.descUi.show(this.items);
            continue;
          } else if (typeof selectedItemIndex === 'string' && selectedItemIndex === 'cancelR') {
            const prevPage = this.currentPage;
            this.currentPage = this.currentPage < this.pocketTitles.length - 1 ? this.currentPage + 1 : 0;
            this.runSwitchPocketAnimation(prevPage, this.currentPage);
            this.getItems(this.currentPage);
            this.list.updateInfo(this.createListForm());
            this.descUi.show(this.items);
            continue;
          } else if (typeof selectedItemIndex === 'string' && selectedItemIndex === i18next.t('menu:cancelMenu')) {
            this.runSwitchPocketAnimation(this.currentPage, 0);
            Keyboard.clearCallbacks();
            await Game.removeUi(UI.BAG_SELL);
            return;
          }
        } else {
          const item = this.items[selectedItemIndex];
          await this.sellMenuUi.show(item);
          this.getItems(this.currentPage);
          this.list.updateInfo(this.createListForm());
          this.list.show();
          this.descUi.updateData(this.items, selectedItemIndex);
          Keyboard.setKeyDownCallback(() => {});
          continue;
        }
      } catch (error) {
        console.error('Error in BagSellUi handleKeyInput:', error);
        throw error;
      }
    }
  }

  protected onClean(): void {
    super.onClean();

    Event.emit(EVENT.ENABLE_DAY_NIGHT_FILTER);

    Keyboard.clearCallbacks();

    this.currentPage = 0;
    this.items = [];

    if (this.descUi) {
      this.descUi.clean();
    }
    if (this.list) {
      this.list.clean();
    }
  }

  private getItems(current: number) {
    switch (current) {
      case 0:
        this.items = Bag.getCategory(ItemCategory.POKEBALL);
        break;
      case 1:
        this.items = Bag.getCategory(ItemCategory.ETC);
        break;
      case 2:
        this.items = Bag.getCategory(ItemCategory.BERRY);
        break;
      case 3:
        this.items = Bag.getCategory(ItemCategory.TM_HM);
        break;
      case 4:
        this.items = Bag.getCategory(ItemCategory.KEY);
        break;
    }

    this.items = this.items.filter((item) => {
      const info = getItemData(item.getKey());
      return info?.sellable === true;
    });
  }

  private createListForm(): ListForm[] {
    const ret: ListForm[] = [];
    const candyIcon = TEXTURE.BLANK;

    for (const item of this.items) {
      ret.push({
        name: i18next.t(`item:${item.getKey()}.name`),
        nameImg: '',
        etc: `x${item.getStock()}`,
        etcImg: candyIcon,
      });
    }

    return ret;
  }
}

export class BagSellMenuUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private menuContainer!: Phaser.GameObjects.Container;
  private quistion: QuestionMessageUi;
  private talk: TalkMessageUi;
  private message: DummyMessageUi;

  private yourMoneyText!: Phaser.GameObjects.Text;
  private sellText!: Phaser.GameObjects.Text;
  private countText!: Phaser.GameObjects.Text;
  private costText!: Phaser.GameObjects.Text;
  private sellIcon!: Phaser.GameObjects.Image;
  private isProcessing: boolean = false;

  private sell!: number;
  private maxSell: number = 999;
  private readonly minSell: number = 1;

  private readonly scale: number = 2;

  constructor(scene: InGameScene) {
    super(scene);

    this.quistion = new QuestionMessageUi(scene);
    this.message = new DummyMessageUi(scene);
    this.talk = new TalkMessageUi(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.quistion.setup();
    this.talk.setup();
    this.message.setup();

    this.container = this.createTrackedContainer(width / 2, height / 2);

    const bg = this.addBackground(TEXTURE.BG_BLACK).setOrigin(0.5, 0.5).setAlpha(0.5);
    this.container.add(bg);

    this.setupMenu(width, height);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.MENU + 1);
    this.container.setScrollFactor(0);

    this.menuContainer.setVisible(false);
    this.menuContainer.setDepth(DEPTH.MENU + 2);
    this.menuContainer.setScrollFactor(0);
  }

  async show(data: PlayerItem): Promise<void> {
    this.container.setVisible(true);
    this.menuContainer.setVisible(true);

    this.message.show(replacePercentSymbol(i18next.t('npc:shop_5'), [i18next.t(`item:${data.getKey()}.name`)]));
    this.sellIcon.setTexture(data.getKey());

    await this.promptForQuantity(data);
  }

  protected onClean(): void {
    this.container.setVisible(false);
    this.menuContainer.setVisible(false);

    this.quistion.clean();
    this.message.clean();
    this.talk.clean();
  }

  hide(): void {
    this.container.setVisible(false);
    this.menuContainer.setVisible(false);
    this.message.hide();
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  private async promptForQuantity(item: PlayerItem) {
    return new Promise<void>((resolve) => {
      const keys = [KEY.ARROW_UP, KEY.ARROW_DOWN, KEY.ARROW_LEFT, KEY.ARROW_RIGHT, KEY.Z, KEY.X, KEY.ENTER, KEY.ESC];
      const itemInfo = getItemData(item.getKey())!;

      this.sell = this.minSell;
      this.maxSell = item.getStock();
      this.yourMoneyText.text = ` ${PlayerGlobal.getData()?.money}`;
      this.countText.text = `${this.sell}`;
      this.costText.text = ` ${itemInfo.sellPrice}`;

      Keyboard.setAllowKey(keys);
      Keyboard.setKeyDownCallback(async (key) => {
        if (this.isProcessing) return;

        switch (key) {
          case KEY.ARROW_UP:
            this.changeSell(1);
            break;
          case KEY.ARROW_DOWN:
            this.changeSell(-1);
            break;
          case KEY.ARROW_LEFT:
            this.changeSell(-10);
            break;
          case KEY.ARROW_RIGHT:
            this.changeSell(10);
            break;
          case KEY.ENTER:
          case KEY.Z:
            this.isProcessing = true;
            this.menuContainer.setVisible(false);

            this.hide();

            await this.quistion.show({
              type: 'default',
              content: replacePercentSymbol(i18next.t('npc:shop_6'), [this.sell * itemInfo.sellPrice]),
              speed: Option.getTextSpeed()!,
              yes: async () => {
                const ret = await sellItemApi({ item: item.getKey(), stock: this.sell });

                if (ret?.result) {
                  const data = ret.data as SellItemRes;
                  PlayerGlobal.updateData({ money: data.money });

                  if (data.stock <= 0) Bag.removeItem(item.getKey());
                  else Bag.getItem(item.getKey())?.setStock(data.stock);

                  await this.talk.show({ type: 'default', content: i18next.t('npc:shop_2'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
                } else {
                  if (ret?.data === ErrorCode.NOT_SELLABLE_INGAME_ITEM) {
                    await this.talk.show({ type: 'default', content: i18next.t('message:warn_not_sellable_item'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
                  } else if (ret?.data === ErrorCode.NOT_FOUND_INGAME_ITEM) {
                    await this.talk.show({ type: 'default', content: i18next.t('message:warn_not_found_ingame_item'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
                  }
                }
                this.isProcessing = false;
                resolve();
              },
              no: async () => {
                this.isProcessing = false;
                resolve();
              },
            });
            break;
          case KEY.ESC:
          case KEY.X:
            this.container.setVisible(false);
            this.menuContainer.setVisible(false);
            this.message.hide();
            resolve();
        }

        if ([KEY.ARROW_UP, KEY.ARROW_DOWN, KEY.ARROW_LEFT, KEY.ARROW_RIGHT].includes(key)) {
          playEffectSound(this.scene, AUDIO.SELECT_0);
          this.render(itemInfo);
        }
      });

      this.menuContainer.setVisible(true);
      this.container.setVisible(true);
    });
  }

  private setupMenu(width: number, height: number): void {
    const windowScale = 4;

    this.menuContainer = this.createTrackedContainer(width / 2 + 440, height / 2 + 180);

    const yourMoneyWindow = this.addWindow(TEXTURE.WINDOW_MENU, -300, 0, 400 / windowScale, 170 / windowScale, 16, 16, 16, 16);
    yourMoneyWindow.setScale(windowScale);
    const yourMoneyTitle = this.addText(-455, -25, i18next.t('menu:yourMoney'), TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5).setScale(0.8);
    this.yourMoneyText = this.addText(-455, +25, ` 54321`, TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5).setScale(0.8);

    const costWindow = this.addWindow(TEXTURE.WINDOW_MENU, +215, 0, 600 / windowScale, 170 / windowScale, 16, 16, 16, 16).setScale(windowScale);
    this.sellText = this.addText(0, 0, ``, TEXTSTYLE.MESSAGE_BLACK);
    const sellSymbol = this.addText(+70, 0, 'X', TEXTSTYLE.MESSAGE_BLACK).setScale(0.8).setOrigin(0.5, 0.5);
    this.sellIcon = this.addImage('poke-ball', 0, 0).setScale(3.8);
    this.countText = this.addText(+140, 0, `888`, TEXTSTYLE.MESSAGE_BLACK).setOrigin(0.5, 0.5).setScale(0.8);
    const arrowDown = this.addImage(TEXTURE.ARROW_R, +140, -50).setFlipY(true).setScale(2);
    const arrowUp = this.addImage(TEXTURE.ARROW_R, +140, +50).setScale(2);
    this.costText = this.addText(+350, 0, ` 300000`, TEXTSTYLE.MESSAGE_BLACK).setOrigin(0.5, 0.5).setScale(0.8);

    this.menuContainer.add(yourMoneyWindow);
    this.menuContainer.add(yourMoneyTitle);
    this.menuContainer.add(this.yourMoneyText);
    this.menuContainer.add(costWindow);
    this.menuContainer.add(this.sellIcon);
    this.menuContainer.add(sellSymbol);
    this.menuContainer.add(this.sellText);
    this.menuContainer.add(this.countText);
    this.menuContainer.add(arrowDown);
    this.menuContainer.add(arrowUp);
    this.menuContainer.add(this.costText);
  }

  private changeSell(amount: number) {
    let newSell = this.sell + amount;
    newSell = Math.max(this.minSell, Math.min(newSell, this.maxSell));
    this.sell = newSell;
  }

  private render(item: ItemData) {
    this.countText.setText(this.sell.toString());
    this.costText.setText(` ${this.sell * item.sellPrice}`);
  }
}
