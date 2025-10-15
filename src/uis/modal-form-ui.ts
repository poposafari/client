import { eventBus } from '../core/event-bus';
import { GM } from '../core/game-manager';
import { AUDIO, DEPTH, EVENT, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { addWindow, playSound, shakeEffect, Ui } from './ui';

export class ModalFormUi extends Ui {
  private modalContainer!: Phaser.GameObjects.Container;
  private contentContainer!: Phaser.GameObjects.Container;
  private window!: Phaser.GameObjects.NineSlice;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.modalContainer = this.createContainer(width / 2, height / 2);
    this.window = addWindow(this.scene, TEXTURE.BLANK, 0, 0, 0, 0, 16, 16, 16, 16);

    this.modalContainer.add(this.window);

    this.modalContainer.setVisible(false);
    this.modalContainer.setDepth(DEPTH.TITLE + 1);
    this.modalContainer.setScrollFactor(0);
  }

  show(): void {}

  clean(data?: any): void {}

  pause(data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}

  shake() {
    playSound(this.scene, AUDIO.BUZZER, GM.getUserOption()?.getEffectVolume());
    shakeEffect(this.scene, this.modalContainer);
  }

  protected setModalSize(texture: TEXTURE, width: number, height: number, scale: number) {
    this.window.setTexture(texture);
    this.window.width = width;
    this.window.height = height;
    this.window.setScale(scale);
  }

  protected getModal() {
    return this.modalContainer;
  }
}
