import { pokemonData } from '../data/pokemon';
import { BATTLE_STATUS } from '../enums/battle-status';
import { DEPTH } from '../enums/depth';
import { EASE } from '../enums/ease';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { PlayerItem } from '../object/player-item';
import { InGameScene } from '../scenes/ingame-scene';
import { isPokedexShiny, trimLastChar } from '../utils/string-util';
import { BattleInfo } from './battle-base-ui';
import { BattleUi } from './battle-ui';
import { addImage, createSprite, delay, getRealBounds, Ui } from './ui';

export class BattleSpriteUi extends Ui {
  private mode: OverworldMode;
  private battleUi: BattleUi;

  //container.
  private container!: Phaser.GameObjects.Container;

  //sprite.
  private enemy!: Phaser.GameObjects.Image;
  private player!: Phaser.GameObjects.Sprite;
  private throwItem!: Phaser.GameObjects.Sprite;

  private readonly fixedStartItemPosX: number = -300;
  private readonly fixedStartItemPosY: number = 100;
  private readonly fixedEndItemPosX: number = 500;
  private readonly fixedEndItemPosY: number = -260;

  constructor(scene: InGameScene, mode: OverworldMode, battleUi: BattleUi) {
    super(scene);
    this.mode = mode;
    this.battleUi = battleUi;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.scene.add.container(width / 2, height / 2);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE_UI + 4);
    this.container.setScrollFactor(0);
  }

  show(data?: BattleInfo): void {
    if (!data) {
      console.log('Can not found battle data.');
      return;
    }

    this.showSprite();

    const playerInfo = this.mode.getPlayerInfo();
    const playerBack = `${playerInfo?.getGender()}_${playerInfo?.getAvatar()}_back`;

    this.player.setTexture(playerBack);
    this.enemy.setTexture(`pokemon_sprite${data.pokedex}`);

    this.adjustPokemonSpritePos(data.pokedex);

    this.container.setVisible(true);
  }

  clean(data?: any): void {
    this.container.setVisible(false);

    this.cleanSprite();
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}

  private adjustPokemonSpritePos(pokedex: string) {
    const bounds = getRealBounds(this.enemy, this.scene);
    const height = bounds.height;
    const size = pokemonData[isPokedexShiny(pokedex) ? trimLastChar(pokedex) : pokedex].size;

    if (size === 1) {
      this.enemy.setPosition(500, -160);
    } else if (size === 2) {
      this.enemy.setPosition(500, -175);
    } else if (size === 3) {
      this.enemy.setPosition(500, -200);
    } else {
    }
  }

  throwPokeball(item: PlayerItem) {
    this.startPlayerThrowAnimation();

    this.player.once('animationcomplete', async () => {
      await this.startThrowItem(item);
    });
  }

  private startPlayerThrowAnimation() {
    const playerInfo = this.mode.getPlayerInfo();
    const playerBack = `${playerInfo?.getGender()}_${playerInfo?.getAvatar()}_back`;

    this.startPlayerAnimation(playerBack);
  }

  private startPlayerAnimation(animationKey: string) {
    this.player.anims.play({
      key: animationKey,
      repeat: 0,
      frameRate: 10,
    });
  }

  private resetPlayerAnimation() {
    this.player.setFrame(0);
  }

  private async startThrowItem(item: PlayerItem) {
    const startX = this.fixedStartItemPosX;
    const startY = this.fixedStartItemPosY;
    const endX = this.fixedEndItemPosX - 50;
    const endY = this.fixedEndItemPosY;
    const peakHeight = -300; // 포물선의 최고점 값. (더 작은 값일수록 높이 날아간다.)
    const duration = 500; // 총 이동 시간 설정 값.

    this.throwItem.setVisible(true);

    this.throwItem.anims.play({
      key: `${item.getKey()}_launch`,
      repeat: 0,
    });

    this.scene.tweens.add({
      targets: this.throwItem,
      x: endX,
      duration: duration,
      ease: EASE.LINEAR,
      onUpdate: (tween) => {
        const progress = tween.progress;
        const currentX = Phaser.Math.Linear(startX, endX, progress);

        // 포물선 방정식: -4a(x - 0.5)^2 + 1 공식으로 y 값 계산.
        const parabola = -4 * peakHeight * (progress - 0.5) ** 2 + peakHeight;
        this.throwItem.y = startY + (endY - startY) * progress + parabola;
      },
      onComplete: async () => {
        this.resetPlayerAnimation();
        this.throwItem.setVisible(false);
        await this.startEnterItemAnimation(item);
        await delay(this.scene, 500);
        await this.startDropItemAnimation(item);
        await delay(this.scene, 1000);
        const testCnt = 2;
        await this.startShakeItemAnimation(item, testCnt);
        await this.startExitItemAnimation(item, testCnt);
        await delay(this.scene, 1000);
        await this.startCatchItemAnimation(testCnt);
      },
    });
  }

  private async startEnterItemAnimation(item: PlayerItem) {
    this.throwItem.anims.play({
      key: `${item.getKey()}_enter`,
      repeat: 0,
      frameRate: 10,
    });
    this.enterEffect();
    this.throwItem.setVisible(true);
  }

  private enterEffect() {
    this.enemy.setTintFill(0xffffff);

    this.scene.tweens.add({
      targets: this.enemy,
      duration: 300,
      ease: EASE.QUAD_EASEIN,
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.enemy,
          scaleX: 0.1,
          scaleY: 0.1,
          alpha: 0,
          duration: 800,
          ease: EASE.CUBIC_EASEIN,
          onComplete: () => {
            this.enemy.setVisible(false);
            this.enemy.setTint(0xffffff);
            this.enemy.setScale(1);
            this.enemy.setAlpha(1);
          },
        });
      },
    });
  }

  private async startDropItemAnimation(item: PlayerItem) {
    this.scene.tweens.add({
      targets: this.throwItem,
      y: this.fixedEndItemPosY + 100,
      duration: 500,
      ease: EASE.BOUNCE_EASEOUT,
      onStart: () => {
        this.throwItem.anims.play({
          key: `${item.getKey()}_drop`,
          repeat: 0,
          frameRate: 30,
        });
      },
      onComplete: () => {},
    });
  }

  private async startShakeItemAnimation(item: PlayerItem, count: number): Promise<void> {
    for (let i = 1; i <= count; i++) {
      await delay(this.scene, 500);
      await new Promise<void>((resolve) => {
        const animationKey = `${item.getKey()}_shake`;

        this.throwItem.off(Phaser.Animations.Events.ANIMATION_COMPLETE);
        this.throwItem.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
          resolve();
        });

        this.throwItem.anims.play({
          key: animationKey,
          repeat: 0,
        });
      });
    }
  }

  private async startExitItemAnimation(item: PlayerItem, count: number) {
    if (count >= 3) return;

    this.enemy.setScale(0.1);
    this.enemy.setAlpha(0);
    this.enemy.setVisible(true);
    this.enemy.setTintFill(0xffffff);

    this.scene.tweens.add({
      targets: this.enemy,
      scaleX: 4,
      scaleY: 4,
      alpha: 1,
      duration: 300,
      ease: EASE.LINEAR,
      onStart: () => {
        this.throwItem.anims.play({
          key: `${item.getKey()}_exit`,
          repeat: 0,
          frameRate: 10,
        });
      },
      onComplete: () => {
        this.enemy.clearTint();
        this.throwItem.setVisible(false);
        this.cleanThrowItem();
        this.battleUi.checkCurrentStatus(BATTLE_STATUS.CATCH_FAIL);
      },
    });
  }

  private async startCatchItemAnimation(count: number) {
    if (count < 3) return;

    this.throwItem.setTint(0x5a5a5a);

    this.battleUi.checkCurrentStatus(BATTLE_STATUS.CATCH_SUCCESS);
  }

  private cleanSprite() {
    this.enemy.destroy();
    this.player.destroy();
    this.throwItem.destroy();

    this.container.removeAll(true);
  }

  private cleanThrowItem() {
    this.throwItem.setPosition(-300, +100).setVisible(false);
  }

  private showSprite() {
    this.enemy = addImage(this.scene, '', +500, -110).setScale(4).setOrigin(0.5, 0.5);
    this.player = createSprite(this.scene, '', -400, +100).setScale(4).setOrigin(0.5, 0.5);
    this.throwItem = createSprite(this.scene, TEXTURE.BLANK, -300, +100).setVisible(false);

    this.container.add(this.enemy);
    this.container.add(this.player);
    this.container.add(this.throwItem);
  }
}
