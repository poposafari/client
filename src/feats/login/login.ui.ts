import i18next from 'i18next';
import InputText from 'phaser3-rex-plugins/plugins/inputtext';
import { AudioManager, BaseUi, IInputHandler, IRefreshableLanguage } from '@poposafari/core';
import { DEPTH, SFX, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { LoginLocalUiInput } from '@poposafari/types/dto';
import {
  addBackground,
  addContainer,
  addImage,
  addText,
  addTextInput,
  addWindow,
  getBackgroundKey,
  isValidPassword,
  isValidUsername,
  runFloatEffect,
  runShakeEffect,
} from '@poposafari/utils';
import BBCodeText from 'phaser3-rex-plugins/plugins/bbcodetext';
import { GameScene } from '@poposafari/scenes';

export class LoginUi extends BaseUi implements IInputHandler, IRefreshableLanguage {
  scene: GameScene;
  private audio: AudioManager;
  private inputResolver: ((result: LoginLocalUiInput) => void) | null = null;

  private bg!: GImage;
  private title!: GImage;
  private modalContainer!: GContainer;
  private modalWindow!: GWindow;
  private modalTitle!: GText;
  private modalErrorMsg!: GText;

  private labelContainer!: GContainer;
  private labels: GText[] = [];
  private labelWindows: GWindow[] = [];
  private labelInputs: InputText[] = [];

  private btnContainer!: GContainer;
  private btnTitles: GText[] = [];
  private btnWindows: GWindow[] = [];

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.DEFAULT);
    this.scene = scene;
    this.audio = scene.getAudio();

    this.createLayout();
    this.createMouseEvent();

    this.modalErrorMsg.setText('');

    this.audio.playEffect(SFX.OPEN_0);
    for (const container of [this.modalContainer, this.labelContainer, this.btnContainer]) {
      runFloatEffect(scene, container, +100, 1000);
    }
  }

  onInput(key: string): void {}

  createLayout() {
    this.bg = addBackground(this.scene, TEXTURE.BG_1);
    this.title = addImage(this.scene, TEXTURE.LOGO_0, undefined, 0, -420).setScale(3.2);

    this.createModal();
    this.createLabel();
    this.createButton();

    this.add([this.bg, this.title, this.modalContainer, this.labelContainer, this.btnContainer]);
  }

  private createModal() {
    this.modalContainer = addContainer(this.scene, DEPTH.DEFAULT + 1);
    this.modalWindow = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      0,
      650,
      650,
      4,
      16,
      16,
      16,
      16,
    );
    this.modalTitle = addText(
      this.scene,
      0,
      -240,
      i18next.t('menu:login'),
      80,
      'bold',
      'center',
      TEXTSTYLE.SIG_0,
      TEXTSHADOW.SIG_1,
    );
    this.modalErrorMsg = addText(
      this.scene,
      -250,
      +85,
      '에러_테스트',
      40,
      'bold',
      'left',
      TEXTSTYLE.ERROR,
      TEXTSHADOW.ERROR,
    ).setOrigin(0, 0);

    this.modalContainer.add([this.modalWindow, this.modalTitle, this.modalErrorMsg]);
  }

  private createLabel() {
    this.labelContainer = addContainer(this.scene, DEPTH.DEFAULT + 1);

    this.labelContainer.setY(-100);

    this.labels.push(
      addText(
        this.scene,
        -250,
        -80,
        i18next.t('menu:username') + ' :',
        40,
        '100',
        'left',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      ),
    );
    this.labelWindows.push(
      addWindow(this.scene, this.scene.getOption().getWindow(), 0, -20, 500, 70, 2, 16, 16, 16, 16),
    );
    this.labelInputs.push(
      addTextInput(this.scene, -230, -20, 25, '100', 500, 70, TEXTSTYLE.WHITE, {
        type: 'text',
        placeholder: i18next.t('menu:enterYourUsername'),
        minLength: 5,
        maxLength: 20,
      }),
    );

    this.labels.push(
      addText(
        this.scene,
        -250,
        +70,
        i18next.t('menu:password') + ' :',
        40,
        '100',
        'left',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      ),
    );
    this.labelWindows.push(
      addWindow(
        this.scene,
        this.scene.getOption().getWindow(),
        0,
        +130,
        500,
        70,
        2,
        16,
        16,
        16,
        16,
      ),
    );
    this.labelInputs.push(
      addTextInput(this.scene, -230, +130, 25, '100', 500, 70, TEXTSTYLE.WHITE, {
        type: 'password',
        placeholder: i18next.t('menu:enterYourPassword'),
        minLength: 5,
        maxLength: 20,
      }),
    );

    this.labelContainer.add([
      this.labels[0],
      this.labelWindows[0],
      this.labelInputs[0],
      this.labels[1],
      this.labelWindows[1],
      this.labelInputs[1],
    ]);
  }

  private createButton() {
    this.btnContainer = addContainer(this.scene, DEPTH.DEFAULT + 1);
    this.btnContainer.setY(+215);

    this.btnWindows.push(
      addWindow(
        this.scene,
        this.scene.getOption().getWindow(),
        -140,
        0,
        220,
        70,
        2,
        16,
        16,
        16,
        16,
      ).setInteractive({
        cursor: 'pointer',
      }),
    );

    this.btnTitles.push(
      addText(
        this.scene,
        -140,
        0,
        i18next.t('menu:login'),
        40,
        '100',
        'center',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      ),
    );

    this.btnWindows.push(
      addWindow(
        this.scene,
        this.scene.getOption().getWindow(),
        +140,
        0,
        220,
        70,
        2,
        16,
        16,
        16,
        16,
      ).setInteractive({
        cursor: 'pointer',
      }),
    );
    this.btnTitles.push(
      addText(
        this.scene,
        +140,
        0,
        i18next.t('menu:register'),
        40,
        '100',
        'center',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      ),
    );

    this.btnContainer.add([
      this.btnWindows[0],
      this.btnTitles[0],
      this.btnWindows[1],
      this.btnTitles[1],
    ]);
  }

  private createMouseEvent() {
    this.btnWindows[0].on('pointerover', () => {
      this.btnWindows[0].setTint(0xcccccc);
      this.btnTitles[0].setTint(0xcccccc);
    });
    this.btnWindows[0].on('pointerout', () => {
      this.btnWindows[0].clearTint();
      this.btnTitles[0].clearTint();
    });
    this.btnWindows[0].on('pointerup', () => {
      this.validateAndSubmit();
    });

    this.btnWindows[1].on('pointerover', () => {
      this.btnWindows[1].setTint(0xcccccc);
      this.btnTitles[1].setTint(0xcccccc);
    });
    this.btnWindows[1].on('pointerout', () => {
      this.btnWindows[1].clearTint();
      this.btnTitles[1].clearTint();
    });
    this.btnWindows[1].on('pointerup', () => {
      if (this.inputResolver) {
        this.inputResolver('register');
        this.inputResolver = null;
      }
    });
  }

  waitForInput(): Promise<LoginLocalUiInput> {
    return new Promise((resolve) => {
      this.inputResolver = resolve;
    });
  }

  private validateAndSubmit() {
    const username = this.labelInputs[0].text;
    const password = this.labelInputs[1].text;

    if (!username) {
      this.errorEffect(i18next.t('error:emptyUsername'));
      return;
    }

    if (!password) {
      this.errorEffect(i18next.t('error:emptyPassword'));
      return;
    }

    if (!isValidUsername(username) || !isValidPassword(password)) {
      this.errorEffect(i18next.t('error:invalidUsernameOrPassword'));
      return;
    }

    if (this.inputResolver) {
      this.inputResolver({
        username,
        password,
      });
      this.inputResolver = null;
    }
  }

  setErrorText(msg: string): void {
    this.modalErrorMsg.setText(msg);
  }

  errorEffect(errorMsg: string) {
    this.audio.playEffect(SFX.BUZZER);

    runShakeEffect(this.scene, this.modalContainer);
    runShakeEffect(this.scene, this.labelContainer);
    runShakeEffect(this.scene, this.btnContainer);
    this.modalErrorMsg.setText(errorMsg);
  }

  onRefreshLanguage(): void {
    this.modalTitle.setText(i18next.t('menu:login'));
    this.modalErrorMsg.setText('');
    this.labels[0].setText(i18next.t('menu:username') + ' :');
    this.labels[1].setText(i18next.t('menu:password') + ' :');
    this.btnTitles[0].setText(i18next.t('menu:login'));
    this.btnTitles[1].setText(i18next.t('menu:register'));
  }

  show(): void {
    this.bg.setTexture(getBackgroundKey());
    super.show();
  }
}
