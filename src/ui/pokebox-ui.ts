import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager } from '../managers';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { PokeBoxSlotUi } from './pokebox-slot-ui';
import { addBackground, addImage, addText, addWindow, Ui } from './ui';
import { isPokedexShiny, trimLastChar } from '../utils/string-util';
import { MyPokemon } from '../storage/box';
import { pokemonData } from '../data/pokemon';
import { PokeboxBoxChoiceUi } from './pokebox-box-choice-ui';
import { PokeboxRegisterUi } from './pokebox-register-ui';

export class PokeBoxUi extends Ui {
  private mode: OverworldMode;
  private pokeboxSlotUi: PokeBoxSlotUi;
  private pokeboxBoxChoiceUi: PokeboxBoxChoiceUi;
  private pokeboxRegisterUi: PokeboxRegisterUi;
  private container!: Phaser.GameObjects.Container;

  private iconContainer!: Phaser.GameObjects.Container;

  private bg!: Phaser.GameObjects.Image;

  private windowName!: Phaser.GameObjects.Image;
  private windowDesc!: Phaser.GameObjects.Image;

  private pokemonCaptureBall!: Phaser.GameObjects.Image;
  private pokemonCaptureDate!: Phaser.GameObjects.Text;
  private pokemonName!: Phaser.GameObjects.Text;
  private pokemonSprite!: Phaser.GameObjects.Image;
  private pokemonGender!: Phaser.GameObjects.Image;
  private pokemonShiny!: Phaser.GameObjects.Image;
  private pokemonPokedex!: Phaser.GameObjects.Text;
  private pokemonType1!: Phaser.GameObjects.Image;
  private pokemonType2!: Phaser.GameObjects.Image;
  private captureCountTitle!: Phaser.GameObjects.Text;
  private captureCountValue!: Phaser.GameObjects.Text;

  private box!: Phaser.GameObjects.Image;
  private windowBox!: Phaser.GameObjects.NineSlice;

  private icons: Phaser.GameObjects.Image[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];
  private mypokemons: MyPokemon[] = [];

  private lastChoice!: number | null;
  private lastRow!: number | null;
  private lastCol!: number | null;

  private readonly MaxRow: number = 9;
  private readonly MaxColumn: number = 7;
  private readonly genderTexture = [TEXTURE.GENDER_0, TEXTURE.GENDER_1, TEXTURE.BLANK];

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
    this.pokeboxSlotUi = new PokeBoxSlotUi(this.scene, this.mode, this);
    this.pokeboxBoxChoiceUi = new PokeboxBoxChoiceUi(this.scene, this.mode, this);
    this.pokeboxRegisterUi = new PokeboxRegisterUi(this.scene, this.mode, this, this.pokeboxSlotUi);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.pokeboxSlotUi.setup();
    this.pokeboxBoxChoiceUi.setup();
    this.pokeboxRegisterUi.setup();

    this.container = this.scene.add.container(width / 2, height / 2);
    this.iconContainer = this.scene.add.container(-680, -230);

    this.bg = addBackground(this.scene, TEXTURE.BG_BOX).setOrigin(0.5, 0.5);

    this.windowName = addImage(this.scene, TEXTURE.BOX_NAME, +660, -390).setScale(2.8);
    this.windowDesc = addImage(this.scene, TEXTURE.BOX_DESC, +650, +410).setScale(2.8);

    this.box = addImage(this.scene, `box0`, -230, +20).setScale(3.4);
    this.windowBox = addWindow(this.scene, TEXTURE.WINDOW_4, -230, 20, 506, 462, 16, 16, 16, 16).setScale(2.12);

