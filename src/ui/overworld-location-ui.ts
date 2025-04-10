import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { EASE } from '../enums/ease';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addText, addWindow, Ui } from './ui';

export class OverworldLocationUi extends Ui {
  private mode: OverworldMode;

  private container!: Phaser.GameObjects.Container;
  private window!: Phaser.GameObjects.NineSlice;
  private location!: Phaser.GameObjects.Text;
  private restorePosY!: number;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2 - 940, height / 2 - 475);
    this.restorePosY = this.container.y;

    this.window = addWindow(this.scene, TEXTURE.WINDOW_5, 0, 0, 150, 30, 16, 16, 16, 16).setOrigin(0, 0.5).setScale(3);
    this.location = addText(this.scene, 25, 0, '', TEXTSTYLE.DEFAULT_BLACK).setOrigin(0, 0.5);

    this.container.add(this.window);
    this.container.add(this.location);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_MENU);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    if (typeof data === 'string') {
      this.location.setText(i18next.t(`menu:overworld_${data}`));
    }

    const startY = -this.window.height - 15;
    const endY = this.container.y;

    this.container.setVisible(true);
    this.container.y = startY;

    this.scene.tweens.add({
      targets: this.container,
      y: endY,
      ease: EASE.LINEAR,
      duration: 500,
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.container,
          y: startY,
          ease: EASE.LINEAR,
          duration: 500,
          delay: 2000,
        });
      },
    });
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}
}
