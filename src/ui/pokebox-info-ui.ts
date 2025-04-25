import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { PokeboxUi } from './pokebox-ui';
import { addImage, addText, getTextShadow, getTextStyle, Ui } from './ui';
import { Box, MyPokemon } from '../storage/box';
import { PokemonGender, PokemonSkill } from '../object/pokemon-object';
import { PokemonData } from '../data/pokemon';
import { TYPE } from '../enums/type';

export class PokeboxInfoUi extends Ui {
  private mode: OverworldMode;
  private pokeboxUi: PokeboxUi;

  private container!: Phaser.GameObjects.Container;
  private skillContainer!: Phaser.GameObjects.Container;
  private skillContainerPosY!: number;

  private topInfoWindow!: Phaser.GameObjects.Image;
  private bottomInfoWindow!: Phaser.GameObjects.Image;
  private sprite!: Phaser.GameObjects.Image;
  private shiny!: Phaser.GameObjects.Image;
  private name!: Phaser.GameObjects.Text;
  private gender!: Phaser.GameObjects.Text;
  private pokedex!: Phaser.GameObjects.Text;
  private type1!: Phaser.GameObjects.Image;
  private type2!: Phaser.GameObjects.Image;
  private capturePokeball!: Phaser.GameObjects.Image;
  private captureCnt!: Phaser.GameObjects.Text;
  private captureCntIcon!: Phaser.GameObjects.Image;
  private captureCntTitle!: Phaser.GameObjects.Text;
  private captureLocation!: Phaser.GameObjects.Text;
  private captureDate!: Phaser.GameObjects.Text;
  private skillIcons: Phaser.GameObjects.Image[] = [];
  private skillTexts: Phaser.GameObjects.Text[] = [];

  constructor(scene: InGameScene, mode: OverworldMode, pokeboxUi: PokeboxUi) {
    super(scene);
    this.mode = mode;
    this.pokeboxUi = pokeboxUi;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();
    this.skillContainerPosY = height / 2 + 265;

    this.container = this.scene.add.container(width / 2 + 660, height / 2);
    this.skillContainer = this.scene.add.container(width / 2 + 435, this.skillContainerPosY);

    this.topInfoWindow = addImage(this.scene, TEXTURE.BOX_NAME, 0, -390).setScale(2.8);
    this.bottomInfoWindow = addImage(this.scene, TEXTURE.BOX_DESC, -10, +410).setScale(2.8);
    this.sprite = addImage(this.scene, `pokemon_sprite000`, 0, 0).setScale(5);
    this.shiny = addImage(this.scene, TEXTURE.BLANK, -255, -390).setScale(2.2);
    this.name = addText(this.scene, -240, -355, '', TEXTSTYLE.BOX_NAME).setOrigin(0, 0.5).setScale(1);
    this.gender = addText(this.scene, this.name.x + this.name.displayWidth, -350, '', TEXTSTYLE.GENDER_0)
      .setOrigin(0, 0.5)
      .setScale(0.8);
    const pokedexTitle = addText(this.scene, -230, -435, `No.`, TEXTSTYLE.BOX_POKEDEX).setOrigin(0, 0.5).setScale(1.2);
    this.pokedex = addText(this.scene, -160, -445, `0000`, TEXTSTYLE.BOX_POKEDEX).setOrigin(0, 0.5).setScale(1.6);
    this.type1 = addImage(this.scene, TEXTURE.TYPES, +90, -450).setScale(1.8);
    this.type2 = addImage(this.scene, TEXTURE.TYPES, +210, -450).setScale(1.8);
    this.captureCntTitle = addText(this.scene, -230, -190, i18next.t('menu:captureCount'), TEXTSTYLE.BOX_CAPTURE_TITLE).setScale(0.7).setOrigin(0.5, 0.5);
    this.captureCntIcon = addImage(this.scene, `item002`, -230, -250).setScale(1.4).setInteractive();
    const captureCntColon = addText(this.scene, -185, -250, ':', TEXTSTYLE.BOX_CAPTURE_TITLE).setScale(0.7).setOrigin(0, 0.5);
    this.captureCnt = addText(this.scene, -155, -250, '', TEXTSTYLE.SPECIAL).setScale(0.7).setOrigin(0, 0.5);
    const captureTitle = addText(this.scene, -110, +322, i18next.t('menu:capture'), TEXTSTYLE.BOX_POKEDEX).setScale(1);
    this.captureLocation = addText(this.scene, -260, +405, '- ', TEXTSTYLE.SPECIAL).setScale(0.6).setOrigin(0, 0.5);
    this.captureDate = addText(this.scene, -260, +480, '- ' + '', TEXTSTYLE.SPECIAL)
      .setScale(0.6)
      .setOrigin(0, 0.5);

    this.container.add(this.topInfoWindow);
    this.container.add(this.bottomInfoWindow);
    this.container.add(this.sprite);
    this.container.add(this.name);
    this.container.add(this.shiny);
    this.container.add(this.gender);
    this.container.add(pokedexTitle);
    this.container.add(this.pokedex);
    this.container.add(this.type1);
    this.container.add(this.type2);
    this.container.add(captureTitle);
    this.container.add(this.captureCntIcon);
    this.container.add(this.captureCntTitle);
    this.container.add(captureCntColon);
    this.container.add(this.captureCnt);
    this.container.add(this.captureDate);
    this.container.add(this.captureLocation);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.container.setScrollFactor(0);

    this.skillContainer.setVisible(false);
    this.skillContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.skillContainer.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.skillContainer.setVisible(true);

    this.handlePointer();
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.skillContainer.setVisible(false);

    this.captureCntIcon.off('pointerover');
    this.captureCntIcon.off('pointerout');
    this.captureCntIcon.disableInteractive();
  }

