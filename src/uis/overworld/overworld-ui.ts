import i18next from 'i18next';
import { DEPTH } from '../../enums/depth';
import { DIRECTION } from '../../enums/direction';
import { KEY } from '../../enums/key';
import { OBJECT } from '../../enums/object-type';
import { OVERWORLD_TYPE } from '../../enums/overworld-type';
import { PLAYER_STATUS } from '../../enums/player-status';
import { TEXTURE } from '../../enums/texture';
import { NpcObject } from '../../object/npc-object';
import { PlayerObject } from '../../object/player-object';
import { InGameScene } from '../../scenes/ingame-scene';
import { OverworldInfo } from '../../storage/overworld-info';
import { PlayerInfo } from '../../storage/player-info';
import { addMap, createSprite, delay, findEventTile, playSound, runFadeEffect, Ui } from '../ui';
import { KeyboardHandler } from '../../handlers/keyboard-handler';
import { eventBus } from '../../core/event-bus';
import { EVENT } from '../../enums/event';
import { catchGroundItem, getAvailableTicketApi, warpOverworldApi } from '../../api';
import { Message, PokemonSpawn } from '../../types';
import { replacePercentSymbol } from '../../utils/string-util';
import { OverworldHUDUi } from './overworld-hud-ui';
import { MODE } from '../../enums/mode';
import { BaseObject } from '../../object/base-object';
import { HM } from '../../enums/hidden-move';
import { PokemonObject } from '../../object/pokemon-object';
import { GroundItemObject } from '../../object/ground-item-object';
import { Bag } from '../../storage/bag';
import { AUDIO } from '../../enums/audio';

type MapInfo = {
  texture: TEXTURE;
  tilesets: TEXTURE[];
};

type Layer = {
  idx: number;
  texture: TEXTURE;
  depth: DEPTH;
};

type ForegroundLayer = {
  idx: number;
  texture: TEXTURE[];
  depth: DEPTH;
};

type NpcInfo = {
  key: string;
  x: number;
  y: number;
  overworldType: OVERWORLD_TYPE;
  startMessageType: 'talk' | 'question';
};

type PlayerInitPos = {
  x: number;
  y: number;
  px: number;
  py: number;
};

export class OverworldUi extends Ui {
  private type: OVERWORLD_TYPE;

  protected map: OverworldMap;
  protected player: OverworldPlayer;
  protected npc: OverworldNpc;
  protected safari: OverworldSafari;

  constructor(scene: InGameScene, type: OVERWORLD_TYPE) {
    super(scene);

    this.type = type;

    this.map = new OverworldMap(scene);
    this.npc = new OverworldNpc(scene);
    this.safari = new OverworldSafari(scene);
    this.player = new OverworldPlayer(scene, this.npc, this.safari);
  }

  setup(): void {}

  show(data?: any): void {
    runFadeEffect(this.scene, 1200, 'in');

    this.map.show();
    this.player.show(this.map.get());
    this.npc.show(this.map.get());

    if (this.type === OVERWORLD_TYPE.SAFARI) this.safari.show(this.map.get());
  }

  clean(data?: any): void {
    this.map.clean();
    this.player.clean();
    this.npc.clean();

    if (this.type === OVERWORLD_TYPE.SAFARI) this.safari.clean();
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {
    this.player.handleKeyInput();
  }

  update(time: number, delta: number): void {}

  updatePlayer(delta: number) {
    this.player.update(delta);
  }

  updateWildPokemon(delta: number) {
    this.safari.updateWildPokemon(delta);
  }
}

export class OverworldMap {
  private scene!: InGameScene;
  private sceneWidth!: number;
  private sceneHeight!: number;

  private map!: Phaser.Tilemaps.Tilemap;
  private layers: Phaser.Tilemaps.TilemapLayer[] = [];

  private mapInfo: MapInfo = { texture: TEXTURE.BLANK, tilesets: [] };
  private layerInfo: Layer[] = [];
  private foregroundLayerInfo: ForegroundLayer = { idx: 0, texture: [], depth: 0 };

  private layerContainer!: Phaser.GameObjects.Container;
  private foregroundContainer!: Phaser.GameObjects.Container;

  private readonly scale: number = 3;

  constructor(scene: InGameScene) {
    this.scene = scene;
    this.sceneWidth = this.scene.game.canvas.width;
    this.sceneHeight = this.scene.game.canvas.height;
  }

  get() {
    return this.map;
  }

