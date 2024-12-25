import i18next from 'i18next';
import { TEXTURE } from '../enums/texture';
import { BagMode, BoxMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { KeyboardManager } from '../managers';
import { KEY } from '../enums/key';

export class BoxModalUi extends Ui {
  private bg!: Phaser.GameObjects.Image;
  private mode: BoxMode;
  private choiceContainer!: Phaser.GameObjects.Container;
  private choiceBtn: Phaser.GameObjects.Image[] = [];
  private choiceDummys: Phaser.GameObjects.Image[] = [];
  private registerText!: Phaser.GameObjects.Text;
  private data!: any;

  constructor(scene: InGameScene, mode: BoxMode) {
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

    this.choiceContainer = this.scene.add.container(width / 4 + 390, height / 4 + 180);
    const registerBtn = addImage(this.scene, TEXTURE.CHOICE, 0, 0);
    this.registerText = addText(this.scene, -60, 0, i18next.t('sys:register'), TEXTSTYLE.CHOICE_DEFAULT).setOrigin(0, 0.5);
    const cancelBtn = addImage(this.scene, TEXTURE.CHOICE, 0, +50);
    const cancelText = addText(this.scene, -60, +50, i18next.t('sys:cancel'), TEXTSTYLE.CHOICE_DEFAULT).setOrigin(0, 0.5);

    this.choiceBtn.push(registerBtn);
    this.choiceBtn.push(cancelBtn);

    this.choiceContainer.add(this.choiceBtn);
    this.choiceContainer.add(this.registerText);
    this.choiceContainer.add(cancelText);

    this.choiceContainer.setVisible(false);

    ui.add(this.bg);
    ui.add(this.choiceContainer);
  }

  show(data?: any): void {
    this.data = data;
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
    const playerPokemonManager = this.mode.getPlayerPokemonManager();
    const myPokemons = playerPokemonManager.getMyPokemons();
    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT];

    let startIndex = 0;
    let endIndex = 1;
    let choice = startIndex;

    this.bg.setVisible(true);

    this.choiceBtn[choice].setTexture(TEXTURE.CHOICE);

    if (myPokemons[this.data].partySlot >= 0) {
      this.registerText.setText(i18next.t('sys:registerCancel'));
    } else {
      this.registerText.setText(i18next.t('sys:register'));
    }

    keyboardMananger.setAllowKey(keys);
    keyboardMananger.setKeyDownCallback((key) => {
      const prevChoice = choice;

      switch (key) {
        case KEY.UP:
          choice = Math.max(startIndex, choice - 1);
          break;
        case KEY.DOWN:
          choice = Math.min(endIndex, choice + 1);
          break;
        case KEY.SELECT:
          this.clean();
          this.mode.popUiStack();
          if (choice === 0) {
            this.mode.addUiStack('BoxRegisterUi', { choice: this.data, isRemove: myPokemons[this.data].partySlot >= 0 });
          }

          break;
      }

      if (choice !== prevChoice) {
        this.choiceBtn[prevChoice].setTexture(TEXTURE.CHOICE);
        this.choiceBtn[choice].setTexture(TEXTURE.CHOICE_S);
      }
    });
  }

  update(time: number, delta: number): void {}
}
