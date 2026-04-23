import InputText from 'phaser3-rex-plugins/plugins/inputtext';
import { BaseUi } from '@poposafari/core';
import { DEPTH, KEY, SFX, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addText, addTextInput, addWindow } from '@poposafari/utils';
import i18next from 'i18next';
import { GameScene } from '@poposafari/scenes';

export interface NameInputResult {
  confirmed: boolean;
  value: string;
}

export class NameInputUi extends BaseUi {
  scene: GameScene;

  private modalWindow!: GWindow;
  private titleText!: GText;
  private inputField!: InputText;
  private inputWindow!: GWindow;
  private confirmBtn!: GWindow;
  private confirmBtnText!: GText;
  private cancelBtn!: GWindow;
  private cancelBtnText!: GText;

  private resolver: ((result: NameInputResult) => void) | null = null;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.MESSAGE);
    this.scene = scene;
    this.createLayout();
  }

  onInput(key: string): void {
    switch (key) {
      case KEY.ENTER:
        this.confirm();
        break;
      case KEY.ESC:
        this.cancel();
        break;
    }
  }

  errorEffect(errorMsg: string): void {}

  waitForInput(): Promise<NameInputResult> {
    return new Promise((resolve) => {
      this.resolver = resolve;
    });
  }

  /** 모달을 열고 결과를 반환하는 편의 메서드 */
  open(title: string, defaultValue: string, maxLength: number = 20): Promise<NameInputResult> {
    this.titleText.setText(title);
    this.inputField.setText(defaultValue);
    this.show();
    this.inputField.setFocus();
    return this.waitForInput();
  }

  createLayout(): void {
    this.modalWindow = addWindow(this.scene, TEXTURE.WINDOW_0, 0, 0, 550, 350, 4, 16, 16, 16, 16);

    this.titleText = addText(
      this.scene,
      0,
      -100,
      i18next.t('pc:enterName'),
      55,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    this.inputWindow = addWindow(this.scene, TEXTURE.WINDOW_0, 0, 0, 420, 70, 2, 16, 16, 16, 16);

    this.inputField = addTextInput(this.scene, -190, 0, 25, '100', 420, 70, TEXTSTYLE.WHITE, {
      type: 'text',
      placeholder: '',
      maxLength: 20,
    });

    // 결정하기 버튼
    this.confirmBtn = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      -120,
      +100,
      200,
      65,
      2,
      16,
      16,
      16,
      16,
    )
      .setScrollFactor(0)
      .setInteractive({ cursor: 'pointer' });

    this.confirmBtnText = addText(
      this.scene,
      -120,
      +100,
      i18next.t('pc:confirm'),
      40,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    // 취소하기 버튼
    this.cancelBtn = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      +120,
      +100,
      200,
      65,
      2,
      16,
      16,
      16,
      16,
    )
      .setScrollFactor(0)
      .setInteractive({ cursor: 'pointer' });

    this.cancelBtnText = addText(
      this.scene,
      +120,
      +100,
      i18next.t('pc:cancelAction'),
      40,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    this.setupMouseEvents();

    this.add([
      this.modalWindow,
      this.titleText,
      this.inputWindow,
      this.inputField,
      this.confirmBtn,
      this.confirmBtnText,
      this.cancelBtn,
      this.cancelBtnText,
    ]);
  }

  private setupMouseEvents(): void {
    this.confirmBtn.on('pointerover', () => {
      this.confirmBtn.setTint(0xcccccc);
      this.confirmBtnText.setTint(0xcccccc);
    });
    this.confirmBtn.on('pointerout', () => {
      this.confirmBtn.clearTint();
      this.confirmBtnText.clearTint();
    });
    this.confirmBtn.on('pointerup', () => this.confirm());

    this.cancelBtn.on('pointerover', () => {
      this.cancelBtn.setTint(0xcccccc);
      this.cancelBtnText.setTint(0xcccccc);
    });
    this.cancelBtn.on('pointerout', () => {
      this.cancelBtn.clearTint();
      this.cancelBtnText.clearTint();
    });
    this.cancelBtn.on('pointerup', () => this.cancel());
  }

  private confirm(): void {
    const value = this.inputField.text.trim();
    this.scene.getAudio().playEffect(SFX.CURSOR_0);
    this.hide();
    if (this.resolver) {
      this.resolver({ confirmed: true, value });
      this.resolver = null;
    }
  }

  private cancel(): void {
    this.scene.getAudio().playEffect(SFX.CURSOR_0);
    this.hide();
    if (this.resolver) {
      this.resolver({ confirmed: false, value: '' });
      this.resolver = null;
    }
  }
}