  setup(texture: TEXTURE, tilesets: TEXTURE[]) {
    this.layerContainer = this.scene.add.container(this.sceneWidth / 4, this.sceneHeight / 4);
    this.foregroundContainer = this.scene.add.container(this.sceneWidth / 4, this.sceneHeight / 4);

    this.layerContainer.setVisible(false);
    this.foregroundContainer.setVisible(false);

    this.foregroundContainer.setDepth(DEPTH.FOREGROND);

    this.mapInfo.texture = texture;
    for (const tileset of tilesets) {
      this.mapInfo.tilesets.push(tileset);
    }
  }

  setLayer(idx: number, texture: TEXTURE, depth: DEPTH) {
    this.layerInfo.push({ idx: this.layerInfo.length, texture: texture, depth: depth });
  }

  setForegroundLayer(idx: number, texture: TEXTURE[], depth: DEPTH) {
    this.foregroundLayerInfo.idx = idx;
    this.foregroundLayerInfo.texture = texture;
    this.foregroundLayerInfo.depth = depth;
  }

  show() {
    this.map = addMap(this.scene, this.mapInfo.texture);

    this.foregroundContainer.setDepth(DEPTH.FOREGROND);

    for (const tileset of this.mapInfo.tilesets) {
      this.addTileset(tileset);
    }

    for (const layer of this.layerInfo) {
      this.addLayers(layer.idx, layer.texture, layer.depth);
    }

    this.addForegroundLayer(this.foregroundLayerInfo.idx, this.foregroundLayerInfo.texture, this.foregroundLayerInfo.depth);

    this.layerContainer.setVisible(true);
    this.foregroundContainer.setVisible(true);
  }

  clean() {
    if (this.map) {
      this.map.destroy();
      this.map = null!;
    }

    if (this.layerContainer) {
      this.layerContainer.removeAll(true);
      this.layerContainer.destroy();
      this.layerContainer = null!;
      this.layers = [];
      this.layerInfo = [];
    }

    if (this.foregroundContainer) {
      this.foregroundContainer.removeAll(true);
      this.foregroundContainer.destroy();
      this.foregroundContainer = null!;
      this.foregroundLayerInfo = { idx: 0, texture: [], depth: 0 };
    }
  }

  private addLayers(idx: number, texture: TEXTURE, depth: DEPTH) {
    const layer = this.map.createLayer(idx, texture)?.setScale(this.scale).setDepth(depth);
    this.layers.push(layer!);
    this.layerContainer.add(layer!);
  }

  private addForegroundLayer(idx: number, texture: TEXTURE[], depth: DEPTH) {
    const foregroundLayer = this.map.createLayer(idx, texture)?.setScale(this.scale).setDepth(depth);
    this.foregroundContainer.add(foregroundLayer!);
  }

  private addTileset(tilesetTexture: TEXTURE) {
    this.map.addTilesetImage(tilesetTexture, tilesetTexture);
  }
}

export class OverworldPlayer {
  private scene: InGameScene;
  private cursorKey: Phaser.Types.Input.Keyboard.CursorKeys;
  private npc: OverworldNpc;
  private safari: OverworldSafari;

  private obj!: PlayerObject | null;
  private dummy!: BaseObject;

  private readonly scale: number = 3;

  constructor(scene: InGameScene, npc: OverworldNpc, safari: OverworldSafari) {
    this.scene = scene;
    this.cursorKey = this.scene.input.keyboard!.createCursorKeys();
    this.npc = npc;
    this.safari = safari;

    eventBus.on(EVENT.FINISH_TALK, () => {
      this.obj?.setStatus(this.obj.getLastStatus(), this.obj.getLastDirection());
    });

    eventBus.on(EVENT.CHECK_HIDDEN_MOVE, () => {
      if (this.obj && this.obj.getStatus() !== PLAYER_STATUS.SURF) {
        this.obj.startSurfAnimation();
      }
    });

    eventBus.on(EVENT.FINISH_SURF, () => {
      if (this.obj && this.obj.getStatus() === PLAYER_STATUS.SURF) {
        PlayerInfo.getInstance().setSurfPokemon(null);
        this.obj.jump(HM.NONE);
        eventBus.emit(EVENT.PET_CALL);
      }
    });

    eventBus.on(EVENT.BATTLE_FINISH, () => {
      runFadeEffect(this.scene, 1000, 'in');
      this.obj?.setStatus(this.obj.getLastStatus(), this.obj.getLastDirection());
      eventBus.emit(EVENT.RESTORE_BATTLE);
    });

    eventBus.on(EVENT.ENTER_EXIT, async (tileEvent: string) => {
      const warpIdx = tileEvent.split('_')[1];

      await delay(this.scene, 100);

      runFadeEffect(this.scene, 2000, 'in');
      playSound(this.scene, AUDIO.DOOR_ENTER);
      eventBus.emit(EVENT.MOVETO_OVERWORLD_MODE, tileEvent.includes('enter') ? 'enter' : 'exit', warpIdx);
    });
  }

