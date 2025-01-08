import i18next, { t } from 'i18next';
import { KEY } from '../enums/key';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager } from '../managers';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, addWindow, Ui } from './ui';
import { getPokemonType } from '../data/types';
import { pokemons } from '../data/pokemon';
import { OverworldMode } from '../modes';
import { DEPTH } from '../enums/depth';

export class BoxUi extends Ui {
  private mode: OverworldMode;
  private container: Phaser.GameObjects.Container[] = [];
  private bgContainer!: Phaser.GameObjects.Container;
  private bg!: Phaser.GameObjects.Image;
  private filterContainer!: Phaser.GameObjects.Container;
  private pokemonSlotContainer!: Phaser.GameObjects.Container;
  private pokemonSlotWindow!: Phaser.GameObjects.NineSlice;
  private pokemonSlotIcons: Phaser.GameObjects.Image[] = [];
  private filterWindow!: Phaser.GameObjects.NineSlice;
  private pokemonAllSlotContainer!: Phaser.GameObjects.Container;
  private pokemonAllSlotWindow!: Phaser.GameObjects.Image;
  private pokemonAllSlotIconsContainer!: Phaser.GameObjects.Container;
  private pokemonAllSlotIcons: Phaser.GameObjects.Image[] = [];
  private pokemonAllSlotDummy: Phaser.GameObjects.Image[] = [];
  private pokemonInfoTopContainer!: Phaser.GameObjects.Container;
  private pokemonInfoTop!: Phaser.GameObjects.Image;
  private pokemonGender!: Phaser.GameObjects.Image;
  private pokemonInfoTopText1!: Phaser.GameObjects.Text;
  private pokemonInfoTopText2!: Phaser.GameObjects.Text;
  private pokemonInfoTopText3!: Phaser.GameObjects.Text;
  private pokemonInfoSpriteContainer!: Phaser.GameObjects.Container;
  private pokemonInfoSprite!: Phaser.GameObjects.Image;
  private pokemonInfoBottomContainer!: Phaser.GameObjects.Container;
  private pokemonInfoBottom!: Phaser.GameObjects.Image;
  private pokemonCaptureDate!: Phaser.GameObjects.Text;
  private pokemonType1!: Phaser.GameObjects.Image;
  private pokemonType2!: Phaser.GameObjects.Image;
  private pokemonShinyIcon!: Phaser.GameObjects.Image;
  private lastChoice: number = 0;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.bgContainer = this.scene.add.container(0, 0);
    this.bg = addBackground(this.scene, TEXTURE.BG_BOX, width, height);
    this.bgContainer.add(this.bg);
    this.bgContainer.setScale(2);
    this.bgContainer.setVisible(false);
    this.bgContainer.setDepth(DEPTH.OVERWORLD_UI + 2);
    this.bgContainer.setScrollFactor(0);

    this.filterContainer = this.scene.add.container(width / 2 + 330, height / 2 - 480);
    this.filterWindow = addWindow(this.scene, TEXTURE.WINDOW_BOX, 0, 0, 620, 60, 16, 16, 16, 16);
    this.filterContainer.add(this.filterWindow);
    this.filterContainer.setScale(2);
    this.filterContainer.setVisible(false);
    this.filterContainer.setDepth(DEPTH.OVERWORLD_UI + 2);
    this.filterContainer.setScrollFactor(0);

    this.pokemonAllSlotContainer = this.scene.add.container(width / 2 + 260, height / 2 + 50);
    this.pokemonAllSlotWindow = addImage(this.scene, TEXTURE.WINDOW_BOX_STORAGE, 0, 0).setScale(1.5);
    this.pokemonAllSlotContainer.add(this.pokemonAllSlotWindow);
    this.pokemonAllSlotContainer.setScale(2);
    this.pokemonAllSlotContainer.setVisible(false);
    this.pokemonAllSlotContainer.setDepth(DEPTH.OVERWORLD_UI + 2);
    this.pokemonAllSlotContainer.setScrollFactor(0);

    this.pokemonSlotContainer = this.scene.add.container(width / 2 + 880, height / 2 - 60);
    this.pokemonSlotWindow = addWindow(this.scene, TEXTURE.WINDOW_BOX, 0, 0, 70, 355, 16, 16, 16, 16);
    for (let i = 0; i < 6; i++) {
      const yPosition = i * 50;
      const slotIcon = addImage(this.scene, 'pokemon_icon000', 0, yPosition - 133).setScale(1);
      this.pokemonSlotIcons.push(slotIcon);
    }
    this.pokemonSlotContainer.add(this.pokemonSlotWindow);
    this.pokemonSlotContainer.add(this.pokemonSlotIcons);
    this.pokemonSlotContainer.setScale(2);
    this.pokemonSlotContainer.setVisible(false);
    this.pokemonSlotContainer.setDepth(DEPTH.OVERWORLD_UI + 2);
    this.pokemonSlotContainer.setScrollFactor(0);

