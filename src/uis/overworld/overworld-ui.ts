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
import { addMap, createSprite, runFadeEffect, Ui } from '../ui';
import { KeyboardHandler } from '../../handlers/keyboard-handler';
import { eventBus } from '../../core/event-bus';
import { EVENT } from '../../enums/event';
import { getAvailableTicketApi } from '../../api';
import { Message } from '../../types';
import { replacePercentSymbol } from '../../utils/string-util';
import { OverworldHUDUi } from './overworld-hud-ui';
import { MODE } from '../../enums/mode';
import { BaseObject } from '../../object/base-object';

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
  protected map: OverworldMap;
  protected player: OverworldPlayer;
  protected info: OverworldInfo;
  protected npc: OverworldNpc;

  constructor(scene: InGameScene) {
    super(scene);
    this.map = new OverworldMap(scene);
    this.info = new OverworldInfo();
    this.npc = new OverworldNpc(scene, this.info);
    this.player = new OverworldPlayer(scene, this.npc, this.info);
  }

  setup(): void {}

  show(data?: any): void {
    runFadeEffect(this.scene, 1200, 'in');

    this.map.show();
    this.player.show(this.map.get());
    this.npc.show(this.map.get());
  }

  clean(data?: any): void {
    this.map.clean();
    this.player.clean();
    this.npc.clean();
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {
    this.player.handleKeyInput();
  }

  update(time: number, delta: number): void {}

  updatePlayer(delta: number) {
    this.player.update(delta);
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

  private obj!: PlayerObject | null;
  private overworldInfo: OverworldInfo;
  private dummy!: BaseObject;

  private readonly scale: number = 3;

  constructor(scene: InGameScene, npc: OverworldNpc, overworldInfo: OverworldInfo) {
    this.scene = scene;
    this.cursorKey = this.scene.input.keyboard!.createCursorKeys();
    this.overworldInfo = overworldInfo;
    this.npc = npc;

    eventBus.on(EVENT.FINISH_TALK, () => {
      this.obj?.setStatus(PLAYER_STATUS.WALK, this.obj.getLastDirection());
    });

    eventBus.on(EVENT.START_SURF_ANIMATION, () => {
      if (!this.obj) return;

      const pos = this.obj.getTilePos();
      const lastDirection = this.obj.getLastDirection();

      let x = pos.x;
      let y = pos.y;
      let frame = 0;

      switch (lastDirection) {
        case DIRECTION.UP:
          y = y - 2;
          frame = 0;
          break;
        case DIRECTION.DOWN:
          y = y + 2;
          frame = 3;
          break;
        case DIRECTION.LEFT:
          x = x - 2;
          frame = 6;
          break;
        case DIRECTION.RIGHT:
          x = x + 2;
          frame = 9;
          break;
      }

      this.dummy = new BaseObject(this.scene, `surf`, x, y, '', OBJECT.PLAYER);
      this.dummy.setSpriteFrame(frame);
      this.dummy.setScale(3.2);
      this.obj.jump();
    });

    eventBus.on(EVENT.SURF_ON, () => {
      if (!this.obj) return;

      this.dummy.destroy();

      eventBus.emit(EVENT.POP_MODE);
      this.obj?.setStatus(PLAYER_STATUS.SURF, this.obj.getLastDirection());
    });
  }

  show(map: Phaser.Tilemaps.Tilemap) {
    const playerData = PlayerInfo.getInstance();

    const texture = `${playerData?.getGender()}_${playerData?.getAvatar()}_movement`;
    const nickname = playerData.getNickname();
    const px = playerData.getPosX();
    const py = playerData.getPosY();

    this.obj = new PlayerObject(this.scene, texture, px, py, map, nickname, this.overworldInfo, OBJECT.PLAYER);
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
    this.obj.getPet().destroy();
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
    this.obj.update(delta);
    this.obj.getPet().update(delta);
  }

  private movement() {
    if (this.cursorKey.up.isDown && this.obj!.isMovementFinish()) {
      this.obj!.move(KEY.UP);
    } else if (this.cursorKey.down.isDown && this.obj!.isMovementFinish()) {
      this.obj!.move(KEY.DOWN);
    } else if (this.cursorKey.left.isDown && this.obj!.isMovementFinish()) {
      this.obj!.move(KEY.LEFT);
    } else if (this.cursorKey.right.isDown && this.obj!.isMovementFinish()) {
      this.obj!.move(KEY.RIGHT);
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
            if (this.obj && this.obj.isMovementFinish()) {
              const target = this.obj.getObjectInFront(this.obj.getLastDirection());
              const tile = this.obj.getTileInfo(this.obj.getLastDirection());

              if (target instanceof NpcObject) {
                this.npc.talk(target, this.obj!.getLastDirection());
              } else if (tile?.properties.event) {
                switch (tile?.properties.event) {
                  case 'surf':
                    if (PlayerInfo.getInstance().hasSurfInParty() >= 0) {
                      this.showSurfMessage();
                    }
                    break;
                }
              }
            }

            break;
          case KEY.MENU:
            if (this.obj && this.obj.isMovementFinish()) {
              eventBus.emit(EVENT.OVERLAP_MODE, MODE.OVERWORLD_MENU);
              return;
            }
            break;
          case KEY.RUNNING:
            if (this.obj && this.obj.isMovementFinish()) {
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

  private showSurfMessage() {
    eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, [{ type: 'sys', format: 'question', content: i18next.t('message:surf'), speed: 10, questionYes: EVENT.MOVETO_HIDDENMOVE_MODE }]);
  }
}

export class OverworldNpc {
  private scene: InGameScene;
  private overworldInfo: OverworldInfo;
  private info: NpcInfo[] = [];

  constructor(scene: InGameScene, overworldInfo: OverworldInfo) {
    this.scene = scene;
    this.overworldInfo = overworldInfo;
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
      this.overworldInfo.addNpc(npc);
    }
  }

  clean() {
    this.info = [];
    this.overworldInfo.resetNpcs();
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
