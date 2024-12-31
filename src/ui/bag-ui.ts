import { Item, items } from '../data/items';
import { ANIMATION } from '../enums/animation';
import { ITEM } from '../enums/item';
import { KEY } from '../enums/key';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager, PlayerItemManager } from '../managers';
import { BagMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, createSprite, Ui } from './ui';

export class BagUi extends Ui {
  private mode: BagMode;
  private container: Phaser.GameObjects.Container[] = [];
  private bgContainer!: Phaser.GameObjects.Container;
  private bg!: Phaser.GameObjects.Image;
  private xboxContainer!: Phaser.GameObjects.Container;
  private xboxBtn!: Phaser.GameObjects.Image;
  private menuContainer!: Phaser.GameObjects.Container;
  private menu1Btn!: Phaser.GameObjects.Sprite;
  private menu2Btn!: Phaser.GameObjects.Sprite;
  private menu3Btn!: Phaser.GameObjects.Sprite;
  private menu4Btn!: Phaser.GameObjects.Sprite;
  private menuAnimations: ANIMATION[] = [ANIMATION.BAG1, ANIMATION.BAG2, ANIMATION.BAG3, ANIMATION.BAG4];
  private menus: Phaser.GameObjects.Sprite[] = [];
  private boxContainer!: Phaser.GameObjects.Container;
  private itemBoxBtn: Phaser.GameObjects.Image[] = [];
  private itemBoxReg: Phaser.GameObjects.Image[] = [];
  private itemIcons: Phaser.GameObjects.Image[] = [];
  private itemStocks: Phaser.GameObjects.Text[] = [];
  private itemTexts: Phaser.GameObjects.Text[] = [];
  private itemNames: Phaser.GameObjects.Text[] = [];
  private horisontalStartIndex: 0 | 1 | 2 | 3 = 0;
  private horisontalEndIndex: 0 | 1 | 2 | 3 = (this.menus.length - 1) as 0 | 1 | 2 | 3;
  private verticalEndIndex!: number;
  private lastHorisontalChoice: 0 | 1 | 2 | 3;
  private lastVerticalChoice: number;
  private itemFilterResult!: [string, Item][];

  constructor(scene: InGameScene, mode: BagMode) {
    super(scene);
    this.mode = mode;

    this.lastHorisontalChoice = 0;
    this.lastVerticalChoice = 0;
  }

  setup(): void {
    const ui = this.getUi();
    const width = this.getWidth();
    const height = this.getHeight();

    this.bgContainer = this.scene.add.container(0, 0);
    this.bg = addBackground(this.scene, TEXTURE.BG_BAG, width, height);
    this.bgContainer.add(this.bg);
    this.bgContainer.setVisible(false);

    this.xboxContainer = this.scene.add.container(width / 4, height / 4);
    this.xboxBtn = addImage(this.scene, TEXTURE.XBOX, 453, -245);
    this.xboxContainer.add(this.xboxBtn);
    this.xboxContainer.setVisible(false);

    this.menuContainer = this.scene.add.container(width / 4, height / 4);
    this.menu1Btn = createSprite(this.scene, TEXTURE.BAG1, -475, -180).setScale(1.5);
    this.menu2Btn = createSprite(this.scene, TEXTURE.BAG2, -475, +20).setScale(1.5);
    this.menu3Btn = createSprite(this.scene, TEXTURE.BAG3, -345, 0).setScale(1.5);
    this.menu4Btn = createSprite(this.scene, TEXTURE.BAG4, -280, -170).setScale(1.5);
    this.menus.push(this.menu1Btn);
    this.menus.push(this.menu2Btn);
    this.menus.push(this.menu3Btn);
    this.menus.push(this.menu4Btn);
    this.menuContainer.add(this.menu1Btn);
    this.menuContainer.add(this.menu2Btn);
    this.menuContainer.add(this.menu3Btn);
    this.menuContainer.add(this.menu4Btn);
    this.menuContainer.setVisible(false);

    this.boxContainer = this.scene.add.container(width / 4, height / 4);
    this.boxContainer.setVisible(false);

    this.container.push(this.bgContainer);
    this.container.push(this.xboxContainer);
    this.container.push(this.menuContainer);
    this.container.push(this.boxContainer);

    ui.add(this.container);
  }

