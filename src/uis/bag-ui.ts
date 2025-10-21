import { getItemsApi } from '../api';
import { MAX_QUICK_ITEM_SLOT } from '../constants';
import { GM } from '../core/game-manager';
import { getItemByKey } from '../data';
import { DEPTH, ItemCategory, ItemData, KEY, PLAYER_STATUS, TEXTSTYLE, TEXTURE } from '../enums';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import i18next from '../i18n';
import { PlayerItem } from '../obj/player-item';
import { InGameScene } from '../scenes/ingame-scene';
import { BagStorage } from '../storage';
import { ListForm } from '../types';
import { BagMenuUi } from './bag-ui-dummy';
import { MenuListUi } from './menu-list-ui';
import { MenuUi } from './menu-ui';
import { TalkMessageUi } from './talk-message-ui';
import { addBackground, addImage, addText, addWindow, createSprite, runFadeEffect, Ui } from './ui';

export class BagUi extends Ui {
  private menu!: MenuUi;
  private list!: MenuListUi;
  private descUi!: BagDescUi;
  private talkMesageUi!: TalkMessageUi;
  private registerUi!: BagRegisterUi;

  private items: PlayerItem[] = [];
  private currentPage: number = 0;

  private container!: Phaser.GameObjects.Container;
  private pocketContainer!: Phaser.GameObjects.Container;
  private pocketTitleContainer!: Phaser.GameObjects.Container;
  private registerContainer!: Phaser.GameObjects.Container;

  private bg!: Phaser.GameObjects.Image;

  private pocketTitles: string[] = [i18next.t('menu:bag1'), i18next.t('menu:bag2'), i18next.t('menu:bag3'), i18next.t('menu:bag4')];
  private pocketTitleText!: Phaser.GameObjects.Text;
  private pocketSprites: Phaser.GameObjects.Sprite[] = [];
  private pokeballPocket!: Phaser.GameObjects.Sprite;
  private berryPocket!: Phaser.GameObjects.Sprite;
  private etcPocket!: Phaser.GameObjects.Sprite;
  private keyPocket!: Phaser.GameObjects.Sprite;

  constructor(scene: InGameScene) {
    super(scene);

    this.menu = new MenuUi(scene);
    this.descUi = new BagDescUi(scene);
    this.list = new MenuListUi(scene, this.descUi);
    this.talkMesageUi = new TalkMessageUi(scene);
    this.registerUi = new BagRegisterUi(scene, this);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.descUi.setup();
    this.registerUi.setup();
    this.talkMesageUi.setup();
    this.setupPocket(width, height);

    this.menu.setup([i18next.t('menu:use'), i18next.t('menu:registerSlot'), i18next.t('menu:cancelMenu')]);

    this.container = this.createContainer(width / 2, height / 2);
    this.bg = addBackground(this.scene, TEXTURE.BG_BAG).setOrigin(0.5, 0.5);

    this.list.setup({ scale: 2, etcScale: 2, windowWidth: 590, offsetX: -240, offsetY: +130, depth: DEPTH.MENU + 1, per: 9, info: [], window: TEXTURE.BLANK, isAllowLRCancel: true });

    this.container.add(this.bg);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE);
    this.container.setScrollFactor(0);
  }

  async show(data?: any): Promise<void> {
    runFadeEffect(this.scene, 1000, 'in');
    this.container.setVisible(true);
    this.pocketContainer.setVisible(true);
    this.pocketTitleContainer.setVisible(true);

    const items = await getItemsApi();
    BagStorage.getInstance().setup(items?.data);

    this.runPocketAnimation(0);
    this.getItems(0);

    this.descUi.show(this.items);

    await this.handleKeyInput();
  }

  clean(data?: any): void {
    runFadeEffect(this.scene, 1000, 'in');

    this.container.setVisible(false);
    this.pocketContainer.setVisible(false);
    this.pocketTitleContainer.setVisible(false);
    this.descUi.clean();
  }

  pause(onoff: boolean, data?: any): void {}

  async handleKeyInput(...data: any[]) {
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
          GM.popUi();
          this.runSwitchPocketAnimation(this.currentPage, 0);
          this.currentPage = 0;
          break;
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
      const [find, i] = GM.findSlotItem(item);
      if (find && (i as number) >= 0) {
        this.setRegVisual(true, item);
      } else {
        this.setRegVisual(false, item);
      }
    }
  }

  async handleMenu(item: PlayerItem): Promise<void> {
    const [find, i] = GM.findSlotItem(item);
    const itemInfo = getItemByKey(item.getKey());

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
      GM.getPlayerObj().useItem(item);
    } else if (ret === i18next.t('menu:registerSlot')) {
      this.menu.clean();
      await this.registerUi.show(item);
    } else if (ret === i18next.t('menu:registerCancel')) {
      this.menu.clean();
      GM.registerCancelSlotItem(item);
      this.setRegVisual(false, item);
    } else {
      this.menu.clean();
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
    const bag = BagStorage.getInstance();

    switch (current) {
      case 0:
        this.items = Object.values(bag.getCategory(ItemCategory.POKEBALL)!);
        break;
      case 1:
        this.items = Object.values(bag.getCategory(ItemCategory.ETC)!);
        break;
      case 2:
        this.items = Object.values(bag.getCategory(ItemCategory.BERRY)!);
        break;
      case 3:
        this.items = Object.values(bag.getCategory(ItemCategory.KEY)!);
        break;
    }
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
      frameRate: 10,
      delay: 0,
    });
  }

  private runSwitchPocketAnimation(prev: number, current: number) {
    const pockets = ['ball', 'etc', 'berry', 'key'];

    BagStorage.getInstance().clearItems();
    this.pocketSprites[prev].anims.playReverse({ key: `bag_pocket_${pockets[prev]}`, repeat: 0 });
    this.runPocketAnimation(current);
  }
}

