import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { OBJECT } from '../enums/object-type';
import { OVERWORLD_TYPE } from '../enums/overworld-type';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { PLAYER_SCALE } from '../object/base-object';
import { NpcObject } from '../object/npc-object';
import { PlayerObject } from '../object/player-object';
import { InGameScene } from '../scenes/ingame-scene';
import { addMap, delay, Ui } from './ui';
import { KeyboardManager } from '../managers';
import { KEY } from '../enums/key';
import { PokemonObject } from '../object/pokemon-object';
import { PLAYER_STATUS } from '../enums/player-status';

export interface InitPos {
  x: number;
  y: number;
}

export class OverworldUi extends Ui {
  private mode: OverworldMode;
  private overworldKey: string;
  private cursorKey: Phaser.Types.Input.Keyboard.CursorKeys;
  private sysBlock!: boolean;
  private isMessageActive: boolean = false;
  private isBattle: boolean = false;

  //map
  private map!: Phaser.Tilemaps.Tilemap;
  private layerContainer!: Phaser.GameObjects.Container;
  private foregroundContainer!: Phaser.GameObjects.Container;
  private layers: Phaser.Tilemaps.TilemapLayer[] = [];

  //npc
  private npcs: NpcObject[] = [];

  //player
  private playerObj!: PlayerObject;

  private readonly MapScale: number = 1.5;

  constructor(scene: InGameScene, mode: OverworldMode, key: string) {
    super(scene);
    this.mode = mode;
    this.overworldKey = key;
    this.cursorKey = this.scene.input.keyboard!.createCursorKeys();
  }

  setup(): void {}

  //show player-object, map
  show(data?: InitPos): void {
    if (data) this.showPlayerObj(data);

    this.showMap();
  }

  clean(data?: any): void {}

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  update(time: number, delta: number): void {
    if (this.sysBlock) return;
    this.movement();
    this.playerObj.update(delta);
    this.playerObj.getPet().update();
  }

  getOverworldMode() {
    return this.mode as OverworldMode;
  }

  createLayerContainer() {
    const width = this.getWidth();
    const height = this.getHeight();

    this.layerContainer = this.scene.add.container(width / 4, height / 4);
    this.foregroundContainer = this.scene.add.container(width / 4, height / 4);

    this.layerContainer.setVisible(false);
    this.foregroundContainer.setVisible(false);

    this.foregroundContainer.setDepth(DEPTH.FOREGROND);
  }

  addLayers(idx: number, texture: TEXTURE, depth: DEPTH) {
    const layer = this.map.createLayer(idx, texture)?.setScale(this.MapScale).setDepth(depth);
    this.layers.push(layer!);
    this.layerContainer.add(layer!);
  }

  addForegroundLayer(idx: number, texture: TEXTURE[], depth: DEPTH) {
    const foregroundLayer = this.map.createLayer(idx, texture)?.setScale(this.MapScale).setDepth(depth);
    this.foregroundContainer.add(foregroundLayer!);
  }

  addTileset(tilesetTexture: TEXTURE) {
    this.map.addTilesetImage(tilesetTexture, tilesetTexture);
  }

  setMap(texture: TEXTURE) {
    this.map = addMap(this.scene, texture);
  }

  private block() {
    this.sysBlock = true;
  }

