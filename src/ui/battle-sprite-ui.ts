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
  private emotionContainer!: Phaser.GameObjects.Container;

  //sprite.
  private enemy!: Phaser.GameObjects.Image;
  private effect!: Phaser.GameObjects.Sprite;
  private player!: Phaser.GameObjects.Sprite;
  private throwItem!: Phaser.GameObjects.Sprite;
  private heart!: Phaser.GameObjects.Sprite;

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
    this.emotionContainer = this.scene.add.container(width / 2, height / 2);
    this.heart = createSprite(this.scene, TEXTURE.BLANK, 0, 0).setScale(2).setOrigin(0.5, 0);

    this.effect = createSprite(this.scene, TEXTURE.BLANK, +500, -300).setOrigin(0.5, 0);
    this.effect.setScale(6);

    this.emotionContainer.add(this.heart);
    this.emotionContainer.add(this.effect);

    this.emotionContainer.setVisible(false);
    this.emotionContainer.setScrollFactor(0);
    this.emotionContainer.setDepth(DEPTH.BATTLE_UI + 6);

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
    const enemyTexture = `pokemon_sprite${data.pokedex}`;
    const enemyHeight = getRealBounds(this.enemy, this.scene);

    this.startShinyEffect(data.pokedex);

    this.player.setTexture(playerBack);
    this.enemy.setTexture(enemyTexture);

    this.heart.setPosition(+500, enemyHeight.y - 350);

    this.adjustPokemonSpritePos(data.pokedex);

    this.container.setVisible(true);
    this.emotionContainer.setVisible(true);
  }

  clean(data?: any): void {
    this.emotionContainer.setVisible(false);
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
      this.enemy.setPosition(500, -220);
    }
  }

  throwBerryOrPokeball(item: PlayerItem, type: 'berry' | 'pokeball') {
    this.startPlayerThrowAnimation();

    this.player.once('animationcomplete', async () => {
      await this.startThrowItem(item, type);
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

  private async startThrowItem(item: PlayerItem, type: 'berry' | 'pokeball') {
    const startX = this.fixedStartItemPosX;
    const startY = this.fixedStartItemPosY;
    const endX = this.fixedEndItemPosX - 50;
    const endY = this.fixedEndItemPosY;
    const peakHeight = -300; // 포물선의 최고점 값. (더 작은 값일수록 높이 날아간다.)
    const duration = 500; // 총 이동 시간 설정 값.

    this.throwItem.setVisible(true);

    if (type === 'pokeball') {
      this.throwItem.anims.play({
        key: `${item.getKey()}_launch`,
        repeat: 0,
      });
    } else {
      this.throwItem.setTexture(`item${item.getKey()}`);
    }

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

        if (type === 'pokeball') await this.startPokeballAnimation(item);
        else await this.startBerryAnimation(item);
      },
    });
  }

  private async startPokeballAnimation(item: PlayerItem) {
    await this.startEnterItemAnimation(item);
    await delay(this.scene, 500);
    await this.startDropItemAnimation(item);
    await delay(this.scene, 1000);

    //TODO: 서버로부터 포획 성공 여부와 도망여부를 받는다.(반환은 0<=cnt<=3로 받는다. isRun boolean 값을 받는다.)
    const testCnt = 2;
    const isRun = true;
    await this.startShakeItemAnimation(item, testCnt);
    await this.startExitItemAnimation(item, testCnt, isRun);
    await delay(this.scene, 1000);
    await this.startCatchItemAnimation(testCnt, isRun);
  }

  private async startBerryAnimation(item: PlayerItem) {
    this.biteBerry(item);
  }

  private biteBerry(item: PlayerItem) {
    this.scene.tweens.add({
      targets: this.throwItem,
      duration: 1000,
      ease: EASE.BACK_EASEIN,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      onComplete: () => {
        this.showEmotion();
        this.throwItem.setTexture(TEXTURE.BLANK);
        this.battleUi.handleBattleStatus(BATTLE_STATUS.FEED, item);
        this.throwItem.setScale(2, 2);
        this.throwItem.setAlpha(1);
        this.cleanThrowItem();
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

  private async startExitItemAnimation(item: PlayerItem, count: number, isRun: boolean) {
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
      onComplete: async () => {
        this.enemy.clearTint();
        this.throwItem.setVisible(false);
        this.cleanThrowItem();
        await delay(this.scene, 600);
        this.battleUi.handleBattleStatus(BATTLE_STATUS.CATCH_FAIL, isRun);
      },
    });
  }

  private async startRunAway(isRun: boolean) {
    if (isRun) this.battleUi.handleBattleStatus(BATTLE_STATUS.RUN_ENEMY);
  }

  private async startCatchItemAnimation(count: number, isRun: boolean) {
    if (count < 3) return;

    this.throwItem.setTint(0x5a5a5a);

    await delay(this.scene, 600);
    this.battleUi.handleBattleStatus(BATTLE_STATUS.CATCH_SUCCESS);
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

  private showEmotion() {
    this.heart.off(Phaser.Animations.Events.ANIMATION_COMPLETE);

    this.heart.anims.play({
      key: 'emo_2',
      repeat: 0,
      frameRate: 7,
    });

    this.heart.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.scene.time.delayedCall(800, () => {
        this.heart.setTexture(TEXTURE.BLANK);
      });
    });
  }

  private startShinyEffect(pokedex: string) {
    if (!isPokedexShiny(pokedex)) return;

    this.effect.anims.play({
      key: 'sparkle',
      repeat: 0,
      frameRate: 50,
    });

    this.effect.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.effect.setTexture(TEXTURE.BLANK);
    });
  }
}
