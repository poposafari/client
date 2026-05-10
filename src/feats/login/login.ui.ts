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
  runFloatEffect,
  runShakeEffect,
} from '@poposafari/utils';
import BBCodeText from 'phaser3-rex-plugins/plugins/bbcodetext';
import { GameScene } from '@poposafari/scenes';
import { VITE_API_BASE_URL } from '@poposafari/env';

export class LoginUi extends BaseUi implements IInputHandler, IRefreshableLanguage {
  scene: GameScene;
  private audio: AudioManager;
  private inputResolver: ((result: LoginLocalUiInput) => void) | null = null;
  private isReady = false;

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

  private oauthContainer!: GContainer;
  private oauthIcons: GImage[] = [];
  private oauthLabel!: GText;
  private oauthWindow!: GWindow;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.DEFAULT);
    this.scene = scene;
    this.audio = scene.getAudio();

    this.createLayout();
    this.createMouseEvent();

    this.modalErrorMsg.setText('');

    this.audio.playEffect(SFX.OPEN_0);
    const containers = [
      this.modalContainer,
      this.labelContainer,
      this.btnContainer,
      this.oauthContainer,
    ];
    containers.forEach((container, idx) => {
      const isLast = idx === containers.length - 1;
      runFloatEffect(
        scene,
        container,
        +100,
        700,
        0,
        isLast ? () => (this.isReady = true) : undefined,
      );
    });
  }

  onInput(key: string): void {}

  createLayout() {
    this.bg = addBackground(this.scene, TEXTURE.BG_1);
    this.title = addImage(this.scene, TEXTURE.LOGO_0, undefined, 0, -420).setScale(3.2);

    this.createModal();
    this.createLabel();
    this.createButton();
    this.createOauth();

    this.add([
      this.bg,
      this.title,
      this.modalContainer,
      this.labelContainer,
      this.btnContainer,
      this.oauthContainer,
    ]);
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
      3.2,
      16,
      16,
      16,
      16,
    );
    this.modalTitle = addText(
      this.scene,
      0,
      -240,
      i18next.t('etc:login'),
      80,
      'bold',
      'center',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    );
    this.modalErrorMsg = addText(
      this.scene,
      -250,
      +100,
      '에러_테스트',
      40,
      'bold',
      'left',
      TEXTSTYLE.ERROR,
      TEXTSHADOW.ERROR,
    ).setOrigin(0, 0);

    this.modalContainer.setY(-20);

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
        i18next.t('etc:username') + ' :',
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
        placeholder: i18next.t('etc:enterYourUsername'),
        minLength: 1,
        maxLength: 64,
      }),
    );

    this.labels.push(
      addText(
        this.scene,
        -250,
        +70,
        i18next.t('etc:password') + ' :',
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
        placeholder: i18next.t('etc:enterYourPassword'),
        minLength: 1,
        maxLength: 128,
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
        i18next.t('etc:login'),
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
        i18next.t('etc:register'),
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

  private createOauth() {
    this.oauthContainer = addContainer(this.scene, DEPTH.DEFAULT + 1);
    this.oauthContainer.setY(+500);

    this.oauthLabel = addText(
      this.scene,
      0,
      -140,
      '-------- OR --------',
      40,
      100,
      'center',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    );

    this.oauthWindow = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      -90,
      650,
      200,
      3.2,
      16,
      16,
      16,
      16,
    );

    this.oauthIcons.push(
      addImage(this.scene, TEXTURE.ICON_GOOGLE, undefined, -50, -65).setInteractive({
        cursor: 'pointer',
      }),
    );
    this.oauthIcons.push(
      addImage(this.scene, TEXTURE.ICON_DISCORD, undefined, +50, -65).setInteractive({
        cursor: 'pointer',
      }),
    );

    this.oauthContainer.add([
      this.oauthWindow,
      this.oauthLabel,
      this.oauthIcons[0],
      this.oauthIcons[1],
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
      if (!this.isReady) return;
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
      if (!this.isReady) return;
      if (this.inputResolver) {
        this.inputResolver('register');
        this.inputResolver = null;
      }
    });

    this.oauthIcons[0].on('pointerover', () => {
      this.oauthIcons[0].setTint(0xcccccc);
    });
    this.oauthIcons[0].on('pointerout', () => {
      this.oauthIcons[0].clearTint();
    });
    this.oauthIcons[0].on('pointerup', () => {
      if (!this.isReady) return;
      const apiBase = VITE_API_BASE_URL ?? 'http://localhost:9000/api';
      window.location.href = `${apiBase}/auth/oauth/google/authorize`;
    });

    this.oauthIcons[1].on('pointerover', () => {
      this.oauthIcons[1].setTint(0xcccccc);
    });
    this.oauthIcons[1].on('pointerout', () => {
      this.oauthIcons[1].clearTint();
    });
    this.oauthIcons[1].on('pointerup', () => {
      if (!this.isReady) return;
      const apiBase = VITE_API_BASE_URL ?? 'http://localhost:9000/api';
      window.location.href = `${apiBase}/auth/oauth/discord/authorize`;
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
      this.errorEffect(i18next.t('error:EMPTY_USERNAME'));
      return;
    }

    if (!password) {
      this.errorEffect(i18next.t('error:EMPTY_PASSWORD'));
      return;
    }

    // 로그인은 가입 정책을 클라이언트에서 검증하지 않는다.
    // 자격증명 일치 여부는 서버가 판단(FAILED_ACCOUNT).
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
    this.modalTitle.setText(i18next.t('etc:login'));
    this.modalErrorMsg.setText('');
    this.labels[0].setText(i18next.t('etc:username') + ' :');
    this.labels[1].setText(i18next.t('etc:password') + ' :');
    this.btnTitles[0].setText(i18next.t('etc:login'));
    this.btnTitles[1].setText(i18next.t('etc:register'));
  }

  show(): void {
    this.bg.setTexture(getBackgroundKey());
    super.show();
  }
}
