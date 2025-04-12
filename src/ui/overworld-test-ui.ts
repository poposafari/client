import { DEPTH } from '../enums/depth';
import { OBJECT } from '../enums/object-type';
import { OVERWORLD_TYPE } from '../enums/overworld-type';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { PlayerObject } from '../object/player-object';
import { InGameScene } from '../scenes/ingame-scene';
import { addMap, runFadeEffect, Ui } from './ui';
import { PlayerInfo } from '../storage/player-info';
import { KEY } from '../enums/key';
import { OverworldInfo } from '../storage/overworld-info';
import { KeyboardManager } from '../managers';
import { PLAYER_STATUS } from '../enums/player-status';

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

  protected map: OverworldMap;
  protected player: OverworldPlayer;
  protected info: OverworldInfo;

  constructor(scene: InGameScene, mode: OverworldMode, key: string) {
    super(scene);
    this.mode = mode;
    this.map = new OverworldMap(scene);
    this.info = new OverworldInfo();
    this.player = new OverworldPlayer(scene, mode, this.info);
  }

  setup(): void {}

  show(data?: any): void {
    runFadeEffect(this.scene, 1200, 'in');

    this.map.show();
    this.player.show(this.map.get());
  }

  clean(data?: any): void {
    this.map.clean();
    this.player.clean();
  }

  pause(onoff: boolean, data?: any): void {
    this.player.handleKeyInput();
  }

  update(time: number, delta: number): void {
    this.player.update();
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
  private mode: OverworldMode;
  private updateBlock: boolean;

  private obj!: PlayerObject | null;
  private overworldInfo: OverworldInfo;

  private readonly scale: number = 3;

  constructor(scene: InGameScene, mode: OverworldMode, overworldInfo: OverworldInfo) {
    this.scene = scene;
    this.mode = mode;
    this.cursorKey = this.scene.input.keyboard!.createCursorKeys();
    this.overworldInfo = overworldInfo;

    this.updateBlock = false;
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

  update() {
    if (!this.obj) {
      console.error('obj is null');
      return;
    }
    this.movement();
    this.obj.update();
    this.obj.getPet().update();
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
    const keyboardMananger = KeyboardManager.getInstance();
    const keys = [KEY.SELECT, KEY.RUNNING, KEY.MENU, KEY.USE_1, KEY.USE_2, KEY.USE_3, KEY.USE_4, KEY.USE_5, KEY.USE_6, KEY.USE_7, KEY.USE_8, KEY.USE_9];

    keyboardMananger.setAllowKey(keys);
    keyboardMananger.setKeyDownCallback(async (key) => {
      try {
        switch (key) {
          case KEY.SELECT:
            break;
          case KEY.MENU:
            if (this.obj && this.obj.isMovementFinish()) {
              this.mode.setOverworldUiBlock(true);
              this.mode.addUiStack('OverworldMenuUi');
            }
            break;
          case KEY.RUNNING:
            if (this.obj && this.obj.isMovementFinish()) {
              this.obj.setStatus(PLAYER_STATUS.RUNNING);
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
}