export class BagDescUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private items: PlayerItem[] = [];
  private icon!: Phaser.GameObjects.Image;
  private text!: Phaser.GameObjects.Text;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2 - 200, height / 2 + 400);

    this.icon = addImage(this.scene, `item000`, -575, +10);
    this.text = addText(this.scene, -400, -65, '', TEXTSTYLE.MESSAGE_WHITE);

    this.icon.setScale(2.4);
    this.text.setOrigin(0, 0);
    this.text.setScale(1);

    this.container.add(this.icon);
    this.container.add(this.text);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.container.setScrollFactor(0);
  }

  show(data: PlayerItem[]): void {
    this.items = data;
    this.container.setVisible(true);
    this.handleKeyInput(0);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.icon.setTexture(TEXTURE.BLANK);
    this.text.setText('');
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any) {
    const item = this.items[data];

    if (!item) {
      this.icon.setTexture(TEXTURE.BLANK);
      this.text.setText('');
      return;
    }

    this.icon.setTexture(`item${item.getKey()}`);
    this.text.setText(i18next.t(`item:${item.getKey()}.description`));
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

    const title = addText(this.scene, 0, -130, i18next.t('menu:guide_item_register_0'), TEXTSTYLE.MESSAGE_WHITE).setScale(1);
    const guide = addText(this.scene, 0, -80, i18next.t('menu:guide_item_register_1'), TEXTSTYLE.MESSAGE_WHITE).setScale(0.5);

    this.bg = addBackground(this.scene, TEXTURE.BG_BLACK).setOrigin(0.5, 0.5);
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
      const keyboard = KeyboardHandler.getInstance();
      const keys = [KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];

      let start = 0;
      let end = MAX_QUICK_ITEM_SLOT - 1;
      let choice = start;

      this.renderSlot();
      this.renderChoice(1, 0);

      keyboard.setAllowKey(keys);
      keyboard.setKeyDownCallback((key) => {
        const prevChoice = choice;

        try {
          switch (key) {
            case KEY.LEFT:
              if (choice > start) {
                choice--;
              }
              break;
            case KEY.RIGHT:
              if (choice < end && choice < MAX_QUICK_ITEM_SLOT) {
                choice++;
              }
              break;
            case KEY.SELECT:
              this.registerItem((choice + 1) as 1 | 2 | 3 | 4 | 5);
              this.renderSlot();
              this.bagUi.setRegVisual(true, this.item);
              break;
            case KEY.CANCEL:
              this.renderChoice(choice, 0);
              this.clean();
              resolve();
              break;
          }
          if (key === KEY.LEFT || key === KEY.RIGHT) {
            if (choice !== prevChoice) {
              this.renderChoice(prevChoice, choice);
            }
          }
        } catch (error) {
          console.error(`Error handling key input: ${error}`);
        }
      });
    });
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.slotContainer.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time?: number, delta?: number): void {}

  registerItem(choice: 1 | 2 | 3 | 4 | 5) {
    GM.registerSlotItem(this.item, choice - 1);
    this.bagUi.setRegVisual(true, this.item);
  }

  private setupSlot(width: number, height: number) {
    const spacing = 40;
    const contentWidth = 80;
    const totalWidth = ((MAX_QUICK_ITEM_SLOT - 1) / 2) * (contentWidth + spacing);

    let currentX = 0;

    this.slotContainer = this.createContainer(width / 2 - totalWidth, height / 2 + 50);

    for (let i = 0; i < MAX_QUICK_ITEM_SLOT; i++) {
      const window = addWindow(this.scene, TEXTURE.WINDOW_OPACITY, currentX, 0, contentWidth, contentWidth, 8, 8, 8, 8).setScale(1.4);
      const dummy = addImage(this.scene, TEXTURE.BLANK, currentX, -80).setScale(3.2);
      const icon = addImage(this.scene, TEXTURE.BLANK, currentX, 0).setScale(2);

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
      const item = GM.getUserData()?.slotItem[i];
      if (item) {
        this.slotIcons[i].setTexture(`item${item.getKey()}`);
      } else {
        this.slotIcons[i].setTexture(TEXTURE.BLANK);
      }
    }
  }
}
