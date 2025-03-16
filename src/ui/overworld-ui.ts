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
import { addMap, runFadeEffect, Ui } from './ui';
import { KeyboardManager } from '../managers';
import { KEY } from '../enums/key';
import { PLAYER_STATUS } from '../enums/player-status';
import { OverworldInfo } from '../storage/overworld-info';
import { PokemonObject } from '../object/pokemon-object';
import { BattleInfo } from './battle-base-ui';
import { GroundItemObject } from '../object/ground-item-object';
import { SKILL } from '../enums/skill';
import { Message } from '../interface/sys';
import { HiddenMoveUi } from './hidden-move-ui';
import { getPokemonSpriteKey } from '../utils/string-util';
import { DIRECTION } from '../enums/direction';

export interface Layer {
  idx: number;
  texture: TEXTURE;
  depth: DEPTH;
}

export interface ForegroundLayer {
  idx: number;
  texture: TEXTURE[];
  depth: DEPTH;
}

export interface MapInfo {
  texture: TEXTURE;
  tilesets: TEXTURE[];
}

export interface NpcInfo {
  key: string;
  x: number;
  y: number;
  overworldType: OVERWORLD_TYPE;
  startMessageType: 'talk' | 'question';
}

export interface PlayerInitPos {
  x: number;
  y: number;
  px: number;
  py: number;
}

export class OverworldUi extends Ui {
  private mode: OverworldMode;
  private overworldKey: string;
  private cursorKey: Phaser.Types.Input.Keyboard.CursorKeys;
  private sysBlock!: boolean;
  private isMessageActive: boolean = false;
  private isBattle: boolean = false;
  private overworldInfo: OverworldInfo;
  private hiddenMoveUi: HiddenMoveUi;

  //overworld creative info.
  private npcsInfo: NpcInfo[] = [];
  private mapInfo: MapInfo = { texture: TEXTURE.BLANK, tilesets: [] };
  private mapLayerInfo: Layer[] = [];
  private mapForegroundLayerInfo: ForegroundLayer = { idx: 0, texture: [], depth: 0 };

  //map
  private map!: Phaser.Tilemaps.Tilemap;
  private layerContainer!: Phaser.GameObjects.Container;
  private foregroundContainer!: Phaser.GameObjects.Container;
  private layers: Phaser.Tilemaps.TilemapLayer[] = [];

  //player
  private playerInitPos: PlayerInitPos = { x: 0, y: 0, px: 0, py: 0 };
  private playerObj!: PlayerObject | null;

  private readonly MapScale: number = 3;
  // private readonly MapScale: number = 1.5;

  constructor(scene: InGameScene, mode: OverworldMode, key: string) {
    super(scene);
    this.mode = mode;
    this.overworldKey = key;
    this.cursorKey = this.scene.input.keyboard!.createCursorKeys();
    this.overworldInfo = this.mode.getOverworldInfo()!;

    this.hiddenMoveUi = new HiddenMoveUi(scene, mode);
  }

  setup(): void {
    this.hiddenMoveUi.setup();
  }

  setupMap(texture: TEXTURE, tilesets: TEXTURE[]) {
    const width = this.getWidth();
    const height = this.getHeight();

    this.layerContainer = this.scene.add.container(width / 4, height / 4);
    this.foregroundContainer = this.scene.add.container(width / 4, height / 4);

    this.layerContainer.setVisible(false);
    this.foregroundContainer.setVisible(false);

    this.foregroundContainer.setDepth(DEPTH.FOREGROND);

    this.mapInfo.texture = texture;
    for (const tileset of tilesets) {
      this.mapInfo.tilesets.push(tileset);
    }
  }

  setupMapLayer(idx: number, texture: TEXTURE, depth: DEPTH) {
    this.mapLayerInfo.push({ idx: idx, texture: texture, depth: depth });
  }

  setupMapForegroundLayer(idx: number, texture: TEXTURE[], depth: DEPTH) {
    this.mapForegroundLayerInfo.idx = idx;
    this.mapForegroundLayerInfo.texture = texture;
    this.mapForegroundLayerInfo.depth = depth;
  }

  setupNpc(npcKey: string, x: number, y: number, overworldType: OVERWORLD_TYPE, startMessageType: 'talk' | 'question') {
    this.npcsInfo.push({
      key: npcKey,
      x: x,
      y: y,
      overworldType: overworldType,
      startMessageType: startMessageType,
    });
  }