  show(map: Phaser.Tilemaps.Tilemap) {
    const playerData = PlayerInfo.getInstance();

    const texture = `${playerData?.getGender()}_${playerData?.getAvatar()}_movement`;
    const nickname = playerData.getNickname();
    const px = playerData.getPosX();
    const py = playerData.getPosY();

    this.obj = new PlayerObject(this.scene, texture, px, py, map, nickname, OBJECT.PLAYER);
    this.obj.setScale(this.scale);
    this.scene.cameras.main.startFollow(this.obj.getSprite(), true, 0.5, 0.5);

    this.handleKeyInput();
  }

  clean() {
    if (!this.obj) {
      console.error('obj is null');
      return;
    }

    this.obj.destroy();
    // this.obj.getPet()?.destroy();
    this.obj = null;
    this.scene.cameras.main.stopFollow();
    this.scene.cameras.main.setScroll(0, 0);
  }

  update(delta: number) {
    if (!this.obj) {
      console.error('player obj is null');
      return;
    }

    this.movement();
    this.obj?.update(delta);
    this.obj?.getPet()?.update(delta);
  }

  private movement() {
    if (!this.obj) return;

    if (this.cursorKey.up.isDown && this.obj!.isMovementFinish() && this.obj.getStatus() !== PLAYER_STATUS.WARP) {
      this.obj!.move(KEY.UP);
      this.obj.isEnterOrExit(DIRECTION.UP);
    } else if (this.cursorKey.down.isDown && this.obj!.isMovementFinish() && this.obj.getStatus() !== PLAYER_STATUS.WARP) {
      this.obj!.move(KEY.DOWN);
      this.obj.isEnterOrExit(DIRECTION.DOWN);
    } else if (this.cursorKey.left.isDown && this.obj!.isMovementFinish() && this.obj.getStatus() !== PLAYER_STATUS.WARP) {
      this.obj!.move(KEY.LEFT);
      this.obj.isEnterOrExit(DIRECTION.LEFT);
    } else if (this.cursorKey.right.isDown && this.obj!.isMovementFinish() && this.obj.getStatus() !== PLAYER_STATUS.WARP) {
      this.obj!.move(KEY.RIGHT);
      this.obj.isEnterOrExit(DIRECTION.RIGHT);
    }
  }

  handleKeyInput() {
    const keyboard = KeyboardHandler.getInstance();
    const keys = [KEY.SELECT, KEY.RUNNING, KEY.MENU, KEY.USE_1, KEY.USE_2, KEY.USE_3, KEY.USE_4, KEY.USE_5, KEY.USE_6, KEY.USE_7, KEY.USE_8, KEY.USE_9];

    keyboard.setAllowKey(keys);
    keyboard.setKeyDownCallback((key) => {
      try {
        switch (key) {
          case KEY.SELECT:
            if (this.obj && this.obj.isMovementFinish() && this.obj.getStatus() !== PLAYER_STATUS.TALK) {
              const target = this.obj.getObjectInFront(this.obj.getLastDirection());
              const tiles = this.obj.getTileInfo(this.obj.getLastDirection());

              if (target instanceof NpcObject) {
                this.npc.talk(target, this.obj!.getLastDirection());
              } else if (target instanceof GroundItemObject) {
                this.safari.talkGroundItem(target);
              } else if (target instanceof PokemonObject) {
                this.obj.setStatus(PLAYER_STATUS.TALK, DIRECTION.NONE);
                this.safari.talkWildPokemon(target, this.obj!.getLastDirection());
              } else if (findEventTile(tiles)) {
                switch (findEventTile(tiles)) {
                  case 'surf':
                    if (PlayerInfo.getInstance().hasSurfInParty() >= 0) {
                      if (this.obj.getStatus() !== PLAYER_STATUS.SURF) {
                        this.showSurfMessage(true);
                      } else {
                        this.showSurfMessage(false);
                      }
                    }
                    break;
                }
              }
            }

            break;
          case KEY.MENU:
            if (this.obj && this.obj.isMovementFinish()) {
              eventBus.emit(EVENT.OVERLAP_MODE, MODE.OVERWORLD_MENU, this.obj);
              return;
            }
            break;
          case KEY.RUNNING:
            if (this.obj && this.obj.isMovementFinish() && this.obj.getStatus() !== PLAYER_STATUS.SURF) {
              this.obj.setStatus(PLAYER_STATUS.RUNNING, this.obj.getLastDirection());
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
      } catch (err: any) {
        console.error(`Error handling key input: ${err}`);
      }
    });
  }

  private useItem(slotIdx: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) {
    if (this.obj?.isMovementFinish()) this.obj!.readyItem(slotIdx);
  }

  private showSurfMessage(onoff: boolean) {
    if (onoff) {
      eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, [{ type: 'sys', format: 'question', content: i18next.t('message:surfOn'), speed: 10, questionYes: EVENT.MOVETO_HIDDENMOVE_MODE }]);
    } else {
      eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, [{ type: 'sys', format: 'question', content: i18next.t('message:surfOff'), speed: 10, questionYes: EVENT.FINISH_SURF }]);
    }
  }
}

export class OverworldNpc {
  private scene: InGameScene;
  private info: NpcInfo[] = [];

