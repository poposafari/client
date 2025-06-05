import { eventBus } from '../core/event-bus';
import { AUDIO } from '../enums/audio';
import { DEPTH } from '../enums/depth';
import { EVENT } from '../enums/event';
import { KEY } from '../enums/key';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { addWindow, playSound, Ui } from './ui';

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

  show(): void {
    eventBus.emit(EVENT.PLAY_SOUND, this.scene);
  }

  clean(data?: any): void {}

  pause(data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}

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