  setupPlayerInitPos(x: number, y: number) {
    this.playerInitPos.x = x;
    this.playerInitPos.y = y;
    this.playerInitPos.px = x + 1;
    this.playerInitPos.py = y;
  }

  show(): void {
    runFadeEffect(this.scene, 1200, 'in');

    this.showMap();
    this.showNpc();
    // this.showWild();
    this.showPlayer();

    this.pause(false);
  }

  private showMap() {
    const width = this.getWidth();
    const height = this.getHeight();

    this.map = addMap(this.scene, this.mapInfo.texture);

    this.layerContainer = this.scene.add.container(width / 4, height / 4);
    this.foregroundContainer = this.scene.add.container(width / 4, height / 4);

    this.foregroundContainer.setDepth(DEPTH.FOREGROND);

    for (const tileset of this.mapInfo.tilesets) {
      this.addTileset(tileset);
    }

    for (const layer of this.mapLayerInfo) {
      this.addLayers(layer.idx, layer.texture, layer.depth);
    }

    this.addForegroundLayer(this.mapForegroundLayerInfo.idx, this.mapForegroundLayerInfo.texture, this.mapForegroundLayerInfo.depth);

    this.layerContainer.setVisible(true);
    this.foregroundContainer.setVisible(true);
  }

  private showNpc() {
    for (const info of this.npcsInfo) {
      const npc = new NpcObject(this.scene, info.key, info.x, info.y, this.map, i18next.t(`npc:${info.key}.name`), OBJECT.NPC, info.overworldType, info.startMessageType);
      this.overworldInfo.addNpc(npc);
    }
  }

  private showPlayer(x?: number, y?: number, texture?: string) {
    const playerData = this.mode.getPlayerInfo();
    let pTexture = `${playerData?.getGender()}_${playerData?.getAvatar()}_movement`;
    let px = this.playerInitPos.x;
    let py = this.playerInitPos.y;

    if (x && y) {
      px = x;
      py = y;
    }

    if (texture) {
      pTexture = texture;
    }

    if (!playerData) {
      console.error('Player does not exist.');
      return;
    }

    this.playerObj = new PlayerObject(this.scene, pTexture, px, py, this.map, playerData?.getNickname(), OBJECT.PLAYER, this.mode.getBag()!, this.mode.getPlayerInfo()!, this.overworldInfo);

    this.playerObj.getSprite().setVisible(true).setScale(PLAYER_SCALE);
    this.scene.cameras.main.startFollow(this.playerObj.getSprite(), true, 0.5, 0.5, 0, 0);
  }

  clean(data?: any): void {
    this.cleanPlayer();
    this.cleanNpc();
    this.cleanWild();
    this.cleanMap();
  }

  private cleanPlayer() {
    this.playerObj!.destroy();
    this.playerObj!.getPet().destroy();
    this.playerObj = null;
    this.scene.cameras.main.stopFollow();
    this.scene.cameras.main.setScroll(0, 0);
  }

  private cleanNpc() {
    for (const npc of this.overworldInfo.getNpcs()) {
      npc.destroy();
    }
    this.overworldInfo.resetNpcs();
  }

  private cleanWild() {
    for (const target of this.overworldInfo.getPokemons()) {
      target.stopMovement();
      target.destroy();
    }

    for (const target of this.overworldInfo.getGroundItems()) {
      target.destroy();
    }
    this.overworldInfo.resetPokemons();
    this.overworldInfo.resetGroundItem();
  }