    this.pokemonInfoTopContainer = this.scene.add.container(width / 2 - 630, height / 2 - 430);
    this.pokemonInfoTop = addImage(this.scene, TEXTURE.BOX_NAME, 0, 0);
    this.pokemonGender = addImage(this.scene, TEXTURE.BLANK, +115, +15).setScale(2.5);
    this.pokemonInfoTopText1 = addText(this.scene, -120, -15, 'No.', TEXTSTYLE.BOX_POKEDEX).setOrigin(0, 0.5);
    this.pokemonInfoTopText2 = addText(this.scene, -90, -15, '000', TEXTSTYLE.BOX_POKEDEX).setOrigin(0, 0.5);
    this.pokemonInfoTopText3 = addText(this.scene, -125, +12, '???', TEXTSTYLE.BOX_NAME).setOrigin(0, 0.5);
    this.pokemonShinyIcon = addImage(this.scene, TEXTURE.BLANK, +130, +60);
    this.pokemonInfoTopContainer.add(this.pokemonInfoTop);
    this.pokemonInfoTopContainer.add(this.pokemonInfoTopText1);
    this.pokemonInfoTopContainer.add(this.pokemonInfoTopText2);
    this.pokemonInfoTopContainer.add(this.pokemonInfoTopText3);
    this.pokemonInfoTopContainer.add(this.pokemonGender);
    this.pokemonInfoTopContainer.add(this.pokemonShinyIcon);
    this.pokemonInfoTopContainer.setScale(2);
    this.pokemonInfoTopContainer.setVisible(false);
    this.pokemonInfoTopContainer.setDepth(DEPTH.OVERWORLD_UI + 2);
    this.pokemonInfoTopContainer.setScrollFactor(0);

    this.pokemonInfoSpriteContainer = this.scene.add.container(width / 2 - 630, height / 2 - 140);
    this.pokemonInfoSprite = addImage(this.scene, 'pokemon_sprite000', 0, 0);
    this.pokemonType1 = addImage(this.scene, TEXTURE.TYPES, -100, +85);
    this.pokemonType2 = addImage(this.scene, TEXTURE.TYPES, -30, +85);
    this.pokemonInfoSpriteContainer.add(this.pokemonInfoSprite);
    this.pokemonInfoSpriteContainer.add(this.pokemonType1);
    this.pokemonInfoSpriteContainer.add(this.pokemonType2);
    this.pokemonInfoSpriteContainer.setScale(2);
    this.pokemonInfoSpriteContainer.setVisible(false);
    this.pokemonInfoSpriteContainer.setDepth(DEPTH.OVERWORLD_UI + 2);
    this.pokemonInfoSpriteContainer.setScrollFactor(0);

    this.pokemonInfoBottomContainer = this.scene.add.container(width / 2 - 630, height / 2 + 300);
    this.pokemonInfoBottom = addImage(this.scene, TEXTURE.BOX_DESC, 0, 0);
    const pokemonCaptureDateTitle = addText(this.scene, -125, -90, i18next.t('menu:captureDate'), TEXTSTYLE.BOX_DEFAULT).setOrigin(0, 0.5);
    this.pokemonCaptureDate = addText(this.scene, -120, -58, '0000-00-00', TEXTSTYLE.BOX_DEFAULT).setOrigin(0, 0.5);
    this.pokemonInfoBottomContainer.add(this.pokemonInfoBottom);
    this.pokemonInfoBottomContainer.add(pokemonCaptureDateTitle);
    this.pokemonInfoBottomContainer.add(this.pokemonCaptureDate);
    this.pokemonInfoBottomContainer.setScale(2);
    this.pokemonInfoBottomContainer.setVisible(false);
    this.pokemonInfoBottomContainer.setDepth(DEPTH.OVERWORLD_UI + 2);
    this.pokemonInfoBottomContainer.setScrollFactor(0);

