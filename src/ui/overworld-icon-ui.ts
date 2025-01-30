import { DEPTH } from '../enums/depth';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, Ui } from './ui';

export class OverworldIconUi extends Ui {
  private mode: OverworldMode;
  private container!: Phaser.GameObjects.Container;
  private icons: Phaser.GameObjects.Image[] = [];
  private readonly contents: string[] = [TEXTURE.MENU_SHOES, TEXTURE.MENU_ICON];
  private readonly guides: string[] = [TEXTURE.KEY_R, TEXTURE.KEY_S];

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    const slotSize = 55;
    const slotSpacing = 5;

    this.container = this.scene.add.container(width / 2, height / 2 + 507);

    this.contents.forEach((key, index) => {
      const xPosition = index * (slotSize + slotSpacing);
      const yPosition = 0;

      const icon = addImage(this.scene, key, xPosition + 860, yPosition).setScale(2);
      const guideText = addImage(this.scene, this.guides[index], xPosition + 840, yPosition - 20);

      this.icons.push(icon);

      this.container.add(icon);
      this.container.add(guideText);
    });

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.pause(false);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.pause(true);
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}
}