  private unblock() {
    const keyboardMananger = KeyboardManager.getInstance();
    const keys = [KEY.SELECT, KEY.RUNNING, KEY.MENU, KEY.USE_1, KEY.USE_2, KEY.USE_3, KEY.USE_4, KEY.USE_5, KEY.USE_6, KEY.USE_7, KEY.USE_8, KEY.USE_9];

    this.sysBlock = false;

    keyboardMananger.setAllowKey(keys);
    keyboardMananger.setKeyDownCallback(async (key) => {
      if (this.isMessageActive) return;

      try {
        switch (key) {
          case KEY.SELECT:
            const obj = this.playerObj.getObjectInFront(this.playerObj.getLastDirection());
            if (obj && this.playerObj.isMovementFinish() && !this.isMessageActive && !this.isBattle) {
              const objKey = obj.getSprite().texture.key;
              if (obj instanceof NpcObject) {
                this.isMessageActive = true;
                const messageResult = await this.mode.startMessage(obj.reaction(this.playerObj.getLastDirection(), objKey, 'talk'));
                this.handleNpcPostScriptAction(objKey, obj.getLocation(), messageResult);
                this.isMessageActive = false;
              } else if (obj instanceof PokemonObject) {
                this.isBattle = true;
                obj.reaction(this.playerObj.getLastDirection());
                await delay(this.scene, 500);
                this.mode.pauseOverworldSystem(true);
                this.mode.addUiStackOverlap('OverworldBattleUi', { overworld: this.overworldKey, pokedex: obj.getPokedex(), pokemon: obj });
              }
            }
            break;
          case KEY.MENU:
            if (this.playerObj.isMovementFinish()) {
              this.mode.pauseOverworldSystem(true);
              this.mode.addUiStackOverlap('OverworldMenuUi');
            }
            break;
          case KEY.RUNNING:
            if (this.playerObj.isMovementFinish()) {
              this.playerObj.setStatus(PLAYER_STATUS.RUNNING);
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
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  changeFollowPokemon(pokedex: string) {
    const pet = this.playerObj.getPet();

    pet.startAnmation(`pokemon_overworld${pokedex}_${pet.getLastDirection()}`);
    pet.setVisible(pokedex !== '000' ? true : false);
    this.playerObj.getPet().getSprite().setTexture(`pokemon_overworld${pokedex}`);
  }

  private useItem(slotIdx: number) {
    this.playerObj.readyItem(slotIdx);
    this.mode.chnageItemSlot();
  }

  private showPlayerObj(pos: InitPos) {
    const playerData = this.mode.getPlayerInfo();
    const playerInitPos = pos;

    if (!playerData || !playerInitPos) {
      console.error('Player or InitPos does not exist.');
      return;
    }

    this.playerObj = new PlayerObject(
      this.scene,
      `${playerData?.getGender()}_${playerData?.getAvatar()}_movement`,
      playerInitPos.x,
      playerInitPos.y,
      this.map,
      playerData?.getNickname(),
      OBJECT.PLAYER,
      this.mode.getBag()!,
      this.mode.getPlayerInfo()!,
    );

    this.playerObj.getSprite().setVisible(true).setScale(PLAYER_SCALE);
    this.scene.cameras.main.startFollow(this.playerObj.getSprite(), true, 0.5, 0.5, 0, 0);

    this.pause(false);
  }

  private showMap() {
    this.layerContainer.setVisible(true);
    this.foregroundContainer.setVisible(true);
  }

  private movement() {
    if (this.cursorKey.up.isDown && this.playerObj.isMovementFinish()) {
      this.playerObj.move(KEY.UP);
    } else if (this.cursorKey.down.isDown && this.playerObj.isMovementFinish()) {
      this.playerObj.move(KEY.DOWN);
    } else if (this.cursorKey.left.isDown && this.playerObj.isMovementFinish()) {
      this.playerObj.move(KEY.LEFT);
    } else if (this.cursorKey.right.isDown && this.playerObj.isMovementFinish()) {
      this.playerObj.move(KEY.RIGHT);
    }
  }

  private handleNpcPostScriptAction(npcKey: string, location: OVERWORLD_TYPE, msgResult: boolean) {
    switch (npcKey) {
      case 'npc000':
        if (location === OVERWORLD_TYPE.PLAZA && !msgResult) {
          this.mode.pauseOverworldSystem(true);
          this.mode.addUiStackOverlap('OverworldTaxiListUi');
        }
        if (msgResult) {
          if (msgResult) this.mode.moveToVillage();
        }
        return;
      case 'npc001':
        this.mode.pauseOverworldSystem(true);
        this.mode.addUiStackOverlap('OverworldShopListUi');
        return;
    }
  }

  showNpc(npcTexture: TEXTURE | string, x: number, y: number, overworldType: OVERWORLD_TYPE) {
    const npc = new NpcObject(this.scene, npcTexture, x, y, this.map, i18next.t(`npc:${npcTexture}.name`), OBJECT.NPC, overworldType);
    this.npcs.push(npc);
  }
}
