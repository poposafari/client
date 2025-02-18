import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { Location } from '../storage/player-info';
import { OverworldIconUi } from './overworld-icon-ui';
import { OverworldInfoUi } from './overworld-info-ui';
import { OverworldItemSlotUi } from './overworld-itemslot-ui';
import { OverworldPokemonSlotUi } from './overworld-pokemonslot-ui';
import { Ui } from './ui';

export class OverworldHUDUi extends Ui {
  private mode: OverworldMode;

  private overworldItemSlotUi: OverworldItemSlotUi;
  private overworldPokemonSlotUi: OverworldPokemonSlotUi;
  private overworldInfoUi: OverworldInfoUi;
  private overworldIconUi: OverworldIconUi;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;

    this.overworldItemSlotUi = new OverworldItemSlotUi(scene, mode);
    this.overworldPokemonSlotUi = new OverworldPokemonSlotUi(scene, mode);
    this.overworldInfoUi = new OverworldInfoUi(scene, mode);
    this.overworldIconUi = new OverworldIconUi(scene, mode);
  }

  setup(): void {
    this.overworldItemSlotUi.setup();
    this.overworldPokemonSlotUi.setup();
    this.overworldInfoUi.setup();
    this.overworldIconUi.setup();
  }

  show(data?: any): void {
    this.overworldItemSlotUi.show();
    this.overworldPokemonSlotUi.show();
    this.overworldInfoUi.show();
    this.overworldIconUi.show();
  }

  clean(data?: any): void {
    this.overworldItemSlotUi.clean();
    this.overworldPokemonSlotUi.clean();
    this.overworldInfoUi.clean();
    this.overworldIconUi.clean();
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  update(time: number, delta: number): void {}

  updateItemSlotUi() {
    this.overworldItemSlotUi.updateSlot();
  }

  updatePokemonSlotUi() {
    this.overworldPokemonSlotUi.update();
  }

  updateOverworldInfoUi() {
    this.overworldInfoUi.updateData();
    this.overworldItemSlotUi.updateSlot();
    this.overworldPokemonSlotUi.update();
  }

  updateOverworldLocationUi(location: Location) {
    this.overworldInfoUi.updateLocation(location);
  }

  private block() {
    this.overworldItemSlotUi.pause(true);
    this.overworldPokemonSlotUi.pause(true);
    this.overworldInfoUi.pause(true);
  }

  private unblock() {
    this.overworldItemSlotUi.pause(false);
    this.overworldPokemonSlotUi.pause(false);
    this.overworldInfoUi.pause(false);
  }
}
