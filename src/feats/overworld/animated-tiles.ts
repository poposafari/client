interface AnimFrame {
  tileid: number;
  duration: number;
}

interface AnimatedTileGroup {
  frames: AnimFrame[];
  firstgid: number;
  currentFrame: number;
  elapsed: number;
  tiles: Phaser.Tilemaps.Tile[];
}

export class AnimatedTiles {
  private groups: AnimatedTileGroup[] = [];
  private active = true;

  init(map: Phaser.Tilemaps.Tilemap): void {
    this.groups = [];

    for (const tileset of map.tilesets) {
      const tileData = (tileset as any).tileData as
        | Record<string, { animation?: AnimFrame[] }>
        | undefined;
      if (!tileData) continue;

      for (const [localIdStr, data] of Object.entries(tileData)) {
        if (!data.animation || data.animation.length < 2) continue;

        const localId = Number(localIdStr);
        const gid = tileset.firstgid + localId;
        const tiles: Phaser.Tilemaps.Tile[] = [];

        for (const layer of map.layers) {
          for (const row of layer.data) {
            for (const tile of row) {
              if (tile && tile.index === gid) {
                tiles.push(tile);
              }
            }
          }
        }

        if (tiles.length === 0) continue;

        this.groups.push({
          frames: data.animation,
          firstgid: tileset.firstgid,
          currentFrame: 0,
          elapsed: 0,
          tiles,
        });
      }
    }
  }

  update(delta: number): void {
    if (!this.active) return;

    for (const group of this.groups) {
      group.elapsed += delta;
      const frame = group.frames[group.currentFrame];

      if (group.elapsed >= frame.duration) {
        group.elapsed -= frame.duration;
        group.currentFrame = (group.currentFrame + 1) % group.frames.length;
        const newIndex = group.firstgid + group.frames[group.currentFrame].tileid;
        for (const tile of group.tiles) {
          tile.index = newIndex;
        }
      }
    }
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  destroy(): void {
    this.groups = [];
  }
}
