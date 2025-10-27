import i18next from 'i18next';
import { DIRECTION, OBJECT, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { TalkMessageUi } from '../uis/talk-message-ui';
import { ImmovableOverworldObj } from './immovable-overworld-obj';
import { GM } from '../core/game-manager';

export class NpcOverworldObj extends ImmovableOverworldObj {
  private key: string;
  private script: string[];

  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, name: string, script: string[]) {
    super(scene, texture, x, y, name, OBJECT.NPC);

    this.key = texture;
    this.setSpriteScale(1.6);
    this.script = script;
  }

  async reaction(direction: DIRECTION, talkUi: TalkMessageUi) {
    this.lookUser(direction);

    for (const script of this.script) {
      await talkUi.show({ type: 'default', content: i18next.t(`npc:${script}`), speed: GM.getUserOption()?.getTextSpeed()! });
    }
  }

  getKey() {
    return this.key;
  }

  private lookUser(playerDirection: DIRECTION) {
    switch (playerDirection) {
      case DIRECTION.LEFT:
        this.stopSpriteAnimation(8);
        break;
      case DIRECTION.RIGHT:
        this.stopSpriteAnimation(4);
        break;
      case DIRECTION.DOWN:
        this.stopSpriteAnimation(12);
        break;
      case DIRECTION.UP:
        this.stopSpriteAnimation(0);
        break;
    }
  }
}