    this.container.push(this.bgContainer);
    this.container.push(this.filterContainer);
    this.container.push(this.pokemonAllSlotContainer);
    this.container.push(this.pokemonSlotContainer);
    this.container.push(this.pokemonInfoTopContainer);
    this.container.push(this.pokemonInfoSpriteContainer);
    this.container.push(this.pokemonInfoBottomContainer);
  }

  show(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();
    const playerPokemonManager = this.mode.getPlayerPokemonManager();
    const myPokemonsSize = playerPokemonManager.getMyPokemons().length;
    const targetCnt = 10;

    this.bg.setVisible(true);
    for (const container of this.container) {
      container.setVisible(true);
    }

    this.scene.tweens.add({
      targets: this.container,
      alpha: { from: 0, to: 1 },
      ease: 'Sine.Linear',
      duration: 200,
    });

    this.pokemonAllSlotIconsContainer = this.scene.add.container(width / 2 - 190, height / 2 - 360);

    for (let i = 0; i < myPokemonsSize; i++) {
      const xPosition = (i % targetCnt) * 50;
      const yPosition = Math.floor(i / targetCnt) * 50;
      const icon = addImage(this.scene, `pokemon_icon000`, xPosition, yPosition);
      const blank = addImage(this.scene, TEXTURE.BLANK, xPosition + 12, yPosition + 20).setScale(1.6);
      this.pokemonAllSlotIconsContainer.add(icon);
      this.pokemonAllSlotIconsContainer.add(blank);
      this.pokemonAllSlotIcons.push(icon);
      this.pokemonAllSlotDummy.push(blank);
    }

    this.pokemonAllSlotIconsContainer.setScale(2);
    this.pokemonAllSlotIconsContainer.setDepth(DEPTH.OVERWORLD_UI + 2);
    this.pokemonAllSlotIconsContainer.setScrollFactor(0);

    this.pause(false);
  }

  clean(): void {
    this.bgContainer.setAlpha(1);
    this.bgContainer.setVisible(false);
    for (const container of this.container) {
      container.setVisible(false);
    }
    this.pokemonAllSlotIconsContainer.destroy();
    this.pokemonAllSlotIcons = [];
    this.pokemonAllSlotDummy = [];
  }

  pause(onoff: boolean): void {
    onoff ? this.block() : this.unblock();
  }

  block() {}

  unblock() {
    const playerPokemonManager = this.mode.getPlayerPokemonManager();
    const myPokemons = playerPokemonManager.getMyPokemons();
    const myPokemonSlots = playerPokemonManager.getMyPokemonSlots();
    const targetCnt = 10;
    const keyboardMananger = KeyboardManager.getInstance();
    const keys = [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];

    let startIndex = 0;
    let endIndex = this.pokemonAllSlotDummy.length - 1;

    for (let i = 0; i < myPokemons.length; i++) {
      if (myPokemons[i].partySlot >= 0) {
        let texture = `pokemon_icon${myPokemons[i].idx}`;
        if (myPokemons[i].isShiny) texture += 's';
        this.pokemonSlotIcons[myPokemons[i].partySlot].setTexture(texture);
      }
    }

    for (let i = 0; i < myPokemonSlots.length; i++) {
      if (myPokemonSlots[i] < 0) {
        this.pokemonSlotIcons[i].setTexture(`pokemon_icon000`);
      }
    }

    for (let i = 0; i < this.pokemonAllSlotIcons.length; i++) {
      let texture = `pokemon_icon${myPokemons[i].idx}`;
      if (myPokemons[i].isShiny) texture += 's';
      this.pokemonAllSlotIcons[i].setTexture(texture);
      this.pokemonAllSlotIcons[i].setAlpha(1);
    }

    for (const slot of myPokemonSlots) {
      if (slot >= 0) {
        this.pokemonAllSlotIcons[slot].setAlpha(0.5);
      }
    }
    this.pokemonAllSlotDummy[this.lastChoice].setTexture(TEXTURE.FINGER);

    keyboardMananger.setAllowKey(keys);
    keyboardMananger.setKeyDownCallback((key) => {
      const prevChoice = this.lastChoice;

      switch (key) {
        case KEY.UP:
          this.lastChoice = Math.max(startIndex, this.lastChoice - targetCnt);
          break;
        case KEY.DOWN:
          this.lastChoice = Math.min(endIndex, this.lastChoice + targetCnt);
          break;
        case KEY.LEFT:
          this.lastChoice = Math.max(startIndex, this.lastChoice - 1);
          break;
        case KEY.RIGHT:
          this.lastChoice = Math.min(endIndex, this.lastChoice + 1);
          break;
        case KEY.CANCEL:
          this.mode.chnagePokemonSlot();
          this.clean();
          this.mode.popUiStack();
          break;
        case KEY.SELECT:
          this.mode.addUiStack('BoxModalUi', this.lastChoice);
          break;
      }

      if (this.lastChoice !== prevChoice) {
        const pokedex = myPokemons[this.lastChoice].idx;
        let texture = `pokemon_sprite${pokedex}`;
        this.pokemonShinyIcon.setTexture(TEXTURE.BLANK);
        if (myPokemons[this.lastChoice].isShiny) {
          texture += 's';
          this.pokemonShinyIcon.setTexture(TEXTURE.SHINY);
        }

        this.pokemonAllSlotDummy[prevChoice].setTexture(TEXTURE.BLANK);
        this.pokemonAllSlotDummy[this.lastChoice].setTexture(TEXTURE.FINGER);
        this.pokemonInfoSprite.setTexture(texture);

        this.pokemonInfoTopText2.setText(pokedex);
        this.pokemonInfoTopText3.setText(i18next.t(`pokemon:${pokedex}.name`));

        this.pokemonGender.setTexture(myPokemons[this.lastChoice].gender === 'b' ? TEXTURE.GENDER_0 : TEXTURE.GENDER_1);

        const type1 = getPokemonType(pokemons.get(pokedex)?.type1!);
        const type2 = getPokemonType(pokemons.get(pokedex)?.type2!);
        this.pokemonType1.setTexture(TEXTURE.TYPES, 'types-' + type1).setVisible(type1 !== 0 ? true : false);
        this.pokemonType2.setTexture(TEXTURE.TYPES, 'types-' + type2).setVisible(type2 !== 0 ? true : false);

        this.pokemonCaptureDate.setText(myPokemons[this.lastChoice].capturedDate);
      }
    });
  }

  update(time: number, delta: number): void {}
}
