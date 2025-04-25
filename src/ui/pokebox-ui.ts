import { DEPTH } from '../enums/depth';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, playSound, Ui } from './ui';
import { AUDIO } from '../enums/audio';
import { PokeboxMainUi } from './pokebox-main-ui';
import { PokeboxInfoUi } from './pokebox-info-ui';
import { PokeboxPartyUi } from './pokebox-party-ui';
import { PokemonGender } from '../object/pokemon-object';

export class PokeboxUi extends Ui {
  private mode: OverworldMode;

  private pokeboxMainUi: PokeboxMainUi;
  private pokeboxInfoUi: PokeboxInfoUi;
  private pokeboxPartyUi: PokeboxPartyUi;

  private container!: Phaser.GameObjects.Container;

  private bg!: Phaser.GameObjects.Image;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;

    this.pokeboxInfoUi = new PokeboxInfoUi(this.scene, this.mode, this);
    this.pokeboxPartyUi = new PokeboxPartyUi(this.scene, this.mode, this);
    this.pokeboxMainUi = new PokeboxMainUi(this.scene, this.mode, this);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.pokeboxMainUi.setup();
    this.pokeboxInfoUi.setup();
    this.pokeboxPartyUi.setup();

    this.container = this.scene.add.container(width / 2, height / 2);

    this.bg = addBackground(this.scene, TEXTURE.BG_BOX).setOrigin(0.5, 0.5);

    this.container.add(this.bg);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    playSound(this.scene, AUDIO.POKEBOX_ACCESS);

    this.container.setVisible(true);

    this.pokeboxMainUi.show();
    this.pokeboxInfoUi.show();
    this.pokeboxPartyUi.show();
  }

  clean(data?: any): void {
    playSound(this.scene, AUDIO.POKEBOX_CLOSE);

    this.container.setVisible(false);

    this.pokeboxMainUi.clean();
    this.pokeboxInfoUi.clean();
    this.pokeboxPartyUi.clean();
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}

  updatePokemonInfoUi(idx: number) {
    this.pokeboxInfoUi.updateInfo(idx);
  }

  updatePokemonTint(pokedex: string, gender: PokemonGender) {
    const idx = this.pokeboxMainUi.scanTargetPokemon(pokedex.slice(0, 4), gender);

    if (idx >= 0) this.pokeboxMainUi.updateHasPartyUi(idx, false);
  }

  getPokeboxMainUi() {
    return this.pokeboxMainUi;
  }

  getPokeboxPartyUi() {
    return this.pokeboxPartyUi;
  }
}
