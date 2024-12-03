import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { MAP_SCALE } from '../object/base-object';
import { InGameScene } from '../scenes/ingame-scene';
import { Overworld } from './overworld';
import { addMap } from './ui';

export class LabOverworld extends Overworld {
  private mode: OverworldMode;
  public map!: Phaser.Tilemaps.Tilemap;
  private container!: Phaser.GameObjects.Container;
  private test!: Phaser.GameObjects.Container;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    super.setup();
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.scene.add.container(width / 4, height / 4);

    this.map = addMap(this.scene, TEXTURE.MAP_TEST);
    this.map.addTilesetImage(TEXTURE.MAP_GROUND, TEXTURE.MAP_GROUND);

    this.container.add(this.map.createLayer(0, TEXTURE.MAP_GROUND)!.setScale(MAP_SCALE).setDepth(0));
    this.container.add(this.map.createLayer(1, TEXTURE.MAP_GROUND)!.setScale(MAP_SCALE).setDepth(1));
    this.container.add(this.map.createLayer(2, TEXTURE.MAP_GROUND)!.setScale(MAP_SCALE).setDepth(2));

    this.test = this.scene.add.container(width / 4, height / 4);
    this.test.add(this.map.createLayer(3, TEXTURE.MAP_GROUND)!.setScale(MAP_SCALE));
    this.test.setDepth(9999);

    this.container.setVisible(false);
    this.test.setVisible(false);

    this.setMap(this.map);
  }

  show(): void {
    super.show();
    this.container.setVisible(true);
    this.test.setVisible(true);
  }

  clean(): void {}
}
