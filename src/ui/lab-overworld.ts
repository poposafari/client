import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { OverworldUi } from './overworld-ui';
import { addMap } from './ui';

export class LabOverworld extends OverworldUi {
  private mode: OverworldMode;
  private map!: Phaser.Tilemaps.Tilemap;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {}

  show(): void {
    this.map = addMap(this.scene, TEXTURE.MAP_TEST);
    this.map.addTilesetImage(TEXTURE.MAP_GROUND, TEXTURE.MAP_GROUND);
    this.map.createLayer(0, TEXTURE.MAP_GROUND);
    this.map.createLayer(1, TEXTURE.MAP_GROUND);
    this.map.createLayer(2, TEXTURE.MAP_GROUND);
  }
}
