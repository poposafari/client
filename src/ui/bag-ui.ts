import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { ITEM } from '../enums/item';
import { KEY } from '../enums/key';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager } from '../managers';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, createSprite, runFadeEffect, Ui } from './ui';

export class BagUi extends Ui {
  private mode: OverworldMode;
  private container!: Phaser.GameObjects.Container;
  private bg!: Phaser.GameObjects.Image;
  private lastCurrentPage!: number;
  private lastChoice!: number;

  //pocket
  private pocketContainer!: Phaser.GameObjects.Container;
  private pocketTitles: string[] = [i18next.t('menu:bag1'), i18next.t('menu:bag2'), i18next.t('menu:bag3'), i18next.t('menu:bag4')];
  private pocketTitleWindow!: Phaser.GameObjects.Image;
  private pocketTitleText!: Phaser.GameObjects.Text;
  private pocketSprites: Phaser.GameObjects.Sprite[] = [];
  private pokeballPocket!: Phaser.GameObjects.Sprite;
  private berryPocket!: Phaser.GameObjects.Sprite;
  private etcPocket!: Phaser.GameObjects.Sprite;
  private keyPocket!: Phaser.GameObjects.Sprite;

  //item list
  private listContainer!: Phaser.GameObjects.Container;
  private listWindows: Phaser.GameObjects.Image[] = [];
  private listRegs: Phaser.GameObjects.Image[] = [];
  private listNames: Phaser.GameObjects.Text[] = [];
  private listStocks: Phaser.GameObjects.Text[] = [];
  private listEmptyText!: Phaser.GameObjects.Text;

  //item description
  private descContainer!: Phaser.GameObjects.Container;
  private descIcons: string[] = [];
  private descTexts: string[] = [];
  private descIcon!: Phaser.GameObjects.Image;
  private descText!: Phaser.GameObjects.Text;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.lastCurrentPage = 0;
    this.lastChoice = 0;
    this.container = this.scene.add.container(width / 2, height / 2);
    this.bg = addBackground(this.scene, TEXTURE.BG_BAG).setOrigin(0.5, 0.5);

    //pockets
    this.pocketContainer = this.scene.add.container(-953, 0);
    this.pocketTitleWindow = addImage(this.scene, TEXTURE.INFO_BOX, +320, -450).setScale(2);
    this.pocketTitleText = addText(this.scene, +70, -450, '', TEXTSTYLE.BOX_NAME).setOrigin(0, 0.5);
    this.pokeballPocket = createSprite(this.scene, TEXTURE.BAG1, 0, -350).setScale(2.8);
    this.etcPocket = createSprite(this.scene, TEXTURE.BAG2, 0, +50).setScale(2.8);
    this.berryPocket = createSprite(this.scene, TEXTURE.BAG3, +250, 0).setScale(2.8);
    this.keyPocket = createSprite(this.scene, TEXTURE.BAG4, +380, -350).setScale(2.8);
    this.pocketSprites.push(this.pokeballPocket);
    this.pocketSprites.push(this.etcPocket);
    this.pocketSprites.push(this.berryPocket);
    this.pocketSprites.push(this.keyPocket);
    this.pocketContainer.add(this.pocketTitleWindow);
    this.pocketContainer.add(this.pocketTitleText);
    this.pocketContainer.add(this.pokeballPocket);
    this.pocketContainer.add(this.etcPocket);
    this.pocketContainer.add(this.berryPocket);
    this.pocketContainer.add(this.keyPocket);

    this.listContainer = this.scene.add.container(405, -405);
    this.listContainer.setScale(2);

    this.descContainer = this.scene.add.container(0, 0);
    this.descIcon = addImage(this.scene, '', -410, +235);
    this.descText = addText(this.scene, -350, +225, '', TEXTSTYLE.ITEM_TITLE).setOrigin(0, 0.5);
    this.descContainer.add(this.descIcon);
    this.descContainer.add(this.descText);
    this.descContainer.setScale(2);

    this.listEmptyText = addText(this.scene, +650, 0, i18next.t('menu:itemEmpty'), TEXTSTYLE.ITEM_NOTICE);

