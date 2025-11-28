import { DEPTH, TEXTURE } from '../../enums';
import { InGameScene } from '../../scenes/ingame-scene';
import { ForegroundLayer, Layer, MapInfo } from '../../types';
import { addMap } from '../ui';

export class OverworldMap {
  private scene!: InGameScene;
  private sceneWidth!: number;
  private sceneHeight!: number;

  private map!: Phaser.Tilemaps.Tilemap;
  private layers: Phaser.Tilemaps.TilemapLayer[] = [];

  private mapInfo: MapInfo = { texture: TEXTURE.BLANK, tilesets: [] };
  private layerInfo: Layer[] = [];
  private foregroundLayerInfo: ForegroundLayer = { idx: 0, texture: [], depth: 0 };
  private foreground1LayerInfo: ForegroundLayer = { idx: 0, texture: [], depth: 0 };

  private layerContainer!: Phaser.GameObjects.Container;
  private foregroundContainer!: Phaser.GameObjects.Container;
  private foreground1Container!: Phaser.GameObjects.Container;

  private readonly scale: number = 3;

  constructor(scene: InGameScene) {
    this.scene = scene;
    this.sceneWidth = this.scene.game.canvas.width;
    this.sceneHeight = this.scene.game.canvas.height;
  }

  get() {
    return this.map;
  }

  getLayerContainer(): Phaser.GameObjects.Container {
    return this.layerContainer;
  }

  getForegroundContainer(): Phaser.GameObjects.Container {
    return this.foregroundContainer;
  }

  getForeground1Container(): Phaser.GameObjects.Container {
    return this.foreground1Container;
  }

  setup(texture: TEXTURE, tilesets: TEXTURE[]) {
    this.layerContainer = this.scene.add.container(this.sceneWidth / 4, this.sceneHeight / 4);
    this.foregroundContainer = this.scene.add.container(this.sceneWidth / 4, this.sceneHeight / 4);
    this.foreground1Container = this.scene.add.container(this.sceneWidth / 4, this.sceneHeight / 4);

    this.layerContainer.setVisible(false);
    this.foregroundContainer.setVisible(false);
    this.foreground1Container.setVisible(false);

    this.foregroundContainer.setDepth(DEPTH.FOREGROND);
    this.foreground1Container.setDepth(DEPTH.FOREGROND);

    this.mapInfo.texture = texture;
    this.mapInfo.tilesets = [];

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

  setForeground1Layer(idx: number, texture: TEXTURE[], depth: DEPTH) {
    this.foreground1LayerInfo.idx = idx;
    this.foreground1LayerInfo.texture = texture;
    this.foreground1LayerInfo.depth = depth;
  }

  show() {
    this.map = addMap(this.scene, this.mapInfo.texture);

    this.foregroundContainer.setDepth(DEPTH.FOREGROND);
    this.foreground1Container.setDepth(DEPTH.FOREGROND);

    for (const tileset of this.mapInfo.tilesets) {
      this.addTileset(tileset);
    }

    for (const layer of this.layerInfo) {
      this.addLayers(layer.idx, layer.texture, layer.depth);
    }

    this.addForegroundLayer(this.foregroundLayerInfo.idx, this.foregroundLayerInfo.texture, this.foregroundLayerInfo.depth);

    if (this.foreground1LayerInfo.texture.length > 0) this.addForeground1Layer(this.foreground1LayerInfo.idx, this.foreground1LayerInfo.texture, this.foreground1LayerInfo.depth);

    this.layerContainer.setVisible(true);
    this.foregroundContainer.setVisible(true);
    this.foreground1Container.setVisible(true);
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

    if (this.foreground1LayerInfo.texture.length > 0 && this.foreground1Container) {
      this.foreground1Container.removeAll(true);
      this.foreground1Container.destroy();
      this.foreground1Container = null!;
      this.foreground1LayerInfo = { idx: 0, texture: [], depth: 0 };
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

  private addForeground1Layer(idx: number, texture: TEXTURE[], depth: DEPTH) {
    const foregroundLayer = this.map.createLayer(idx, texture)?.setScale(this.scale).setDepth(depth);
    this.foreground1Container.add(foregroundLayer!);
  }

  private addTileset(tilesetTexture: TEXTURE) {
    this.map.addTilesetImage(tilesetTexture, tilesetTexture);
  }

  getLightTilePositions(): { x: number; y: number }[] {
    const lightPositions: { x: number; y: number }[] = [];

    if (!this.map) {
      return lightPositions;
    }

    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        for (const layer of this.map.layers) {
          const tile = layer.data[y]?.[x];
          if (tile && tile.index !== -1) {
            if (tile.properties && tile.properties.light === true) {
              lightPositions.push({ x, y });
              break;
            }
          }
        }
      }
    }

    return lightPositions;
  }
}