    this.pokemonCaptureBall = addImage(this.scene, TEXTURE.BOXBALL_001, +450, -440).setScale(2);
    this.pokemonCaptureDate = addText(this.scene, +500, +405, '2024-10-12', TEXTSTYLE.BOX_NAME).setScale(0.7);
    this.pokemonGender = addImage(this.scene, TEXTURE.GENDER_0, +910, -440).setScale(5);
    this.captureCountTitle = addText(this.scene, +400, -250, i18next.t('menu:captureCount'), TEXTSTYLE.BOX_CAPTURE_TITLE).setScale(0.7).setOrigin(0, 0.5);
    this.captureCountValue = addText(this.scene, +610, -250, '', TEXTSTYLE.BOX_CAPTURE_VALUE).setScale(1).setOrigin(0, 0.5);
    this.pokemonName = addText(this.scene, +490, -440, '한카리아스', TEXTSTYLE.BOX_NAME).setOrigin(0, 0.5).setScale(1);
    this.pokemonSprite = addImage(this.scene, `pokemon_sprite001`, +680, 0).setScale(5);
    this.pokemonShiny = addImage(this.scene, TEXTURE.SHINY, +900, -260).setScale(3);
    this.pokemonPokedex = addText(this.scene, +430, -350, `No.001`, TEXTSTYLE.BOX_POKEDEX).setOrigin(0, 0.5).setScale(1.4);
    this.pokemonType1 = addImage(this.scene, TEXTURE.TYPES, +760, -340).setScale(1.8);
    this.pokemonType2 = addImage(this.scene, TEXTURE.TYPES, +880, -340).setScale(1.8);

