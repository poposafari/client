import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { ModalUi } from './modal-ui';
import { addBackground } from './ui';

export class LoginUi extends ModalUi {
  private bg!: Phaser.GameObjects.Image;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    const ui = this.getUi();
    const width = this.getWidth();
    const height = this.getHeight();

    this.bg = addBackground(this.scene, TEXTURE.BG_LOBBY, 0, 0, width, height);

    ui.add(this.bg);
    super.setup();
  }

  show(): void {
    super.show();
  }

  clean(): void {}

  pause(): void {}
}
