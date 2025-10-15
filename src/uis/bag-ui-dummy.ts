import { getItemsApi } from '../api';
import { MAX_ITEM_SLOT } from '../constants';
import { eventBus } from '../core/event-bus';
import { GM } from '../core/game-manager';
import { getItemByKey } from '../data';
import { AUDIO, DEPTH, EVENT, ItemCategory, KEY, PLAYER_STATUS, TEXTSTYLE, TEXTURE } from '../enums';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import i18next from '../i18n';
import { PlayerItem } from '../obj/player-item';
import { InGameScene } from '../scenes/ingame-scene';
import { BagStorage } from '../storage';
import { MenuUi } from './menu-ui';
import { TalkMessageUi } from './talk-message-ui';
import { addBackground, addImage, addText, addWindow, createSprite, getTextStyle, playSound, runFadeEffect, Ui } from './ui';

export class BagUi extends Ui {
  private menuUi!: BagMenuUi;
  private registerUi!: BagRegisterUi;

  private container!: Phaser.GameObjects.Container;
  private listContainer!: Phaser.GameObjects.Container;
  private listWindowContainer!: Phaser.GameObjects.Container;
  private hideContainer!: Phaser.GameObjects.Container;
  private descContainer!: Phaser.GameObjects.Container;
  private pocketContainer!: Phaser.GameObjects.Container;
  private pocketTitleContainer!: Phaser.GameObjects.Container;

  private start!: number;
  private lastStart!: number | null;
  private lastChoice!: number | null;
  private lastPage!: number | null;
  private tempTargetIdx!: number;

  //background.
  private bg!: Phaser.GameObjects.Image;
  private symbol!: Phaser.GameObjects.Image;

  //pocket.
  private pocketTitles: string[] = [i18next.t('menu:bag1'), i18next.t('menu:bag2'), i18next.t('menu:bag3'), i18next.t('menu:bag4')];
  private pocketTitleText!: Phaser.GameObjects.Text;
  private pocketSprites: Phaser.GameObjects.Sprite[] = [];
  private pokeballPocket!: Phaser.GameObjects.Sprite;
  private berryPocket!: Phaser.GameObjects.Sprite;
  private etcPocket!: Phaser.GameObjects.Sprite;
  private keyPocket!: Phaser.GameObjects.Sprite;

  //list.
  private listInfo!: Record<string, PlayerItem>;
  private listDummys: Phaser.GameObjects.NineSlice[] = [];
  private listNames: Phaser.GameObjects.Text[] = [];
  private listStocks: Phaser.GameObjects.Text[] = [];
  private listEmptyText!: Phaser.GameObjects.Text;

  //description.
  private descIcon!: Phaser.GameObjects.Image;
  private descText!: Phaser.GameObjects.Text;
  private descIcons: string[] = [];
  private descTexts: string[] = [];

  private readonly ItemPerPage = 11;
  private readonly ListWindowWidth: number = 500;
  private readonly ListWindowHeight: number = 455;
  private readonly ListDummyHeight: number = 50;
  private readonly scale: number = 3;
  private readonly dummyScale: number = 2;
  private readonly menuWindowWidth: number = 160;

  private readonly menuScale: number = 2;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.setupPocket(width, height);
    this.setupDesc(width, height);
    this.setupListWindow(width, height);

    this.container = this.createContainer(width / 2, height / 2);
    this.listContainer = this.createContainer(width / 2, height / 2 - 390);

    this.bg = addBackground(this.scene, TEXTURE.BG_BAG).setOrigin(0.5, 0.5);
    const symbol = addImage(this.scene, TEXTURE.BLANK, 0, 0);
    symbol.setAlpha(0.2);
    symbol.setScale(8.65);

    this.registerUi = new BagRegisterUi(this.scene, this);
    this.menuUi = new BagMenuUi(this.scene, this, this.registerUi);
    this.menuUi.setup();
    this.registerUi.setup();

