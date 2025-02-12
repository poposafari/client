import i18next from 'i18next';
import { DIRECTION } from '../enums/direction';
import { OBJECT } from '../enums/object-type';
import { OVERWORLD_TYPE } from '../enums/overworld-type';
import { TEXTURE } from '../enums/texture';
import { Message } from '../interface/sys';
import { InGameScene } from '../scenes/ingame-scene';
import { BaseObject } from './base-object';

export class NpcObject extends BaseObject {
  private location: OVERWORLD_TYPE;
  private key: string;
  private startMessageType: 'talk' | 'question';

  constructor(
    scene: InGameScene,
    texture: TEXTURE | string,
    x: number,
    y: number,
    map: Phaser.Tilemaps.Tilemap,
    nickname: string,
    type: OBJECT,
    location: OVERWORLD_TYPE,
    startMessageType: 'talk' | 'question',
  ) {
    super(scene, texture, x, y, nickname, type);

    this.key = texture;
    this.getSprite().setScale(1.6);
    this.location = location;

    this.startMessageType = startMessageType;
  }

  getStartMessageType(): 'talk' | 'question' {
    return this.startMessageType;
  }

  getLocation() {
    return this.location;
  }

  reaction(playerDirection: DIRECTION, key: string, messageType: 'talk' | 'question', talkType: string): Message[] {
    this.reactionDirection(playerDirection);

    return this.reactionScript(key, messageType, talkType);
  }

  afterReaction(key: string) {}

  private reactionDirection(playerDirection: DIRECTION) {
    switch (playerDirection) {
      case DIRECTION.LEFT:
        this.setSpriteFrame(8);
        break;
      case DIRECTION.RIGHT:
        this.setSpriteFrame(4);
        break;
      case DIRECTION.DOWN:
        this.setSpriteFrame(12);
        break;
      case DIRECTION.UP:
        this.setSpriteFrame(0);
        break;
    }
  }

  reactionScript(key: string, messageType: 'talk' | 'question', talkType: string, etc?: string): Message[] {
    let ret: Message[] = [];

    const scripts = i18next.t(`npc:${key}.scripts`, { returnObjects: true });
    const filteredScripts = this.filterScripts(scripts as string[], messageType, talkType);

    for (const script of filteredScripts) {
      ret.push({
        type: 'default',
        format: messageType,
        content: etc ? etc + script : script,
      });
    }

    if (ret.length === 0) {
      ret.push({
        type: 'sys',
        format: 'talk',
        content: 'Error!',
      });
    }

    return ret;
  }

  private filterScripts(scripts: string[], messageType: string, talkType: string): string[] {
    return scripts
      .filter((script) => {
        const [type, talk] = script.split('_');
        return type === messageType && talk === talkType;
      })
      .map((script) => script.split('_')[2]);
  }
}