    this.container.add(this.bg);
    this.container.add(this.listEmptyText);
    this.container.add(this.pocketContainer);
    this.container.add(this.listContainer);
    this.container.add(this.descContainer);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE);
    this.container.setScrollFactor(0);
  }

  show(): void {
    this.container.setVisible(true);
    this.pause(false);

    runFadeEffect(this.scene, 500, 'in');
  }

  clean(): void {
    this.container.setVisible(false);
    this.clearList();
    this.pause(true);
  }

  pause(onoff: boolean): void {
    onoff ? this.block() : this.unblock();
  }

  update(time: number, delta: number): void {}

  private block() {}

  private unblock() {
    const keyboardManager = KeyboardManager.getInstance();
    const keys = [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];

    let start = 0;
    let end = this.pocketTitles.length - 1;
    let choice = this.lastChoice;
    let currentPage = this.lastCurrentPage;
    let totalPage = 3;

    this.pocketTitleText.setText(this.pocketTitles[0]);
    this.renderPage(currentPage);
    this.renderChoice(1, this.lastChoice);

    this.pocketSprites[currentPage].anims.play({
      key: `bag${currentPage + 1}`,
      repeat: 0,
    });

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback((key) => {
      const prevChoice = choice;
      const prevPage = currentPage;
      try {
        switch (key) {
          case KEY.UP:
            if (choice > start) {
              choice--;
            }
            break;
          case KEY.DOWN:
            if (choice < end && choice < this.listWindows.length - 1) {
              choice++;
            }
            break;
          case KEY.LEFT:
            if (currentPage > 0) {
              currentPage--;
              choice = 0;
            }
            break;
          case KEY.RIGHT:
            if (currentPage < totalPage) {
              currentPage++;
              choice = 0;
            }
            break;
          case KEY.SELECT:
            if (this.listWindows.length > 0) {
              this.lastCurrentPage = currentPage;
              this.lastChoice = choice;
              this.mode.addUiStackOverlap('BagChoiceUi', this.descIcons[choice]);
            }
            break;
          case KEY.CANCEL:
            this.clean();
            this.lastCurrentPage = 0;
            this.runPocketAnimation(prevPage, 0);
            this.renderPage(0);
            this.renderChoice(prevChoice, 0);
            this.mode.popUiStack();
            break;
        }

        if (key === KEY.LEFT || key === KEY.RIGHT) {
          if (currentPage !== prevPage) {
            this.runPocketAnimation(prevPage, currentPage);
            this.renderPage(currentPage);
            this.renderChoice(1, 0);
          }
        }
        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            this.renderChoice(prevChoice, choice);
            this.lastChoice = choice;
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private runPocketAnimation(prev: number, current: number) {
    this.pocketTitleText.setText(this.pocketTitles[current]);
    this.pocketSprites[prev].anims.playReverse({ key: `bag${prev + 1}`, repeat: 0 });
    this.pocketSprites[current].anims.play({
      key: `bag${current + 1}`,
      repeat: 0,
    });
  }

  private renderChoice(prev: number, current: number) {
    if (this.listWindows.length === 0) {
      this.listEmptyText.setVisible(true);
      return;
    }

    this.listEmptyText.setVisible(false);
    this.listWindows[prev].setTexture(TEXTURE.ITEM_BOX);
    this.listWindows[current].setTexture(TEXTURE.ITEM_BOX_S);
    this.descIcon.setTexture('item' + this.descIcons[current]);
    this.descText.setText(i18next.t(this.descTexts[current]));
  }

  private renderPage(current: number) {
    const spacing = 1;
    const contentHeight = 50;
    let currentY = 0;

    this.clearList();

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

    for (const key of Object.keys(playerItems)) {
      if (key) {
        const window = addImage(this.scene, TEXTURE.ITEM_BOX, 0, currentY).setOrigin(0, 0.5);
        const name = addText(this.scene, 15, currentY + contentHeight / 2 - 25, i18next.t(`item:${key}.name`), TEXTSTYLE.ITEM_TITLE).setOrigin(0, 0.5);
        const stock = addText(this.scene, 170, currentY + contentHeight / 2 - 25, `x${playerItems[key].getStock()}`, TEXTSTYLE.ITEM_TITLE).setOrigin(0, 0.5);
        const reg = addImage(this.scene, playerItems[key].getRegister() !== null ? TEXTURE.BAG_REG : TEXTURE.BLANK, -20, currentY);

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

  private clearList() {
    //item lists
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
}
