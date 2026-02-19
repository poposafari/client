import { BaseUi, IInputHandler, IRefreshableLanguage } from '@poposafari/core';
import i18next from '@poposafari/i18n';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, SFX, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addContainer, addText, addWindow } from '@poposafari/utils';

export interface MessageConfig {
  name?: string;
  speed?: number; // 0이면 타이핑 없이 즉시 출력
  window?: TEXTURE | string;
  /** 'close': Z/ENTER로 닫을 때 resolve (기본값). 'displayed': 출력이 끝나자마자 resolve (메뉴 등 즉시 노출용) */
  resolveWhen?: 'close' | 'displayed';
}

export abstract class MessageUi extends BaseUi implements IInputHandler, IRefreshableLanguage {
  scene: GameScene;

  protected container!: GContainer;
  protected window!: GWindow;
  protected text!: GText;
  protected fullText: string = '';
  protected isTyping: boolean = false;

  private typingTimer: Phaser.Time.TimerEvent | null = null;
  protected resolveFunction: (() => void) | null = null;
  private resolveWhenDisplayed: boolean = false;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.MESSAGE);

    this.scene = scene;
    this.createLayout();
    this.add([this.container]);
    this.setVisible(false);
  }

  abstract onInput(key: string): void;

  createLayout() {
    const { width } = this.scene.cameras.main;
    this.container = addContainer(this.scene, DEPTH.MESSAGE);
    this.window = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      0,
      width,
      270,
      4,
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

    this.container.setY(405);
    this.container.add([this.window, this.text]);
  }

  public async showMessage(content: string, config: MessageConfig = {}): Promise<void> {
    this.scene.getAudio().playEffect(SFX.CURSOR_0);

    this.window.setTexture((config.window as TEXTURE) ?? this.scene.getOption().getWindow());

    this.show(); // Input Stack Push
    this.setVisible(true);

    // const zoom = this.scene.cameras.main.zoom;
    // this.setScale(zoom > 0 ? 1 / zoom : 1);
    this.fullText = content;
    this.text.setText('');

    const speed = config.speed !== undefined ? config.speed : this.scene.getOption().getTextSpeed();

    this.resolveWhenDisplayed = config.resolveWhen === 'displayed';

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
    this.hide();
    this.setVisible(false);

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
  }

  onRefreshLanguage(): void {
    this.text.setText(i18next.t(this.fullText));
  }

  override hide(): void {
    this.setScale(1);
    super.hide();
  }
}
