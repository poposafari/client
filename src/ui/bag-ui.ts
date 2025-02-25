import i18next from 'i18next';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, createSprite, runFadeEffect, Ui } from './ui';
import { TEXTURE } from '../enums/texture';
import { TEXTSTYLE } from '../enums/textstyle';
import { DEPTH } from '../enums/depth';
import { KeyboardManager } from '../managers';
import { KEY } from '../enums/key';
import { PlayerItem } from '../object/player-item';
import { ITEM } from '../enums/item';
import { BagChoiceUi } from './bag-choice-ui';

export class BagUi extends Ui {
  private mode: OverworldMode;
  private bagChoiceUi: BagChoiceUi;
  private start!: number;
  private lastStart!: number | null;
  private lastChoice!: number | null;
  private lastPage!: number | null;
  private tempTargetIdx!: number;

  //background.
  private bg!: Phaser.GameObjects.Image;
  private symbol!: Phaser.GameObjects.Image;

  //containers.
  private container!: Phaser.GameObjects.Container;
  private listContainer!: Phaser.GameObjects.Container;
  private descContainer!: Phaser.GameObjects.Container;
  private pocketContainer!: Phaser.GameObjects.Container;
  private pocketTitleContainer!: Phaser.GameObjects.Container;

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
  private listWindows: Phaser.GameObjects.Image[] = [];
  private listRegs: Phaser.GameObjects.Image[] = [];
  private listNames: Phaser.GameObjects.Text[] = [];
  private listStocks: Phaser.GameObjects.Text[] = [];
  private listEmptyText!: Phaser.GameObjects.Text;

  //description.
  private descIcon!: Phaser.GameObjects.Image;
  private descText!: Phaser.GameObjects.Text;
  private descIcons: string[] = [];
  private descTexts: string[] = [];

  private readonly ITEMS_PER_PAGE = 7;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;

    this.bagChoiceUi = new BagChoiceUi(this.scene, mode, this);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.bagChoiceUi.setup();

    this.container = this.scene.add.container(width / 2, height / 2);
    this.listContainer = this.scene.add.container(360, -405).setScale(2.3);
    this.descContainer = this.scene.add.container(0, 0).setScale(2);
    this.pocketContainer = this.scene.add.container(-953, +120).setScale(1.8);
    this.pocketTitleContainer = this.scene.add.container(-667, -450).setScale(2);

    //background.
    this.bg = addBackground(this.scene, TEXTURE.BG_BAG).setOrigin(0.5, 0.5);
    this.symbol = addImage(this.scene, TEXTURE.SYMBOL, 0, 0);
    this.symbol.setAlpha(0.2);
    this.symbol.setScale(8.65);

    //pocketTitle.
    const bar = addImage(this.scene, TEXTURE.BAG_BAR, 0, 0);
    const arrowLeft = addImage(this.scene, TEXTURE.ARROW_W_R, -120, 0).setFlipX(true);
    const arrowRight = addImage(this.scene, TEXTURE.ARROW_W_R, +100, 0);
    this.pocketTitleText = addText(this.scene, -10, 0, '', TEXTSTYLE.MESSAGE_WHITE);
    this.pocketTitleContainer.add(bar);
    this.pocketTitleContainer.add(this.pocketTitleText);
    this.pocketTitleContainer.add(arrowLeft);
    this.pocketTitleContainer.add(arrowRight);

    //pocket.
    this.pokeballPocket = createSprite(this.scene, TEXTURE.BAG1, 0, -280);
    this.etcPocket = createSprite(this.scene, TEXTURE.BAG2, 0, -80);
    this.berryPocket = createSprite(this.scene, TEXTURE.BAG3, 150, -80);
    this.keyPocket = createSprite(this.scene, TEXTURE.BAG4, +230, -270);
    this.pocketSprites.push(this.pokeballPocket);
    this.pocketSprites.push(this.etcPocket);
    this.pocketSprites.push(this.berryPocket);
    this.pocketSprites.push(this.keyPocket);
    this.pocketContainer.add(this.pokeballPocket);
    this.pocketContainer.add(this.etcPocket);
    this.pocketContainer.add(this.berryPocket);
    this.pocketContainer.add(this.keyPocket);

    //list.
    this.listEmptyText = addText(this.scene, +650, 0, i18next.t('menu:itemEmpty'), TEXTSTYLE.ITEM_NOTICE);

    //desc.
    this.descIcon = addImage(this.scene, '', -410, +235);
    this.descText = addText(this.scene, -350, +225, '', TEXTSTYLE.ITEM_TITLE).setOrigin(0, 0.5);
    this.descContainer.add(this.descIcon);
    this.descContainer.add(this.descText);

    this.container.add(this.bg);
    this.container.add(this.symbol);
    this.container.add(this.listEmptyText);
    this.container.add(this.pocketTitleContainer);
    this.container.add(this.pocketContainer);
    this.container.add(this.listContainer);
    this.container.add(this.descContainer);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.lastChoice = null;
    this.lastPage = null;
    this.lastStart = null;

    runFadeEffect(this.scene, 500, 'in');
    this.container.setVisible(true);
    this.pause(false);

