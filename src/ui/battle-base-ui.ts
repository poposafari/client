import i18next from 'i18next';
import { getSafari } from '../data/overworld';
import { DEPTH } from '../enums/depth';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { PokemonObject } from '../object/pokemon-object';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, delay, getTextStyle, runFlashEffect, runWipeRifghtToLeftEffect, stopPostPipeline, Ui } from './ui';
import { isPokedexShiny, trimLastChar } from '../utils/string-util';
import { pokemonData } from '../data/pokemon';

export interface BattleInfo {
  overworld: string;
  pokedex: string;
  pokemon: PokemonObject;
}

export class BattleBaseUi extends Ui {
  private mode: OverworldMode;

  //containers.
  private container!: Phaser.GameObjects.Container;
  private enemyInfoContainer!: Phaser.GameObjects.Container;
  private playerInfoContainer!: Phaser.GameObjects.Container;
  private partysInfoContainer!: Phaser.GameObjects.Container;

  //backgrounds.
  private bgArea!: Phaser.GameObjects.Image;

  //enemy.
  private enemyBase!: Phaser.GameObjects.Image;
  private enemyInfo!: Phaser.GameObjects.Image;
  private enemyInfoName!: Phaser.GameObjects.Text;
  private enemyInfoGender!: Phaser.GameObjects.Text;
  private enemyInfoShiny!: Phaser.GameObjects.Image;
  private enemyInfoOwned!: Phaser.GameObjects.Image;
  private enemyInfoType1!: Phaser.GameObjects.Image;
  private enemyInfoType2!: Phaser.GameObjects.Image;

  //player.
  private playerBase!: Phaser.GameObjects.Image;
  private playerInfo!: Phaser.GameObjects.Image;
  private playerInfoPartyIcon: Phaser.GameObjects.Image[] = [];
  private playerInfoEmptyParty!: Phaser.GameObjects.Text;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.scene.add.container(width / 2, height / 2);
    this.enemyInfoContainer = this.scene.add.container(-350, -250);
    this.playerInfoContainer = this.scene.add.container(+480, +170);
    this.partysInfoContainer = this.scene.add.container(+280, +150);

    this.bgArea = addBackground(this.scene, '').setOrigin(0.5, 0.5).setScale(2);

    this.enemyBase = addImage(this.scene, '', +500, -100).setScale(2);
    this.enemyInfo = addImage(this.scene, TEXTURE.ENEMY_BAR, 0, 0).setOrigin(0.5, 0.5).setScale(2.2);
    this.enemyInfoName = addText(this.scene, -235, -12, '', TEXTSTYLE.BATTLE_NAME).setOrigin(0, 0.5).setScale(0.7);
    this.enemyInfoShiny = addImage(this.scene, TEXTURE.SHINY, -253, -10).setOrigin(0.5, 0.5).setScale(1.8);
    this.enemyInfoGender = addText(this.scene, 0, 0, '♂♀', TEXTSTYLE.BATTLE_MESSAGE).setOrigin(0, 0.5).setScale(0.6);
    this.enemyInfoOwned = addImage(this.scene, TEXTURE.OWNED, -235, +45).setOrigin(0.5, 0.5).setScale(2);
    this.enemyInfoType1 = addImage(this.scene, TEXTURE.BLANK, +120, -10).setScale(1.2);
    this.enemyInfoType2 = addImage(this.scene, TEXTURE.BLANK, +130 * 1.4, -10).setScale(1.2);
    this.enemyInfoContainer.add(this.enemyInfo);
    this.enemyInfoContainer.add(this.enemyInfoName);
    this.enemyInfoContainer.add(this.enemyInfoShiny);
    this.enemyInfoContainer.add(this.enemyInfoGender);
    this.enemyInfoContainer.add(this.enemyInfoOwned);
    this.enemyInfoContainer.add(this.enemyInfoType1);
    this.enemyInfoContainer.add(this.enemyInfoType2);

