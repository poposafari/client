import { MAX_QUICK_ITEM_SLOT } from '../constants';
import { AUDIO, DEPTH, EVENT, ItemCategory, KEY, MessageEndDelay, TEXTSTYLE, TEXTURE, UI } from '../enums';
import { Keyboard } from '../core/manager/keyboard-manager';
import { Event } from '../core/manager/event-manager';
import i18next from '../i18n';
import { PlayerItem } from '../obj/player-item';
import { InGameScene } from '../scenes/ingame-scene';
import { ListForm } from '../types';
import { MenuListUi } from './menu-list-ui';
import { MenuUi } from './menu-ui';
import { TalkMessageUi } from './talk-message-ui';
import { playEffectSound, runFadeEffect, Ui } from './ui';
import { Bag } from '../core/storage/bag-storage';
import { Game } from '../core/manager/game-manager';
import { Option } from '../core/storage/player-option';
import { OverworldUi } from './overworld/overworld-ui';
import { PlayerGlobal } from '../core/storage/player-storage';
import { replacePercentSymbol } from '../utils/string-util';
import { BagBaseUi } from './bag-base-ui';
import { getItemData } from '../data';

export class BagUi extends BagBaseUi {
  private menu!: MenuUi;
  private list!: MenuListUi;
  private talkMesageUi!: TalkMessageUi;
  private registerUi!: BagRegisterUi;

  private items: PlayerItem[] = [];
  private currentPage: number = 0;
  private tutorialContainer!: Phaser.GameObjects.Container;

  private tutorialBg!: Phaser.GameObjects.Image;

  constructor(scene: InGameScene) {
    super(scene);

    this.menu = new MenuUi(scene);
    this.list = new MenuListUi(scene, this.descUi);
    this.talkMesageUi = new TalkMessageUi(scene);
    this.registerUi = new BagRegisterUi(scene, this);
  }

  setup(data?: any): void {
    super.setup();

    const width = this.getWidth();
    const height = this.getHeight();

    this.descUi.setup();
    this.registerUi.setup();
    this.talkMesageUi.setup();

    this.menu.setup();
    this.menu.setupContent([i18next.t('menu:use'), i18next.t('menu:registerSlot'), i18next.t('menu:cancelMenu')]);

    this.tutorialContainer = this.createTrackedContainer(width / 2, height / 2);
    this.tutorialBg = this.addBackground(TEXTURE.BG_BLACK).setOrigin(0.5, 0.5).setAlpha(0.5);

    this.list.setup({ scale: 2, etcScale: 2, windowWidth: 590, offsetX: -240, offsetY: +130, depth: DEPTH.MENU + 1, per: 9, info: [], window: TEXTURE.BLANK, isAllowLRCancel: true });

    this.tutorialContainer.add(this.tutorialBg);

    this.tutorialContainer.setVisible(false);
    this.tutorialContainer.setDepth(DEPTH.MESSAGE - 1);
    this.tutorialContainer.setScrollFactor(0);
  }

  async show(data?: any): Promise<void> {
    super.show();
    this.getItems(0);

    this.descUi.show(this.items);

    if (Option.getTutorial() && Option.getClientTutorial('bag')) {
      await this.showTutorial();
    }

    await this.handleKeyInput();
  }

