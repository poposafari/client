import i18next from 'i18next';
import { OVERWORLD_TYPE } from '../enums/overworld-type';
import { TYPE } from '../enums/type';
import { OverworldMode } from '../modes';
import { PokemonObject } from '../object/pokemon-object';
import { InGameScene } from '../scenes/ingame-scene';
import { InitPos, Overworld } from './overworld';
import { OverworldManager } from '../managers';

export class Safari extends Overworld {
  private pokemons: PokemonObject[] = [];

  constructor(scene: InGameScene, mode: OverworldMode, type: OVERWORLD_TYPE) {
    super(scene, mode, type);
  }

  setup(): void {
    super.setup();
  }

  show(data: InitPos): void {
    const overworldManager = this.getMode().getOverworldManager();

    super.show(data);

    this.pokemons.push(new PokemonObject(this.scene, `pokemon_overworld002`, '002', 10, 20, this.getMap(), 'test'));
    this.pokemons.push(new PokemonObject(this.scene, `pokemon_overworld001s`, '001s', 13, 20, this.getMap(), 'test'));
    this.pokemons.push(new PokemonObject(this.scene, `pokemon_overworld006s`, '006s', 13, 20, this.getMap(), 'test'));
    this.pokemons.push(new PokemonObject(this.scene, `pokemon_overworld004`, '004', 13, 20, this.getMap(), 'test'));

    overworldManager.addOverworldPokemons(this.pokemons);
  }

  clean(): void {
    super.clean();

    for (const pokemon of this.pokemons) {
      pokemon.destroy();
    }

    this.pokemons = [];
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    for (const pokemon of this.pokemons) {
      if (pokemon.isMovementFinish()) {
        pokemon.move();
      }
      pokemon.update();
    }
  }
}