    this.playerBase = addImage(this.scene, '', -400, +290).setScale(1.6);
    this.playerInfo = addImage(this.scene, TEXTURE.ENEMY_BAR, 0, 0).setOrigin(0.5, 0.5).setScale(2.4);
    this.playerInfo.setFlipX(true);
    this.playerInfoEmptyParty = addText(this.scene, +15, -10, i18next.t('menu:emptyParty'), TEXTSTYLE.BATTLE_NAME);
    this.playerInfoContainer.add(this.playerInfo);
    this.playerInfoContainer.add(this.playerInfoEmptyParty);

    this.container.add(this.bgArea);
    this.container.add(this.enemyBase);
    this.container.add(this.enemyInfoContainer);
    this.container.add(this.playerBase);
    this.container.add(this.playerInfoContainer);
    this.container.add(this.partysInfoContainer);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE_UI + 2);
    this.container.setScrollFactor(0);
  }

  show(data?: BattleInfo): void {
    if (!data) {
      console.log('Can not found battle data.');
      return;
    }

    const contentHeight = 80;
    const spacing = 6;
    const overworld = getSafari(data.overworld);
    const time = 'day';
    const box = this.mode.getBox();
    const playerInfo = this.mode.getPlayerInfo();
    const originPokedex = isPokedexShiny(data.pokedex) ? trimLastChar(data.pokedex) : data.pokedex;

    this.bgArea.setTexture(`bg_${overworld.area}_${time}`);
    this.enemyBase.setTexture(`eb_${overworld.area}_${time}`);
    this.playerBase.setTexture(`pb_${overworld.area}_${time}`);

    this.enemyInfoName.setText(i18next.t(`pokemon:${originPokedex}.name`));
    this.enemyInfoShiny.setVisible(isPokedexShiny(data.pokedex));
    this.enemyInfoOwned.setVisible(box!.hasPokemon(data.pokedex) ? true : false);

    const type1 = pokemonData[originPokedex].type1;
    const type2 = pokemonData[originPokedex].type2;

    if (type1 && type2) {
      this.enemyInfoType1.setTexture(TEXTURE.TYPES_1, `types_1-${type1}`);
      this.enemyInfoType2.setTexture(TEXTURE.TYPES_1, `types_1-${type2}`);
    } else if (type1 && !type2) {
      this.enemyInfoType1.setTexture(TEXTURE.BLANK);
      this.enemyInfoType2.setTexture(TEXTURE.TYPES_1, `types_1-${type1}`).setVisible(true);
    }

    this.cleanPartyInfoContainer();

    if (playerInfo) {
      const parties = playerInfo.getPartySlot();
      let currentX = 0;

      //TODO data와 동일한 타입의 파티 포켓몬을 골라내야 함 :)
      parties.forEach((party) => {
        const box = this.mode.getBox();
        const icon = addImage(this.scene, `pokemon_icon${party}`, currentX, 0).setScale(1.5);
        const shiny = addImage(this.scene, TEXTURE.SHINY, currentX - 25, -21).setScale(1.5);

        if (box) {
          shiny.setVisible(isPokedexShiny(box.hasPokemon(party)!.pokedex) ? true : false);
        }

        this.playerInfoPartyIcon.push(icon);
        this.partysInfoContainer.add(icon);
        this.partysInfoContainer.add(shiny);

        currentX += contentHeight + spacing;
      });

      if (this.playerInfoPartyIcon.length === 0) {
        this.playerInfoEmptyParty.setVisible(true);
      } else {
        this.playerInfoEmptyParty.setVisible(false);
      }
    }

    this.enemyInfoGender.setPosition(this.enemyInfoName.x + this.enemyInfoName.displayWidth, -5);

    if (data.pokemon.getGender() === 0) {
      this.enemyInfoGender.setText(`♂`);
      this.enemyInfoGender.setStyle(getTextStyle(TEXTSTYLE.GENDER_0));
    }
    if (data.pokemon.getGender() === 1) {
      this.enemyInfoGender.setText(`♀`);
      this.enemyInfoGender.setStyle(getTextStyle(TEXTSTYLE.GENDER_1));
    }

    this.container.setVisible(true);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}

  private cleanPartyInfoContainer() {
    if (this.partysInfoContainer) {
      this.partysInfoContainer.removeAll(true);
    }

    this.playerInfoPartyIcon.forEach((icon) => icon.destroy());

    this.playerInfoPartyIcon = [];
  }
}