  async showTutorial(): Promise<void> {
    this.tutorialContainer.setVisible(true);

    await this.talkMesageUi.show({ type: 'default', content: i18next.t('message:tutorial_bag_0'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
    await this.talkMesageUi.show({ type: 'default', content: i18next.t('message:tutorial_bag_1'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
    await this.talkMesageUi.show({ type: 'default', content: i18next.t('message:tutorial_bag_2'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });

    Option.setClientTutorial(false, 'bag');
    this.tutorialContainer.setVisible(false);
  }

  protected onClean(): void {
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
    if (this.menu) {
      this.menu.clean();
    }
    if (this.registerUi) {
      this.registerUi.clean();
    }
  }

  pause(onoff: boolean, data?: any): void {}

  async handleKeyInput(...data: any[]): Promise<void> {
    this.list.updateInfo(this.createListForm());

    while (true) {
      const selectedItemIndex = await this.list.handleKeyInput();

      if (typeof selectedItemIndex !== 'number' || selectedItemIndex < 0) {
        if (typeof selectedItemIndex === 'string' && selectedItemIndex === 'cancelL') {
          const prevPage = this.currentPage;
          this.currentPage = this.currentPage > 0 ? this.currentPage - 1 : this.pocketTitles.length - 1;
          this.runSwitchPocketAnimation(prevPage, this.currentPage);
          this.getItems(this.currentPage);
          this.list.updateInfo(this.createListForm());
          this.descUi.show(this.items);
          setTimeout(() => {
            this.updateRegVisual();
          }, 10);
          continue;
        } else if (typeof selectedItemIndex === 'string' && selectedItemIndex === 'cancelR') {
          const prevPage = this.currentPage;
          this.currentPage = this.currentPage < this.pocketTitles.length - 1 ? this.currentPage + 1 : 0;
          this.runSwitchPocketAnimation(prevPage, this.currentPage);
          this.getItems(this.currentPage);
          this.list.updateInfo(this.createListForm());
          this.descUi.show(this.items);
          setTimeout(() => {
            this.updateRegVisual();
          }, 10);
          continue;
        } else if (typeof selectedItemIndex === 'string' && selectedItemIndex === i18next.t('menu:cancelMenu')) {
          this.runSwitchPocketAnimation(this.currentPage, 0);
          Keyboard.clearCallbacks();
          await Game.removeUi(UI.BAG);
          return;
        }
      } else {
        const item = this.items[selectedItemIndex];
        await this.handleMenu(item);
        setTimeout(() => {
          this.updateRegVisual();
        }, 10);
      }
    }
  }

  updateRegVisual() {
    for (const item of this.items) {
      const [find, i] = Bag.findSlotItem(item);
      if (find && (i as number) >= 0) {
        this.setRegVisual(true, item);
      } else {
        this.setRegVisual(false, item);
      }
    }
  }

  async handleMenu(item: PlayerItem): Promise<void> {
    const [find, i] = Bag.findSlotItem(item);
    const itemInfo = getItemData(item.getKey());

    if (find && (i as number) >= 0) {
      this.menu.updateInfo(i18next.t('menu:registerSlot'), i18next.t('menu:registerCancel'));
    } else {
      this.menu.updateInfo(i18next.t('menu:registerCancel'), i18next.t('menu:registerSlot'));
    }

    this.menu.show();

    if (!itemInfo?.usable) {
      this.menu.updateInfoColor(i18next.t('menu:use'), TEXTSTYLE.MESSAGE_GRAY);
    }

    if (!itemInfo?.registerable) {
      this.menu.updateInfoColor(i18next.t('menu:registerSlot'), TEXTSTYLE.MESSAGE_GRAY);
      this.menu.updateInfoColor(i18next.t('menu:registerCancel'), TEXTSTYLE.MESSAGE_GRAY);
    }

    const ret = await this.menu.handleKeyInput();

    if (ret === i18next.t('menu:use')) {
      const currentUi = Game.findUiInStack((ui) => ui instanceof OverworldUi);
      if (currentUi instanceof OverworldUi && !currentUi.getIsAllowedRide() && item.getKey() === 'k001') {
        this.menu.hide();
        await this.talkMesageUi.show({
          type: 'default',
          content: replacePercentSymbol(i18next.t('message:warn_not_allowed_item'), [PlayerGlobal.getData()?.nickname]),
          speed: Option.getTextSpeed()!,
          endDelay: MessageEndDelay.DEFAULT,
        });
      } else {
        Event.emit(EVENT.USE_ITEM, item);
        this.menu.hide();
      }
    } else if (ret === i18next.t('menu:registerSlot')) {
      this.menu.hide();
      await this.registerUi.show(item);
    } else if (ret === i18next.t('menu:registerCancel')) {
      this.menu.hide();
      Bag.registerCancelSlotItem(item);
      this.setRegVisual(false, item);
    } else {
      this.menu.hide();
    }
  }

  update(time?: number, delta?: number): void {}

  setRegVisual(onoff: boolean, item: PlayerItem) {
    const itemName = i18next.t(`item:${item.getKey()}.name`);
    const color = onoff ? TEXTSTYLE.MESSAGE_BLUE : TEXTSTYLE.MESSAGE_BLACK;
    this.list.updateContentColor(itemName, color);
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
  }
}

export class BagRegisterUi extends Ui {
  private bagUi: BagUi;

  private container!: Phaser.GameObjects.Container;
  private slotContainer!: Phaser.GameObjects.Container;

  private bg!: Phaser.GameObjects.Image;
  private item!: PlayerItem;
  private slotWindows: Phaser.GameObjects.NineSlice[] = [];
  private slotNumbers: Phaser.GameObjects.Text[] = [];
  private slotIcons: Phaser.GameObjects.Image[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];

  private readonly scale: number = 2;

  constructor(scene: InGameScene, bagUi: BagUi) {
    super(scene);

    this.bagUi = bagUi;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.setupSlot(width, height);

    this.container = this.createContainer(width / 2, height / 2);

    const title = this.addText(0, -130, i18next.t('menu:guide_item_register_0'), TEXTSTYLE.MESSAGE_WHITE).setScale(1);
    const guide = this.addText(0, -80, i18next.t('menu:guide_item_register_1'), TEXTSTYLE.MESSAGE_WHITE).setScale(0.5);

    this.bg = this.addBackground(TEXTURE.BG_BLACK).setOrigin(0.5, 0.5);
    this.bg.setAlpha(0.5);

    this.container.add(this.bg);
    this.container.add(title);
    this.container.add(guide);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 5);
    this.container.setScrollFactor(0);
  }

  async show(data: PlayerItem): Promise<void> {
    this.item = data;

    this.container.setVisible(true);
    this.slotContainer.setVisible(true);

    return new Promise((resolve) => {
      let start = 0;
      let end = MAX_QUICK_ITEM_SLOT - 1;
      let choice = start;

      this.renderSlot();
      this.renderChoice(1, 0);

      Keyboard.setAllowKey([KEY.ARROW_LEFT, KEY.ARROW_RIGHT, KEY.Z, KEY.ENTER, KEY.X, KEY.ESC]);
      Keyboard.setKeyDownCallback((key: KEY) => {
        const prevChoice = choice;

        try {
          switch (key) {
            case KEY.ARROW_LEFT:
              if (choice > start) {
                choice--;
              }
              break;
            case KEY.ARROW_RIGHT:
              if (choice < end && choice < MAX_QUICK_ITEM_SLOT) {
                choice++;
              }
              break;
            case KEY.ENTER:
            case KEY.Z:
              playEffectSound(this.scene, AUDIO.SELECT_0);
              this.registerItem((choice + 1) as 1 | 2 | 3 | 4 | 5);
              this.renderSlot();
              this.bagUi.setRegVisual(true, this.item);
              break;
            case KEY.ESC:
            case KEY.X:
              this.renderChoice(choice, 0);
              this.hide();
              resolve();
              break;
          }
          if (key === KEY.ARROW_LEFT || key === KEY.ARROW_RIGHT) {
            if (choice !== prevChoice) {
              playEffectSound(this.scene, AUDIO.SELECT_0);
              this.renderChoice(prevChoice, choice);
            }
          }
        } catch (error) {
          console.error(`Error handling key input: ${error}`);
        }
      });
    });
  }

  protected onClean(): void {
    if (this.container) {
      this.container.setVisible(false);
    }
    if (this.slotContainer) {
      this.slotContainer.setVisible(false);
    }
  }

  hide(): void {
    this.container.setVisible(false);
    this.slotContainer.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time?: number, delta?: number): void {}

  registerItem(choice: 1 | 2 | 3 | 4 | 5) {
    Bag.registerSlotItem(this.item, choice - 1);
    this.bagUi.setRegVisual(true, this.item);
  }

  private setupSlot(width: number, height: number) {
    const spacing = 40;
    const contentWidth = 80;
    const totalWidth = ((MAX_QUICK_ITEM_SLOT - 1) / 2) * (contentWidth + spacing);

    let currentX = 0;

    this.slotContainer = this.createContainer(width / 2 - totalWidth, height / 2 + 50);

    for (let i = 0; i < MAX_QUICK_ITEM_SLOT; i++) {
      const window = this.addWindow(TEXTURE.WINDOW_OPACITY, currentX, 0, contentWidth, contentWidth, 8, 8, 8, 8).setScale(1.4);
      const dummy = this.addImage(TEXTURE.BLANK, currentX, -80).setScale(3.2);
      const icon = this.addImage(TEXTURE.BLANK, currentX, 0).setScale(2);

      this.slotWindows.push(window);
      this.dummys.push(dummy);
      this.slotIcons.push(icon);

      this.slotContainer.add([window, icon, dummy]);

      currentX += contentWidth + spacing;
    }

    this.slotContainer.setVisible(false);
    this.slotContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 6);
    this.slotContainer.setScrollFactor(0);
  }

  private renderChoice(prev: number, current: number) {
    this.dummys[prev].setTexture(TEXTURE.BLANK);
    this.dummys[current].setTexture(TEXTURE.PAUSE_W);
  }

  private renderSlot() {
    for (let i = 0; i < MAX_QUICK_ITEM_SLOT; i++) {
      const item = Bag.getSlotItems()[i];
      if (item) {
        console.log(item.getKey());
        this.slotIcons[i].setTexture(`${item.getKey()}`);
      } else {
        this.slotIcons[i].setTexture(TEXTURE.BLANK);
      }
    }
  }
}
