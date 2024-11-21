import { TEXTURE } from '../enums/texture';
import { Mode } from '../mode';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, UI } from './ui';

export class SeasonUi extends UI {
  private mode: Mode;
  private container!: Phaser.GameObjects.Container;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const ui = this.getUi();
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.scene.add.container(width / 4, height / 4);

    const bg = addBackground(this.scene, TEXTURE.BLACK, 0, 0);
    this.container.add(bg);

    const season = addImage(this.scene, TEXTURE.SEASON_3, 0, 0);
    this.container.add(season);

    this.container.setVisible(false);

    ui.add(this.container);
  }

  show(): void {
    this.container.setVisible(true);

    this.scene.tweens.add({
      targets: this.container,
      alpha: { from: 0, to: 1 },
      ease: 'Sine.Linear',
      duration: 1500,
      repeat: 0,
      yoyo: true,
      onComplete: () => {
        this.clean();
      },
    });
  }

  clean(): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean): void {}
}
