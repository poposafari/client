import i18next from 'i18next';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { KEY } from '../enums/key';
import { KeyboardManager } from '../managers';
import { DEPTH } from '../enums/depth';

export class BagModalUi extends Ui {
  private mode: OverworldMode;
  private bg!: Phaser.GameObjects.Image;
  private bgContainer!: Phaser.GameObjects.Container;
  private choiceContainer!: Phaser.GameObjects.Container;
  private choiceBtn: Phaser.GameObjects.Image[] = [];
  private targetItem: string = '000';
  private registerText!: Phaser.GameObjects.Text;

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

    this.choiceContainer = this.scene.add.container(width / 2 + 700, height / 2 + 350);
    const registerBtn = addImage(this.scene, TEXTURE.CHOICE, 0, 0);
    this.registerText = addText(this.scene, -60, 0, i18next.t('sys:register'), TEXTSTYLE.CHOICE_DEFAULT).setOrigin(0, 0.5);
    const cancelBtn = addImage(this.scene, TEXTURE.CHOICE, 0, +50);
    const cancelText = addText(this.scene, -60, +50, i18next.t('sys:cancel'), TEXTSTYLE.CHOICE_DEFAULT).setOrigin(0, 0.5);

    this.choiceContainer.add(registerBtn);
    this.choiceContainer.add(this.registerText);
    this.choiceContainer.add(cancelBtn);
    this.choiceContainer.add(cancelText);
    this.choiceContainer.setDepth(DEPTH.OVERWORLD_UI + 4);
    this.choiceContainer.setScrollFactor(0);
    this.choiceContainer.setScale(2);

    this.choiceBtn.push(registerBtn);
    this.choiceBtn.push(cancelBtn);

    this.bg.setVisible(false);
    this.choiceContainer.setVisible(false);
  }
  show(data: any): void {
    this.targetItem = data;
    this.bg.setVisible(true);
    this.choiceContainer.setVisible(true);
    this.pause(false);
  }
  clean(): void {
    this.bg.setVisible(false);
    this.choiceContainer.setVisible(false);
  }

  pause(onoff: boolean): void {
    onoff ? this.block() : this.unblock();
  }

  block() {}

  unblock() {
    const keyboardMananger = KeyboardManager.getInstance();
    const playerItemManager = this.mode.getPlayerItemManager();

    let startIndex = 0;
    let endIndex = 1;
    let choice = startIndex;

    if (playerItemManager.getMyItem(this.targetItem).itemSlot >= 0) {
      this.registerText.setText(i18next.t('sys:registerCancel'));
    } else {
      this.registerText.setText(i18next.t('sys:register'));
    }

    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT];
    keyboardMananger.setAllowKey(keys);

    keyboardMananger.setKeyDownCallback((key) => {
      if (key === KEY.UP) {
        choice = Math.max(startIndex, choice - 1);
      } else if (key === KEY.DOWN) {
        choice = Math.min(endIndex, choice + 1);
      } else if (key === KEY.SELECT) {
        this.clean();
        this.mode.popUiStack();
        if (choice === 0) {
          this.mode.addUiStack('BagRegisterUi', { choice: this.targetItem, isRemove: playerItemManager.getMyItem(this.targetItem).itemSlot >= 0 });
        }
      }

      for (const btn of this.choiceBtn) {
        btn.setTexture(TEXTURE.CHOICE);
      }

      this.choiceBtn[choice].setTexture(TEXTURE.CHOICE_S);
    });

    for (const btn of this.choiceBtn) {
      btn.setTexture(TEXTURE.CHOICE);
    }
    this.choiceBtn[choice].setTexture(TEXTURE.CHOICE_S);
    this.bg.setVisible(true);
  }

  update(time: number, delta: number): void {}
}
