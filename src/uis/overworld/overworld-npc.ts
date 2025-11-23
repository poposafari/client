import { DIRECTION } from '../../enums';
import { BicycleNpcOverworldObj } from '../../obj/bicycle-npc-overworld-obj';
import { NpcOverworldObj } from '../../obj/npc-overworld-obj';
import { PostNpcOverworldObj } from '../../obj/post-npc-overworld-obj';
import { ShopNpcOverworldObj } from '../../obj/shop-npc-overworld-obj';
import { InGameScene } from '../../scenes/ingame-scene';
import { NpcInfo, SpecialNpc, SpecialNpcInfo } from '../../types';

export class OverworldNpc {
  private scene: InGameScene;
  private info: NpcInfo[] = [];
  private specialInfo: SpecialNpcInfo[] = [];
  private npcs: NpcOverworldObj[] = [];

  constructor(scene: InGameScene) {
    this.scene = scene;
  }

  setup(npcKey: string, name: string, x: number, y: number, direction: DIRECTION, script: string[]) {
    this.info.push({
      key: npcKey,
      name: name,
      x: x,
      y: y,
      direction: direction,
      script: script,
    });
  }

  setupSpecial(type: SpecialNpc, key: string, name: string, x: number, y: number, direction: DIRECTION, script: string[], data?: unknown) {
    this.specialInfo.push({
      type: type,
      key: key,
      name: name,
      x: x,
      y: y,
      direction: direction,
      script: script,
      data: data ?? undefined,
    });
  }

  update(delta: number) {
    for (const npc of this.npcs) {
      npc.update(delta);
    }
  }

  show(map: Phaser.Tilemaps.Tilemap) {
    this.npcs = [];
    for (const info of this.info) {
      const npc = new NpcOverworldObj(this.scene, map, info.key, info.x, info.y, info.name, info.direction as DIRECTION, info.script);
      this.npcs.push(npc);
    }

    for (const special of this.specialInfo) {
      if (special.type === 'shop') {
        const npc = new ShopNpcOverworldObj(this.scene, map, special.key, special.x, special.y, special.name, special.direction as DIRECTION, special.script, special.data);
        this.npcs.push(npc);
      } else if (special.type === 'bicycle_shop') {
        const npc = new BicycleNpcOverworldObj(this.scene, map, special.key, special.x, special.y, special.name, special.direction as DIRECTION, special.script, special.data);
        this.npcs.push(npc);
      } else if (special.type === 'post') {
        const npc = new PostNpcOverworldObj(this.scene, map, special.key, special.x, special.y, special.name, special.direction as DIRECTION, special.script, special.data);
        this.npcs.push(npc);
      }
    }
  }

  getNpcs(): NpcOverworldObj[] {
    return this.npcs;
  }

  clean() {
    for (const npc of this.npcs) {
      if (npc) {
        npc.destroy();
      }
    }
    this.npcs = [];
    this.info = [];
    this.specialInfo = [];
  }
}
