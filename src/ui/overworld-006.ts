import { DEPTH } from '../enums/depth';
import { OBJECT } from '../enums/object-type';
import { OVERWORLD_TYPE } from '../enums/overworld-type';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { MAP_SCALE } from '../object/base-object';
import { NpcObject } from '../object/npc-object';
import { InGameScene } from '../scenes/ingame-scene';
import { Safari } from './safari';

export class Overworld006 extends Safari {
  private layerContainer!: Phaser.GameObjects.Container;
  private foregroundContainer!: Phaser.GameObjects.Container;
  private container: Phaser.GameObjects.Container[] = [];
  private layers: Phaser.Tilemaps.TilemapLayer[] | null = [];
  private npcs: NpcObject[] = [];

  constructor(scene: InGameScene, mode: OverworldMode, type: OVERWORLD_TYPE) {
    super(scene, mode, type);
  }

  setup(): void {
    super.setup();
  }

  show(): void {
    const mode = this.getMode();
    const playerInfo = mode.getPlayerInfoManager().getInfo();

    this.initMap();
    super.show({ x: 15, y: 10 });

    for (const container of this.container) {
      container.setVisible(true);
    }

    const npc_TaxiDriver = new NpcObject(this.scene, `npc000`, 20, 10, this.map, '택시 드라이버', OBJECT.NPC, this.getType());
    this.npcs.push(npc_TaxiDriver);
  }

  clean(): void {
    super.clean();

    // Remove and destroy all objects in the layerContainer
    if (this.layerContainer) {
      this.layerContainer.removeAll(true);
      this.layerContainer.destroy();
    }
    this.layerContainer = null!; // Reset the reference

    // Remove and destroy all objects in the foregroundContainer
    if (this.foregroundContainer) {
      this.foregroundContainer.removeAll(true);
      this.foregroundContainer.destroy();
    }
    this.foregroundContainer = null!; // Reset the reference

    // Destroy all layers and reset the array
    if (this.layers) {
      for (const layer of this.layers) {
        if (layer) {
          layer.destroy();
        }
      }
    }
    this.layers = []; // Reset the layers array

    // Destroy all NPCs and clear the array
    for (const npc of this.npcs) {
      npc.destroy();
    }
    this.npcs = []; // Reset the NPCs array

    // Clear the container array
    this.container.forEach((cont) => {
      if (cont) {
        cont.removeAll(true);
        cont.destroy();
      }
    });
    this.container = []; // Reset the container array
  }

  private initMap() {
    this.setMap(TEXTURE.MAP_006);
    const width = this.getWidth();
    const height = this.getHeight();
    const map = this.getMap();

    map.addTilesetImage(TEXTURE.MAP_L0, TEXTURE.MAP_L0);
    map.addTilesetImage(TEXTURE.MAP_L1_0, TEXTURE.MAP_L1_0);

    this.layerContainer = this.scene.add.container(width / 4, height / 4);
    this.layers?.push(map.createLayer(0, TEXTURE.MAP_L0)!.setScale(MAP_SCALE).setDepth(DEPTH.GROUND));
    this.layers?.push(
      map
        .createLayer(1, TEXTURE.MAP_L0)!
        .setScale(MAP_SCALE)
        .setDepth(DEPTH.GROUND + 1),
    );
    this.layers?.push(
      map
        .createLayer(2, TEXTURE.MAP_L0)!
        .setScale(MAP_SCALE)
        .setDepth(DEPTH.GROUND + 2),
    );
    this.layers?.push(
      map
        .createLayer(3, TEXTURE.MAP_L0)!
        .setScale(MAP_SCALE)
        .setDepth(DEPTH.GROUND + 3),
    );
    this.layers?.push(
      map
        .createLayer(4, TEXTURE.MAP_L1_0)!
        .setScale(MAP_SCALE)
        .setDepth(DEPTH.GROUND + 4),
    );

    for (const layer of this.layers!) {
      this.layerContainer.add(layer);
    }

    this.foregroundContainer = this.scene.add.container(width / 4, height / 4);
    this.foregroundContainer.add(this.map.createLayer(5, [TEXTURE.MAP_L1_0, TEXTURE.MAP_L0])!.setScale(MAP_SCALE));
    this.foregroundContainer.setDepth(DEPTH.FOREGROND);

    this.layerContainer.setVisible(false);
    this.foregroundContainer.setVisible(false);

    this.container.push(this.layerContainer);
    this.container.push(this.foregroundContainer);
  }
}
