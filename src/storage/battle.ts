import { BATTLE_STATUS } from '../enums/battle-status';
import { PlayerItem } from '../object/player-item';

interface SendBattleInfo {
  wave: number;
  berry: string | null;
  pokeball: string | null;
}

export class Battle {
  private wave: number;
  private berry: PlayerItem | null;
  private pokeball: string | null;
  private status: BATTLE_STATUS;
  private runaway: boolean;

  constructor() {
    this.wave = 1;
    this.berry = null;
    this.pokeball = null;
    this.status = BATTLE_STATUS.WELCOME;
    this.runaway = false;
  }

  updateWave() {
    this.wave += 1;
  }

  isEnemyTurn() {
    return this.isEven() ? true : false;
  }

  setBerry(berry: PlayerItem | null) {
    this.berry = berry;
  }

  setPokeball(pokeball: string) {
    this.pokeball = pokeball;
  }

  setStatus(status: BATTLE_STATUS) {
    this.status = status;
  }

  setRunAway() {
    this.runaway = true;
  }

  getStatus() {
    return this.status;
  }

  getBerry(): PlayerItem | null {
    if (!this.berry) return null;

    return this.berry;
  }

  getWave() {
    return this.wave;
  }

  getIsRunAway() {
    return this.runaway;
  }

  private isEven() {
    return this.wave % 2 === 0;
  }
}
