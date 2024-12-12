import i18next from 'i18next';
import { TEXTURE } from '../enums/texture';
import { BagMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { KEY } from '../enums/key';
import { KeyboardManager } from '../managers';

export class BagModalUi extends Ui {
  private mode: BagMode;
  private bg!: Phaser.GameObjects.Image;
  private choiceContainer!: Phaser.GameObjects.Container;
  private choiceBtn: Phaser.GameObjects.Image[] = [];

  constructor(scene: InGameScene, mode: BagMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const ui = this.getUi();
    const width = this.getWidth();
    const height = this.getHeight();

    this.bg = addBackground(this.scene, TEXTURE.BLACK, width, height);
    this.bg.setVisible(false);
    this.bg.setAlpha(0.5);

    this.choiceContainer = this.scene.add.container(width / 4 + 350, height / 4 + 100);
    const registerBtn = addImage(this.scene, TEXTURE.CHOICE, 0, 0);
    const registerText = addText(this.scene, -60, 0, i18next.t('sys:register'), TEXTSTYLE.CHOICE_DEFAULT).setOrigin(0, 0.5);
    const cancelBtn = addImage(this.scene, TEXTURE.CHOICE, 0, +50);
    const cancelText = addText(this.scene, -60, +50, i18next.t('sys:cancel'), TEXTSTYLE.CHOICE_DEFAULT).setOrigin(0, 0.5);

    this.choiceBtn.push(registerBtn);
    this.choiceBtn.push(cancelBtn);

    this.choiceContainer.add(this.choiceBtn);
    this.choiceContainer.add(registerText);
    this.choiceContainer.add(cancelText);

    this.choiceContainer.setVisible(false);

    ui.add(this.bg);
    ui.add(this.choiceContainer);

    this.pause(false);
  }
  show(data: any): void {
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

  block() {
    this.bg.setVisible(false);
  }

  unblock() {
    const keyboardMananger = KeyboardManager.getInstance();

    let startIndex = 0;
    let endIndex = 1;
    let choice = startIndex;

    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT];
    keyboardMananger.setAllowKey(keys);

    keyboardMananger.setKeyDownCallback((key) => {
      if (key === KEY.UP) {
        choice = Math.max(startIndex, choice - 1);
      } else if (key === KEY.DOWN) {
        choice = Math.min(endIndex, choice + 1);
      } else if (key === KEY.SELECT) {
        if (choice === 1) {
          this.clean();
          this.mode.popUiStack();
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
  }

  update(time: number, delta: number): void {}
}
