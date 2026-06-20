import { GameScene } from '@poposafari/scenes';
import { TextAlign, TEXTSHADOW, TEXTSTYLE } from '@poposafari/types';
import { addText } from '@poposafari/utils';

/**
 * 좌 → 우로 한 글자씩 나타나는 타이핑 텍스트.
 *
 * @example
 * const notice = new TypingTextContainer(scene, x, y, {
 *   fontSize: 40,
 *   textStyle: TEXTSTYLE.YELLOW,
 *   typeSpeed: 60,
 *   hideDelay: 3000,
 * });
 * notice.typeOut(i18next.t('etc:githubNotice'));
 */
export interface TypingTextOptions {
  /** 폰트 크기 (기본 40) */
  fontSize?: number;
  /** 폰트 두께 (기본 '100') */
  fontWeight?: number | string;
  /** 텍스트 정렬/origin (기본 'left') */
  align?: TextAlign;
  /** 텍스트 스타일(색) (기본 TEXTSTYLE.WHITE) */
  textStyle?: TEXTSTYLE;
  /** 텍스트 그림자 (기본 TEXTSHADOW.GRAY) */
  textShadow?: TEXTSHADOW;
  /** 한 글자 출력 간격 ms (기본 60). 0 이면 즉시 전체 출력 */
  typeSpeed?: number;
  /** 타이핑 완료 후 자동 숨김까지의 대기 ms. 미지정/0 이하면 자동 숨김 안 함 */
  hideDelay?: number;
  /** 자동 숨김 시 페이드 아웃 시간 ms (기본 400) */
  fadeDuration?: number;
}

const DEFAULTS = {
  fontSize: 40,
  fontWeight: '100' as number | string,
  align: 'left' as TextAlign,
  textStyle: TEXTSTYLE.WHITE,
  textShadow: TEXTSHADOW.GRAY,
  typeSpeed: 60,
  hideDelay: 0,
  fadeDuration: 400,
};

export class TypingTextContainer extends Phaser.GameObjects.Container {
  scene: GameScene;
  private label!: GText;
  private opts: typeof DEFAULTS;

  private typingTimer: Phaser.Time.TimerEvent | null = null;
  private hideTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: GameScene, x = 0, y = 0, options: TypingTextOptions = {}) {
    super(scene, x, y);
    this.scene = scene;
    this.opts = { ...DEFAULTS, ...options };
    this.setScrollFactor(0);

    this.label = addText(
      this.scene,
      0,
      0,
      '',
      this.opts.fontSize,
      this.opts.fontWeight,
      this.opts.align,
      this.opts.textStyle,
      this.opts.textShadow,
    );
    this.label.setAlpha(0);

    this.add(this.label);
    scene.add.existing(this);
  }

  /**
   * content 를 좌 → 우로 한 글자씩 출력한다.
   * 재호출 시 진행 중이던 타이핑/숨김을 정리하고 처음부터 다시 출력한다.
   * */
  typeOut(content: string, onComplete?: () => void): void {
    this.cancelTimers();
    this.scene.tweens.killTweensOf(this.label);

    this.label.setText('');
    this.label.setAlpha(1);

    if (this.opts.typeSpeed <= 0) {
      this.label.setText(content);
      this.onTypingDone(onComplete);
      return;
    }

    let idx = 0;
    this.typingTimer = this.scene.time.addEvent({
      delay: this.opts.typeSpeed,
      callback: () => {
        this.label.text += content[idx];
        idx++;
        if (idx >= content.length) {
          this.typingTimer?.remove();
          this.typingTimer = null;
          this.onTypingDone(onComplete);
        }
      },
      repeat: content.length - 1,
    });
  }

  clear(): void {
    this.cancelTimers();
    this.scene.tweens.killTweensOf(this.label);
    this.label.setText('');
    this.label.setAlpha(0);
  }

  getText(): GText {
    return this.label;
  }

  private onTypingDone(onComplete?: () => void): void {
    onComplete?.();
    if (this.opts.hideDelay > 0) {
      this.hideTimer = this.scene.time.delayedCall(this.opts.hideDelay, () => {
        this.scene.tweens.add({
          targets: this.label,
          alpha: 0,
          duration: this.opts.fadeDuration,
        });
      });
    }
  }

  private cancelTimers(): void {
    this.typingTimer?.remove();
    this.typingTimer = null;
    this.hideTimer?.remove();
    this.hideTimer = null;
  }

  override destroy(fromScene?: boolean): void {
    this.cancelTimers();
    super.destroy(fromScene);
  }
}
