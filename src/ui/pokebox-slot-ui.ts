import { DEPTH } from '../enums/depth';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addWindow, Ui } from './ui';

export class PokeBoxSlotUi extends Ui {
  private mode: OverworldMode;

  private container!: Phaser.GameObjects.Container;
  private window!: Phaser.GameObjects.NineSlice;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.scene.add.container(width / 2, height / 2);

    this.window = addWindow(this.scene, TEXTURE.WINDOW_5, +170, +18, 42, 288, 16, 16, 16, 16).setScale(3.2);

    this.container.add(this.window);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}
}
