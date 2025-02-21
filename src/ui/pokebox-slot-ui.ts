import { DEPTH } from '../enums/depth';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addWindow, Ui } from './ui';

export class PokeBoxSlotUi extends Ui {
  private mode: OverworldMode;

  private container!: Phaser.GameObjects.Container;
  private window!: Phaser.GameObjects.NineSlice;

  private icons: Phaser.GameObjects.Image[] = [];

  private readonly MaxSlot: number = 6;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();
    const spacing = 30;
    const contentHeight = 65;
    let currentY = 0;

    this.container = this.scene.add.container(width / 2 - 855, height / 2);
    const window = addWindow(this.scene, TEXTURE.WINDOW_12, 0, 0, contentHeight + 30, contentHeight * this.MaxSlot, 16, 16, 16, 16).setScale(1.6);
    this.container.add(window);

    for (let i = 0; i < this.MaxSlot; i++) {
      const icon = addImage(this.scene, `pokemon_icon000`, 0, currentY - 250).setScale(1.6);

      this.icons.push(icon);
      this.container.add(icon);

      currentY += contentHeight + spacing;
    }

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

  update(time?: number, delta?: number): void {
    const playerInfo = this.mode.getPlayerInfo();

    if (!playerInfo) return;

    const slots = playerInfo.getPartySlot();

    for (let i = 0; i < this.MaxSlot; i++) {
      const slotInfo = slots[i];
      if (slotInfo) {
        this.icons[i].setTexture(`pokemon_icon${slotInfo}`);
      } else {
        this.icons[i].setTexture(`pokemon_icon000`);
      }
    }
  }
}
