import InputText from 'phaser3-rex-plugins/plugins/inputtext';

import { BaseUi, IInputHandler, InputManager, IRefreshableLanguage } from '@poposafari/core';
import { DEPTH, SFX, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import {
  addBackground,
  addContainer,
  addText,
  addTextInput,
  addWindow,
  getBackgroundKey,
  isValidPassword,
  isValidUsername,
  runFloatEffect,
  runShakeEffect,
} from '@poposafari/utils';
import i18next from 'i18next';
import { RegisterLocalUiInput } from '@poposafari/types/dto';
import { GameScene } from '@poposafari/scenes';

export class RegisterUi extends BaseUi implements IInputHandler, IRefreshableLanguage {
  scene: GameScene;
  private inputResolver: ((result: RegisterLocalUiInput) => void) | null = null;

  private bg!: GImage;

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

    this.createLayout();
    this.createMouseEvent();

    this.modalErrorMsg.setText('');

    this.scene.getAudio().playEffect(SFX.OPEN_0);
    for (const container of [this.modalContainer, this.labelContainer, this.btnContainer]) {
      runFloatEffect(scene, container, +100, 1000);
    }
  }

  onInput(key: string): void {}

  createLayout() {
    this.bg = addBackground(this.scene, TEXTURE.BG_1);

    this.createModal();
    this.createLabel();
    this.createButton();

    this.add([this.bg, this.modalContainer, this.labelContainer, this.btnContainer]);
  }

  private createModal() {
    this.modalContainer = addContainer(this.scene, DEPTH.DEFAULT + 1);
    this.modalWindow = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      0,
      650,
      850,
      4,
      16,
      16,
      16,
      16,
    );
    this.modalTitle = addText(
      this.scene,
      0,
      -320,
      i18next.t('menu:register'),
      80,
      'bold',
      'center',
      TEXTSTYLE.SIG_0,
      TEXTSHADOW.SIG_1,
    );
    this.modalErrorMsg = addText(
      this.scene,
      -250,
      +175,
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
        -120,
        i18next.t('menu:username') + ' :',
        40,
        '100',
        'left',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      ),
    );
    this.labelWindows.push(
      addWindow(this.scene, this.scene.getOption().getWindow(), 0, -60, 500, 70, 2, 16, 16, 16, 16),
    );
    this.labelInputs.push(
      addTextInput(this.scene, -230, -60, 25, '100', 500, 70, TEXTSTYLE.WHITE, {
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
        +20,
        i18next.t('menu:password') + ' :',
        40,
        '100',
        'left',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      ),
    );
    this.labelWindows.push(
      addWindow(this.scene, this.scene.getOption().getWindow(), 0, +80, 500, 70, 2, 16, 16, 16, 16),
    );
    this.labelInputs.push(
      addTextInput(this.scene, -230, +80, 25, '100', 500, 70, TEXTSTYLE.WHITE, {
        type: 'password',
        placeholder: i18next.t('menu:enterYourPassword'),
        minLength: 5,
        maxLength: 20,
      }),
    );

    this.labels.push(
      addText(
        this.scene,
        -250,
        +160,
        i18next.t('menu:repassword') + ' :',
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
        +220,
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
      addTextInput(this.scene, -230, +220, 25, '100', 500, 70, TEXTSTYLE.WHITE, {
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
      this.labels[2],
      this.labelWindows[2],
      this.labelInputs[2],
    ]);
  }

  private createButton() {
    this.btnContainer = addContainer(this.scene, DEPTH.DEFAULT + 1);
    this.btnContainer.setY(+310);

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
        i18next.t('menu:register'),
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
        i18next.t('menu:login'),
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
        this.inputResolver('login');
        this.inputResolver = null;
      }
    });
  }

  waitForInput(): Promise<RegisterLocalUiInput> {
    return new Promise((resolve) => {
      this.inputResolver = resolve;
    });
  }

  private validateAndSubmit() {
    const username = this.labelInputs[0].text;
    const password = this.labelInputs[1].text;
    const repassword = this.labelInputs[2].text;

    if (!username) {
      this.errorEffect(i18next.t('error:emptyUsername'));
      return;
    }

    if (!password) {
      this.errorEffect(i18next.t('error:emptyPassword'));
      return;
    }

    if (!isValidUsername(username)) {
      this.errorEffect(i18next.t('error:invalidInputUsername'));
      return;
    }

    if (!isValidPassword(password)) {
      this.errorEffect(i18next.t('error:invalidInputPassword'));
      return;
    }

    if (password !== repassword) {
      this.errorEffect(i18next.t('error:notMatchPasswordAndRePassword'));
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

  errorEffect(errorMsg: string) {
    this.scene.getAudio().playEffect(SFX.BUZZER);

    runShakeEffect(this.scene, this.modalContainer);
    runShakeEffect(this.scene, this.labelContainer);
    runShakeEffect(this.scene, this.btnContainer);
    this.modalErrorMsg.setText(errorMsg);
  }

  onRefreshLanguage(): void {
    this.modalTitle.setText(i18next.t('menu:register'));
    this.modalErrorMsg.setText('');
    this.labels[0].setText(i18next.t('menu:username') + ' :');
    this.labels[1].setText(i18next.t('menu:password') + ' :');
    this.labels[2].setText(i18next.t('menu:repassword') + ' :');
  }

  show(): void {
    this.bg.setTexture(getBackgroundKey());
    super.show();
  }
}
