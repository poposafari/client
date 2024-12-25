import { KEY } from '../enums/key';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager } from '../managers';
import { BagMode, BoxMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addWindow, Ui } from './ui';

export class BoxRegisterUi extends Ui {
  private bg!: Phaser.GameObjects.Image;
  private mode: BoxMode;
  private targetPokemon!: number;
  private pokemonSlotContainer!: Phaser.GameObjects.Container;
  private pokemonSlotWindow!: Phaser.GameObjects.NineSlice;
  private pokemonSlotIcons: Phaser.GameObjects.Image[] = [];
  private pokemonSlotDummys: Phaser.GameObjects.Image[] = [];
  private cancelMark!: Phaser.GameObjects.Image;

  constructor(scene: InGameScene, mode: BoxMode) {
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
      const dummy = addImage(this.scene, TEXTURE.BLANK, -50, yPosition - 133).setScale(2);
      this.pokemonSlotIcons.push(slotIcon);
      this.pokemonSlotDummys.push(dummy);
    }
    this.cancelMark = addImage(this.scene, TEXTURE.CANCEL, -5, 6 * 50 - 100)
      .setScale(1.5)
      .setVisible(false);
    this.pokemonSlotDummys.push(this.cancelMark);

    this.pokemonSlotContainer.add(this.pokemonSlotWindow);
    this.pokemonSlotContainer.add(this.pokemonSlotIcons);
    this.pokemonSlotContainer.add(this.pokemonSlotDummys);
    this.pokemonSlotContainer.setVisible(false);

    ui.add(this.bg);
    ui.add(this.pokemonSlotContainer);
  }

  show(data?: any): void {
    this.pokemonSlotContainer.setVisible(true);
    this.cancelMark.setVisible(true);
    this.bg.setVisible(true);
    this.targetPokemon = data.choice;
    if (data.isRemove) {
      const playerPokemonManager = this.mode.getPlayerPokemonManager();
      const myPokemons = playerPokemonManager.getMyPokemons();

      this.pokemonSlotIcons[playerPokemonManager.getMyPokemon(this.targetPokemon).partySlot].setTexture(`pokemon_icon000`);

      playerPokemonManager.resetMyPokemonSlot(playerPokemonManager.getMyPokemon(this.targetPokemon).partySlot, this.targetPokemon);

      this.clean();
      this.mode.popUiStack();
      return;
    }
    this.pause(false);
  }

  clean(data?: any): void {
    this.pokemonSlotContainer.setVisible(false);
    this.bg.setVisible(false);
    this.cancelMark.setVisible(false);
  }

  pause(onoff: boolean): void {
    onoff ? this.block() : this.unblock();
  }

  block() {}

  unblock() {
    const playerPokemonManager = this.mode.getPlayerPokemonManager();
    const myPokemons = playerPokemonManager.getMyPokemons();
    const myPokemonSlots = playerPokemonManager.getMyPokemonSlots();
    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT];

    const keyboardMananger = KeyboardManager.getInstance();

    let startIndex = 0;
    let endIndex = this.pokemonSlotDummys.length - 1;
    let choice = startIndex;

    for (let i = 0; i < myPokemons.length; i++) {
      if (myPokemons[i].partySlot > 0) {
        let texture = `pokemon_icon${myPokemons[i].idx}`;
        if (myPokemons[i].isShiny) texture += 's';
        this.pokemonSlotIcons[myPokemons[i].partySlot].setTexture(texture);
      }
    }

    this.pokemonSlotDummys[choice].setTexture(TEXTURE.ARROW_W_R);

    keyboardMananger.setAllowKey(keys);

    keyboardMananger.setKeyDownCallback((key) => {
      const prevChoice = choice;

      switch (key) {
        case KEY.UP:
          choice = Math.max(startIndex, choice - 1);
          break;
        case KEY.DOWN:
          choice = Math.min(endIndex, choice + 1);
          break;
        case KEY.SELECT:
          if (choice === 6) {
            this.clean();
            this.mode.popUiStack();
          } else {
            for (let i = 0; i < this.pokemonSlotIcons.length; i++) {
              if (this.targetPokemon === myPokemonSlots[i]) {
                this.pokemonSlotIcons[i].setTexture(`pokemon_icon000`);
                playerPokemonManager.resetMyPokemonSlot(i, this.targetPokemon);
              }
            }
            playerPokemonManager.setMyPokemonSlot(choice, this.targetPokemon);
            const target = myPokemons[this.targetPokemon];
            let texture = `pokemon_icon${target.idx}`;

            if (target.isShiny) texture += 's';
            this.pokemonSlotIcons[choice].setTexture(texture);
          }

          break;
      }

      if (choice !== prevChoice) {
        this.pokemonSlotDummys[prevChoice].setTexture(TEXTURE.BLANK);
        this.cancelMark.setTexture(TEXTURE.CANCEL);
        if (choice >= 6) {
          this.cancelMark.setTexture(TEXTURE.CANCEL_S);
        } else {
          this.pokemonSlotDummys[choice].setTexture(TEXTURE.ARROW_W_R);
        }
      }
    });
  }

  update(time: number, delta: number): void {}
}
