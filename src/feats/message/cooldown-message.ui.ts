import { BaseUi, IInputHandler, IRefreshableLanguage } from '@poposafari/core';
import i18next from '@poposafari/i18n';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, EASE, KEY, SFX, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addContainer, addText, addWindow } from '@poposafari/utils';

const WINDOW_WIDTH = 1400;
const WINDOW_HEIGHT = 600;
const HEADER_Y = -230;
const BODY_Y = -40;
const TIMER_Y = +200;
const HINT_BLINK_MS = 500;

export class CooldownMessageUi extends BaseUi implements IInputHandler, IRefreshableLanguage {
  scene: GameScene;

  private container!: GContainer;
  private window!: GWindow;
  private headerText!: GText;
  private bodyText!: GText;
  private timerText!: GText;

  private currentBody: string = '';
  private cooldownTimer: Phaser.Time.TimerEvent | null = null;
  private cooldownUnlocked: boolean = false;
  private inputLocked: boolean = false;
  private cooldownResolve: (() => void) | null = null;
  private timerBlinkTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.MESSAGE_TOP);
    this.scene = scene;
    this.createLayout();
    this.add([this.container]);
    this.setVisible(false);
  }

  createLayout(): void {
    this.container = addContainer(this.scene, DEPTH.MESSAGE_TOP);

    this.window = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      0,
      WINDOW_WIDTH,
      WINDOW_HEIGHT,
      3,
      16,
      16,
      16,
      16,
    );

    this.headerText = addText(
      this.scene,
      0,
      HEADER_Y,
      i18next.t('etc:notice'),
      90,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    this.bodyText = addText(
      this.scene,
      0,
      BODY_Y,
      '',
      75,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.bodyText.setOrigin(0.5, 0.5);

    this.timerText = addText(
      this.scene,
      0,
      TIMER_Y,
      '',
      80,
      '100',
      'center',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    );
    this.timerText.setOrigin(0.5, 0.5);

    this.container.add([this.window, this.headerText, this.bodyText, this.timerText]);
  }

  public async showCooldown(body: string, cooldownSec: number): Promise<void> {
    this.cooldownUnlocked = false;
    this.scene.getAudio().playEffect(SFX.CURSOR_0);

    this.headerText.setText(i18next.t('etc:notice'));

    this.currentBody = body;
    this.bodyText.setText(body);

    this.timerText.setText(i18next.t('etc:cooldownSeconds', { seconds: cooldownSec }));

    this.show();
    this.setVisible(true);

    this.inputLocked = true;
    this.scene.time.delayedCall(100, () => {
      this.inputLocked = false;
    });

    let remaining = cooldownSec;
    this.cooldownTimer = this.scene.time.addEvent({
      delay: 1000,
      repeat: cooldownSec - 1,
      callback: () => {
        remaining--;
        if (remaining > 0) {
          this.timerText.setText(i18next.t('etc:cooldownSeconds', { seconds: remaining }));
          return;
        }
        if (this.cooldownTimer) {
          this.cooldownTimer.remove();
          this.cooldownTimer = null;
        }
        this.cooldownUnlocked = true;
        this.timerText.setText(i18next.t('etc:pressZOrEnter'));
        this.startHintBlink();
      },
    });

    return new Promise<void>((resolve) => {
      this.cooldownResolve = resolve;
    });
  }

  onInput(key: string): void {
    if (this.inputLocked) return;
    if (!this.cooldownUnlocked) return;
    if (key === KEY.Z || key === KEY.ENTER) {
      this.close();
    }
  }

  errorEffect(_errorMsg: string): void {
    throw new Error('Method not implemented.');
  }

  waitForInput(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  onRefreshLanguage(): void {
    this.headerText.setText(i18next.t('etc:notice'));
    this.bodyText.setText(this.currentBody);
    if (this.cooldownUnlocked) {
      this.timerText.setText(i18next.t('etc:pressZOrEnter'));
    }
  }

  private startHintBlink(): void {
    this.stopHintBlink();
    this.timerText.setAlpha(1);
    this.timerBlinkTween = this.scene.tweens.add({
      targets: this.timerText,
      alpha: 0,
      duration: HINT_BLINK_MS,
      yoyo: true,
      repeat: -1,
      ease: EASE.LINEAR,
    });
  }

  private stopHintBlink(): void {
    if (this.timerBlinkTween) {
      this.timerBlinkTween.remove();
      this.timerBlinkTween = null;
    }
    this.timerText.setAlpha(1);
  }

  private close(): void {
    if (this.cooldownTimer) {
      this.cooldownTimer.remove();
      this.cooldownTimer = null;
    }
    this.stopHintBlink();
    this.cooldownUnlocked = false;

    this.scene.getInputManager().clearInputQueue();

    this.hide();
    this.setVisible(false);

    const resolve = this.cooldownResolve;
    this.cooldownResolve = null;
    if (resolve) resolve();
  }
}
