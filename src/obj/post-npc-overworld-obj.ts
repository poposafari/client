import { DIRECTION, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { TalkMessageUi } from '../uis/talk-message-ui';
import { NpcOverworldObj } from './npc-overworld-obj';

export class PostNpcOverworldObj extends NpcOverworldObj {
  private data: unknown;

  constructor(scene: InGameScene, map: Phaser.Tilemaps.Tilemap | null, texture: TEXTURE | string, x: number, y: number, name: string, direction: DIRECTION, script: string[], data: unknown) {
    super(scene, map, texture, x, y, name, direction, script);

    this.getShadow().setVisible(texture !== TEXTURE.BLANK);
  }

  async reaction(direction: DIRECTION, talkUi: TalkMessageUi): Promise<void> {
    await super.reaction(direction, talkUi);
  }
}
