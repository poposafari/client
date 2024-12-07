import { TEXTURE } from '../enums/texture';
import { BagMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, UI } from './ui';

export class BagUi extends UI {
  private mode: BagMode;
  private bg!: Phaser.GameObjects.Image;
  private xboxContainer!: Phaser.GameObjects.Container;
  private xboxBtn!: Phaser.GameObjects.Image;

  constructor(scene: InGameScene, mode: BagMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const ui = this.getUi();
    const width = this.getWidth();
    const height = this.getHeight();

    this.bg = addBackground(this.scene, TEXTURE.BG_BAG, width, height);
    this.bg.setVisible(false);

    this.xboxContainer = this.scene.add.container(width / 4, height / 4);
    this.xboxBtn = addImage(this.scene, TEXTURE.XBOX, 453, -245);
    this.xboxContainer.add(this.xboxBtn);
    this.xboxContainer.setVisible(false);

    ui.add(this.bg);
    ui.add(this.xboxContainer);
  }

  show(): void {
    this.bg.setAlpha(0);
    this.bg.setVisible(true);
    this.xboxContainer.setVisible(true);

    this.scene.tweens.add({
      targets: this.bg,
      alpha: { from: 0, to: 1 },
      ease: 'Sine.Linear',
      duration: 200,
    });

    this.xboxBtn.setInteractive({ cursor: 'pointer' });
    this.xboxBtn.on('pointerdown', () => {
      this.mode.changeOverworldMode();
    });
    this.xboxBtn.on('pointerover', () => {
      this.xboxBtn.setAlpha(0.7);
    });
    this.xboxBtn.on('pointerout', () => {
      this.xboxBtn.setAlpha(1);
    });
  }

  clean(): void {
    this.bg.setAlpha(1);
    this.bg.setVisible(false);
    this.xboxContainer.setVisible(false);

    this.xboxBtn.off('pointerover');
    this.xboxBtn.off('pointerout');
    this.xboxBtn.off('pointerdown');

    this.scene.tweens.add({
      targets: this.bg,
      alpha: { from: 1, to: 0 },
      ease: 'Sine.Linear',
      duration: 200,
    });
  }

  pause(onoff: boolean): void {}

  update(time: number, delta: number): void {}
}
