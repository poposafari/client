import i18next from 'i18next';
import { OBJECT } from '../enums/object-type';
import { TEXTURE } from '../enums/texture';
import { Message } from '../interface/sys';
import { InGameScene } from '../scenes/ingame-scene';
import { BaseObject } from './base-object';

export class GroundItemObject extends BaseObject {
  private key: string;
  private count: number;
  private active: boolean;
  private startMessageType: 'talk' | 'question';
  private talkType: 'sys' | 'default' | 'battle';

  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, map: Phaser.Tilemaps.Tilemap, type: OBJECT, count: number, key: string) {
    super(scene, texture, x, y, '', OBJECT.ITEM_GROUND);

    this.count = count;
    this.key = key;
    this.active = true;

    this.setSpriteFrame(0);
    this.setScale(1);

    this.startMessageType = 'talk';
    this.talkType = 'sys';
  }

  reaction(playerNickname: string): Message[] {
    return this.reactionScripts(playerNickname);
  }

  private reactionScripts(playerNickname: string) {
    let ret: Message[] = [];

    const script1 = playerNickname + i18next.t(`message:battle_thinking1`);
    const script2 = '\n' + i18next.t(`item:${this.key}.name`) + 'x' + this.count + ' ' + i18next.t('message:find');

    const script = script1 + script2;
    ret.push({ type: this.talkType, format: this.startMessageType, content: script });

    return ret;
  }

  changeActive() {
    this.active = false;
  }

  getActive() {
    return this.active;
  }

  getCount() {
    return this.count;
  }

  getItemKey() {
    return this.key;
  }
}