    this.container.add(this.bg);
    this.container.add(symbol);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE);
    this.container.setScrollFactor(0);

    this.listContainer.setScale(2);
    this.listContainer.setVisible(false);
    this.listContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.listContainer.setScrollFactor(0);
  }

  async show(data?: any): Promise<void> {
    runFadeEffect(this.scene, 1000, 'in');
    this.container.setVisible(true);
    this.pocketContainer.setVisible(true);
    this.pocketTitleContainer.setVisible(true);
    this.listContainer.setVisible(true);
    this.listWindowContainer.setVisible(true);
    this.hideContainer.setVisible(true);
    this.descContainer.setVisible(true);

    this.lastChoice = null;
    this.lastPage = null;
    this.lastStart = null;

    const items = await getItemsApi();
    BagStorage.getInstance().setup(items?.data);

    this.runPocketAnimation(0);
    this.getListInfo(0);
    this.renderPage(0);
    this.renderChoice(1, 0);

    this.handleKeyInput();
  }

  clean(data?: any): void {
    runFadeEffect(this.scene, 800, 'in');

    this.container.setVisible(false);
    this.pocketContainer.setVisible(false);
    this.pocketTitleContainer.setVisible(false);
    this.listContainer.setVisible(false);
    this.listWindowContainer.setVisible(false);
    this.hideContainer.setVisible(false);
    this.descContainer.setVisible(false);
  }

  pause(onoff: boolean): void {}

  handleKeyInput(data?: any): void {
    const keyboard = KeyboardHandler.getInstance();
    const keys = [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];

    const totalPage = 3;
    let choice = this.lastChoice ? this.lastChoice : 0;
    let page = this.lastPage ? this.lastPage : 0;
    this.start = this.lastStart ? this.lastStart : 0;

    keyboard.setAllowKey(keys);
    keyboard.setKeyDownCallback((key) => {
      let prevChoice = choice;
      const prevPage = page;

      try {
        switch (key) {
          case KEY.UP:
            if (choice > 0) {
              choice--;
            } else if (this.start > 0) {
              prevChoice = 1;
              this.start--;
              this.renderPage(page);
            }
            break;
          case KEY.DOWN:
            const totalItems = Object.keys(this.listInfo).length;
            if (choice < Math.min(this.ItemPerPage, totalItems) - 1) {
              choice++;
            } else if (this.start + this.ItemPerPage < totalItems) {
              prevChoice = 5;
              this.start++;
              this.renderPage(page);
            }
            break;
          case KEY.LEFT:
            if (page > 0) {
              page--;
            }
            break;
          case KEY.RIGHT:
            if (page < totalPage) {
              page++;
            }
            break;
          case KEY.SELECT:
            this.tempTargetIdx = choice;
            const target = Object.values(this.listInfo)[choice + this.start];
            if (target) {
              this.lastChoice = choice;
              this.lastPage = page;
              this.lastStart = this.start;

              playSound(this.scene, AUDIO.SELECT_0, GM.getUserOption()?.getEffectVolume());
              this.menuUi.show(target);
            }
            break;
          case KEY.CANCEL:
            GM.popUi();
            this.runSwitchPocketAnimation(prevPage, 0);
            break;
        }

        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            this.listDummys[prevChoice].setTexture(TEXTURE.BLANK);
            this.listDummys[choice].setTexture(TEXTURE.WINDOW_RED);

            playSound(this.scene, AUDIO.SELECT_0, GM.getUserOption()?.getEffectVolume());

            this.renderChoice(prevChoice, choice);
          }
        }

        if (key === KEY.LEFT || key === KEY.RIGHT) {
          if (page !== prevPage) {
            choice = 0;
            this.start = 0;
            playSound(this.scene, AUDIO.SELECT_2, GM.getUserOption()?.getEffectVolume());
            this.runSwitchPocketAnimation(prevPage, page);
            this.getListInfo(page);
            this.renderPage(page);
            this.renderChoice(1, 0);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  update(time: number, delta: number): void {}

  private setupListWindow(width: number, height: number) {
    this.listWindowContainer = this.createContainer(width / 2 + 430, height / 2 - 60);
    this.hideContainer = this.createContainer(width / 2 + 430, height / 2 - 60);

    const listWindow = addWindow(this.scene, TEXTURE.WINDOW_BAG, 0, 0, this.ListWindowWidth / this.scale, this.ListWindowHeight / this.scale, 16, 16, 16, 16);
    const hideWindow = addWindow(this.scene, TEXTURE.WINDOW_BAG_O, 0, 0, this.ListWindowWidth / this.scale, this.ListWindowHeight / this.scale, 16, 16, 16, 16);
    this.listEmptyText = addText(this.scene, +650, 0, i18next.t('menu:itemEmpty'), TEXTSTYLE.ITEM_NOTICE);
    listWindow.setScale(this.scale);
    this.listWindowContainer.add(listWindow);
    this.listWindowContainer.add(this.listEmptyText);

    hideWindow.setScale(this.scale);
    this.hideContainer.add(hideWindow);

    this.listWindowContainer.setScale(2);
    this.listWindowContainer.setVisible(false);
    this.listWindowContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.listWindowContainer.setScrollFactor(0);

    this.hideContainer.setScale(2);
    this.hideContainer.setVisible(false);
    this.hideContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 3);
    this.hideContainer.setScrollFactor(0);
  }

  private setupDesc(width: number, height: number) {
    this.descContainer = this.createContainer(width / 2 - 820, height / 2 + 470);

    this.descIcon = addImage(this.scene, 'item001', 0, 0);
    this.descText = addText(this.scene, +65, -25, '성능이 좋은 몬스터볼(x1)\n성능이 좋은 몬스터볼(x1)', TEXTSTYLE.BAG_DESC).setOrigin(0, 0);
    this.descContainer.add(this.descIcon);
    this.descContainer.add(this.descText);

    this.descContainer.setScale(2);
    this.descContainer.setVisible(false);
    this.descContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.descContainer.setScrollFactor(0);
  }

  private setupPocket(width: number, height: number) {
    this.pocketContainer = this.createContainer(width / 2 - 960, height / 2 - 100);
    this.pocketTitleContainer = this.createContainer(width / 2 - 600, height / 2 + 100);

    const bar = addImage(this.scene, TEXTURE.BLANK, 0, 0);
    const arrowLeft = addImage(this.scene, TEXTURE.ARROW_R, -150, +15).setAngle(90).setScale(1.4);
    const arrowRight = addImage(this.scene, TEXTURE.ARROW_R, +140, +15).setAngle(270).setFlipX(true).setScale(1.4);
    this.pocketTitleText = addText(this.scene, 0, +15, '', TEXTSTYLE.ONLY_WHITE).setScale(0.4).setStroke('#696969', 12);
    this.pocketTitleContainer.add(bar);
    this.pocketTitleContainer.add(this.pocketTitleText);
    this.pocketTitleContainer.add(arrowLeft);
    this.pocketTitleContainer.add(arrowRight);

    this.pokeballPocket = createSprite(this.scene, TEXTURE.BAG_POCKET_BALL, 0, -280);
    this.etcPocket = createSprite(this.scene, TEXTURE.BAG_POCKET_ETC, 0, -80);
    this.berryPocket = createSprite(this.scene, TEXTURE.BAG_POCKET_BERRY, 150, -80);
    this.keyPocket = createSprite(this.scene, TEXTURE.BAG_POCKET_KEY, +230, -270);
    this.pocketSprites.push(this.pokeballPocket);
    this.pocketSprites.push(this.etcPocket);
    this.pocketSprites.push(this.berryPocket);
    this.pocketSprites.push(this.keyPocket);
    this.pocketContainer.add(this.pokeballPocket);
    this.pocketContainer.add(this.etcPocket);
    this.pocketContainer.add(this.berryPocket);
    this.pocketContainer.add(this.keyPocket);

    this.pocketContainer.setScale(1.5);
    this.pocketContainer.setVisible(false);
    this.pocketContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.pocketContainer.setScrollFactor(0);

    this.pocketTitleContainer.setScale(2.2);
    this.pocketTitleContainer.setVisible(false);
    this.pocketTitleContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.pocketTitleContainer.setScrollFactor(0);
  }

  private runPocketAnimation(current: number) {
    const pockets = ['ball', 'etc', 'berry', 'key'];

    this.pocketTitleText.setText(this.pocketTitles[current]);
    this.pocketSprites[current].anims.play({
      key: `bag_pocket_${pockets[current]}`,
      repeat: 0,
    });
  }

  private getListInfo(current: number) {
    const bag = BagStorage.getInstance();

    switch (current) {
      case 0:
        this.listInfo = bag.getCategory(ItemCategory.POKEBALL)!;
        break;
      case 1:
        this.listInfo = bag.getCategory(ItemCategory.ETC)!;
        break;
      case 2:
        this.listInfo = bag.getCategory(ItemCategory.BERRY)!;
        break;
      case 3:
        this.listInfo = bag.getCategory(ItemCategory.KEY)!;
        break;
    }
  }

  private renderPage(current: number) {
    const spacing = 10;
    const contentHeight = 25;
    let currentY = 0;

    this.hasItemList();
    this.cleanList();

    const items = Object.values(this.listInfo);

    const visibleItems = items.slice(this.start, this.start + this.ItemPerPage);
    const beforeItem = items[this.start - 1];
    const afterItem = items[this.start + this.ItemPerPage];

    if (beforeItem) {
      const [name, stock, dummy] = this.createList(beforeItem.getKey(), -50) as [Phaser.GameObjects.Text, Phaser.GameObjects.Text, Phaser.GameObjects.NineSlice];

      this.listContainer.add(name);
      this.listContainer.add(stock);
      this.listContainer.add(dummy);
    }

    if (afterItem) {
      const [name, stock, dummy] = this.createList(afterItem.getKey(), +375) as [Phaser.GameObjects.Text, Phaser.GameObjects.Text, Phaser.GameObjects.NineSlice];

      this.listContainer.add(name);
      this.listContainer.add(stock);
      this.listContainer.add(dummy);
    }

    for (const item of visibleItems) {
      if (item) {
        const [name, stock, dummy] = this.createList(item.getKey(), currentY + contentHeight / 2 - 25) as [Phaser.GameObjects.Text, Phaser.GameObjects.Text, Phaser.GameObjects.NineSlice];
        const [find, i] = GM.findSlotItem(item);

        if (find && (i as number) >= 0) {
          name.setStyle(getTextStyle(TEXTSTYLE.BAG_REGISTER));
          stock.setStyle(getTextStyle(TEXTSTYLE.BAG_REGISTER));
        }

        this.listNames.push(name);
        this.listStocks.push(stock);
        this.listDummys.push(dummy);

        this.listContainer.add(name);
        this.listContainer.add(stock);
        this.listContainer.add(dummy);

        this.descIcons.push(`${item.getKey()}`);
        this.descTexts.push(i18next.t(`item:${item.getKey()}.description`));

        currentY += contentHeight + spacing;
      }
    }
  }

  private createList(item: string, y: number) {
    const name = addText(this.scene, -10, y, i18next.t(`item:${item}.name`), TEXTSTYLE.MESSAGE_WHITE).setOrigin(0, 0.5);
    const stock = addText(this.scene, +395, y, `x${this.listInfo[item].getStock()}`, TEXTSTYLE.MESSAGE_WHITE).setOrigin(0, 0.5);
    const dummy = addWindow(this.scene, TEXTURE.BLANK, +215, y, (this.ListWindowWidth - 15) / this.dummyScale, (this.ListDummyHeight - 10) / this.dummyScale, 16, 16, 16, 16).setScale(this.dummyScale);

    return [name, stock, dummy];
  }

  private cleanList() {
    if (this.listContainer) {
      this.listContainer.removeAll(true);
    }

    this.listNames.forEach((name) => name.destroy());
    this.listStocks.forEach((stock) => stock.destroy());

    this.listDummys = [];
    this.listNames = [];
    this.listStocks = [];

    this.descIcons = [];
    this.descTexts = [];

    this.descIcon.setTexture(TEXTURE.BLANK);
    this.descText.setText('');
  }

  private hasItemList() {
    const items = Object.keys(this.listInfo);

    if (items.length > 0) {
      this.listEmptyText.setVisible(false);
      this.descIcon.setVisible(true);
      this.descText.setVisible(true);
    } else {
      this.listEmptyText.setVisible(true);
      this.descIcon.setVisible(false);
      this.descText.setVisible(false);
    }
  }

  private renderChoice(prev: number, current: number) {
    if (this.listDummys[prev]) this.listDummys[prev].setTexture(TEXTURE.BLANK);
    if (this.listDummys[current]) this.listDummys[current].setTexture(TEXTURE.WINDOW_RED);

    this.descIcon.setTexture('item' + this.descIcons[current]);
    this.descText.setText(i18next.t(this.descTexts[current]));
  }

  private runSwitchPocketAnimation(prev: number, current: number) {
    const pockets = ['ball', 'etc', 'berry', 'key'];

    BagStorage.getInstance().clearItems();
    this.pocketSprites[prev].anims.playReverse({ key: `bag_pocket_${pockets[prev]}`, repeat: 0 });
    this.runPocketAnimation(current);
  }

  setRegVisual(onoff: boolean) {
    this.listNames[this.tempTargetIdx].setStyle(onoff ? getTextStyle(TEXTSTYLE.BAG_REGISTER) : getTextStyle(TEXTSTYLE.MESSAGE_WHITE));
    this.listStocks[this.tempTargetIdx].setStyle(onoff ? getTextStyle(TEXTSTYLE.BAG_REGISTER) : getTextStyle(TEXTSTYLE.MESSAGE_WHITE));
  }
}

export class BagMenuUi extends Ui {
  private menu: MenuUi;
  private bagUi: BagUi;
  private bagRegisterUi: BagRegisterUi;
  private talkMesageUi: TalkMessageUi;
  private item!: PlayerItem;

  constructor(scene: InGameScene, bagUi: BagUi, bagRegisterUi: BagRegisterUi) {
    super(scene);
    this.menu = new MenuUi(this.scene);

    this.bagUi = bagUi;
    this.bagRegisterUi = bagRegisterUi;

    this.talkMesageUi = new TalkMessageUi(scene);
  }

  setup(): void {
    this.menu.setup([i18next.t('menu:use'), i18next.t('menu:registerSlot'), i18next.t('menu:cancelMenu')]);
    this.talkMesageUi.setup();
  }

  async show(data?: any): Promise<void> {
    if (data) this.item = data as PlayerItem;

    const [find, i] = GM.findSlotItem(this.item);

    if (find && (i as number) >= 0) {
      this.menu.updateInfo(i18next.t('menu:registerSlot'), i18next.t('menu:registerCancel'));
    } else {
      this.menu.updateInfo(i18next.t('menu:registerCancel'), i18next.t('menu:registerSlot'));
    }
    this.menu.show();
    this.handleKeyInput();
  }

  clean(data?: any): void {
    this.menu.clean();
  }

  pause(onoff: boolean, data?: any): void {}

  async handleKeyInput(data?: any) {
    const ret = await this.menu.handleKeyInput();
    const itemInfo = getItemByKey(this.item.getKey());

    if (ret === i18next.t('menu:use')) {
      if (!itemInfo?.usable) {
        this.clean();
        await this.talkMesageUi.show({
          type: 'sys',
          content: i18next.t('message:warningUseItem'),
          speed: 10,
        });
        this.bagUi.handleKeyInput();
      } else {
        switch (this.item.getKey()) {
          case '046':
            GM.getPlayerObj().setMovement(PLAYER_STATUS.RIDE);
            break;
        }
        this.bagUi.handleKeyInput();
      }
    } else if (ret === i18next.t('menu:registerSlot')) {
      this.clean();
      this.bagRegisterUi.show(this.item);
    } else if (ret === i18next.t('menu:registerCancel')) {
      this.clean();
      GM.registerCancelSlotItem(this.item);
      this.bagUi.setRegVisual(false);
      this.bagUi.handleKeyInput();
    } else {
      this.clean();
      this.bagUi.handleKeyInput();
    }
  }

  update(time?: number, delta?: number): void {}
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

    this.bg = addBackground(this.scene, TEXTURE.BG_BLACK).setOrigin(0.5, 0.5);
    this.bg.setAlpha(0.5);

    this.container.add(this.bg);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 5);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    if (data) this.item = data as PlayerItem;

    this.container.setVisible(true);
    this.slotContainer.setVisible(true);

    this.handleKeyInput();
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.slotContainer.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {
    const keyboardMananger = KeyboardHandler.getInstance();
    const keys = [KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];

    let start = 0;
    let end = MAX_ITEM_SLOT - 1;
    let choice = start;

    this.renderSlot();
    this.renderChoice(1, 0);

    keyboardMananger.setAllowKey(keys);
    keyboardMananger.setKeyDownCallback((key) => {
      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.LEFT:
            if (choice > start) {
              choice--;
            }
            break;
          case KEY.RIGHT:
            if (choice < end && choice < MAX_ITEM_SLOT) {
              choice++;
            }
            break;
          case KEY.SELECT:
            playSound(this.scene, AUDIO.SELECT_0, GM.getUserOption()?.getEffectVolume());

            this.registerItem((choice + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);
            this.renderSlot();
            this.bagUi.setRegVisual(true);
            break;
          case KEY.CANCEL:
            this.renderChoice(choice, 0);
            this.clean();
            this.bagUi.handleKeyInput();
            break;
        }
        if (key === KEY.LEFT || key === KEY.RIGHT) {
          if (choice !== prevChoice) {
            playSound(this.scene, AUDIO.SELECT_0, GM.getUserOption()?.getEffectVolume());
            this.renderChoice(prevChoice, choice);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  update(time?: number, delta?: number): void {}

  private setupSlot(width: number, height: number) {
    const spacing = 5;
    const contentWidth = 60;
    const totalWidth = contentWidth * MAX_ITEM_SLOT;

    let currentX = 0;

    this.slotContainer = this.createContainer(0, height / 2 + 450);

    for (let i = 1; i <= MAX_ITEM_SLOT; i++) {
      const window = addWindow(this.scene, TEXTURE.WINDOW_SYS, currentX, 0, contentWidth, contentWidth, 16, 16, 16, 16);
      const dummy = addImage(this.scene, TEXTURE.BLANK, currentX, -70).setScale(3);
      const num = addText(this.scene, currentX - 25, -10, i.toString(), TEXTSTYLE.MESSAGE_WHITE).setOrigin(0, 0.5);
      const icon = addImage(this.scene, TEXTURE.BLANK, currentX, 0);

      this.slotWindows.push(window);
      this.dummys.push(dummy);
      this.slotNumbers.push(num);
      this.slotIcons.push(icon);

      this.slotContainer.add([window, icon, num, dummy]);

      currentX += contentWidth + spacing;
    }

    this.slotContainer.setX((width - totalWidth * this.scale) / 2);

    this.slotContainer.setScale(this.scale);
    this.slotContainer.setVisible(false);
    this.slotContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 6);
    this.slotContainer.setScrollFactor(0);
  }

  private renderChoice(prev: number, current: number) {
    this.dummys[prev].setTexture(TEXTURE.BLANK);
    this.dummys[current].setTexture(TEXTURE.PAUSE_W);
  }

  private renderSlot() {
    for (let i = 0; i < MAX_ITEM_SLOT; i++) {
      const item = GM.getUserData()?.slotItem[i];
      if (item) {
        this.slotIcons[i].setTexture(`item${item.getKey()}`);
      } else {
        this.slotIcons[i].setTexture(TEXTURE.BLANK);
      }
    }
  }

  registerItem(choice: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) {
    GM.registerSlotItem(this.item, choice - 1);
    // this.bagUi.setRe(true);
  }
}
