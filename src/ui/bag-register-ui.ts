import { KEY } from '../enums/key';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager, MAX_ITEM_SLOT } from '../managers';
import { BagMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, addWindow, Ui } from './ui';

export class BagRegisterUi extends Ui {
  private bg!: Phaser.GameObjects.Image;
  private mode: BagMode;
  protected itemSlotContainer!: Phaser.GameObjects.Container;
  protected itemSlotBtns: Phaser.GameObjects.NineSlice[] = [];
  protected itemSlotIcons: Phaser.GameObjects.Image[] = [];
  protected itemSlotDummys: Phaser.GameObjects.Image[] = [];
  private cancelMark!: Phaser.GameObjects.Image;
  private targetItem: string = '000';

  constructor(scene: InGameScene, mode: BagMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const ui = this.getUi();
    const width = this.getWidth();
    const height = this.getHeight();

    this.bg = addBackground(this.scene, TEXTURE.BLACK, width, height);
    this.bg.setAlpha(0.5);
    this.bg.setVisible(false);

    this.itemSlotContainer = this.scene.add.container(width / 8, height / 8 + 370);

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

    this.cancelMark = addImage(this.scene, TEXTURE.CANCEL, 9 * (50 + 5), 0);
    this.itemSlotDummys.push(this.cancelMark);
    this.itemSlotContainer.add(this.cancelMark);

    this.itemSlotContainer.setVisible(false);

    ui.add(this.bg);
    ui.add(this.itemSlotContainer);
  }

  show(data?: any): void {
    this.targetItem = data.choice;
    this.bg.setVisible(true);
    this.itemSlotContainer.setVisible(true);
    this.cancelMark.setVisible(true);

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
    this.bg.setVisible(false);
    this.itemSlotContainer.setVisible(false);
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
    const keys = [KEY.LEFT, KEY.RIGHT, KEY.SELECT];

    let startIndex = 0;
    let endIndex = MAX_ITEM_SLOT;
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
        case KEY.SELECT:
          if (choice === 9) {
            this.clean();
            this.mode.popUiStack();
          } else {
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
          }
          break;
      }

      if (choice !== prevChoice) {
        this.itemSlotDummys[prevChoice].setTexture(TEXTURE.BLANK);
        this.cancelMark.setTexture(TEXTURE.CANCEL);
        if (choice === 9) {
          this.cancelMark.setTexture(TEXTURE.CANCEL_S);
        } else {
          this.itemSlotDummys[choice].setTexture(TEXTURE.PAUSE_WHITE);
        }
      }
    });
    this.itemSlotDummys[choice].setTexture(TEXTURE.PAUSE_WHITE);
  }

  update(time: number, delta: number): void {}
}
