import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager, MAX_ITEM_SLOT } from '../managers';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, addWindow, Ui } from './ui';

export class BagRegisterUi extends Ui {
  private mode: OverworldMode;
  private bg!: Phaser.GameObjects.Image;
  private bgContainer!: Phaser.GameObjects.Container;
  protected itemSlotContainer!: Phaser.GameObjects.Container;
  protected itemSlotBtns: Phaser.GameObjects.NineSlice[] = [];
  protected itemSlotIcons: Phaser.GameObjects.Image[] = [];
  protected itemSlotDummys: Phaser.GameObjects.Image[] = [];
  private targetItem: string = '000';

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.bgContainer = this.scene.add.container(0, 0);
    this.bg = addBackground(this.scene, TEXTURE.BLACK, width, height);
    this.bgContainer.add(this.bg);
    this.bgContainer.setDepth(DEPTH.OVERWORLD_UI + 3);
    this.bgContainer.setScrollFactor(0);
    this.bgContainer.setAlpha(0.5);
    this.bgContainer.setScale(2);

    this.itemSlotContainer = this.scene.add.container(width / 4, height / 4 + 710);

    for (let i = 0; i < MAX_ITEM_SLOT; i++) {
      const xPosition = i * (50 + 5);
      const itemSlotWindow = addWindow(this.scene, TEXTURE.WINDOW_0, xPosition, 0, 50, 50, 8, 8, 8, 8);
      const itemSlotText = addText(this.scene, xPosition - 16, -12, (i + 1).toString(), TEXTSTYLE.LOBBY_DEFAULT);
      const itemIcon = addImage(this.scene, 'item000', xPosition, 0).setVisible(false);
      const dummy = addImage(this.scene, TEXTURE.BLANK, xPosition, -50).setScale(2);
      this.itemSlotContainer.add(itemSlotWindow);
      this.itemSlotContainer.add(itemSlotText);
      this.itemSlotContainer.add(itemIcon);
      this.itemSlotContainer.add(dummy);
      this.itemSlotBtns.push(itemSlotWindow);
      this.itemSlotIcons.push(itemIcon);
      this.itemSlotDummys.push(dummy);
    }

    this.itemSlotContainer.setDepth(DEPTH.OVERWORLD_UI + 4);
    this.itemSlotContainer.setScrollFactor(0);
    this.itemSlotContainer.setScale(2);

    this.itemSlotContainer.setVisible(false);
    this.bgContainer.setVisible(false);
  }

  show(data?: any): void {
    this.targetItem = data.choice;
    this.itemSlotContainer.setVisible(true);
    this.bgContainer.setVisible(true);

    if (data.isRemove) {
      const playerItemManager = this.mode.getPlayerItemManager();
      playerItemManager.restMyItemSlot(playerItemManager.getMyItem(data.choice).itemSlot, data.choice);

      this.clean();
      this.mode.popUiStack();
      return;
    }

    this.pause(false);
  }

  clean(): void {
    this.itemSlotContainer.setVisible(false);
    this.bgContainer.setVisible(false);
  }

  pause(onoff: boolean): void {
    onoff ? this.block() : this.unblock();
  }

  block() {
    this.bg.setVisible(false);
  }

  unblock() {
    const keyboardMananger = KeyboardManager.getInstance();
    const playerItemManager = this.mode.getPlayerItemManager();
    const myItemSlots = playerItemManager.getMyItemSlots();
    const keys = [KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];

    let startIndex = 0;
    let endIndex = MAX_ITEM_SLOT - 1;
    let choice = startIndex;

    let idx = 0;
    for (const slot of myItemSlots) {
      if (slot !== '000') {
        this.itemSlotIcons[idx].setTexture(`item${slot}`);
      } else {
        this.itemSlotIcons[idx].setTexture(`item000`).setVisible(false);
      }
      idx++;
    }

    keyboardMananger.setAllowKey(keys);
    keyboardMananger.setKeyDownCallback((key) => {
      const prevChoice = choice;

      switch (key) {
        case KEY.LEFT:
          choice = Math.max(startIndex, choice - 1);
          break;
        case KEY.RIGHT:
          choice = Math.min(endIndex, choice + 1);
          break;
        case KEY.CANCEL:
          this.itemSlotDummys[choice].setTexture(TEXTURE.BLANK);
          choice = 0;
          this.clean();
          this.mode.popUiStack();
          break;
        case KEY.SELECT:
          for (let i = 0; i < MAX_ITEM_SLOT; i++) {
            if (myItemSlots[i] === this.targetItem) {
              this.itemSlotIcons[i].setTexture(`item000`).setVisible(false);
              playerItemManager.restMyItemSlot(i, this.targetItem);
              break;
            }
          }

          if (myItemSlots[choice] !== '000') {
            playerItemManager.restMyItemSlot(choice, playerItemManager.getMyItemSlots()[choice]);
          }

          this.itemSlotIcons[choice].setTexture(`item${this.targetItem}`).setVisible(true);
          playerItemManager.setMyItemSlot(choice, this.targetItem);
          break;
      }

      if (choice !== prevChoice) {
        this.itemSlotDummys[prevChoice].setTexture(TEXTURE.BLANK);
        this.itemSlotDummys[choice].setTexture(TEXTURE.PAUSE_WHITE);
      }
    });
    this.itemSlotDummys[choice].setTexture(TEXTURE.PAUSE_WHITE);
  }

  update(time: number, delta: number): void {}
}
