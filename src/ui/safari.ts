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
    const overworldManager = this.getMode().getOverworldManager();

    super.show(data);

    overworldManager.addOverworldPokemons(this.scene, ['001', '001s', '003s', '006s', '006', '005', '004s'], this.getMap());
  }

  clean(): void {
    const overworldManager = this.getMode().getOverworldManager();
    overworldManager.resetOverworldPokemons();
    super.clean();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    this.getMode().getOverworldManager().update();
  }
}
