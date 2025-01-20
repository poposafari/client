import i18next from 'i18next';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { KeyboardManager } from '../managers';
import { KEY } from '../enums/key';
import { DEPTH } from '../enums/depth';

export class BoxModalUi extends Ui {
  private bgContainer!: Phaser.GameObjects.Container;
  private bg!: Phaser.GameObjects.Image;
  private mode: OverworldMode;
  private choiceContainer!: Phaser.GameObjects.Container;
  private choiceBtn: Phaser.GameObjects.Image[] = [];
  private choiceDummys: Phaser.GameObjects.Image[] = [];
  private registerText!: Phaser.GameObjects.Text;
  private data!: any;

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
    this.bgContainer.setVisible(false);

    this.choiceContainer = this.scene.add.container(width / 2 + 780, height / 2 + 360);
    const registerBtn = addImage(this.scene, TEXTURE.CHOICE, 0, 0);
    this.registerText = addText(this.scene, -60, 0, i18next.t('sys:register'), TEXTSTYLE.CHOICE_DEFAULT).setOrigin(0, 0.5);
    const cancelBtn = addImage(this.scene, TEXTURE.CHOICE, 0, +50);
    const cancelText = addText(this.scene, -60, +50, i18next.t('sys:cancel'), TEXTSTYLE.CHOICE_DEFAULT).setOrigin(0, 0.5);
    this.choiceBtn.push(registerBtn);
    this.choiceBtn.push(cancelBtn);
    this.choiceContainer.add(this.choiceBtn);
    this.choiceContainer.add(this.registerText);
    this.choiceContainer.add(cancelText);
    this.choiceContainer.setDepth(DEPTH.OVERWORLD_UI + 4);
    this.choiceContainer.setScrollFactor(0);
    this.choiceContainer.setScale(2);
    this.choiceContainer.setVisible(false);
  }

  show(data?: any): void {
    this.data = data;
    this.choiceContainer.setVisible(true);
    this.bg.setVisible(true);

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
    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT, KEY.CANCEL];

    let startIndex = 0;
    let endIndex = 1;
    let choice = startIndex;

    this.bgContainer.setVisible(true);

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
