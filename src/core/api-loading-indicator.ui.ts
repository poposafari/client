import i18next from 'i18next';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, TEXTSHADOW, TEXTSTYLE } from '@poposafari/types';
import { addText, addWindow } from '@poposafari/utils';
import { BaseUi } from './base.ui';

const MARGIN = 40;
const WINDOW_WIDTH = 320;
const WINDOW_HEIGHT = 100;
const SHOW_DELAY_MS = 200;

export class ApiLoadingIndicatorUi extends BaseUi {
  scene: GameScene;

  private window!: GWindow;
  private text!: GText;
  private activeCount = 0;
  private inputBlocked = false;
  private showTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.API);
    this.scene = scene;
    this.createLayout();

    // 우상단 corner 고정
    const { width } = scene.cameras.main;
    this.setPosition(width - MARGIN - WINDOW_WIDTH / 2, MARGIN + WINDOW_HEIGHT / 2);
  }

  createLayout(): void {
    this.window = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      0,
      WINDOW_WIDTH,
      WINDOW_HEIGHT,
      4,
      16,
      16,
      16,
      16,
    );
    this.text = addText(
      this.scene,
      0,
      0,
      i18next.t('etc:loading'),
      50,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.add([this.window, this.text]);
  }

  /** 요청 시작 — 입력 즉시 차단, 시각 표시는 debounce */
  start(): void {
    this.activeCount++;
    if (this.activeCount === 1) {
      if (!this.inputBlocked) {
        this.inputManager.push(this);
        this.inputBlocked = true;
      }

      if (!this.showTimer) {
        this.showTimer = this.scene.time.delayedCall(SHOW_DELAY_MS, () => {
          this.showTimer = null;
          if (this.activeCount > 0) this.reveal();
        });
      }
    }
  }

  end(): void {
    this.activeCount = Math.max(0, this.activeCount - 1);
    if (this.activeCount === 0) {
      if (this.showTimer) {
        this.showTimer.remove();
        this.showTimer = null;
      }
      this.setVisible(false);
      if (this.inputBlocked) {
        this.inputManager.pop(this);
        this.inputBlocked = false;
      }
    }
  }

  private reveal(): void {
    const zoom = this.scene.cameras.main.zoom;
    this.setScale(zoom > 0 ? 1 / zoom : 1);
    this.window.setTexture(this.scene.getOption().getWindow());
    this.text.setText(i18next.t('etc:loading'));
    this.setVisible(true);
  }

  destroy(fromScene?: boolean): void {
    if (this.showTimer) {
      this.showTimer.remove();
      this.showTimer = null;
    }
    if (this.inputBlocked) {
      this.inputManager.pop(this);
      this.inputBlocked = false;
    }
    super.destroy(fromScene);
  }

  onInput(_key: string): void {}
  errorEffect(_errorMsg: string): void {}
  waitForInput(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
