import i18next from 'i18next';
import { DIRECTION } from '../enums/direction';
import { OBJECT } from '../enums/object-type';
import { OVERWORLD_TYPE } from '../enums/overworld-type';
import { TEXTURE } from '../enums/texture';
import { Message } from '../interface/sys';
import { InGameScene } from '../scenes/ingame-scene';
import { BaseObject } from './base-object';
import { replacePercentSymbol } from '../utils/string-util';

interface ScriptFilterOption {
  messageType: 'talk' | 'question';
  talkType: 'intro' | 'action' | 'accept' | 'reject' | 'end';
  etc: any[] | null;
}

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

  reaction(direction: DIRECTION, option?: ScriptFilterOption): Message[] {
    this.reactionDirection(direction);

    return this.reactionScript(option);
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

  reactionScript(option?: ScriptFilterOption): Message[] {
    let ret: Message[] = [];

    let scripts = i18next.t(`npc:${this.key}.scripts`, { returnObjects: true }) as string[];

    if (option) scripts = this.filterScripts(scripts, option.messageType, option.talkType);

    for (const script of scripts) {
      ret.push({
        type: 'default',
        format: option && option.messageType ? option.messageType : 'talk',
        content: option && option.etc ? replacePercentSymbol(script, option.etc) : script,
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

  private filterScripts(scripts: string[], messageType: 'talk' | 'question', talkType: 'intro' | 'action' | 'accept' | 'reject' | 'end'): string[] {
    return scripts
      .filter((script) => {
        const [type, talk] = script.split('_');
        return type === messageType && talk === talkType;
      })
      .map((script) => script.split('_')[2]);
  }
}
