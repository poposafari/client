import InputText from 'phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText';
import { ModalFormUi } from './modal-form-ui';
import { InGameScene } from '../scenes/ingame-scene';
import { AUDIO, DEPTH, HttpErrorCode, MODE, TEXTSTYLE, TEXTURE } from '../enums';
import { playEffectSound, startModalAnimation } from './ui';
import i18next from '../i18n';
import { loginLocalApi } from '../api';
import { Game } from '../core/manager/game-manager';
import { ErrorCode } from '../core/errors';

export class LoginUi extends ModalFormUi {
  private bg!: Phaser.GameObjects.Image;

  private title!: Phaser.GameObjects.Image;
  private errTexts!: Phaser.GameObjects.Text;

  private inputWindows: Phaser.GameObjects.NineSlice[] = [];
  private inputs: InputText[] = [];

  private btnWindows: Phaser.GameObjects.NineSlice[] = [];
  private btnTexts: Phaser.GameObjects.Text[] = [];
  private btnOthers: Phaser.GameObjects.Image[] = [];
  private orText!: Phaser.GameObjects.Text;

  private container!: Phaser.GameObjects.Container;
  private inputContainer!: Phaser.GameObjects.Container;
  private btnContainer!: Phaser.GameObjects.Container;
  private titleContainer!: Phaser.GameObjects.Container;
  private mixContainer!: Phaser.GameObjects.Container;

  private targetContainers!: Phaser.GameObjects.Container[];
  private restorePosY!: number[];

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    super.setup();
    this.setModalSize(TEXTURE.WINDOW_0, 180, 190, 4);

    this.container = this.createTrackedContainer(width / 2, height / 2);
    this.mixContainer = this.createTrackedContainer(width / 2, height / 2);

    this.bg = this.addBackground(TEXTURE.BG_TITLE).setOrigin(0.5, 0.5);
    this.setUpTitles(width, height);
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
    playEffectSound(this.scene, AUDIO.OPEN_0);
    super.show();
    this.inputs[0].text = '';
    this.inputs[1].text = '';
    this.errTexts.text = '';

    this.container.setVisible(true);

    for (const container of this.targetContainers) {
      container.y += 48;
      container.setAlpha(0);
      container.setVisible(true);
      startModalAnimation(this.scene, container);
    }

