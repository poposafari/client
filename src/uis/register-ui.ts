import InputText from 'phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText';
import { ModalFormUi } from './modal-form-ui';
import { InGameScene } from '../scenes/ingame-scene';
import { AUDIO, DEPTH, HttpErrorCode, MODE, TEXTSTYLE, TEXTURE } from '../enums';
import { addBackground, addText, addTextInput, addWindow, playSound, startModalAnimation } from './ui';
import i18next from '../i18n';
import { registerApi } from '../api';
import { isValidPassword, isValidUsername } from '../utils/string-util';
import { GM } from '../core/game-manager';

export class RegisterUi extends ModalFormUi {
  private bg!: Phaser.GameObjects.Image;

  private title!: Phaser.GameObjects.Text;
  private errTexts!: Phaser.GameObjects.Text;

  private inputWindows: Phaser.GameObjects.NineSlice[] = [];
  private inputs: InputText[] = [];

  private btnWindows: Phaser.GameObjects.NineSlice[] = [];
  private btnTexts: Phaser.GameObjects.Text[] = [];

  private container!: Phaser.GameObjects.Container;
  private inputContainer!: Phaser.GameObjects.Container;
  private btnContainer!: Phaser.GameObjects.Container;
  private titleContainer!: Phaser.GameObjects.Container;

  private targetContainers!: Phaser.GameObjects.Container[];
  private restorePosY!: number[];

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    super.setup();
    this.setModalSize(TEXTURE.WINDOW_0, 170, 185, 4);

    this.container = this.createContainer(width / 2, height / 2);

    this.bg = addBackground(this.scene, TEXTURE.BG_TITLE).setOrigin(0.5, 0.5);
    this.setUpTitle(width, height);
    this.setUpInput(width, height);
    this.setUpBtn(width, height);

    this.targetContainers = [this.inputContainer, this.btnContainer, this.titleContainer, this.getModal()];
    this.restorePosY = [this.inputContainer.y, this.btnContainer.y, this.titleContainer.y, this.getModal().y];

