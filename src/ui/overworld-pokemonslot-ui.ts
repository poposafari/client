import { DEPTH } from '../enums/depth';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { getPokemonOverworldOrIconKey } from '../utils/string-util';
import { addImage, addWindow, Ui } from './ui';

export class OverworldPokemonSlotUi extends Ui {
  private mode: OverworldMode;

  private container!: Phaser.GameObjects.Container;
  protected windows: Phaser.GameObjects.NineSlice[] = [];
  protected icons: Phaser.GameObjects.Image[] = [];

  private readonly MaxSlot: number = 6;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    const contentHeight = 60;
    const spacing = 5;
    let currentY = 0;

    this.container = this.scene.add.container(width - 35, height / 3 + 50);

    for (let i = 0; i < this.MaxSlot; i++) {
      const window = addWindow(this.scene, TEXTURE.WINDOW_0, 0, currentY, contentHeight, contentHeight, 8, 8, 8, 8);
      const icon = addImage(this.scene, 'pokemon_icon000', 0, currentY);

      this.container.add(window);
      this.container.add(icon);

      this.windows.push(window);
      this.icons.push(icon);

      currentY += contentHeight + spacing;
    }
    this.container.setScale(1);

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

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  update(time?: number, delta?: number): void {}

  private block() {}

  private unblock() {
    const playerInfo = this.mode.getPlayerInfo();

    if (!playerInfo) return;

    const slots = playerInfo.getPartySlot();

    for (let i = 0; i < this.MaxSlot; i++) {
      const slotInfo = slots[i];
      if (slotInfo) {
        const iconKey = getPokemonOverworldOrIconKey(slotInfo);
        this.icons[i].setTexture(`pokemon_icon${iconKey}`);
      } else {
        this.icons[i].setTexture(`pokemon_icon000`);
      }
    }
  }
}
