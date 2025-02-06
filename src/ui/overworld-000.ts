import { DEPTH } from '../enums/depth';
import { OBJECT } from '../enums/object-type';
import { OVERWORLD_TYPE } from '../enums/overworld-type';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { MAP_SCALE } from '../object/base-object';
import { NpcObject } from '../object/npc-object';
import { InGameScene } from '../scenes/ingame-scene';
import { InitPos } from './overworld';
import { Plaza } from './plaza';

export class Overworld000 extends Plaza {
  constructor(scene: InGameScene, mode: OverworldMode, type: OVERWORLD_TYPE) {
    super(scene, mode, type, '000');
  }

  setup(): void {
    super.setup();
  }

  show(pos: InitPos): void {
    const mode = this.getMode();
    const playerInfo = mode.getPlayerInfoManager().getInfo();

    this.initMap();

    if (pos) {
      super.show({ x: pos.x, y: pos.y });
    } else {
      super.show({ x: playerInfo.pos.x, y: playerInfo.pos.y });
    }

    for (const container of this.container) {
      container.setVisible(true);
    }

    const npc_TaxiDriver = new NpcObject(this.scene, `npc000`, 8, 8, this.map, '택시 드라이버', OBJECT.NPC, this.getType());
    const npc_shopkeeper = new NpcObject(this.scene, `npc001`, 18, 8, this.map, '점원', OBJECT.NPC, this.getType());
    this.npcs.push(npc_TaxiDriver);
    this.npcs.push(npc_shopkeeper);
  }

  clean(): void {
    super.clean();
  }

  private initMap() {
    this.setMap(TEXTURE.MAP_000);
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