    this.container.add(this.bg);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TITLE - 1);
    this.container.setScrollFactor(0);

    this.handleMouseBtn();
  }

  show(data?: any): void {
    playSound(this.scene, AUDIO.OPEN_0, GM.getUserOption()?.getEffectVolume());
    super.show();

    this.container.setVisible(true);

    this.inputs[0].text = '';
    this.inputs[1].text = '';
    this.inputs[2].text = '';
    this.errTexts.text = '';

    for (const container of this.targetContainers) {
      container.y += 48;
      container.setAlpha(0);
      container.setVisible(true);
      startModalAnimation(this.scene, container);
    }

    this.pause(false);
  }

  clean(data?: any): void {
    this.container.setVisible(false);

    for (let i = 0; i < this.targetContainers.length; i++) {
      this.targetContainers[i].y = this.restorePosY[i];
      this.targetContainers[i].setAlpha(1);
      this.targetContainers[i].setVisible(false);
    }
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}

  private block() {
    for (const input of this.inputs) {
      input.setBlur();
      input.pointerEvents = 'none';
    }

    for (const btn of this.btnWindows) {
      btn.disableInteractive();
    }
  }

  private unblock() {
    for (const input of this.inputs) {
      input.pointerEvents = 'auto';
    }

    for (const btn of this.btnWindows) {
      btn.setInteractive();
    }
  }

  private setUpTitle(width: number, height: number) {
    this.titleContainer = this.createContainer(width / 2, height / 2 - 280);

    this.title = addText(this.scene, 0, 0, i18next.t('menu:register'), TEXTSTYLE.TITLE_MODAL);

    this.titleContainer.add(this.title);

    this.titleContainer.setVisible(false);
    this.titleContainer.setDepth(DEPTH.TITLE + 3);
    this.titleContainer.setScrollFactor(0);

    return this.titleContainer;
  }

  private setUpInput(width: number, height: number) {
    this.inputContainer = this.createContainer(width / 2, height / 2 - 120);

    this.inputWindows[0] = addWindow(this.scene, TEXTURE.WINDOW_WHITE, 0, 0, 380, 60, 16, 16, 16, 16).setScale(1.2);
    this.inputWindows[1] = addWindow(this.scene, TEXTURE.WINDOW_WHITE, 0, +100, 380, 60, 16, 16, 16, 16).setScale(1.2);
    this.inputWindows[2] = addWindow(this.scene, TEXTURE.WINDOW_WHITE, 0, +200, 380, 60, 16, 16, 16, 16).setScale(1.2);
    this.errTexts = addText(this.scene, 0, +270, '', TEXTSTYLE.GENDER_1).setOrigin(0.5, 0);

    this.inputs[0] = addTextInput(this.scene, -200, 0, 380, 60, TEXTSTYLE.LOBBY_INPUT, {
      type: 'text',
      placeholder: i18next.t('menu:username'),
      minLength: 6,
      maxLength: 18,
    }).setScale(2);

    this.inputs[1] = addTextInput(this.scene, -200, +100, 380, 60, TEXTSTYLE.LOBBY_INPUT, {
      type: 'password',
      placeholder: i18next.t('menu:password'),
      minLength: 6,
      maxLength: 18,
    }).setScale(2);

    this.inputs[2] = addTextInput(this.scene, -200, +200, 380, 60, TEXTSTYLE.LOBBY_INPUT, {
      type: 'password',
      placeholder: i18next.t('menu:repassword'),
      minLength: 6,
      maxLength: 18,
    }).setScale(2);

    this.inputContainer.add(this.inputWindows[0]);
    this.inputContainer.add(this.inputWindows[1]);
    this.inputContainer.add(this.inputWindows[2]);
    this.inputContainer.add(this.inputs[0]);
    this.inputContainer.add(this.inputs[1]);
    this.inputContainer.add(this.inputs[2]);
    this.inputContainer.add(this.errTexts);

    this.inputContainer.setVisible(false);
    this.inputContainer.setDepth(DEPTH.TITLE + 2);
    this.inputContainer.setScrollFactor(0);
  }

  private setUpBtn(width: number, height: number) {
    this.btnContainer = this.createContainer(width / 2, height / 2 + 270);

    this.btnWindows[0] = addWindow(this.scene, TEXTURE.WINDOW_0, -125, 0, 170, 60, 16, 16, 16, 16).setScale(1.2).setInteractive({ cursor: 'pointer' });
    this.btnWindows[1] = addWindow(this.scene, TEXTURE.WINDOW_0, +125, 0, 170, 60, 16, 16, 16, 16).setScale(1.2).setInteractive({ cursor: 'pointer' });
    this.btnTexts[0] = addText(this.scene, -125, 0, i18next.t('menu:register'), TEXTSTYLE.DEFAULT);
    this.btnTexts[1] = addText(this.scene, +125, 0, i18next.t('menu:backToLogin'), TEXTSTYLE.DEFAULT).setFontSize(50);

    this.btnContainer.add(this.btnWindows[0]);
    this.btnContainer.add(this.btnWindows[1]);
    this.btnContainer.add(this.btnTexts[0]);
    this.btnContainer.add(this.btnTexts[1]);

    this.btnContainer.setVisible(false);
    this.btnContainer.setDepth(DEPTH.TITLE + 2);
    this.btnContainer.setScrollFactor(0);
  }

  private handleMouseBtn() {
    this.btnWindows[0].on('pointerover', () => {
      this.btnWindows[0].setTint(0xcccccc);
    });
    this.btnWindows[1].on('pointerover', () => {
      this.btnWindows[1].setTint(0xcccccc);
    });

    this.btnWindows[0].on('pointerout', () => {
      this.btnWindows[0].clearTint();
    });
    this.btnWindows[1].on('pointerout', () => {
      this.btnWindows[1].clearTint();
    });

    this.btnWindows[0].on('pointerup', async () => {
      if (this.validate(this.inputs[0].text, this.inputs[1].text, this.inputs[2].text)) {
        const res = await registerApi({ username: this.inputs[0].text, password: this.inputs[2].text });
        if (res!.result) {
          console.log(res!.data);
          localStorage.setItem('access_token', String(res!.data));

          GM.changeMode(MODE.NEWGAME);
        } else {
          if (res!.data === HttpErrorCode.ALREADY_EXIST_ACCOUNT) {
            this.shake();
            this.errTexts.setText(i18next.t('message:existAccount'));
          }
        }
      }
    });

    this.btnWindows[1].on('pointerup', () => {
      GM.changeMode(MODE.LOGIN);
    });
  }

  private validate(username: string, pw: string, pwR: string) {
    if (username.length <= 0) {
      this.shake();
      this.errTexts.setText(i18next.t('message:emptyUsername'));
      return false;
    }

    if (pw.length <= 0) {
      this.shake();
      this.errTexts.setText(i18next.t('message:emptyPassword'));
      return false;
    }

    if (pw !== pwR) {
      this.shake();
      this.errTexts.setText(i18next.t('message:invalidPassword1'));
      return false;
    }

    if (!isValidUsername(username)) {
      this.shake();
      this.errTexts.setText(i18next.t('message:invalidUsername'));
      return false;
    }

    if (!isValidPassword(pw)) {
      this.shake();
      this.errTexts.setText(i18next.t('message:invalidPassword2'));
      return false;
    }

    return true;
  }
}
