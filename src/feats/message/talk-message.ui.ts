import { InputManager } from '@poposafari/core';
import { EASE, KEY, TEXTURE } from '@poposafari/types';
import { addImage } from '@poposafari/utils';
import { MessageUi } from './message.ui';
import { GameScene } from '@poposafari/scenes';

export class TalkMessageUi extends MessageUi {
  private endCursor!: Phaser.GameObjects.Image;
  private cursorTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: GameScene) {
    super(scene);
  }

  createLayout() {
    super.createLayout();

    this.endCursor = addImage(this.scene, TEXTURE.CURSOR_WHITE, undefined, 0, 0)
      .setScale(2.4)
      .setAngle(90);
    this.endCursor.setVisible(false);

    this.container.add(this.endCursor);
  }

  onInput(key: string): void {
    if (key === KEY.Z || key === KEY.ENTER) {
      if (this.isTyping) {
        this.stopTyping();
      } else {
        this.close();
      }
    }
  }

  errorEffect(errorMsg: string): void {
    throw new Error('Method not implemented.');
  }
  waitForInput(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  protected onTypingComplete(): void {
    const lines = this.text.getWrappedText(this.text.text);
    const lastLine = lines[lines.length - 1];
    const tempText = this.scene.add.text(0, 0, lastLine, this.text.style).setVisible(false);
    const lastLineWidth = tempText.displayWidth;
    const singleLineHeight = tempText.displayHeight;

    tempText.destroy();

    const cursorX = this.text.x + lastLineWidth;
    const cursorY = this.text.y + this.text.displayHeight - singleLineHeight / 2;

    this.endCursor.setPosition(cursorX + 30, cursorY);
    this.endCursor.setVisible(true);
    this.playCursorAnim();
  }

  protected close(): void {
    this.stopCursorAnim();

    this.endCursor.setVisible(false);

    super.close();
  }

  private playCursorAnim() {
    if (this.cursorTween) return;

    this.endCursor.setAlpha(1);
    this.cursorTween = this.scene.tweens.add({
      targets: this.endCursor,
      y: '+=15',
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: EASE.LINEAR,
    });
  }

  private stopCursorAnim() {
    if (this.cursorTween) {
      this.cursorTween.remove();
      this.cursorTween = null;
    }

    this.endCursor.setAlpha(1);
  }
}
