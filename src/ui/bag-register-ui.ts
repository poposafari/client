import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager } from '../managers';
import { OverworldMode } from '../modes';
import { PlayerItem } from '../object/player-item';
import { InGameScene } from '../scenes/ingame-scene';
import { BagChoiceUi } from './bag-choice-ui';
import { BagUi } from './bag-ui';
import { addBackground, addImage, addText, addWindow, Ui } from './ui';

export class BagRegisterUi extends Ui {
  private mode: OverworldMode;
  private bagChoiceUi!: BagChoiceUi;
  private bagUi!: BagUi;

  private container!: Phaser.GameObjects.Container;
  private bg!: Phaser.GameObjects.Image;
  private targetItem!: PlayerItem;

  //slots
  private slotContainer!: Phaser.GameObjects.Container;
  private slotWindows: Phaser.GameObjects.NineSlice[] = [];
  private slotNumbers: Phaser.GameObjects.Text[] = [];
  private slotIcons: Phaser.GameObjects.Image[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];

  private readonly MaxSlot: number = 9;

  constructor(scene: InGameScene, mode: OverworldMode, bagChoiceUi: BagChoiceUi, bagUi: BagUi) {
    super(scene);
    this.mode = mode;
    this.bagChoiceUi = bagChoiceUi;
    this.bagUi = bagUi;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();
    const spacing = 5;
    const contentHeight = 100;

    let currentX = 0;

    this.container = this.scene.add.container(width / 2, height / 2);
    this.bg = addBackground(this.scene, TEXTURE.BLACK).setOrigin(0.5, 0.5);
    this.bg.setAlpha(0.5);

    this.slotContainer = this.scene.add.container(-400, +455);
    for (let i = 1; i <= this.MaxSlot; i++) {
      const window = addWindow(this.scene, TEXTURE.WINDOW_0, currentX, 0, 100, 100, 16, 16, 16, 16);
      const dummy = addImage(this.scene, TEXTURE.BLANK, currentX, -90).setScale(4);
      const num = addText(this.scene, currentX - 40, -20, i.toString(), TEXTSTYLE.ITEM_NOTICE).setOrigin(0, 0.5);
      const icon = addImage(this.scene, TEXTURE.BLANK, currentX, 0).setScale(2);

      this.slotWindows.push(window);
      this.dummys.push(dummy);
      this.slotNumbers.push(num);
      this.slotIcons.push(icon);

      this.slotContainer.add(window);
      this.slotContainer.add(dummy);
      this.slotContainer.add(icon);
      this.slotContainer.add(num);

      currentX += contentHeight + spacing;
    }

    this.container.add(this.bg);
    this.container.add(this.slotContainer);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.container.setScrollFactor(0);
  }

  show(data?: PlayerItem): void {
    if (data) this.targetItem = data;
    this.container.setVisible(true);
    this.pause(false);
  }

  clean(): void {
    this.container.setVisible(false);
    this.pause(true);
  }

  pause(onoff: boolean): void {
    onoff ? this.block() : this.unblock();
  }

  private block() {}

  private unblock() {
    const keyboardMananger = KeyboardManager.getInstance();
    const keys = [KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];

    let start = 0;
    let end = this.MaxSlot - 1;
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
            if (choice < end && choice < this.MaxSlot - 1) {
              choice++;
            }
            break;
          case KEY.SELECT:
            this.registerItem((choice + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);
            this.renderSlot();
            break;
          case KEY.CANCEL:
            this.renderChoice(choice, 0);
            this.clean();
            this.bagChoiceUi.pause(false);
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
  }

  update(time: number, delta: number): void {}

  private renderChoice(prev: number, current: number) {
    this.dummys[prev].setTexture(TEXTURE.BLANK);
    this.dummys[current].setTexture(TEXTURE.PAUSE_WHITE);
  }

  private renderSlot() {
    const bag = this.mode.getBag();

    for (let i = 1; i <= this.MaxSlot; i++) {
      const item = bag?.findItemByRegister(i as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);
      if (item) {
        this.slotIcons[i - 1].setTexture(`item${item.getKey()}`);
      } else {
        this.slotIcons[i - 1].setTexture(TEXTURE.BLANK);
      }
    }
  }

  registerItem(choice: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) {
    const bag = this.mode.getBag();

    if (!bag) {
      console.error('Bag object does not exist.');
      return;
    }

    bag.registerItem(this.targetItem.getKey(), choice);
    this.bagUi.setRegVisual(true);
  }

  updateSlotTexture() {}
}
