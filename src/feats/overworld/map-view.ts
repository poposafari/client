import { MapConfig } from '@poposafari/core/map.registry';
import { GameScene } from '@poposafari/scenes';
import { DEPTH } from '@poposafari/types';
import { MAP_LAYER_SCALE_ZOOMED } from './overworld.constants';
import { NpcObject, ProfessorNpcObject, TriggerObject } from './objects';

/**
 * MapView - Overworld 타일맵 및 레이어 렌더링
 *
 * legacy OverworldMap 로직을 기반으로 MapConfig 기반 구조로 이전.
 * 타일맵 생성, 레이어 설정, 포어그라운드 레이어, light 타일 조회를 담당.
 */
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
  /** TilemapLayer는 Container scale을 따르지 않으므로 맵만 이 스케일로 그려 줌인 효과를 맞춤. */
  private readonly scale = MAP_LAYER_SCALE_ZOOMED;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.sceneWidth = this.scene.game.canvas.width;
    this.sceneHeight = this.scene.game.canvas.height;
  }

  /** Phaser Tilemap 인스턴스 */
  getTilemap(): Phaser.Tilemaps.Tilemap {
    return this.map;
  }

  /** ground 레이어들이 담긴 컨테이너 */
  getLayerContainer(): Phaser.GameObjects.Container {
    return this.layerContainer;
  }

  /** 포어그라운드 레이어들이 담긴 컨테이너 (첫 번째 그룹) */
  getForegroundContainer(): Phaser.GameObjects.Container {
    return this.foregroundContainer;
  }

  /** 포어그라운드 레이어들이 담긴 컨테이너 (두 번째 그룹) */
  getForeground1Container(): Phaser.GameObjects.Container {
    return this.foreground1Container;
  }

  /** setup 시점에 생성된 트리거 목록 */
  getTriggers(): TriggerObject[] {
    return this.triggers;
  }

  /** setup 시점에 생성된 NPC 목록 */
  getNpcs(): NpcObject[] {
    return this.npcs;
  }

  /** MapConfig를 기반으로 타일맵 및 레이어 구성. 레거시와 동일: 원점 (0,0)으로 맵·플레이어 같은 월드 좌표계 사용 */
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

  /** 타일맵·컨테이너 해제 및 정리 */
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

  /** 레거시 hasNoTile: 해당 타일 좌표에 타일이 하나도 없으면 true (맵 밖) */
  hasTileAt(tileX: number, tileY: number): boolean {
    if (!this.map) return false;
    return this.map.layers.some((layer) =>
      this.map.hasTileAt(Math.floor(tileX), Math.floor(tileY), layer.name),
    );
  }

  /** 레거시 hasBlockingTile: 해당 타일 좌표에 collides 속성 타일이 있으면 true */
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

  /** light 속성이 true인 타일의 월드 좌표 목록 */
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