  constructor(scene: InGameScene) {
    this.scene = scene;
  }

  setup(npcKey: string, x: number, y: number, overworldType: OVERWORLD_TYPE, startMessageType: 'talk' | 'question') {
    this.info.push({
      key: npcKey,
      x: x,
      y: y,
      overworldType: overworldType,
      startMessageType: startMessageType,
    });
  }

  show(map: Phaser.Tilemaps.Tilemap) {
    for (const info of this.info) {
      const npc = new NpcObject(this.scene, info.key, info.x, info.y, map, i18next.t(`npc:${info.key}.name`), OBJECT.NPC, info.overworldType, info.startMessageType);
      OverworldInfo.getInstance().addNpc(npc);
    }
  }

  clean() {
    this.info = [];
    OverworldInfo.getInstance().resetNpcs();
  }

  async talk(obj: NpcObject, direction: DIRECTION) {
    const etc = await this.preAction(obj);

    this.action(obj, direction, etc!);
  }

  async preAction(obj: NpcObject) {
    const key = obj.getKey();
    let ret;

    switch (key) {
      case 'npc001':
        ret = await getAvailableTicketApi();
        break;
    }

    if (ret) return [ret.data];

    return null;
  }

  action(obj: NpcObject, direction: DIRECTION, etc: any[]) {
    const key = obj.getKey();
    let msgs: Message[] = [];

    switch (key) {
      case 'npc000':
        msgs.push({ type: 'default', format: 'talk', content: i18next.t(`npc:${key}_0`), speed: 10 });
        msgs.push({ type: 'default', format: 'talk', content: i18next.t(`npc:${key}_1`), speed: 10, end: EVENT.MOVETO_SAFARI_LIST_MODE });
        break;
      case 'npc001':
        msgs.push({ type: 'default', format: 'talk', content: i18next.t(`npc:${key}_0`), speed: 10 });
        if (etc[0] <= 0) {
          msgs.push({ type: 'default', format: 'talk', content: i18next.t(`npc:${key}_2`), speed: 10, end: EVENT.FINISH_TALK });
        } else {
          msgs.push({ type: 'default', format: 'talk', content: replacePercentSymbol(i18next.t(`npc:${key}_1`), etc), speed: 10 });
          msgs.push({ type: 'default', format: 'question', content: i18next.t(`npc:${key}_3`), speed: 10, questionYes: EVENT.RECEIVE_AVAILABLE_TICKET, questionNo: EVENT.FINISH_TALK });
        }
        break;
      case 'npc002':
        msgs.push({ type: 'default', format: 'talk', content: i18next.t(`npc:${key}_0`), speed: 10, end: EVENT.MOVETO_SHOP_MODE });
        break;
    }

    obj.reaction(direction);
    eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, msgs);
  }
}

export class OverworldSafari {
  private scene: InGameScene;

  constructor(scene: InGameScene) {
    this.scene = scene;
  }

  show(map: Phaser.Tilemaps.Tilemap) {
    this.addGroundItems(map);
    this.addWildPokemons(map);
  }

  clean() {
    for (const target of OverworldInfo.getInstance().getPokemons()) {
      target.stopMovement();
      target.destroy();
    }
    OverworldInfo.getInstance().resetPokemons();

    for (const target of OverworldInfo.getInstance().getGroundItems()) {
      target.destroy();
    }
    OverworldInfo.getInstance().resetGroundItem();
  }

