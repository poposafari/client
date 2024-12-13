import { ANIMATION } from '../enums/animation';
import { KEY } from '../enums/key';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager } from '../managers';
import { BagMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, addWindow, createSprite, createSpriteAnimation, Ui } from './ui';

export class BagRegisterUi extends Ui {
  private bg!: Phaser.GameObjects.Image;
  private mode: BagMode;
  protected itemSlotContainer!: Phaser.GameObjects.Container;
  protected itemSlotBtns: Phaser.GameObjects.NineSlice[] = [];
  protected choiceMark!: Phaser.GameObjects.Sprite;
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

    this.cancelMark = addImage(this.scene, TEXTURE.CANCEL, 9 * (50 + 5), 0);

    for (let i = 0; i < 9; i++) {
      const xPosition = i * (50 + 5);
      const itemSlotWindow = addWindow(this.scene, TEXTURE.WINDOW_0, xPosition, 0, 50, 50);
      const itemSlotText = addText(this.scene, xPosition - 16, -12, (i + 1).toString(), TEXTSTYLE.LOBBY_DEFAULT);
      this.itemSlotContainer.add(itemSlotWindow);
      this.itemSlotContainer.add(itemSlotText);
      this.itemSlotBtns.push(itemSlotWindow);
    }
    this.itemSlotContainer.add(this.cancelMark);

    this.itemSlotContainer.setVisible(false);

    this.choiceMark = createSprite(this.scene, TEXTURE.PAUSE_WHITE, width / 8 - 14, height / 8 + 290);
    this.choiceMark.setVisible(false);
    createSpriteAnimation(this.scene, TEXTURE.PAUSE_WHITE, ANIMATION.PAUSE);
    this.choiceMark.anims.startAnimation(ANIMATION.PAUSE);

    ui.add(this.bg);
    ui.add(this.itemSlotContainer);
    ui.add(this.choiceMark);
  }

  show(data?: any): void {
    this.targetItem = data;
    this.bg.setVisible(true);
    this.itemSlotContainer.setVisible(true);
    this.choiceMark.setVisible(true);

    this.pause(false);
  }

  clean(): void {
    this.bg.setVisible(false);
    this.itemSlotContainer.setVisible(false);
    this.choiceMark.setVisible(false);
  }

  pause(onoff: boolean): void {
    onoff ? this.block() : this.unblock();
  }

  block() {
    this.bg.setVisible(false);
  }

  unblock() {
    const keyboardMananger = KeyboardManager.getInstance();

    let startIndex = 0;
    let endIndex = 8 + 1;
    let choice = startIndex;

    const width = this.getWidth();
    const height = this.getHeight();

    const keys = [KEY.LEFT, KEY.RIGHT, KEY.SELECT];
    keyboardMananger.setAllowKey(keys);

    keyboardMananger.setKeyDownCallback((key) => {
      if (key === KEY.LEFT) {
        choice = Math.max(startIndex, choice - 1);
      } else if (key === KEY.RIGHT) {
        choice = Math.min(endIndex, choice + 1);
      } else if (key === KEY.SELECT) {
        console.log(`${choice} -> ${this.targetItem}`);
        if (choice === 9) {
          this.clean();
          this.mode.popUiStack();
        }
      }
      this.choiceMark.setPosition(width / 8 - 14 + choice * (50 + 5), height / 8 + 290);

      if (choice > 8) {
        this.choiceMark.setVisible(false);
        this.cancelMark.setTexture(TEXTURE.CANCEL_S);
      } else {
        this.choiceMark.setVisible(true);
        this.cancelMark.setTexture(TEXTURE.CANCEL);
      }
    });
  }

  update(time: number, delta: number): void {}
}
