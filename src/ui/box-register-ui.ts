import { KEY } from '../enums/key';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager, PlayerManager } from '../managers';
import { BagMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addWindow, Ui } from './ui';

export class BoxRegisterUi extends Ui {
  private bg!: Phaser.GameObjects.Image;
  private mode: BagMode;
  private container: Phaser.GameObjects.Container[] = [];
  private targetPokemon!: number;
  private pokemonSlotContainer!: Phaser.GameObjects.Container;
  private pokemonSlotWindow!: Phaser.GameObjects.NineSlice;
  private pokemonSlotIcons: Phaser.GameObjects.Image[] = [];
  private pokemonSlotDummys: Phaser.GameObjects.Image[] = [];
  private cancelMark!: Phaser.GameObjects.Image;

  constructor(scene: InGameScene, mode: BagMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const ui = this.getUi();
    const width = this.getWidth();
    const height = this.getHeight();

    this.bg = addBackground(this.scene, TEXTURE.BLACK, width, height);
    this.bg.setAlpha(0.5);
    this.bg.setVisible(false);

    this.pokemonSlotContainer = this.scene.add.container(width / 4 + 440, height / 4 - 25);
    this.pokemonSlotWindow = addWindow(this.scene, TEXTURE.WINDOW_BOX, 0, 0, 70, 355, 16, 16, 16, 16);
    for (let i = 0; i < 6; i++) {
      const yPosition = i * 50;
      const slotIcon = addImage(this.scene, 'pokemon_icon000', 0, yPosition - 133).setScale(1);
      const slotDummy = addImage(this.scene, TEXTURE.BLANK, 0, yPosition - 133);
      this.pokemonSlotIcons.push(slotIcon);
      this.pokemonSlotDummys.push(slotDummy);
    }
    this.cancelMark = addImage(this.scene, TEXTURE.CANCEL, -5, 6 * 50 - 100).setScale(1.5);
    this.pokemonSlotDummys.push(this.cancelMark);

    this.pokemonSlotContainer.add(this.pokemonSlotWindow);
    this.pokemonSlotContainer.add(this.pokemonSlotIcons);
    this.pokemonSlotContainer.add(this.pokemonSlotDummys);
    this.pokemonSlotContainer.setVisible(false);

    this.container.push(this.pokemonSlotContainer);

    ui.add(this.bg);
    ui.add(this.container);
  }

  show(data?: any): void {
    const ui = this.getUi();
    const width = this.getWidth();
    const height = this.getHeight();

    const playerManager = PlayerManager.getInstance();
    const myPokemons = playerManager.getMyPokemon();
    const myPokemonSlots = playerManager.getMyPokemonSlots();

    console.log(data);
    this.targetPokemon = data;

    this.bg.setVisible(true);
    for (const container of this.container) {
      container.setVisible(true);
    }

    for (let i = 0; i < 6; i++) {
      const targetSlotIdx = myPokemonSlots[i];
      if (targetSlotIdx < 0) {
        this.pokemonSlotIcons[i].setTexture(`pokemon_icon000`);
        continue;
      } else {
        const targetPokemon = myPokemons[targetSlotIdx];
        if (targetPokemon.isShiny) {
          this.pokemonSlotIcons[i].setTexture(`pokemon_icon${targetPokemon.idx}s`);
        } else {
          this.pokemonSlotIcons[i].setTexture(`pokemon_icon${targetPokemon.idx}`);
        }
      }
    }

    this.pause(false);
  }

  clean(): void {
    this.bg.setVisible(false);

    for (const container of this.container) {
      container.setVisible(false);
    }
  }

  pause(onoff: boolean): void {
    onoff ? this.block() : this.unblock();
  }

  block() {}

  unblock() {
    const playerManager = PlayerManager.getInstance();
    const myPokemons = playerManager.getMyPokemon();
    const myPokemonSlots = playerManager.getMyPokemonSlots();

    const keyboardMananger = KeyboardManager.getInstance();

    let startIndex = 0;
    let endIndex = this.pokemonSlotDummys.length - 1;
    let choice = startIndex;

    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT];
    keyboardMananger.setAllowKey(keys);

    keyboardMananger.setKeyDownCallback((key) => {
      const prevChoice = choice;

      if (key === KEY.UP) {
        choice = Math.max(startIndex, choice - 1);
      } else if (key === KEY.DOWN) {
        choice = Math.min(endIndex, choice + 1);
      } else if (key === KEY.SELECT) {
        if (choice >= 6) {
          this.clean();
          this.mode.popUiStack();
        } else {
          for (let i = 0; i < myPokemonSlots.length; i++) {
            if (myPokemonSlots[i] === this.targetPokemon) {
              playerManager.setMyPokemonSlots(i, -1);
              this.pokemonSlotIcons[i].setTexture(`pokemon_icon000`);
            }
          }
          playerManager.setMyPokemonSlots(choice, this.targetPokemon);
          console.log(playerManager.getMyPokemonSlots());
          if (myPokemons[this.targetPokemon].isShiny) {
            this.pokemonSlotIcons[choice].setTexture(`pokemon_icon${myPokemons[this.targetPokemon].idx}s`);
          } else {
            this.pokemonSlotIcons[choice].setTexture(`pokemon_icon${myPokemons[this.targetPokemon].idx}`);
          }
        }
      }

      if (choice !== prevChoice) {
        this.pokemonSlotDummys[prevChoice].setTexture(TEXTURE.BLANK);
        this.cancelMark.setTexture(TEXTURE.CANCEL);
        if (choice >= 6) {
          this.cancelMark.setTexture(TEXTURE.CANCEL_S);
        } else {
          this.pokemonSlotDummys[choice].setTexture(TEXTURE.FINGER);
        }
      }
    });
  }

  update(time: number, delta: number): void {}
}
