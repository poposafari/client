import InputText from 'phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { loginConfirmBtnConfig, loginFindAccountBtnConfig, loginPasswordConfig, loginRegisterBtnConfig, loginUsernameConfig } from './config';
import { ModalUi } from './modal-ui';
import { addBackground, addText, addTextInput, addWindow } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import i18next from 'i18next';
import { LoginMode } from '../modes';

export class LoginUi extends ModalUi {
  private mode: LoginMode;
  private bg!: Phaser.GameObjects.Image;
  private inputConfig!: Input[];
  private inputContainers: Phaser.GameObjects.Container[] = [];
  private inputs: InputText[] = [];
  private btnConfig: Button[] = [];
  private btns: Phaser.GameObjects.NineSlice[] = [];
  private title!: Phaser.GameObjects.Text;

  constructor(scene: InGameScene, mode: LoginMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const ui = this.getUi();
    const width = this.getWidth();
    const height = this.getHeight();

    this.bg = addBackground(this.scene, TEXTURE.BG_LOBBY, width, height);
    this.bg.setVisible(false);
    ui.add(this.bg);

    super.setup();

    this.inputConfig = [loginUsernameConfig, loginPasswordConfig];
    this.btnConfig = [loginConfirmBtnConfig, loginRegisterBtnConfig, loginFindAccountBtnConfig];

    this.title = addText(this.scene, 0, -160, i18next.t('lobby:login'), TEXTSTYLE.LOBBY_TITLE);
    this.modalContainer.add(this.title);

    for (const config of this.inputConfig) {
      const inputContainer = this.scene.add.container(config.x, config.y);
      const inputLabel = addText(this.scene, config.labelX, config.labelY, config.label, TEXTSTYLE.LOBBY_DEFAULT);
      const inputWindow = addWindow(this.scene, TEXTURE.WINDOW_1, 0, 0, config.w, config.h);
      const input = addTextInput(this.scene, 5, 0, config.w, config.h, TEXTSTYLE.LOBBY_INPUT, {
        type: config.type,
        placeholder: config.placeholder,
        minLength: config.minLength,
        maxLength: config.maxLength,
      });

      inputContainer.add(inputLabel);
      inputContainer.add(inputWindow);
      inputContainer.add(input);

      this.inputs.push(input);
      this.inputContainers.push(inputContainer);
      this.modalContainer.add(inputContainer);
    }

    for (const config of this.btnConfig) {
      const btnContainer = this.scene.add.container(config.x, config.y);
      const btnWindow = addWindow(this.scene, TEXTURE.WINDOW_0, 0, 0, config.w, config.h);
      const btnTitle = addText(this.scene, config.contentX, config.contentY, config.content, TEXTSTYLE.LOBBY_DEFAULT);

      btnContainer.add(btnWindow);
      btnContainer.add(btnTitle);

      this.btns.push(btnWindow);
      this.modalContainer.add(btnContainer);
    }
  }

  show(): void {
    super.show();

    this.bg.setVisible(true);

    this.inputs[0].text = '';
    this.inputs[1].text = '';

    for (const container of this.inputContainers) {
      container.setVisible(true);
    }

    for (const btn of this.btns) {
      btn.setVisible(true);
      btn.setInteractive({ cursor: 'pointer' });
    }

    this.btns[0].on('pointerdown', async () => {
      console.log('login');
    });
    this.btns[0].on('pointerover', () => {
      this.btns[0].setAlpha(0.7);
    });
    this.btns[0].on('pointerout', () => {
      this.btns[0].setAlpha(1);
    });

    this.btns[1].on('pointerdown', async () => {
      this.mode.changeRegisterMode();
    });
    this.btns[1].on('pointerover', () => {
      this.btns[1].setAlpha(0.7);
    });
    this.btns[1].on('pointerout', () => {
      this.btns[1].setAlpha(1);
    });

    this.btns[2].on('pointerdown', async () => {
      console.log('find account');
    });
    this.btns[2].on('pointerover', () => {
      this.btns[2].setAlpha(0.7);
    });
    this.btns[2].on('pointerout', () => {
      this.btns[2].setAlpha(1);
    });
  }

  clean(): void {
    super.clean();

    for (const container of this.inputContainers) {
      container.setVisible(false);
    }

    for (const btn of this.btns) {
      btn.off('pointerdown');
    }
  }

  pause(): void {}
}
