import { DEPTH } from '../enums/depth';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes-test';
import { InGameScene } from '../scenes/ingame-scene';
import { MAX_PARTY_SLOT, PlayerInfo } from '../storage/player-info';
import { getPokemonOverworldOrIconKey, isPokedexShiny } from '../utils/string-util';
import { addImage, addWindow, Ui } from './ui';

export class OverworldPokemonSlotUi extends Ui {
  private mode: OverworldMode;

  private container!: Phaser.GameObjects.Container;
  protected windows: Phaser.GameObjects.NineSlice[] = [];
  protected icons: Phaser.GameObjects.Image[] = [];
  protected shinyIcons: Phaser.GameObjects.Image[] = [];

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

    this.container = this.scene.add.container(width - 40, height / 3 + 50);

    for (let i = 0; i < this.MaxSlot; i++) {
      const window = addWindow(this.scene, TEXTURE.WINDOW_0, 0, currentY, contentHeight, contentHeight, 8, 8, 8, 8);
      const icon = addImage(this.scene, 'pokemon_icon000', 0, currentY);
      const shiny = addImage(this.scene, TEXTURE.BLANK, -25, currentY - 15).setScale(1);

      this.container.add(window);
      this.container.add(icon);
      this.container.add(shiny);

      this.windows.push(window);
      this.icons.push(icon);
      this.shinyIcons.push(shiny);

      currentY += contentHeight + spacing;
    }
    this.container.setScale(1);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_UI);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.update();
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  update(): void {
    const party = PlayerInfo.getInstance().getPartySlot();

    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      this.shinyIcons[i].setTexture(TEXTURE.BLANK);
      if (party[i]) {
        const key = party[i]?.split('_')[0];
        this.icons[i].setTexture(`pokemon_icon${key}`);
        if (isPokedexShiny(key!)) this.shinyIcons[i].setTexture(TEXTURE.SHINY);
      } else {
        this.icons[i].setTexture(`pokemon_icon000`);
      }
    }
  }
}
