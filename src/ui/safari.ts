import i18next from 'i18next';
import { OVERWORLD_TYPE } from '../enums/overworld-type';
import { OverworldMode } from '../modes';
import { PokemonObject } from '../object/pokemon-object';
import { InGameScene } from '../scenes/ingame-scene';
import { OverworldUi } from './overworld-ui';

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
    const validPosition = this.doMapScan(map);
    const overworldInfo = this.getOverworldInfo();

    let test = ['001', '002', '003', '004', '005', '006', '007', '008', '009', '001s', '002s', '003s', '004s', '005s', '006s', '007s', '008s', '009s', '004', '005', '006', '007'];
    //TODO: overworld.spawnTypes들을 가지고, 서버에게 request를 날리도록 해야 한다.

    for (const pokedex of test) {
      const pos = this.getRandomTilePosition(validPosition);
      const originPokedex = pokedex.endsWith('s') ? pokedex.slice(0, -1) : pokedex;
      const pokemon = new PokemonObject(scene, `pokemon_overworld${pokedex}`, `${pokedex}`, pos[0], pos[1], map, i18next.t(`pokemon:${originPokedex}.name`), this.getOverworldInfo());
      overworldInfo.addPokemon(pokemon);
    }

    return Promise.resolve();
  }

  private doMapScan(map: Phaser.Tilemaps.Tilemap): [number, number][] {
    const validPositions: [number, number][] = [];

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (!this.hasBlockingTile(this.getMap(), new Phaser.Math.Vector2(x, y))) {
          validPositions.push([x, y]);
        }
      }
    }

    if (validPositions.length === 0) {
      throw new Error('No valid positions found in the map.');
    }

    return validPositions;
  }

  private getRandomTilePosition(validPositions: [number, number][]) {
    return Phaser.Utils.Array.GetRandom(validPositions);
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
}