  show(): void {
    for (const container of this.container) {
      container.setVisible(true);
    }

    this.scene.tweens.add({
      targets: this.container,
      alpha: { from: 0, to: 1 },
      ease: 'Sine.Linear',
      duration: 200,
    });

    this.openAnimations(0, 0);
    this.pause(false);
  }

  clean(): void {
    for (const container of this.container) {
      container.setVisible(false);
    }

    for (let i = 0; i < this.menus.length; i++) {
      this.menus[i].setTexture(this.menuAnimations[i]).stop();
    }

    this.cleanObj();

    this.xboxBtn.off('pointerover');
    this.xboxBtn.off('pointerout');
    this.xboxBtn.off('pointerup');

    this.lastHorisontalChoice = 0;
    this.lastVerticalChoice = 0;
  }

  pause(onoff: boolean): void {
    onoff ? this.block() : this.unblock();
  }

  block() {
    this.xboxBtn.off('pointerover');
    this.xboxBtn.off('pointerout');
    this.xboxBtn.off('pointerup');
  }

  unblock() {
    const keyboardMananger = KeyboardManager.getInstance();
    const keys = [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT];

    let horisontalChoice = this.lastHorisontalChoice;
    let verticalChoice = this.lastVerticalChoice;

    this.itemFilterResult = this.filterItem(horisontalChoice);
    this.verticalEndIndex = this.itemFilterResult.length;

    this.itemRegisterCheck(this.itemFilterResult);

    this.updateVerticalTexture(0, verticalChoice);

    keyboardMananger.setAllowKey(keys);
    keyboardMananger.setKeyDownCallback((key) => {
      const prevVerticalChoice = verticalChoice;
      const prevHorizontalChoice = horisontalChoice;

      switch (key) {
        case KEY.UP:
          verticalChoice = Math.max(0, verticalChoice - 1);
          break;
        case KEY.DOWN:
          verticalChoice = Math.min(this.verticalEndIndex - 1, verticalChoice + 1);
          break;
        case KEY.LEFT:
          horisontalChoice = Math.max(0, horisontalChoice - 1) as 0 | 1 | 2 | 3;
          break;
        case KEY.RIGHT:
          horisontalChoice = Math.min(this.menus.length - 1, horisontalChoice + 1) as 0 | 1 | 2 | 3;
          break;
        case KEY.SELECT:
          this.lastHorisontalChoice = horisontalChoice;
          this.lastVerticalChoice = verticalChoice;
          const targetItem = this.itemIcons[verticalChoice]?.texture.key;
          if (targetItem) {
            this.mode.addUiStack('BagModalUi', targetItem.split('item')[1]);
          }
          return;
      }

      if (verticalChoice !== prevVerticalChoice) {
        this.updateVerticalTexture(prevVerticalChoice, verticalChoice);
        this.lastVerticalChoice = verticalChoice;
      }

      if (horisontalChoice !== prevHorizontalChoice) {
        this.cleanObj();
        this.openAnimations(prevHorizontalChoice, horisontalChoice);
        this.itemFilterResult = this.filterItem(horisontalChoice);
        this.verticalEndIndex = this.itemFilterResult.length;
        this.itemRegisterCheck(this.itemFilterResult);
        this.updateVerticalTexture(0, 0);
        this.lastHorisontalChoice = horisontalChoice;
      }
    });

    this.xboxBtn.setInteractive({ cursor: 'pointer' });
    this.xboxBtn.on('pointerup', () => {
      this.mode.changeOverworldMode();
    });
    this.xboxBtn.on('pointerover', () => {
      this.xboxBtn.setAlpha(0.7);
    });
    this.xboxBtn.on('pointerout', () => {
      this.xboxBtn.setAlpha(1);
    });
  }

  update(time: number, delta: number): void {}

  restoreLastState(): void {
    this.itemFilterResult = this.filterItem(this.lastHorisontalChoice);
    this.verticalEndIndex = this.itemFilterResult.length;
    this.itemRegisterCheck(this.itemFilterResult);
    this.updateVerticalTexture(0, this.lastVerticalChoice);
  }

  private updateVerticalTexture(verticalPrevChoice: number, verticalChoice: number) {
    this.itemIcons[verticalPrevChoice]?.setVisible(false);
    this.itemTexts[verticalPrevChoice]?.setVisible(false);
    this.itemBoxBtn[verticalPrevChoice]?.setTexture(TEXTURE.ITEM_BOX);

    this.itemIcons[verticalChoice]?.setVisible(true);
    this.itemTexts[verticalChoice]?.setVisible(true);
    this.itemBoxBtn[verticalChoice]?.setTexture(TEXTURE.ITEM_BOX_S);

    this.lastVerticalChoice = verticalChoice;
  }