  updateWildPokemon(delta: number) {
    for (const pokemon of OverworldInfo.getInstance().getPokemons()) {
      if (pokemon.isMovementFinish()) {
        pokemon.move();
      }

      pokemon.update(delta);
    }
  }

  private addWildPokemons(map: Phaser.Tilemaps.Tilemap) {
    OverworldInfo.getInstance().resetPokemons();

    const validPosition = this.doScanSpawnTile(map);

    for (const info of OverworldInfo.getInstance().getWildPokemonInfo()) {
      const pos = this.getRandomSpawnTilePos(validPosition, info.spawns);

      if (info.catch) continue;

      const pokemon = new PokemonObject(
        this.scene,
        `pokemon_overworld${info.pokedex}${info.shiny ? 's' : ''}`,
        info.idx,
        info.pokedex,
        info.gender,
        info.skills,
        info.spawns,
        info.shiny,
        info.eaten_berry,
        info.baseRate,
        info.rank,
        pos[0],
        pos[1],
        map,
        i18next.t(`pokemon:${info.pokedex}.name`),
      );

      pokemon.updateShadowType(info.spawns);

      OverworldInfo.getInstance().addPokemon(pokemon);
    }
  }

  private addGroundItems(map: Phaser.Tilemaps.Tilemap) {
    OverworldInfo.getInstance().resetGroundItem();

    const validPosition = this.doScanSpawnTile(map);

    for (const info of OverworldInfo.getInstance().getGroundItemInfo()) {
      const pos = this.getRandomSpawnTilePos(validPosition, 'land');

      if (info.catch) continue;

      const groundItem = new GroundItemObject(this.scene, TEXTURE.POKEBALL_GROUND, pos[0], pos[1], map, OBJECT.ITEM_GROUND, info.idx, info.stock, info.item, info.catch);

      OverworldInfo.getInstance().addGroundItem(groundItem);
    }
  }

  private doScanSpawnTile(map: Phaser.Tilemaps.Tilemap) {
    const validPositions: [number, number, PokemonSpawn][] = [];

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tiles = this.getTile(map, new Phaser.Math.Vector2(x, y));

        if (!tiles || tiles.length > 1) {
          continue;
        }

        for (const tile of tiles) {
          if (tile && tile.properties.type) {
            validPositions.push([x, y, tile.properties.type as PokemonSpawn]);
          }
        }
      }
    }

    return validPositions;
  }

  private getTile(map: Phaser.Tilemaps.Tilemap, pos: Phaser.Math.Vector2): Phaser.Tilemaps.Tile[] | null {
    const ret: Phaser.Tilemaps.Tile[] = [];

    map.layers.map((layer) => {
      const tile = map.getTileAt(pos.x, pos.y, false, layer.name);

      if (tile) ret.push(tile!);
    });

    return ret;
  }

  private getRandomSpawnTilePos(pos: [number, number, PokemonSpawn][], targetSpawn: PokemonSpawn) {
    const targetTiles = pos.filter(([x, y, spawn]) => spawn === targetSpawn);

    return Phaser.Utils.Array.GetRandom(targetTiles);
  }

  async talkGroundItem(obj: GroundItemObject) {
    obj.destroy();
    obj.changeCatch();

    const ret = await catchGroundItem({ idx: obj.getIdx() });

    if (ret && ret.success) {
      const bag = Bag.getInstance();

      bag.addItems(ret.data.item, ret.data.stock, ret.data.category);
      playSound(this.scene, AUDIO.GET_0);
      eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, [
        {
          type: 'default',
          format: 'talk',
          content: replacePercentSymbol(i18next.t(`message:catchItem`), [PlayerInfo.getInstance().getNickname(), i18next.t(`item:${obj.getItemKey()}.name`), obj.getCount()]),
          speed: 60,
        },
        {
          type: 'default',
          format: 'talk',
          content: replacePercentSymbol(i18next.t(`message:putPocket`), [
            PlayerInfo.getInstance().getNickname(),
            i18next.t(`item:${obj.getItemKey()}.name`),
            i18next.t(`menu:${ret.data.data.category}`),
          ]),
          speed: 10,
        },
      ]);
    }
  }

  talkWildPokemon(obj: PokemonObject, direction: DIRECTION) {
    playSound(this.scene, AUDIO.REACTION_0);
    obj.reaction(direction);

    eventBus.emit(EVENT.OVERLAP_MODE, MODE.BATTLE, obj);

    // this.scene.time.delayedCall(100, () => {
    // });
  }
}
