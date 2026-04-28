import { BaseUi, IInputHandler, IRefreshableLanguage } from '@poposafari/core';
import i18next from '@poposafari/i18n';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, EASE, SFX, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addContainer, addText, addWindow } from '@poposafari/utils';

const HINT_DELAY_MS = 5000;
const HINT_BLINK_MS = 500;

export interface MessageConfig {
  name?: string;
  speed?: number;
  window?: TEXTURE | string;
  resolveWhen?: 'close' | 'displayed';
  showHint?: boolean;
}

export abstract class MessageUi extends BaseUi implements IInputHandler, IRefreshableLanguage {
  scene: GameScene;

  protected container!: GContainer;
  protected window!: GWindow;
  protected text!: GText;
  protected hintText!: GText;
  protected fullText: string = '';
  protected isTyping: boolean = false;

  private typingTimer: Phaser.Time.TimerEvent | null = null;
  protected resolveFunction: (() => void) | null = null;
  private resolveWhenDisplayed: boolean = false;
  protected inputLocked: boolean = false;
  /** 시퀀스 중간 메시지일 때 close() 시 윈도우를 유지한다. */
  protected keepWindowOpen: boolean = false;
  private currentShowHint: boolean = true;

  private hintTimer: Phaser.Time.TimerEvent | null = null;
  private hintBlinkTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.MESSAGE_TOP);

    this.scene = scene;
    this.createLayout();
    this.add([this.container]);
    this.setVisible(false);
  }

  abstract onInput(key: string): void;

  createLayout() {
    const { width } = this.scene.cameras.main;
    this.container = addContainer(this.scene, DEPTH.MESSAGE_TOP);
    this.window = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      0,
      width,
      270,
      3,
      16,
      16,
      16,
      16,
    );
    this.text = addText(
      this.scene,
      -880,
      -70,
      '',
      75,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setOrigin(0, 0);

    this.hintText = addText(
      this.scene,
      +940,
      -220,
      i18next.t('msg:pressZOrEnter'),
      90,
      '100',
      'left',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    );
    this.hintText.setOrigin(1, 0);
    this.hintText.setVisible(false);

    this.container.setY(405);
    this.container.add([this.window, this.text, this.hintText]);
  }

  public async showMessage(content: string | string[], config: MessageConfig = {}): Promise<void> {
    const contents = Array.isArray(content) ? content : [content];
    if (contents.length === 0) return;

    this.window.setTexture((config.window as TEXTURE) ?? this.scene.getOption().getWindow());

    this.show(); // Input Stack Push
    this.setVisible(true);

    for (let i = 0; i < contents.length; i++) {
      const isLast = i === contents.length - 1;
      this.keepWindowOpen = !isLast;
      await this.showOne(contents[i], config);
    }
    this.keepWindowOpen = false;
  }

  private showOne(content: string, config: MessageConfig): Promise<void> {
    this.scene.getAudio().playEffect(SFX.CURSOR_0);

    this.cancelHintTimer();

    this.inputLocked = true;
    this.scene.time.delayedCall(100, () => {
      this.inputLocked = false;
    });

    this.fullText = content;
    this.text.setText('');

    const speed = config.speed !== undefined ? config.speed : this.scene.getOption().getTextSpeed();
    this.resolveWhenDisplayed = config.resolveWhen === 'displayed';
    this.currentShowHint = config.showHint !== false;

    if (speed === 0) {
      this.text.setText(this.fullText);
      this.onTypingComplete();
    } else {
      this.startTyping(speed);
    }

    return new Promise<void>((resolve) => {
      this.resolveFunction = resolve;
    });
  }

  protected startTyping(speed: number) {
    this.isTyping = true;
    let idx = 0;

    if (this.typingTimer) this.typingTimer.remove();

    this.typingTimer = this.scene.time.addEvent({
      delay: speed,
      callback: () => {
        this.text.text += this.fullText[idx];
        idx++;
        if (idx >= this.fullText.length) {
          this.stopTyping();
        }
      },
      repeat: this.fullText.length - 1,
    });
  }

  protected stopTyping() {
    this.isTyping = false;

    if (this.typingTimer) {
      this.typingTimer.remove();
      this.typingTimer = null;
    }

    this.text.setText(this.fullText);
    this.onTypingComplete();
  }

  protected close() {
    this.cancelHintTimer();

    if (!this.keepWindowOpen) {
      this.hide();
      this.setVisible(false);
    }

    if (this.resolveFunction) {
      this.resolveFunction();
      this.resolveFunction = null;
    }
  }

  protected onTypingComplete(): void {
    if (this.resolveWhenDisplayed && this.resolveFunction) {
      this.resolveFunction();
      this.resolveFunction = null;
      this.resolveWhenDisplayed = false;
    }
    this.startHintTimer();
  }

  private startHintTimer(): void {
    this.cancelHintTimer();
    if (!this.currentShowHint) return;
    this.hintTimer = this.scene.time.delayedCall(HINT_DELAY_MS, () => {
      this.showHint();
    });
  }

  private cancelHintTimer(): void {
    if (this.hintTimer) {
      this.hintTimer.remove();
      this.hintTimer = null;
    }
    this.hideHint();
  }

  private showHint(): void {
    this.hintText.setVisible(true);
    this.hintText.setAlpha(1);
    this.hintBlinkTween = this.scene.tweens.add({
      targets: this.hintText,
      alpha: 0,
      duration: HINT_BLINK_MS,
      yoyo: true,
      repeat: -1,
      ease: EASE.LINEAR,
    });
  }

  private hideHint(): void {
    if (this.hintBlinkTween) {
      this.hintBlinkTween.remove();
      this.hintBlinkTween = null;
    }
    this.hintText.setAlpha(1);
    this.hintText.setVisible(false);
  }

  onRefreshLanguage(): void {
    this.text.setText(i18next.t(this.fullText));
    this.hintText.setText(i18next.t('msg:pressZOrEnter'));
  }

  override hide(): void {
    this.setScale(1);
    super.hide();
  }
}
