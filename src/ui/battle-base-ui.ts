import i18next from 'i18next';
import { getSafari } from '../data/overworld';
import { DEPTH } from '../enums/depth';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { PokemonObject } from '../object/pokemon-object';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, delay, runFlashEffect, runWipeRifghtToLeftEffect, stopPostPipeline, Ui } from './ui';
import { isPokedexShiny, trimLastChar } from '../utils/string-util';

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

  //backgrounds.
  private bgArea!: Phaser.GameObjects.Image;

  //enemy.
  private enemyBase!: Phaser.GameObjects.Image;
  private enemyInfo!: Phaser.GameObjects.Image;
  private enemyInfoName!: Phaser.GameObjects.Text;
  private enemyInfoGender!: Phaser.GameObjects.Image;
  private enemyInfoShiny!: Phaser.GameObjects.Image;

  //player.
  private playerBase!: Phaser.GameObjects.Image;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.scene.add.container(width / 2, height / 2);
    this.enemyInfoContainer = this.scene.add.container(-400, -250);

    this.bgArea = addBackground(this.scene, '').setOrigin(0.5, 0.5).setScale(2);

    this.enemyBase = addImage(this.scene, '', +500, -100).setScale(2);
    this.enemyInfo = addImage(this.scene, TEXTURE.ENEMY_INFO, 0, 0).setOrigin(0.5, 0.5).setScale(2);
    this.enemyInfoName = addText(this.scene, -220, -65, '리자몽', TEXTSTYLE.BATTLE_MESSAGE).setOrigin(0, 0).setScale(0.8);
    this.enemyInfoShiny = addImage(this.scene, TEXTURE.SHINY, -240, -40).setOrigin(0.5, 0.5).setScale(2);
    this.enemyInfoGender = addImage(this.scene, TEXTURE.GENDER_0, +210, -35).setOrigin(0.5, 0.5).setScale(4);
    this.enemyInfoContainer.add(this.enemyInfo);
    this.enemyInfoContainer.add(this.enemyInfoName);
    this.enemyInfoContainer.add(this.enemyInfoShiny);
    this.enemyInfoContainer.add(this.enemyInfoGender);

    this.playerBase = addImage(this.scene, '', -400, +290).setScale(1.6);

    this.container.add(this.bgArea);
    this.container.add(this.enemyBase);
    this.container.add(this.enemyInfoContainer);
    this.container.add(this.playerBase);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE_UI + 2);
    this.container.setScrollFactor(0);
  }

  show(data?: BattleInfo): void {
    if (!data) {
      console.log('Can not found battle data.');
      return;
    }

    const overworld = getSafari(data.overworld);
    const time = 'day';

    this.bgArea.setTexture(`bg_${overworld.area}_${time}`);
    this.enemyBase.setTexture(`eb_${overworld.area}_${time}`);
    this.playerBase.setTexture(`pb_${overworld.area}_${time}`);

    this.enemyInfoName.setText(i18next.t(`pokemon:${isPokedexShiny(data.pokedex) ? trimLastChar(data.pokedex) : data.pokedex}.name`));
    this.enemyInfoShiny.setVisible(isPokedexShiny(data.pokedex));

    this.container.setVisible(true);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}
}
