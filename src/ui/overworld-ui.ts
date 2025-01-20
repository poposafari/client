import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { OverworldItemSlotUi } from './overworld-itemslot-ui';
import { OverworldPokemonSlotUi } from './overworld-pokemonslot-ui';
import { Ui } from './ui';

export class OverworldUi extends Ui {
  private mode: OverworldMode;
  private overworldItemSlotUi: OverworldItemSlotUi;
  private overworldPokemonSlotUi: OverworldPokemonSlotUi;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;

    this.overworldItemSlotUi = new OverworldItemSlotUi(scene, mode);
    this.overworldPokemonSlotUi = new OverworldPokemonSlotUi(scene, mode);
  }

  setup(): void {
    this.overworldItemSlotUi.setup();
    this.overworldPokemonSlotUi.setup();
  }

  show(data?: any): void {
    this.overworldItemSlotUi.show(data);
    this.overworldPokemonSlotUi.show();
  }

  clean(data?: any): void {
    this.overworldItemSlotUi.clean();
    this.overworldPokemonSlotUi.clean();
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.blockInputs() : this.unblockInputs();
  }

  update(time: number, delta: number): void {}

  updateItemSlotUi() {
    this.overworldItemSlotUi.updateItemSlotUi();
  }

  updatePokemonSlotUi() {
    this.overworldPokemonSlotUi.update();
  }

  private blockInputs() {
    this.overworldItemSlotUi.pause(true);
    this.overworldPokemonSlotUi.pause(true);
  }

  private unblockInputs() {
    this.overworldItemSlotUi.pause(false);
    this.overworldPokemonSlotUi.pause(false);
  }
}
