import { OverworldGlobal } from '../../core/storage/overworld-storage';
import { GroundItemOverworldObj } from '../../obj/ground-item-overworld-obj';
import { WildOverworldObj } from '../../obj/wild-overworld-obj';
import { InGameScene } from '../../scenes/ingame-scene';
import { PokemonSpawn } from '../../types';

export class OverworldSafari {
  private scene: InGameScene;
  private wilds: WildOverworldObj[] = [];
  private groundItems: GroundItemOverworldObj[] = [];

  constructor(scene: InGameScene) {
    this.scene = scene;
  }

  getWilds(): WildOverworldObj[] {
    return this.wilds;
  }

  getGroundItems(): GroundItemOverworldObj[] {
    return this.groundItems;
  }

  show(map: Phaser.Tilemaps.Tilemap) {
    this.addGroundItemObj(map);
    this.addWildObj(map);
  }

  clean() {
    for (const wild of this.wilds) {
      if (wild) {
        wild.stopMovement();
        wild.destroy();
      }
    }
    this.wilds = [];

    for (const groundItem of this.groundItems) {
      if (groundItem) {
        groundItem.destroy();
      }
    }
    this.groundItems = [];
  }

  update(delta: number) {
    for (const wild of this.wilds) {
      wild.update(delta);
    }
  }

  private addWildObj(map: Phaser.Tilemaps.Tilemap) {
    this.wilds = [];

    const validPos = this.doScanSpawnTile(map);
    const usedPositions = new Set<string>();

    for (const groundItem of this.groundItems) {
      const tilePos = groundItem.getTilePos();
      const posKey = `${Math.floor(tilePos.x)},${Math.floor(tilePos.y)}`;
      usedPositions.add(posKey);
    }

    for (const data of OverworldGlobal.getWildData()) {
      if (data.catch) continue;

      const maxAttempts = 100;
      let attempts = 0;
      let randPos: [number, number] | null = null;

      while (attempts < maxAttempts) {
        randPos = this.getRandomSpawnTilePos(validPos, data.spawn);

        if (!randPos) {
          break;
        }

        const posKey = `${randPos[0]},${randPos[1]}`;

        if (!usedPositions.has(posKey)) {
          usedPositions.add(posKey);
          break;
        }

        attempts++;
        randPos = null;
      }

      if (randPos) {
        const wild = new WildOverworldObj(this.scene, map, data, randPos[0], randPos[1]);
        this.wilds.push(wild);
      }
    }
  }

  private addGroundItemObj(map: Phaser.Tilemaps.Tilemap) {
    this.groundItems = [];

    const validPos = this.doScanSpawnTile(map);
    const usedPositions = new Set<string>();

    for (const data of OverworldGlobal.getGroundItemData()) {
      if (data.catch) continue;

      const maxAttempts = 100;
      let attempts = 0;
      let randPos: [number, number] | null = null;

      while (attempts < maxAttempts) {
        randPos = this.getRandomSpawnTilePos(validPos, 'land');

        if (!randPos) {
          break;
        }

        const posKey = `${randPos[0]},${randPos[1]}`;

        if (!usedPositions.has(posKey)) {
          usedPositions.add(posKey);
          break;
        }

        attempts++;
        randPos = null;
      }

      if (randPos) {
        const groundItem = new GroundItemOverworldObj(this.scene, data, randPos[0], randPos[1]);
        this.groundItems.push(groundItem);
      }
    }
  }

  private doScanSpawnTile(map: Phaser.Tilemaps.Tilemap) {
    const validPositions: [number, number, PokemonSpawn][] = [];

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tiles = this.getTile(map, new Phaser.Math.Vector2(x, y));

        if (!tiles) {
          continue;
        }

        for (const tile of tiles) {
          if (tile && tile.properties.spawn) {
            validPositions.push([x, y, tile.properties.spawn as PokemonSpawn]);
          }
        }
      }
    }

    return validPositions;
  }

  private getTile(map: Phaser.Tilemaps.Tilemap, pos: Phaser.Math.Vector2): Phaser.Tilemaps.Tile[] | null {
    const tiles: Phaser.Tilemaps.Tile[] = [];

    for (const layer of map.layers) {
      const tile = layer.data[pos.y]?.[pos.x];
      if (tile && tile.index !== -1) {
        tiles.push(tile);
      }
    }

    return tiles.length > 0 ? tiles : null;
  }

  private getRandomSpawnTilePos(pos: [number, number, PokemonSpawn][], targetSpawn: PokemonSpawn): [number, number] | null {
    const filteredPos = pos.filter((p) => p[2] === targetSpawn);
    if (filteredPos.length === 0) return null;
    const randomPos = filteredPos[Phaser.Math.Between(0, filteredPos.length - 1)];
    return [randomPos[0], randomPos[1]];
  }
}