    this.pause(false);
  }

  protected onClean(): void {
    this.inputs = [];
    this.inputWindows = [];
    this.btnWindows = [];
    this.btnTexts = [];
    this.btnOthers = [];
    this.targetContainers = [];
    this.restorePosY = [];
  }

  handleKeyInput() {
    for (const input of this.inputs) {
      input.pointerEvents = 'auto';
    }
    for (const btn of this.btnWindows) {
      btn.setInteractive();
    }
    for (const btn of this.btnOthers) {
      btn.setInteractive();
    }
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  update(time: number, delta: number): void {}

  private block() {
    for (const input of this.inputs) {
      input.setBlur();
      input.pointerEvents = 'none';
    }
    for (const btn of this.btnWindows) {
      btn.disableInteractive();
    }
    for (const btn of this.btnOthers) {
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
    for (const btn of this.btnOthers) {
      btn.setInteractive();
    }
  }

  private setUpInput(width: number, height: number) {
    this.inputContainer = this.createTrackedContainer(width / 2, height / 2 - 110);

    this.inputWindows[0] = this.addWindow(TEXTURE.WINDOW_WHITE, 0, 0, 380, 60, 16, 16, 16, 16).setScale(1.2);
    this.inputWindows[1] = this.addWindow(TEXTURE.WINDOW_WHITE, 0, +100, 380, 60, 16, 16, 16, 16).setScale(1.2);
    this.errTexts = this.addText(0, +195, '', TEXTSTYLE.GENDER_1);

    this.inputs[0] = this.addTextInput(-200, 0, 380, 60, TEXTSTYLE.LOBBY_INPUT, {
      type: 'text',
      placeholder: i18next.t('menu:username'),
      minLength: 6,
      maxLength: 18,
    }).setScale(2);

    this.inputs[1] = this.addTextInput(-200, +100, 380, 60, TEXTSTYLE.LOBBY_INPUT, {
      type: 'password',
      placeholder: i18next.t('menu:password'),
      minLength: 6,
      maxLength: 18,
    }).setScale(2);

    this.inputContainer.add(this.inputWindows[0]);
    this.inputContainer.add(this.inputWindows[1]);
    this.inputContainer.add(this.inputs[0]);
    this.inputContainer.add(this.inputs[1]);
    this.inputContainer.add(this.errTexts);

    this.inputContainer.setVisible(false);
    this.inputContainer.setDepth(DEPTH.TITLE + 2);
    this.inputContainer.setScrollFactor(0);
  }

  private setUpBtn(width: number, height: number) {
    this.btnContainer = this.createTrackedContainer(width / 2, height / 2 + 150);

    this.btnWindows[0] = this.addWindow(TEXTURE.WINDOW_0, -125, 0, 170, 60, 16, 16, 16, 16).setScale(1.2).setInteractive({ cursor: 'pointer' });
    this.btnWindows[1] = this.addWindow(TEXTURE.WINDOW_0, +125, 0, 170, 60, 16, 16, 16, 16).setScale(1.2).setInteractive({ cursor: 'pointer' });
    this.btnTexts[0] = this.addText(-125, 0, i18next.t('menu:login'), TEXTSTYLE.DEFAULT);
    this.btnTexts[1] = this.addText(+125, 0, i18next.t('menu:register'), TEXTSTYLE.DEFAULT);
    this.btnOthers[0] = this.addImage(TEXTURE.BLANK, -40, +115).setInteractive({ cursor: 'default' }); //google
    this.btnOthers[1] = this.addImage(TEXTURE.BLANK, +40, +115).setInteractive({ cursor: 'default' }); //discord
    this.orText = this.addText(0, +60, '', TEXTSTYLE.DEFAULT_GRAY);

    this.btnContainer.add(this.btnWindows[0]);
    this.btnContainer.add(this.btnWindows[1]);
    this.btnContainer.add(this.btnTexts[0]);
    this.btnContainer.add(this.btnTexts[1]);
    this.btnContainer.add(this.orText);
    this.btnContainer.add(this.btnOthers[0]);
    this.btnContainer.add(this.btnOthers[1]);

    this.btnContainer.setVisible(false);
    this.btnContainer.setDepth(DEPTH.TITLE + 2);
    this.btnContainer.setScrollFactor(0);
  }

  private setUpTitles(width: number, height: number) {
    this.titleContainer = this.createTrackedContainer(width / 2, height / 2 - 250);

    this.title = this.addImage(TEXTURE.LOGO_0, 0, 0).setScale(2.2);
    this.titleContainer.add(this.title);

    this.titleContainer.setVisible(false);
    this.titleContainer.setDepth(DEPTH.TITLE + 3);
    this.titleContainer.setScrollFactor(0);
  }

  private handleMouseBtn() {
    this.btnWindows[0].on('pointerover', () => {
      this.btnWindows[0].setTint(0xcccccc);
    });
    this.btnWindows[1].on('pointerover', () => {
      this.btnWindows[1].setTint(0xcccccc);
    });
    // this.btnOthers[0].on('pointerover', () => {
    //   this.btnOthers[0].setTint(0xcccccc);
    // });
    // this.btnOthers[1].on('pointerover', () => {
    //   this.btnOthers[1].setTint(0xcccccc);
    // });

    this.btnWindows[0].on('pointerout', () => {
      this.btnWindows[0].clearTint();
    });
    this.btnWindows[1].on('pointerout', () => {
      this.btnWindows[1].clearTint();
    });

    this.btnWindows[0].on('pointerup', async () => {
      if (this.validate(this.inputs[0].text, this.inputs[1].text)) {
        this.pause(true);
        const res = await loginLocalApi({ username: this.inputs[0].text, password: this.inputs[1].text });

        if (res!.result) {
          localStorage.setItem('access_token', String(res!.data.token));

          if (res!.data.isDelete) Game.changeMode(MODE.ACCOUNT_DELETE_RESTORE, res!.data.isDeleteAt);
          else Game.changeMode(MODE.CHECK_INGAME_DATA);
        } else {
          if (res!.data === ErrorCode.FAIL_LOGIN) {
            this.shake();
            this.errTexts.setText(i18next.t('message:invalidUsernameOrPassword'));
            this.pause(false);
          }
        }
      }
    });
    this.btnWindows[1].on('pointerup', () => {
      Game.changeMode(MODE.REGISTER);
    });
  }

  private validate(username: string, password: string) {
    if (username.length <= 0) {
      this.shake();
      this.errTexts.setText(i18next.t('message:emptyUsername'));
      return false;
    }

    if (password.length <= 0) {
      this.shake();
      this.errTexts.setText(i18next.t('message:emptyPassword'));
      return false;
    }

    return true;
  }
}