  private cleanObj() {
    this.itemBoxBtn.forEach((obj) => obj.destroy());
    this.itemBoxBtn = [];

    this.itemBoxReg.forEach((obj) => obj.destroy());
    this.itemBoxReg = [];

    this.itemIcons.forEach((obj) => obj.destroy());
    this.itemIcons = [];

    this.itemStocks.forEach((obj) => obj.destroy());
    this.itemStocks = [];

    this.itemTexts.forEach((obj) => obj.destroy());
    this.itemTexts = [];

    this.itemNames.forEach((obj) => obj.destroy());
    this.itemNames = [];
  }

  private createItemBox(key: string, stock: number, itemInfo: Item, x: number, y: number): void {
    const boxContainer = this.scene.add.container(0, 0);
    const box = addImage(this.scene, TEXTURE.ITEM_BOX, x, y);
    const reg = addImage(this.scene, TEXTURE.BLANK, x - 130, y);
    const text = addText(this.scene, x - 95, y - 8, itemInfo.name, TEXTSTYLE.ITEM_TITLE).setOrigin(0, 0);
    const icon = addImage(this.scene, `item${key}`, -410, 235).setVisible(false);
    const iconText = addText(this.scene, -350, 220, itemInfo.description, TEXTSTYLE.ITEM_TITLE).setOrigin(0, 0).setVisible(false);
    const iconStock = addText(this.scene, x + 75, y - 8, 'x' + stock.toString(), TEXTSTYLE.ITEM_TITLE).setOrigin(0, 0);
    this.itemBoxBtn.push(box);
    this.itemBoxReg.push(reg);
    this.itemIcons.push(icon);
    this.itemTexts.push(iconText);
    this.itemNames.push(text);
    this.itemStocks.push(iconStock);
    boxContainer.add(box);
    boxContainer.add(reg);
    boxContainer.add(text);
    boxContainer.add(icon);
    boxContainer.add(iconText);
    boxContainer.add(iconStock);
    this.boxContainer.add(boxContainer);
  }

  private openAnimations(prevChoice: 0 | 1 | 2 | 3, choice: 0 | 1 | 2 | 3) {
    const playerItemManager = PlayerItemManager.getInstance();
    const prevAnimationType = this.menuAnimations[prevChoice];
    const animationType = this.menuAnimations[choice];

    this.menus[prevChoice].setTexture(prevAnimationType).stop();
    this.menus[choice].play(animationType).stopAfterRepeat(0);
  }

  private filterItem(choice: 0 | 1 | 2 | 3) {
    const playerItemManager = PlayerItemManager.getInstance();

    this.boxContainer.removeAll();
    this.cleanObj();

    const selectedItemType = this.getItemType(choice);
    const filteredItems = Object.entries(items).filter(([key, item]) => {
      return item.type === selectedItemType && playerItemManager.getMyItems().hasOwnProperty(key);
    });

    let index = 0;
    const itemSpacing = 50;
    const startX = 320;
    const startY = -204;

    filteredItems.forEach(([key, item]) => {
      const myItem = playerItemManager.getMyItem(key);
      const posY = startY + index * itemSpacing;
      this.createItemBox(key, myItem.stock, item!, startX, posY);
      index++;
    });

    return filteredItems;
  }

  private getItemType(choice: 0 | 1 | 2 | 3): ITEM {
    switch (choice) {
      case 0:
        return ITEM.POKEBALL;
      case 1:
        return ITEM.ETC;
      case 2:
        return ITEM.BERRY;
      case 3:
        return ITEM.KEY;
    }
  }

  private itemRegisterCheck(filterResult: [string, Item][]) {
    const playerItemManager = PlayerItemManager.getInstance();
    let idx = 0;
    for (const target of filterResult) {
      const myItem = playerItemManager.getMyItem(target[0]);
      if (myItem.itemSlot >= 0) this.itemBoxReg[idx].setTexture(TEXTURE.BAG_REG);
      else this.itemBoxReg[idx].setTexture(TEXTURE.BLANK);
      idx++;
    }
  }
}
