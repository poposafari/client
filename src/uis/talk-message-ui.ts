import { ANIMATION, AUDIO, DEPTH, KEY, TEXTSTYLE, TEXTURE } from '../enums';
import { KeyboardManager } from '../core/manager/keyboard-manager';
import { Talk } from '../types';
import { delay, playEffectSound } from './ui';
import { MessageUi } from './message-ui';
import i18next from '../i18n';

export class TalkMessageUi extends MessageUi {
  private guideTextContainer!: Phaser.GameObjects.Container;
  private endMarkContainer!: Phaser.GameObjects.Container;
  private endMark!: Phaser.GameObjects.Sprite;
  private endMarkTexture!: TEXTURE | string;
  private guideText!: Phaser.GameObjects.Text;
  private guideTextTimer!: Phaser.Time.TimerEvent | null;
  private readonly GUIDE_TEXT_DELAY: number = 5000;

  setup(data?: any): void {
    super.setup(data);

    const width = this.getWidth();
    const height = this.getHeight();

    this.endMarkContainer = this.createTrackedContainer(width / 2 + 830, height / 2 + 410);
    this.guideTextContainer = this.createTrackedContainer(width / 2 + 830, height / 2);
    this.endMark = this.createSprite(TEXTURE.PAUSE_B, 0, 0);

    this.guideText = this.addText(0, +230, i18next.t('menu:guide_talk_message'), TEXTSTYLE.SPLASH_TEXT).setOrigin(0, 0.5);

    this.endMarkContainer.add(this.endMark);
    this.guideTextContainer.add(this.guideText);

    this.endMarkContainer.setScale(this.scale);
    this.endMarkContainer.setVisible(false);
    this.endMarkContainer.setDepth(DEPTH.MESSAGE + 1);
    this.endMarkContainer.setScrollFactor(0);

    this.guideTextContainer.setScale(1);
    this.guideTextContainer.setVisible(false);
    this.guideTextContainer.setDepth(DEPTH.MESSAGE + 1);
    this.guideTextContainer.setScrollFactor(0);
  }

  async show(data: Talk): Promise<boolean> {
    this.setMessageStyle(data.type);

    if (data.type === 'sys') {
      this.endMarkTexture = ANIMATION.PAUSE_W;
    } else {
      this.endMarkTexture = ANIMATION.PAUSE_B;
    }

    this.container.setVisible(true);

    const keyboard = KeyboardManager.getInstance();
    keyboard.setAllowKey([KEY.SELECT, KEY.ENTER]);
    playEffectSound(this.scene, AUDIO.SELECT_0);

    await this.showText(data.content, data.speed);

    await delay(this.scene, data.endDelay);

    return new Promise((resolve) => {
      this.showEndMark(true);
      this.startGuideTextTimer();

      const callback = (key: KEY) => {
        if (key === KEY.SELECT || key === KEY.ENTER) {
          this.cancelGuideTextTimer();
          this.showEndMark(false);
          keyboard.clearCallbacks();
          this.container.setVisible(false);
          this.text.text = '';
          this.textObjects.forEach((obj) => obj.destroy());
          this.textObjects = [];
          if (data.end) data.end();
          resolve(true);
        }
      };
      keyboard.setKeyDownCallback(callback);
      this.trackKeyboardCallback(() => {
        this.cancelGuideTextTimer();
        keyboard.clearCallbacks();
      });
    });
  }

  protected onClean(): void {
    super.onClean();
    this.cancelGuideTextTimer();
  }

  private showEndMark(onoff: boolean) {
    if (onoff) {
      this.endMarkContainer.setVisible(true);
      if (this.endMark && this.endMark.anims) {
        this.endMark.anims.play(this.endMarkTexture);
      }
    } else {
      this.endMarkContainer.setVisible(false);
      if (this.endMark && this.endMark.anims) {
        this.endMark.anims.stop();
      }
    }
  }

  private startGuideTextTimer(): void {
    this.cancelGuideTextTimer();

    this.guideTextTimer = this.scene.time.delayedCall(this.GUIDE_TEXT_DELAY, () => {
      this.showGuideText();
      this.guideTextTimer = null;
    });
  }

  private showGuideText(): void {
    const mapWidth = this.getWidth();
    const textDisplayWidth = this.guideText.displayWidth;

    const containerCenterX = +90;
    const calculatedX = containerCenterX - textDisplayWidth;

    this.guideText.setX(calculatedX);
    this.guideTextContainer.setVisible(true);
    this.guideTextContainer.setAlpha(0);

    this.scene.tweens.add({
      targets: this.guideTextContainer,
      alpha: 1,
      duration: 800,
      ease: 'Linear',
      onComplete: () => {
        this.startGuideTextPulse();
      },
    });
  }

  private startGuideTextPulse(): void {
    this.scene.tweens.add({
      targets: this.guideTextContainer,
      alpha: 0.3,
      duration: 500,
      ease: 'Linear',
      yoyo: true,
      repeat: -1,
    });
  }

  private cancelGuideTextTimer(): void {
    if (this.guideTextTimer) {
      this.guideTextTimer.remove();
      this.guideTextTimer = null;
    }
    this.scene.tweens.killTweensOf(this.guideTextContainer);
    this.guideTextContainer.setVisible(false);
    this.guideTextContainer.setAlpha(0);
  }
}
