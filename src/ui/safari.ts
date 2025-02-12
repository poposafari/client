import i18next from 'i18next';
import { OVERWORLD_TYPE } from '../enums/overworld-type';
import { TYPE } from '../enums/type';
import { OverworldMode } from '../modes';
import { PokemonObject } from '../object/pokemon-object';
import { InGameScene } from '../scenes/ingame-scene';
import { OverworldUi } from './overworld-ui';

export class Safari extends OverworldUi {
  private pokemons: PokemonObject[] = [];

  constructor(scene: InGameScene, mode: OverworldMode, type: OVERWORLD_TYPE, key: string) {
    super(scene, mode, key);
  }

  setup(): void {
    super.setup();
  }

  show(): void {
    super.show();
  }

  clean(): void {
    super.clean();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    // this.getMode().getOverworldManager().update();
  }
}
