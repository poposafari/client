import i18next from 'i18next';
import { OVERWORLD_TYPE } from '../enums/overworld-type';
import { TYPE } from '../enums/type';
import { OverworldMode } from '../modes';
import { PokemonObject } from '../object/pokemon-object';
import { InGameScene } from '../scenes/ingame-scene';
import { InitPos, Overworld } from './overworld';

export class Safari extends Overworld {
  private pokemons: PokemonObject[] = [];

  constructor(scene: InGameScene, mode: OverworldMode, type: OVERWORLD_TYPE) {
    super(scene, mode, type);
  }

  setup(): void {
    super.setup();
  }

  show(data: InitPos): void {
    super.show(data);

    const test = new PokemonObject(this.scene, `pokemon_overworld002`, '002', 10, 20, this.getMap(), 'test');
    this.pokemons.push(test);
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