    this.container.add(this.bg);
    this.container.add(this.windowName);
    this.container.add(this.windowDesc);
    this.container.add(this.windowBox);
    this.container.add(this.pokemonCaptureBall);
    this.container.add(this.pokemonCaptureDate);
    this.container.add(this.pokemonGender);
    this.container.add(this.captureCountTitle);
    this.container.add(this.captureCountValue);
    this.container.add(this.pokemonShiny);
    this.container.add(this.pokemonPokedex);
    this.container.add(this.pokemonType1);
    this.container.add(this.pokemonType2);
    this.container.add(this.pokemonName);
    this.container.add(this.pokemonSprite);
    this.container.add(this.box);
    this.container.add(this.iconContainer);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE);
    this.container.setScrollFactor(0);

    this.lastChoice = null;
    this.lastRow = null;
    this.lastCol = null;
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.pokeboxSlotUi.show();
    this.pause(false);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.pokeboxSlotUi.clean();
    this.pause(true);
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  update(time: number, delta: number): void {}

  private block() {}
  private unblock() {
    const keys = [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];
    const keyboardManager = KeyboardManager.getInstance();

    this.renderPage();

    let row = this.lastRow ? this.lastRow : 0;
    let col = this.lastCol ? this.lastCol : 0;

    const finger = TEXTURE.FINGER;

    let choice = row * this.MaxRow + col;
    this.dummys[choice].setTexture(finger);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback((key) => {
      const prevChoice = choice;
      try {
        switch (key) {
          case KEY.UP:
            if (row > -1) row--;
            if (row === -1) {
              this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
              this.pokeboxBoxChoiceUi.show();
              return;
            }
            break;
          case KEY.DOWN:
            if (row < this.MaxColumn - 1) row++;
            break;
          case KEY.LEFT:
            if (col > -1) col--;
            if (col === -1) {
              this.pokeboxSlotUi.pause(false);
              return;
            }
            break;
          case KEY.RIGHT:
            if (col < this.MaxRow - 1) col++;
            break;
          case KEY.SELECT:
            const target = this.mypokemons[choice];

            if (this.mypokemons[choice]) {
              this.pokeboxRegisterUi.show(target.pokedex);
            }

            break;
          case KEY.CANCEL:
            this.clean();
            this.dummys[choice].setTexture(TEXTURE.BLANK);
            this.mode.pauseOverworldSystem(false);
            this.mode.popUiStack();
            return;
        }

        choice = row * this.MaxRow + col;
        this.lastRow = row;
        this.lastCol = col;

        if (choice !== prevChoice) {
          this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
          this.dummys[choice].setTexture(finger);

          this.updatePokemonInfo(this.mypokemons[choice]);
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  updatePokemonInfo(pokemon: MyPokemon) {
    if (pokemon) {
      const originPokedex = isPokedexShiny(pokemon.pokedex) ? trimLastChar(pokemon.pokedex) : pokemon.pokedex;
      this.pokemonSprite.setTexture(`pokemon_sprite${pokemon.pokedex}`);
      this.pokemonName.setText(i18next.t(`pokemon:${originPokedex}.name`));
      this.pokemonCaptureBall.setTexture(`boxball_${pokemon.capturePokeball}`);
      this.pokemonCaptureDate.setText(pokemon.captureDate);
      this.pokemonGender.setTexture(this.genderTexture[pokemon.gender]);
      this.pokemonShiny.setTexture(isPokedexShiny(pokemon.pokedex) ? TEXTURE.SHINY : TEXTURE.BLANK);
      this.pokemonPokedex.setText(`No.${originPokedex}`);
      this.captureCountValue.setText(`${pokemon.captureCount}`);

      if (pokemonData[originPokedex].type1) this.pokemonType1.setTexture(TEXTURE.TYPES, `types-${pokemonData[originPokedex].type1}`);
      else this.pokemonType1.setTexture(TEXTURE.BLANK);
      if (pokemonData[originPokedex].type2) this.pokemonType2.setTexture(TEXTURE.TYPES, `types-${pokemonData[originPokedex].type2}`);
      else this.pokemonType2.setTexture(TEXTURE.BLANK);
    } else {
      this.pokemonSprite.setTexture(`pokemon_sprite000`);
      this.pokemonName.setText('');
      this.pokemonCaptureBall.setTexture(TEXTURE.BLANK);
      this.pokemonCaptureDate.setText(`0000-00-00`);
      this.pokemonGender.setTexture(TEXTURE.BLANK);
      this.pokemonShiny.setTexture(TEXTURE.BLANK);
      this.pokemonPokedex.setText(`No.000`);
      this.captureCountValue.setText(`0`);
      this.pokemonType1.setTexture(TEXTURE.BLANK);
      this.pokemonType2.setTexture(TEXTURE.BLANK);
      this.captureCountValue.setText(``);
    }
  }

  private renderPage() {
    const box = this.mode.getBox();
    const playerInfo = this.mode.getPlayerInfo();
    const partSlots = playerInfo?.getPartySlot();

    this.cleanPage();

    const contentHeight = 100;
    const spacing = 10;

    let currentX = 0;
    let currentY = 0;

    for (let i = 0; i < this.MaxColumn; i++) {
      for (let j = 0; j < this.MaxRow; j++) {
        const icon = addImage(this.scene, TEXTURE.BLANK, currentX, currentY).setScale(2.2);
        const dummy = addImage(this.scene, TEXTURE.BLANK, currentX + 20, currentY + 50).setScale(2.8);

        this.icons.push(icon);
        this.dummys.push(dummy);

        this.iconContainer.add(icon);
        this.iconContainer.add(dummy);

        currentX += contentHeight + spacing;
      }
      currentX = 0;
      currentY += contentHeight + spacing;
    }

    if (!box) return;

    let idx = 0;
    for (const pokemon of box.getMyPokemons()) {
      this.mypokemons.push(pokemon);
      this.icons[idx].setTexture(`pokemon_icon${pokemon.pokedex}`);
      playerInfo?.hasPartySlot(pokemon.pokedex) ? this.icons[idx].setAlpha(0.5) : this.icons[idx].setAlpha(1);
      idx++;
    }
  }

  private cleanPage() {
    const box = this.mode.getBox();

    this.icons.forEach((icon) => icon.destroy());
    this.dummys.forEach((dummy) => dummy.destroy());

    this.icons = [];
    this.dummys = [];

    this.mypokemons = [];
  }
}
