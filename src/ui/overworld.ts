import i18next from 'i18next';
import { ANIMATION } from '../enums/animation';
import { KEY } from '../enums/key';
import { OBJECT } from '../enums/object-type';
import { PLAYER_STATUS } from '../enums/player-status';
import { KeyboardManager, MessageManager, PlayerInfoManager } from '../managers';
import { OverworldMode } from '../modes';
import { PLAYER_SCALE } from '../object/base-object';
import { PlayerObject } from '../object/player-object';
import { InGameScene } from '../scenes/ingame-scene';
import { addMap, Ui } from './ui';
import { Message } from '../interface/sys';
import { OVERWORLD_TYPE } from '../enums/overworld-type';
import { TEXTURE } from '../enums/texture';

export interface InitPos {
  x: number;
  y: number;
}

export class Overworld extends Ui {
  private mode!: OverworldMode;
  private type!: OVERWORLD_TYPE;
  protected map!: Phaser.Tilemaps.Tilemap;
  protected player!: PlayerObject;
  private cursorKey: Phaser.Types.Input.Keyboard.CursorKeys;
  private sysBlock!: boolean;
  private isMessageActive: boolean = false;

  constructor(scene: InGameScene, mode: OverworldMode, type: OVERWORLD_TYPE) {
    super(scene);
    this.cursorKey = this.scene.input.keyboard!.createCursorKeys();
    this.mode = mode;
    this.type = type;
  }

  setup(): void {}

  show(data: InitPos): void {
    const playerPos = data;
    const playerInfo = PlayerInfoManager.getInstance().getInfo();
    this.player = new PlayerObject(this.scene, `${playerInfo.gender}_${playerInfo.avatarType}_movement`, playerPos.x, playerPos.y, this.map, playerInfo.nickname, OBJECT.PLAYER);

    const playerSprite = this.player.getSprite();
    playerSprite.setVisible(true);
    playerSprite.setScale(PLAYER_SCALE);
    this.scene.cameras.main.startFollow(playerSprite, true, 0.5, 0.5, 0, 0);

    this.pause(false);
  }

  clean(): void {
    this.map.destroy();
    this.player.destroy();
    this.player.getPet().destroy();
    this.scene.cameras.main.stopFollow();
    this.scene.cameras.main.setScroll(0, 0);
  }

  pause(onoff: boolean): void {
    onoff ? this.block() : this.unblock();
  }

  block() {
    this.sysBlock = true;
  }

  unblock() {
    const keyboardMananger = KeyboardManager.getInstance();
    const keys = [KEY.SELECT, KEY.MENU, KEY.USE_1, KEY.USE_2, KEY.USE_3, KEY.USE_4, KEY.USE_5, KEY.USE_6, KEY.USE_7, KEY.USE_8, KEY.USE_9];

    this.sysBlock = false;

    keyboardMananger.setAllowKey(keys);
    keyboardMananger.setKeyDownCallback(async (key) => {
      if (this.isMessageActive) return;

      switch (key) {
        case KEY.SELECT:
          const obj = this.player.getObjectInFront(this.player.getLastDirection());
          if (obj && this.player.isMovementFinish() && !this.isMessageActive) {
            const objKey = obj.getSprite().texture.key;
            this.isMessageActive = true;
            await this.mode.startMessage(obj.reaction(this.player.getLastDirection(), objKey, 'question'));
            this.handleNpcPostScriptAction(objKey, obj.getLocation());
            this.isMessageActive = false;
          }
          break;
        case KEY.MENU:
          if (this.player.isMovementFinish()) {
            this.mode.pauseOverworldSystem(true);
            this.mode.addUiStackOverlap('OverworldMenuUi');
          }
          break;
        case KEY.USE_1:
          this.useItem(0);
          break;
        case KEY.USE_2:
          this.useItem(1);
          break;
        case KEY.USE_3:
          this.useItem(2);
          break;
        case KEY.USE_4:
          this.useItem(3);
          break;
        case KEY.USE_5:
          this.useItem(4);
          break;
        case KEY.USE_6:
          this.useItem(5);
          break;
        case KEY.USE_7:
          this.useItem(6);
          break;
        case KEY.USE_8:
          this.useItem(7);
          break;
        case KEY.USE_9:
          this.useItem(8);
          break;
      }
    });
  }

  update(time: number, delta: number) {
    if (this.sysBlock) return;
    this.movement();
    this.player.update(delta);
    this.player.getPet().update();
  }

  changeFollowPokemon(pokedex: string) {
    const pet = this.player.getPet();

    pet.startAnmation(`pokemon_overworld${pokedex}_${pet.getLastDirection()}`);
    this.player
      .getPet()
      .getSprite()
      .setTexture(`pokemon_overworld${pokedex}`)
      .setVisible(pokedex !== '000' ? true : false);
  }

  getMode() {
    return this.mode;
  }

  getType() {
    return this.type;
  }

  setMap(mapTexture: TEXTURE) {
    this.map = addMap(this.scene, mapTexture);
  }

  getMap() {
    return this.map;
  }

  private useItem(slotIdx: number) {
    this.player.readyItem(slotIdx);
    this.mode.chnageItemSlot();
  }

  private movement() {
    if (this.cursorKey.up.isDown && this.player.isMovementFinish()) {
      this.player.move(KEY.UP);
    } else if (this.cursorKey.down.isDown && this.player.isMovementFinish()) {
      this.player.move(KEY.DOWN);
    } else if (this.cursorKey.left.isDown && this.player.isMovementFinish()) {
      this.player.move(KEY.LEFT);
    } else if (this.cursorKey.right.isDown && this.player.isMovementFinish()) {
      this.player.move(KEY.RIGHT);
    }
  }

  private handleNpcPostScriptAction(npcKey: string, location: OVERWORLD_TYPE) {
    switch (npcKey) {
      case 'npc000':
        if (location === OVERWORLD_TYPE.PLAZA) {
          this.mode.pauseOverworldSystem(true);
          this.mode.addUiStackOverlap('OverworldTaxiListUi');
        }
        return;
    }
  }
}
