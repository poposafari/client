import { DEPTH, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, runFadeEffect, Ui } from './ui';

export class StarterPokemonUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);

    const bg = addBackground(this.scene, TEXTURE.BG_STARTER_POKEMON).setOrigin(0.5, 0.5);

    this.container.add(bg);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    runFadeEffect(this.scene, 1000, 'in');
    this.container.setVisible(true);
  }

  clean(data?: any): void {
    runFadeEffect(this.scene, 1000, 'in');
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}
}
