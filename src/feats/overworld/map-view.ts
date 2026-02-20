import { MapConfig } from '@poposafari/core/map.registry';
import { GameScene } from '@poposafari/scenes';
import { DEPTH } from '@poposafari/types';
import { MAP_LAYER_SCALE_ZOOMED } from './overworld.constants';
import { NpcObject, ProfessorNpcObject, TriggerObject } from './objects';

export class MapView {
  private scene!: GameScene;
  private sceneWidth!: number;
  private sceneHeight!: number;

  private map!: Phaser.Tilemaps.Tilemap;
  private layers: Phaser.Tilemaps.TilemapLayer[] = [];

  private layerContainer!: Phaser.GameObjects.Container;
  private foregroundContainer!: Phaser.GameObjects.Container;
  private foreground1Container!: Phaser.GameObjects.Container;

  private triggers: TriggerObject[] = [];
  private npcs: NpcObject[] = [];
  private readonly scale = MAP_LAYER_SCALE_ZOOMED;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.sceneWidth = this.scene.game.canvas.width;
    this.sceneHeight = this.scene.game.canvas.height;
  }

  getTilemap(): Phaser.Tilemaps.Tilemap {
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

  getTriggers(): TriggerObject[] {
    return this.triggers;
  }

  getNpcs(): NpcObject[] {
    return this.npcs;
  }

  setup(config: MapConfig): void {
    this.layerContainer = this.scene.add.container(0, 0);
    this.foregroundContainer = this.scene.add.container(0, 0);
    this.foreground1Container = this.scene.add.container(0, 0);

    this.layerContainer.setVisible(false);
    this.foregroundContainer.setVisible(false);
    this.foreground1Container.setVisible(false);

    this.foregroundContainer.setDepth(DEPTH.FOREGROUND);
    this.foreground1Container.setDepth(DEPTH.FOREGROUND);

    this.map = this.scene.make.tilemap({ key: config.key });

    for (const tilesetKey of config.tilesets) {
      this.map.addTilesetImage(tilesetKey, tilesetKey);
    }

    for (const layer of config.layers) {
      this.addLayer(layer.idx, layer.texture, layer.depth);
    }

    const [fg0, fg1] = config.foreground;
    if (fg0) {
      this.addForegroundLayer(fg0.idx, fg0.texture, fg0.depth, this.foregroundContainer);
    }
    if (fg1) {
      this.addForegroundLayer(fg1.idx, fg1.texture, fg1.depth, this.foreground1Container);
    }

    this.triggers = [];
    if (config.triggers?.length) {
      for (const t of config.triggers) {
        this.triggers.push(new TriggerObject(t));
      }
    }

    this.npcs = [];
    if (config.npcs?.length) {
      for (const n of config.npcs) {
        if (n.special === 'professor') {
          this.npcs.push(new ProfessorNpcObject(this.scene, n));
        } else {
          this.npcs.push(new NpcObject(this.scene, n));
        }
      }
    }

    this.layerContainer.setVisible(true);
    this.foregroundContainer.setVisible(true);
    this.foreground1Container.setVisible(true);
  }

  destroy(): void {
    if (this.map) {
      this.map.destroy();
      this.map = null!;
    }

    if (this.layerContainer) {
      this.layerContainer.removeAll(true);
      this.layerContainer.destroy();
      this.layerContainer = null!;
      this.layers = [];
    }

    if (this.foregroundContainer) {
      this.foregroundContainer.removeAll(true);
      this.foregroundContainer.destroy();
      this.foregroundContainer = null!;
    }

    if (this.foreground1Container) {
      this.foreground1Container.removeAll(true);
      this.foreground1Container.destroy();
      this.foreground1Container = null!;
    }

    for (const npc of this.npcs) {
      npc.destroy();
    }
    this.npcs = [];
    this.triggers = [];
  }

  hasTileAt(tileX: number, tileY: number): boolean {
    if (!this.map) return false;
    return this.map.layers.some((layer) =>
      this.map.hasTileAt(Math.floor(tileX), Math.floor(tileY), layer.name),
    );
  }

  hasBlockingTileAt(tileX: number, tileY: number): boolean {
    if (!this.map) return false;
    const tx = Math.floor(tileX);
    const ty = Math.floor(tileY);
    return this.map.layers.some((layer) => {
      const tile = this.map.getTileAt(tx, ty, false, layer.name);
      return (
        tile != null &&
        tile.index !== -1 &&
        (tile.properties?.collides === true || tile.properties?.collides === 'true')
      );
    });
  }

  getLightTilePositions(): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = [];
    if (!this.map) return positions;

    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        for (const layer of this.map.layers) {
          const tile = layer.data[y]?.[x];
          if (tile && tile.index !== -1 && tile.properties?.light === true) {
            positions.push({ x, y });
            break;
          }
        }
      }
    }
    return positions;
  }

  private addLayer(idx: number, texture: string, depth: number): void {
    const layer = this.map.createLayer(idx, texture)?.setScale(this.scale).setDepth(depth);
    if (layer) {
      this.layers.push(layer);
      this.layerContainer.add(layer);
    }
  }

  private addForegroundLayer(
    idx: number,
    textures: string[],
    depth: number,
    container: Phaser.GameObjects.Container,
  ): void {
    const layer = this.map.createLayer(idx, textures)?.setScale(this.scale).setDepth(depth);
    if (layer) {
      container.add(layer);
    }
  }
}