    this.runPocketAnimation(0);
    this.getListInfo(0);
    this.renderPage(0);
    this.renderChoice(1, 0);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.pause(true);

    this.cleanList();
  }

  pause(onoff: boolean): void {
    onoff ? this.block() : this.unblock();
  }

  update(time: number, delta: number): void {}

  private block() {}

  private unblock() {
    const keyboardManager = KeyboardManager.getInstance();
    const keys = [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];

    const totalPage = 3;
    let choice = this.lastChoice ? this.lastChoice : 0;
    let page = this.lastPage ? this.lastPage : 0;
    this.start = this.lastStart ? this.lastStart : 0;

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback((key) => {
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
            if (choice < Math.min(this.ITEMS_PER_PAGE, totalItems) - 1) {
              choice++;
            } else if (this.start + this.ITEMS_PER_PAGE < totalItems) {
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
              this.bagChoiceUi.show(target);
            }
            break;
          case KEY.CANCEL:
            this.clean();
            this.runSwitchPocketAnimation(prevPage, 0);
            this.mode.popUiStack();
            break;
        }

        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            this.renderChoice(prevChoice, choice);
          }
        }

        if (key === KEY.LEFT || key === KEY.RIGHT) {
          if (page !== prevPage) {
            choice = 0;
            this.start = 0;
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

  private getListInfo(current: number) {
    const bag = this.mode.getBag();
    let playerItems;

    switch (current) {
      case 0:
        playerItems = bag?.getPockets(ITEM.POKEBALL);
        break;
      case 1:
        playerItems = bag?.getPockets(ITEM.ETC);
        break;
      case 2:
        playerItems = bag?.getPockets(ITEM.BERRY);
        break;
      case 3:
        playerItems = bag?.getPockets(ITEM.KEY);
        break;
    }

    if (!playerItems) {
      console.error('Player Item does not exist.');
      return;
    }

    this.listInfo = playerItems;
  }

  private renderPage(current: number) {
    const spacing = 1;
    const contentHeight = 50;
    let currentY = 0;

    this.hasItemList();
    this.cleanList();

    const items = Object.keys(this.listInfo);
    const visibleItems = items.slice(this.start, this.start + this.ITEMS_PER_PAGE);

    for (const key of visibleItems) {
      if (key) {
        const window = addImage(this.scene, TEXTURE.ITEM_BOX, 0, currentY).setOrigin(0, 0.5);
        const name = addText(this.scene, 15, currentY + contentHeight / 2 - 25, i18next.t(`item:${key}.name`), TEXTSTYLE.ITEM_TITLE).setOrigin(0, 0.5);
        const stock = addText(this.scene, 170, currentY + contentHeight / 2 - 25, `x${this.listInfo[key].getStock()}`, TEXTSTYLE.ITEM_TITLE).setOrigin(0, 0.5);
        const reg = addImage(this.scene, this.listInfo[key].getRegister() !== null ? TEXTURE.BAG_REG : TEXTURE.BLANK, -20, currentY);

        this.listWindows.push(window);
        this.listNames.push(name);
        this.listStocks.push(stock);
        this.listRegs.push(reg);
        this.listContainer.add(window);
        this.listContainer.add(name);
        this.listContainer.add(stock);
        this.listContainer.add(reg);

        this.descIcons.push(`${key}`);
        this.descTexts.push(i18next.t(`item:${key}.description`));

        currentY += contentHeight + spacing;
      }
    }
  }

  private renderChoice(prev: number, current: number) {
    if (this.listWindows[prev]) this.listWindows[prev].setTexture(TEXTURE.ITEM_BOX);
    if (this.listWindows[current]) this.listWindows[current].setTexture(TEXTURE.ITEM_BOX_S);
    this.descIcon.setTexture('item' + this.descIcons[current]);
    this.descText.setText(i18next.t(this.descTexts[current]));
    this.descIcon.setTexture('item' + this.descIcons[current]);
    this.descText.setText(i18next.t(this.descTexts[current]));
  }

  private cleanList() {
    if (this.listContainer) {
      this.listContainer.removeAll(true);
    }

    this.listWindows.forEach((window) => window.destroy());
    this.listRegs.forEach((reg) => reg.destroy());
    this.listNames.forEach((name) => name.destroy());
    this.listStocks.forEach((stock) => stock.destroy());

    this.listWindows = [];
    this.listRegs = [];
    this.listNames = [];
    this.listStocks = [];

    this.descIcons = [];
    this.descTexts = [];

    this.descIcon.setTexture(TEXTURE.BLANK);
    this.descText.setText('');
  }

  private runSwitchPocketAnimation(prev: number, current: number) {
    this.pocketSprites[prev].anims.playReverse({ key: `bag${prev + 1}`, repeat: 0 });
    this.runPocketAnimation(current);
  }

  private runPocketAnimation(current: number) {
    this.pocketTitleText.setText(this.pocketTitles[current]);
    this.pocketSprites[current].anims.play({
      key: `bag${current + 1}`,
      repeat: 0,
    });
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

  setRegVisual(onoff: boolean) {
    this.listRegs[this.tempTargetIdx].setTexture(onoff ? TEXTURE.BAG_REG : TEXTURE.BLANK);
  }
}
