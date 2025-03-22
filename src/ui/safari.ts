import i18next from 'i18next';
import { OVERWORLD_TYPE } from '../enums/overworld-type';
import { OverworldMode } from '../modes';
import { PokemonObject } from '../object/pokemon-object';
import { InGameScene } from '../scenes/ingame-scene';
import { OverworldUi } from './overworld-ui';
import { GroundItemObject } from '../object/ground-item-object';
import { OBJECT } from '../enums/object-type';
import { TEXTURE } from '../enums/texture';

export interface WildPokemon {
  pokedex: string;
  gender: 0 | 1 | 2; //0:male, 1:female, 2:nothing
  skill: 0 | 1 | 2 | 3 | 4 | null;
  habitat: 'forest' | 'lake' | 'mt';
}

export interface GroundItem {
  item: string;
  count: number;
}

export class Safari extends OverworldUi {
  private pokemons!: PokemonObject[];
  private isReadyPokemons!: boolean;

  constructor(scene: InGameScene, mode: OverworldMode, type: OVERWORLD_TYPE, key: string) {
    super(scene, mode, key);
  }

  setup(): void {
    this.isReadyPokemons = false;
    super.setup();
  }

  async show(): Promise<void> {
    const overworldInfo = this.getOverworldInfo();

    super.show();
    await this.addOverworldPokemons(this.scene, this.getMap());
    this.pokemons = overworldInfo?.getPokemons()!;
  }

  clean(): void {
    super.clean();
    this.pokemons = [];
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
    this.updateWildPokemons();
  }

  private updateWildPokemons() {
    for (const pokemon of this.pokemons) {
      if (pokemon.isMovementFinish()) {
        pokemon.move();
      }

      pokemon.update();
    }
  }

  addOverworldPokemons(scene: InGameScene, map: Phaser.Tilemaps.Tilemap): Promise<void> {
    const overworldInfo = this.getOverworldInfo();
    const validPosition = this.doMapScanSpawnTile(map);

    let test: WildPokemon[] = [
      { pokedex: '055s', gender: 0, skill: null, habitat: 'forest' },
      { pokedex: '002s', gender: 1, skill: null, habitat: 'forest' },
      { pokedex: '060', gender: 0, skill: null, habitat: 'forest' },
      { pokedex: '045', gender: 1, skill: null, habitat: 'lake' },
      { pokedex: '117', gender: 0, skill: null, habitat: 'forest' },
      { pokedex: '149s', gender: 1, skill: null, habitat: 'forest' },
      { pokedex: '151s', gender: 2, skill: null, habitat: 'lake' },
      { pokedex: '073s', gender: 2, skill: null, habitat: 'forest' },
      { pokedex: '130s', gender: 0, skill: null, habitat: 'lake' },
    ];

    let test2: GroundItem[] = [
      { item: '002', count: 2 },
      { item: '002', count: 2 },
      { item: '003', count: 2 },
      { item: '001', count: 5 },
      { item: '004', count: 99 },
    ];

    //TODO: overworld.spawnTypes들을 가지고, 서버에게 request를 날리도록 해야 한다.
    for (const wild of test) {
      let pos = this.getRandomTilePosition(validPosition, wild.habitat);
      const originPokedex = wild.pokedex.endsWith('s') ? wild.pokedex.slice(0, -1) : wild.pokedex;
      const pokemon = new PokemonObject(
        scene,
        `pokemon_overworld${wild.pokedex}`,
        `${wild.pokedex}`,
        wild.gender,
        wild.skill,
        wild.habitat,
        pos![0],
        pos![1],
        map,
        i18next.t(`pokemon:${originPokedex}.name`),
        this.getOverworldInfo(),
        this.getOverworldMode().getPlayerInfo()!,
      );
      overworldInfo.addPokemon(pokemon);
    }

    for (const item of test2) {
      const pos = this.getRandomGroundItemTilePosition(validPosition);
      const groundItem = new GroundItemObject(this.scene, TEXTURE.POKEBALL_GROUND, pos[0], pos[1], this.getMap(), OBJECT.ITEM_GROUND, item.count, item.item);
      overworldInfo.addGroundItem(groundItem);
    }

    return Promise.resolve();
  }

  private doMapScanSpawnTile(map: Phaser.Tilemaps.Tilemap) {
    const validPositions: [number, number, string, boolean][] = [];

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = this.getSpawnTile(this.getMap(), new Phaser.Math.Vector2(x, y));
        if (tile && tile.properties.spawn) {
          validPositions.push([x, y, tile.properties.spawn, tile.properties.item]);
        }
      }
    }
    return validPositions;
  }

  private getRandomTilePosition(validPositions: [number, number, string, boolean][], targetSpawn: 'forest' | 'lake' | 'mt') {
    const targetTiles = validPositions.filter(([x, y, spawnType]) => spawnType === targetSpawn);
    return Phaser.Utils.Array.GetRandom(targetTiles);
  }

  private getRandomGroundItemTilePosition(validPositions: [number, number, string, boolean][]) {
    const targetTiles = validPositions.filter(([x, y, any, target]) => target === target);

    return Phaser.Utils.Array.GetRandom(targetTiles);
  }

  private hasNoTile(map: Phaser.Tilemaps.Tilemap, pos: Phaser.Math.Vector2): boolean {
    return map.layers.some((layer) => {
      map.hasTileAt(pos.x, pos.y, layer.name);
    });
  }

  private hasBlockingTile(map: Phaser.Tilemaps.Tilemap, pos: Phaser.Math.Vector2): boolean {
    if (this.hasNoTile(map, pos)) return true;
    return map.layers.some((layer) => {
      const tile = map.getTileAt(pos.x, pos.y, false, layer.name);
      return tile && tile.properties.collides;
    });
  }

  private getSpawnTile(map: Phaser.Tilemaps.Tilemap, pos: Phaser.Math.Vector2): Phaser.Tilemaps.Tile | null {
    if (this.hasNoTile(map, pos)) return null;

    const layer = map.layers.find((layer) => {
      const tile = map.getTileAt(pos.x, pos.y, false, layer.name);
      return tile;
    });

    if (!layer) return null;

    return map.getTileAt(pos.x, pos.y, false, layer.name);
  }
}
