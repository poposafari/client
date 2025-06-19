import { BATTLE_STATUS } from '../enums/battle-status';
import { TIME } from '../enums/time';
import { PlayerItem } from '../object/player-item';

export class Battle {
  private wave: number;
  private pokemon: string;
  private berry: string | null;

  constructor(pokemon: string) {
    this.wave = 1;
    this.berry = null;
    this.pokemon = pokemon;
  }
}
