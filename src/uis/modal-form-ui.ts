import { AUDIO, DEPTH, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { addWindow, playEffectSound, shakeEffect, Ui } from './ui';

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

    this.modalContainer = this.createTrackedContainer(width / 2, height / 2);
    this.window = this.addWindow(TEXTURE.BLANK, 0, 0, 0, 0, 16, 16, 16, 16);

    this.modalContainer.add(this.window);

    this.modalContainer.setVisible(false);
    this.modalContainer.setDepth(DEPTH.TITLE + 1);
    this.modalContainer.setScrollFactor(0);
  }

  show(): void {}

  protected onClean(): void {}

  pause(data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}

  shake() {
    playEffectSound(this.scene, AUDIO.BUZZER);
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