  pause(onoff: boolean, data?: any): void {}

  update(): void {}

  updateInfo(idx: number) {
    const pokemon = Box.getInstance().getMyPokemons()[idx];

    if (pokemon) {
      this.pokedex.setText(pokemon.pokedex);
      this.name.setText(i18next.t(`pokemon:${pokemon.pokedex}.name`));
      this.captureCnt.setText(pokemon.count.toString());
      this.updateGenderInfo(pokemon.gender);
      this.updateSprite(pokemon);
      this.updateTypes(pokemon.pokedex);
      this.updateShiny(pokemon.shiny);
      this.updateSkills(pokemon.skill);
      this.captureLocation.setText(`- ` + i18next.t(`menu:overworld_${pokemon.captureLocation}`));
      this.captureDate.setText(`- ` + pokemon.captureDate.toString().split('T')[0]);
    } else {
      this.pokedex.setText('0000');
      this.name.setText(``);
      this.captureCnt.setText(``);
      this.captureDate.setText(``);
      this.captureLocation.setText(``);
      this.updateGenderInfo();
      this.updateShiny(false);
      this.cleanSkills();
      this.sprite.setTexture(`pokemon_sprite000`);
      this.type1.setTexture(TEXTURE.BLANK);
      this.type2.setTexture(TEXTURE.BLANK);
    }
  }

  private updateGenderInfo(gender?: PokemonGender) {
    this.gender.setX(this.name.x + this.name.displayWidth);
    if (gender === 'female') {
      this.gender.setText(`♀`);
      this.gender.setStyle(getTextStyle(TEXTSTYLE.GENDER_1));
    } else if (gender === 'male') {
      this.gender.setText(`♂`);
      this.gender.setStyle(getTextStyle(TEXTSTYLE.GENDER_0));
    } else {
      this.gender.setText(``);
    }
  }

  private updateSprite(pokemon: MyPokemon) {
    let shiny = pokemon.shiny ? 's' : '';
    let gender = pokemon.gender === 'male' ? 'm' : pokemon.gender === 'female' ? 'f' : '';

    let texture = `pokemon_sprite${pokemon.pokedex}_${gender}${shiny}`;

    this.sprite.setTexture(texture);
  }

  private updateTypes(pokedex: string) {
    let type1: TYPE | null = TYPE.NONE;
    let type2: TYPE | null = TYPE.NONE;

    type1 = PokemonData[Number(pokedex)].type1;
    type2 = PokemonData[Number(pokedex)].type2;

    type1 ? this.type1.setTexture(TEXTURE.TYPES, `types-${type1}`) : this.type1.setTexture(TEXTURE.BLANK);
    type2 ? this.type2.setTexture(TEXTURE.TYPES, `types-${type2}`) : this.type2.setTexture(TEXTURE.BLANK);
  }

  private updateShiny(shiny: boolean) {
    if (shiny) {
      this.shiny.setTexture(TEXTURE.SHINY);
      this.name.setStyle(getTextStyle(TEXTSTYLE.SHINY));
    } else {
      this.shiny.setTexture(TEXTURE.BLANK);
      this.name.setStyle(getTextStyle(TEXTSTYLE.BOX_NAME));
    }
    this.setNameEffect(shiny);
  }

  private updateSkills(skills: PokemonSkill) {
    const contentWidth = 35;
    const spacing = 10;
    let currentY = 0;

    this.cleanSkills();

    for (const skill of skills) {
      const icon = addImage(this.scene, TEXTURE.BLANK, 0, currentY).setScale(1);
      const text = addText(this.scene, +25, currentY, i18next.t(`menu:${skill}`), TEXTSTYLE.BOX_CAPTURE_TITLE);
      text.setScale(0.5).setOrigin(0, 0.5);

      switch (skill) {
        case 'surf':
          icon.setTexture(`item032`);
          break;
        case 'darkeyes':
          icon.setTexture(`item033`);
          break;
      }

      this.skillIcons.push(icon);
      this.skillTexts.push(text);

      this.skillContainer.add(icon);
      this.skillContainer.add(text);

      currentY += currentY + contentWidth + spacing;
    }

    const length = this.skillIcons.length;
    if (length > 1) {
      this.skillContainer.setY(this.skillContainerPosY - (length - 1) * (contentWidth + spacing));
    } else {
      this.skillContainer.setY(this.skillContainerPosY);
    }
  }

  private setNameEffect(shiny: boolean) {
    let shadow;
    if (shiny) {
      shadow = getTextShadow(TEXTSTYLE.SHINY);
      this.name.setStyle(getTextStyle(TEXTSTYLE.SHINY));
    } else {
      shadow = getTextShadow(TEXTSTYLE.BOX_NAME);
      this.name.setStyle(getTextStyle(TEXTSTYLE.BOX_NAME));
    }
    this.name.setShadow(shadow[0] as number, shadow[1] as number, shadow[2] as string);
  }

  private handlePointer() {
    this.captureCntIcon.setInteractive().setScrollFactor(0);
    this.captureCntTitle.setVisible(false);

    this.captureCntIcon.on('pointerover', () => {
      this.captureCntTitle.setVisible(true);
    });

    this.captureCntIcon.on('pointerout', () => {
      this.captureCntTitle.setVisible(false);
    });
  }

  private cleanSkills() {
    this.skillIcons.forEach((icon) => {
      icon.off('pointerover');
      icon.destroy();
    });
    this.skillTexts.forEach((text) => text.destroy());

    this.skillIcons = [];
    this.skillTexts = [];

    this.skillContainer.removeAll(true);
  }
}
