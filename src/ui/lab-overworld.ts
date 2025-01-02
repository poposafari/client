import { DEPTH } from '../enums/depth';
import { OBJECT } from '../enums/object-type';
import { TEXTURE } from '../enums/texture';
import { PlayerInfoManager } from '../managers';
import { OverworldMode } from '../modes';
import { MAP_SCALE, PLAYER_SCALE } from '../object/base-object';
import { PlayerObject } from '../object/player-object';
import { NpcObject } from '../object/npc-object';
import { InGameScene } from '../scenes/ingame-scene';
import { Overworld } from './overworld';
import { addMap } from './ui';

export class LabOverworld extends Overworld {
  private layerContainer!: Phaser.GameObjects.Container;
  private foregroundContainer!: Phaser.GameObjects.Container;
  private container: Phaser.GameObjects.Container[] = [];
  private npcs: NpcObject[] = [];

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

    const npc_TaxiDriver = new NpcObject(this.scene, `npc000`, 8, 8, this.map, '택시 드라이버', OBJECT.NPC);
    this.npcs.push(npc_TaxiDriver);

    super.show();
  }

  clean(): void {
    super.clean();

    for (const npc of this.npcs) {
      npc.destroy();
    }
    this.player.destroy();
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
    this.layerContainer.add(this.map.createLayer(0, TEXTURE.MAP_GROUND)!.setScale(MAP_SCALE).setDepth(DEPTH.GROUND));
    this.layerContainer.add(
      this.map
        .createLayer(1, TEXTURE.MAP_GROUND)!
        .setScale(MAP_SCALE)
        .setDepth(DEPTH.GROUND + 1),
    );
    this.layerContainer.add(
      this.map
        .createLayer(2, TEXTURE.MAP_GROUND)!
        .setScale(MAP_SCALE)
        .setDepth(DEPTH.GROUND + 2),
    );

    this.foregroundContainer = this.scene.add.container(width / 4, height / 4);
    this.foregroundContainer.add(this.map.createLayer(3, TEXTURE.MAP_GROUND)!.setScale(MAP_SCALE));
    this.foregroundContainer.setDepth(DEPTH.FOREGROND);

    this.layerContainer.setVisible(false);
    this.foregroundContainer.setVisible(false);

    this.container.push(this.layerContainer);
    this.container.push(this.foregroundContainer);
  }
}
