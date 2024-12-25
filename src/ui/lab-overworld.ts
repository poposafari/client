import { TEXTURE } from '../enums/texture';
import { PlayerInfoManager } from '../managers';
import { OverworldMode } from '../modes';
import { MAP_SCALE, PLAYER_SCALE } from '../object/base-object';
import { PlayerObject } from '../object/player-object';
import { InGameScene } from '../scenes/ingame-scene';
import { Overworld } from './overworld';
import { addMap } from './ui';

export class LabOverworld extends Overworld {
  private layerContainer!: Phaser.GameObjects.Container;
  private foregroundContainer!: Phaser.GameObjects.Container;
  private container: Phaser.GameObjects.Container[] = [];

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene, mode);
  }

  setup(): void {}

  show(): void {
    this.setMap();
    super.setup();

    for (const container of this.container) {
      container.setVisible(true);
    }

    super.show();
  }

  clean(): void {
    super.clean();

    for (const container of this.container) {
      container.setVisible(false);
    }
  }

  setMap() {
    const width = this.getWidth();
    const height = this.getHeight();

    this.map = addMap(this.scene, TEXTURE.MAP_TEST);
    this.map.addTilesetImage(TEXTURE.MAP_GROUND, TEXTURE.MAP_GROUND);

    this.layerContainer = this.scene.add.container(width / 4, height / 4);
    this.layerContainer.add(this.map.createLayer(0, TEXTURE.MAP_GROUND)!.setScale(MAP_SCALE).setDepth(0));
    this.layerContainer.add(this.map.createLayer(1, TEXTURE.MAP_GROUND)!.setScale(MAP_SCALE).setDepth(1));
    this.layerContainer.add(this.map.createLayer(2, TEXTURE.MAP_GROUND)!.setScale(MAP_SCALE).setDepth(2));

    this.foregroundContainer = this.scene.add.container(width / 4, height / 4);
    this.foregroundContainer.add(this.map.createLayer(3, TEXTURE.MAP_GROUND)!.setScale(MAP_SCALE));
    this.foregroundContainer.setDepth(9999);

    this.layerContainer.setVisible(false);
    this.foregroundContainer.setVisible(false);

    this.container.push(this.layerContainer);
    this.container.push(this.foregroundContainer);
  }
}
