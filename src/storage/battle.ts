interface SendBattleInfo {
  wave: number;
  berry: string | null;
  pokeball: string | null;
}

export class Battle {
  private wave: number;
  private berry: string | null;
  private pokeball: string | null;

  constructor() {
    this.wave = 1;
    this.berry = null;
    this.pokeball = null;
  }

  updateWave() {
    this.wave += 1;
  }

  isEnemyTurn() {
    return this.isEven() ? true : false;
  }

  setBerry(berry: string | null) {
    this.berry = berry;
  }

  setPokeball(pokeball: string) {
    this.pokeball = pokeball;
  }

  private isEven() {
    return this.wave % 2 === 0;
  }
}
