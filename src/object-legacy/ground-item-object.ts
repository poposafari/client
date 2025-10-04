// import i18next from 'i18next';
// import { OBJECT } from '../enums/object-type';
// import { TEXTURE } from '../enums/texture';
// import { Message } from '../interface/sys';
// import { InGameScene } from '../scenes/ingame-scene';
// import { BaseObject } from './base-object';

// export class GroundItemObject extends BaseObject {
//   private idx: number;
//   private key: string;
//   private count: number;
//   private catch: boolean;
//   private startMessageType: 'talk' | 'question';
//   private talkType: 'sys' | 'default' | 'battle';

//   constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, map: Phaser.Tilemaps.Tilemap, type: OBJECT, idx: number, count: number, key: string, active: boolean) {
//     super(scene, texture, x, y, '', OBJECT.ITEM_GROUND);

//     this.idx = idx;
//     this.count = count;
//     this.key = key;
//     this.catch = active;

//     this.setSpriteFrame(0);
//     this.setScale(1.5);

//     this.startMessageType = 'talk';
//     this.talkType = 'sys';
//   }

//   changeCatch() {
//     this.catch = true;
//   }

//   getCatch() {
//     return this.catch;
//   }

//   getCount() {
//     return this.count;
//   }

//   getItemKey() {
//     return this.key;
//   }

//   getIdx() {
//     return this.idx;
//   }
// }
