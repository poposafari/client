import { getOverworldInfo } from '../data/overworld';
import { DEPTH } from '../enums/depth';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, addWindow, createSprite, getRealBounds, Ui } from './ui';

export interface Battle {
  overworld: string;
  pokedex: string;
}

export class OverworldBattleUi extends Ui {
  private mode: OverworldMode;
  private container!: Phaser.GameObjects.Container;
  private bg!: Phaser.GameObjects.Image;
  private enemy!: Phaser.GameObjects.Image;
  private enemyBase!: Phaser.GameObjects.Image;
  private player!: Phaser.GameObjects.Sprite;
  private playerBase!: Phaser.GameObjects.Image;
  private systemWindow!: Phaser.GameObjects.NineSlice;
  private behaviorWindow!: Phaser.GameObjects.NineSlice;
  private systemText!: Phaser.GameObjects.Text;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.scene.add.container(width / 2, height / 2);
    this.bg = addBackground(this.scene, '', width, height).setOrigin(0.5, 0.5);
    this.bg.setScale(2);
    this.enemy = addImage(this.scene, '', +500, -160).setScale(2).setOrigin(0.5, 0.5);
    this.enemyBase = addImage(this.scene, '', +500, -100).setScale(2);
    this.player = createSprite(this.scene, '', -450, +40).setScale(5).setOrigin(0.5, 0.5);
    this.playerBase = addImage(this.scene, '', -450, +275).setScale(2);
    this.systemWindow = addWindow(this.scene, TEXTURE.WINDOW_5, -200, 440, 380, 50, 16, 16, 16, 16).setScale(4);
    this.behaviorWindow = addWindow(this.scene, TEXTURE.WINDOW_5, +760, 440, 100, 50, 16, 16, 16, 16).setScale(4);
    this.systemText = addText(this.scene, 0, 0, '', TEXTSTYLE.MESSAGE_WHITE);

    this.container.add(this.bg);
    this.container.add(this.enemyBase);
    this.container.add(this.playerBase);
    this.container.add(this.systemWindow);
    this.container.add(this.systemText);
    this.container.add(this.behaviorWindow);
    this.container.add(this.enemy);
    this.container.add(this.player);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE_UI);
    this.container.setScrollFactor(0);
  }

  show(data?: Battle): void {
    const playerInfoManager = this.mode.getPlayerInfoManager();
    const playerInfo = playerInfoManager.getInfo();

    if (!data) {
      console.log('Can not found battle data.');
      return;
    }

    const overworld = getOverworldInfo(data.overworld);
    const pokedex = data.pokedex;
    const time = 'day';

    this.bg.setTexture(`bg_${overworld?.area}_${time}`);
    this.enemyBase.setTexture(`eb_${overworld?.area}_${time}`);
    this.playerBase.setTexture(`pb_${overworld?.area}_${time}`);

    this.player.setTexture(`${playerInfo.gender}_${playerInfo.avatarType}_back`);
    this.player.play(`${playerInfo.gender}_${playerInfo.avatarType}_back`);
    // this.player.setTexture(TEXTURE.BOY_1_BACK);

    this.enemy.setTexture(`pokemon_sprite${pokedex}`);
    this.adjustPokemonSpritePos();

    // this.scene.cameras.main.shake(500, 0.02);
    // this.scene.cameras.main.zoomTo(1.2, 500);

    this.container.setVisible(true);
    this.pause(false);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.pause(true);
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}

  private adjustPokemonSpritePos() {
    const bounds = getRealBounds(this.enemy, this.scene);
    const height = bounds.height;

    if (height >= 156) {
      this.enemy.setPosition(500, -240);
    }
  }
}