  private cleanMap() {
    if (this.map) {
      this.map.destroy();
    }

    if (this.layerContainer) {
      this.layerContainer.removeAll(true);
      this.layerContainer.destroy();
      this.layerContainer = null!;
    }

    if (this.foregroundContainer) {
      this.foregroundContainer.removeAll(true);
      this.foregroundContainer.destroy();
      this.foregroundContainer = null!;
    }
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  update(time: number, delta: number): void {
    if (this.sysBlock) return;

    if (this.playerObj) {
      this.mode.updateOverworldLocationUi({ overworld: '000', x: this.playerObj.getTilePos().x, y: this.playerObj.getTilePos().y });
      this.playerMovement();
      this.playerObj.update(delta);
      this.playerObj.getPet().update();
    }
  }

  getOverworldMode() {
    return this.mode as OverworldMode;
  }

  getOverworldKey() {
    return this.overworldKey;
  }

  getOverworldInfo() {
    return this.overworldInfo;
  }

  getMap() {
    return this.map;
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

  private block() {
    this.sysBlock = true;
  }

  private unblock() {
    const keyboardMananger = KeyboardManager.getInstance();
    const keys = [KEY.SELECT, KEY.RUNNING, KEY.MENU, KEY.USE_1, KEY.USE_2, KEY.USE_3, KEY.USE_4, KEY.USE_5, KEY.USE_6, KEY.USE_7, KEY.USE_8, KEY.USE_9];

    this.sysBlock = false;
    this.isBattle = false;

    keyboardMananger.setAllowKey(keys);
    keyboardMananger.setKeyDownCallback(async (key) => {
      if (this.isMessageActive) return;

      try {
        switch (key) {
          case KEY.SELECT:
            const obj = this.playerObj!.getObjectInFront(this.playerObj!.getLastDirection());

            if (!(this.playerObj!.isMovementFinish() && !this.isMessageActive && !this.isBattle)) return;

            if (obj) {
              const key = obj.getKey();
              if (obj instanceof NpcObject) {
                const talkResult = await this.talkToNpc(obj, key);
                if (talkResult) {
                  this.handleNpcPostScriptAction(obj, key);
                }
              } else if (obj instanceof PokemonObject) {
                this.talkToPokemon(obj);
                this.mode.pauseOverworldSystem(true);
                this.mode.addUiStackOverlap('BattleUi', { overworld: this.overworldKey, pokedex: obj.getPokedex(), pokemon: obj } as BattleInfo);
              } else if (obj instanceof GroundItemObject) {
                this.talkToGroundItem(obj);
              }
            } else {
              const tile = this.playerObj!.getTileInfo(this.playerObj!.getLastDirection());
              if (tile?.properties.event === 'surf' && this.playerObj?.getStatus() !== PLAYER_STATUS.SURF) {
                this.isMessageActive = true;
                const msgResult = await this.mode.startMessage(this.talkToWater());
                if (msgResult) {
                  // this.mode.pauseOverworldSystem(true);
                  this.hiddenMoveUi.show();
                  this.showSurf();
                  this.playerObj!.setStatus(PLAYER_STATUS.SURF);
                }
                this.isMessageActive = false;
              } else if (tile?.properties.event === 'surf' && this.playerObj?.getStatus() === PLAYER_STATUS.SURF) {
                this.isMessageActive = true;
                const msgResult = await this.mode.startMessage(this.talkToGround());
                if (msgResult) {
                  this.showSurfToGround();
                }
                this.isMessageActive = false;
              }
            }
            break;
          case KEY.MENU:
            if (this.playerObj!.isMovementFinish()) {
              this.mode.pauseOverworldSystem(true);
              this.mode.addUiStackOverlap('OverworldMenuUi');
            }
            break;
          case KEY.RUNNING:
            if (this.playerObj!.isMovementFinish()) {
              this.playerObj!.setStatus(PLAYER_STATUS.RUNNING);
            }
            break;
          case KEY.USE_1:
            this.useItem(1);
            break;
          case KEY.USE_2:
            this.useItem(2);
            break;
          case KEY.USE_3:
            this.useItem(3);
            break;
          case KEY.USE_4:
            this.useItem(4);
            break;
          case KEY.USE_5:
            this.useItem(5);
            break;
          case KEY.USE_6:
            this.useItem(6);
            break;
          case KEY.USE_7:
            this.useItem(7);
            break;
          case KEY.USE_8:
            this.useItem(8);
            break;
          case KEY.USE_9:
            this.useItem(9);
            break;
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  changeFollowPokemon(pokedex: string) {
    const pet = this.playerObj!.getPet();

    pet.startAnmation(`pokemon_overworld${pokedex}_${pet.getLastDirection()}`);
    pet.setVisible(pokedex !== '000' ? true : false);
    this.playerObj!.getPet().getSprite().setTexture(`pokemon_overworld${pokedex}`);
  }

  private useItem(slotIdx: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) {
    this.playerObj!.readyItem(slotIdx);
  }

  private playerMovement() {
    if (this.cursorKey.up.isDown && this.playerObj!.isMovementFinish()) {
      this.playerObj!.move(KEY.UP);
    } else if (this.cursorKey.down.isDown && this.playerObj!.isMovementFinish()) {
      this.playerObj!.move(KEY.DOWN);
    } else if (this.cursorKey.left.isDown && this.playerObj!.isMovementFinish()) {
      this.playerObj!.move(KEY.LEFT);
    } else if (this.cursorKey.right.isDown && this.playerObj!.isMovementFinish()) {
      this.playerObj!.move(KEY.RIGHT);
    }
  }

  private handleNpcPostScriptAction(npcObj: NpcObject, npcKey: string) {
    switch (npcKey) {
      case 'npc000':
        this.mode.pauseOverworldSystem(true);
        this.mode.addUiStackOverlap('SafariListUi', npcObj);
        return;
      case 'npc001':
        this.mode.pauseOverworldSystem(true);
        this.mode.updateOverworld('000');
        return;
      case 'npc002':
        this.mode.pauseOverworldSystem(true);
        this.mode.addUiStackOverlap('ShopUi', npcObj);
        return;
    }
  }

  private async talkToNpc(obj: NpcObject, key: string) {
    let ret: Promise<boolean> = Promise.resolve(true);

    this.isMessageActive = true;

    if (obj.getStartMessageType() === 'talk') {
      await this.mode.startMessage(obj.reaction(this.playerObj!.getLastDirection(), key, 'talk', 'welcome'));
    } else {
      ret = this.mode.startMessage(obj.reaction(this.playerObj!.getLastDirection(), key, 'question', 'welcome'));
    }
    this.isMessageActive = false;

    return ret;
  }

  private talkToPokemon(obj: PokemonObject) {
    this.isBattle = true;
    obj.reaction(this.playerObj!.getLastDirection());
  }

  private async talkToGroundItem(obj: GroundItemObject) {
    const playerInfo = this.mode.getPlayerInfo();
    const bag = this.mode.getBag();
    await this.mode.startMessage(obj.reaction(playerInfo ? playerInfo?.getNickname() : ''));

    bag?.addItems(obj.getItemKey(), obj.getCount());
    this.mode.updateOverworldInfoUi();
    obj.destroy();
    obj.changeActive();
    this.isMessageActive = false;
  }

  private talkToWater(): Message[] {
    const playerInfo = this.mode.getPlayerInfo();
    const box = this.mode.getBox();
    const script1 = i18next.t(`message:surf_welcome`);
    const script2 = i18next.t(`message:surf_question`);

    let ret: Message[] = [];
    let script = script1;
    let format: 'talk' | 'question' = 'talk';

    if (playerInfo && box) {
      playerInfo.getPartySlot().forEach((party) => {
        const target = box.hasPokemon(party.pokedex, party.shiny, party.gender);
        if (target && target.skill === SKILL.SURF) {
          this.hiddenMoveUi.setPokemonSprite(getPokemonSpriteKey(target));
          script += script2;
          format = 'question';
        }
      });
    }
    ret.push({ type: 'sys', format: format, content: script });
    return ret;
  }

  private talkToGround() {
    const script = i18next.t(`message:surf_cancel`);
    let ret: Message[] = [];
    let format: 'talk' | 'question' = 'question';

    ret.push({ type: 'sys', format: format, content: script });

    return ret;
  }

  private showSurf() {
    const playerPos = this.playerObj!.getTilePos();
    let px = playerPos.x;
    let py = playerPos.y;
    let texture = 'up';

    switch (this.playerObj!.getLastDirection()) {
      case DIRECTION.UP:
        py -= 2;
        texture = 'up';
        break;
      case DIRECTION.DOWN:
        py += 2;
        texture = 'down';
        break;
      case DIRECTION.LEFT:
        texture = 'left';
        px -= 2;
        break;
      case DIRECTION.RIGHT:
        texture = 'right';
        px += 2;
        break;
    }
    this.cleanPlayer();
    this.showPlayer(px, py, `surf`);
  }

  private showSurfToGround() {
    const surfPos = this.playerObj!.getTilePos();
    let px = surfPos.x;
    let py = surfPos.y;
    let texture = 'up';

    switch (this.playerObj!.getLastDirection()) {
      case DIRECTION.UP:
        py -= 2;
        texture = 'up';
        break;
      case DIRECTION.DOWN:
        py += 2;
        texture = 'down';
        break;
      case DIRECTION.LEFT:
        px -= 2;
        texture = 'left';
        break;
      case DIRECTION.RIGHT:
        px += 2;
        texture = 'right';
        break;
    }
    this.cleanPlayer();
    this.showPlayer(px, py);
  }
}
