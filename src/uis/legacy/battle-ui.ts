import i18next from 'i18next';
import { getSafari } from '../data/overworld';
import { DEPTH } from '../enums/depth';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { PokemonObject } from '../object-legacy/pokemon-object';
import { InGameScene } from '../scenes/ingame-scene';
import { OverworldInfo } from '../storage/overworld-info';
import { PlayerInfo } from '../storage/player-info';
import { getBattlePokemonSpriteKey, getPokemonOverworldOrIconKey, getPokemonSpriteKey, replacePercentSymbol } from '../utils/string-util';
import { addBackground, addImage, addText, addWindow, createSprite, delay, getTextStyle, playSound, runFadeEffect, runFlashEffect, runWipeRifghtToLeftEffect, stopPostPipeline, Ui } from './ui';
import { getPokemonInfo } from '../data/pokemon';
import { ListForm, MaxPartySlot, Message } from '../types';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import { KEY } from '../enums/key';
import { AUDIO } from '../enums/audio';
import { eventBus } from '../core/event-bus';
import { EVENT } from '../enums/event';
import { MenuListUi } from './menu-list-ui';
import { Bag, ItemCategory } from '../storage/bag';
import { item } from '../locales/ko/item';
import { EASE } from '../enums/ease';
import { BattleRewardUi } from './battle-reward-ui';
import { catchWildPokemon, feedBerryApi } from '../api';
import { ANIMATION } from '../enums/animation';
import { TYPE } from '../enums/type';
import { PlayerItem } from '../obj/player-item';

export class BattleUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private bg!: Phaser.GameObjects.Image;

  private bgUi: BattleBgUi;
  private messageUi: BattleMessageUi;
  private spriteUi: BattleSpriteUi;

  constructor(scene: InGameScene) {
    super(scene);

    this.bgUi = new BattleBgUi(scene);
    this.messageUi = new BattleMessageUi(scene);
    this.spriteUi = new BattleSpriteUi(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.bgUi.setup();
    this.messageUi.setup();
    this.spriteUi.setup(this.bgUi);

    this.container = this.createContainer(width / 2, height / 2);
    this.bg = addBackground(this.scene, TEXTURE.BLACK).setOrigin(0.5, 0.5);

    this.container.add(this.bg);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE);
    this.container.setScrollFactor(0);
  }

  async show(data?: PokemonObject): Promise<void> {
    await delay(this.scene, 500);
    await runFlashEffect(this.scene, 100);
    await runFlashEffect(this.scene, 100);
    runWipeRifghtToLeftEffect(this.scene);
    await delay(this.scene, 1000);
    await stopPostPipeline(this.scene);
    runFadeEffect(this.scene, 1000, 'in');
    this.bgUi.show(data!);
    this.messageUi.showContainer();
    await this.spriteUi.show(data);
    this.messageUi.show(data);
  }

  clean(data?: any): void {
    this.bgUi.clean();
    this.messageUi.clean();
    this.spriteUi.clean();
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}
}

export class BattleBgUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private bg!: Phaser.GameObjects.Image;
  private playerBase!: Phaser.GameObjects.Image;
  private enemyBase!: Phaser.GameObjects.Image;
  private rateText!: Phaser.GameObjects.Text;
  private tempPokemonObject!: PokemonObject;

  constructor(scene: InGameScene) {
    super(scene);

    eventBus.on(EVENT.UPDATE_CATCHRATE, (item?: string, type1?: TYPE, type2?: TYPE) => {
      const symbol = '%';
      const rate = item === '001' ? (100.0).toFixed(1) : this.tempPokemonObject.getCalcCatchRate(item, type1, type2).toFixed(1);
      this.rateText.setText(`${rate}${symbol}`);
    });
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);

    this.bg = addBackground(this.scene, TEXTURE.BLACK).setOrigin(0.5, 0.5).setScale(2);
    this.playerBase = addImage(this.scene, '', -400, +250).setScale(1.6);
    this.enemyBase = addImage(this.scene, '', +500, -100).setOrigin(0.5, 0.5).setScale(2);
    this.rateText = addText(this.scene, +730, -480, '100.0%', TEXTSTYLE.MESSAGE_WHITE);
    const rateTextTitle = addText(this.scene, this.rateText.x - 5, -490, i18next.t('menu:battleCaptureRateTitle'), TEXTSTYLE.MESSAGE_WHITE);

    rateTextTitle.setOrigin(1, 0.5);
    rateTextTitle.setScale(1.1);
    this.rateText.setOrigin(0, 0.5);
    this.rateText.setScale(1.4);

    this.container.add(this.bg);
    this.container.add(this.playerBase);
    this.container.add(this.enemyBase);
    this.container.add(rateTextTitle);
    this.container.add(this.rateText);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE + 1);
    this.container.setScrollFactor(0);
  }

  show(data: PokemonObject): void {
    if (!data) throw Error('Not found wild pokemon');

    this.tempPokemonObject = data;

    const overworld = OverworldInfo.getInstance().getKey();
    const overworldData = getSafari(overworld);
    const time = 'day';

    this.bg.setTexture(`bg_${overworldData.area}_${time}`);
    this.playerBase.setTexture(`pb_${overworldData.area}_${time}`);
    this.enemyBase.setTexture(`eb_${overworldData.area}_${time}`);

    eventBus.emit(EVENT.UPDATE_CATCHRATE);

    this.container.setVisible(true);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  getEnemyBase() {
    return this.enemyBase;
  }
}

export class BattleSpriteUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private partyContainer!: Phaser.GameObjects.Container;

  private player!: Phaser.GameObjects.Sprite;
  private playerInfo!: Phaser.GameObjects.Image;
  private throwItem!: Phaser.GameObjects.Sprite;
  private enemy!: Phaser.GameObjects.Image;
  private enemyInfo!: Phaser.GameObjects.Image;
  private enemyInfoShiny!: Phaser.GameObjects.Image;
  private enemyInfoName!: Phaser.GameObjects.Text;
  private enemyInfoGender!: Phaser.GameObjects.Text;
  private enemyInfoType1!: Phaser.GameObjects.Image;
  private enemyInfoType2!: Phaser.GameObjects.Image;
  private heart!: Phaser.GameObjects.Sprite;
  private eatenBerry!: Phaser.GameObjects.Sprite;
  private parties: Phaser.GameObjects.Image[] = [];
  private shinies: Phaser.GameObjects.Image[] = [];
  private effect!: Phaser.GameObjects.Sprite;

  private tempPokemonObject!: PokemonObject;
  private bgUi!: BattleBgUi;
  private rewardUi!: BattleRewardUi;

  constructor(scene: InGameScene) {
    super(scene);

    eventBus.on(EVENT.START_PLAYER_THROW, async (type: ItemCategory, item: string) => {
      await this.startPlayerThrow(type, item);
    });

    eventBus.on(EVENT.POKEMON_CATCH_CHECK, async (item: string) => {
      console.log(this.tempPokemonObject.getIdx());
      const eatenBerry = this.tempPokemonObject.getEatenBerry();
      const ret = await catchWildPokemon({ idx: this.tempPokemonObject.getIdx(), ball: item, berry: eatenBerry, parties: PlayerInfo.getInstance().getPartySlotIdx() });

      Bag.getInstance().useItem(item);

      await delay(this.scene, 500);
      if (ret && ret.success) {
        const isCatch = ret.data.catch;

        console.log(ret.data);

        if (isCatch) {
          await this.startShakeBall();
          await this.startCatchBall();
          this.showReward(ret.data.candy, ret.data.reward);
          await delay(this.scene, 3000);
          this.restore();
        } else {
          const randomShake = 1;
          await this.startShakeBall(randomShake);
          await this.startExitBall(item, ret.data.flee);
          this.restore();
        }

        eventBus.emit(EVENT.UPDATE_CATCHRATE);
      }
    });

    eventBus.on(EVENT.RESTORE_BATTLE, () => {
      this.restore();
      this.restoreSprite();
    });
  }

  setup(data: BattleBgUi): void {
    this.bgUi = data;

    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);
    this.partyContainer = this.createContainer(width / 2 + 295, height / 2 + 130);

    this.player = createSprite(this.scene, '', -400, +60).setScale(4).setOrigin(0.5, 0.5);
    this.playerInfo = addImage(this.scene, TEXTURE.ENEMY_BAR, 500, +150).setOrigin(0.5, 0.5).setScale(2.4);
    this.playerInfo.setFlipX(true);
    this.throwItem = createSprite(this.scene, TEXTURE.BLANK, -230, +110).setOrigin(0.5, 0.5);

    this.enemy = addImage(this.scene, '', +500, -200).setScale(4).setOrigin(0.5, 0.5);
    this.enemyInfo = addImage(this.scene, TEXTURE.ENEMY_BAR, -400, -250).setOrigin(0.5, 0.5).setScale(2.2);
    this.enemyInfoShiny = addImage(this.scene, TEXTURE.SHINY, -645, -260).setOrigin(0.5, 0.5).setScale(1.6);
    this.enemyInfoName = addText(this.scene, -620, -260, '', TEXTSTYLE.BOX_NAME).setOrigin(0, 0.5).setScale(0.8);
    this.enemyInfoGender = addText(this.scene, 0, 0, '♂♀', TEXTSTYLE.BOX_NAME).setOrigin(0, 0.5).setScale(0.8);
    this.enemyInfoType1 = addImage(this.scene, TEXTURE.BLANK, -275, -260).setScale(1.2);
    this.enemyInfoType2 = addImage(this.scene, TEXTURE.BLANK, -215, -260).setScale(1.2);
    this.heart = createSprite(this.scene, TEXTURE.BLANK, +500, -400).setScale(2).setOrigin(0.5, 0.5);
    this.eatenBerry = createSprite(this.scene, TEXTURE.BLANK, -620, -120).setOrigin(0.5, 0.5);
    this.effect = createSprite(this.scene, TEXTURE.BLANK, +500, -200).setScale(8).setOrigin(0.5, 0.5);

    const contentWidth = 50;
    const spacing = 15;
    let currentX = 0;

    for (let i = 0; i < MaxPartySlot; i++) {
      const icon = addImage(this.scene, `pokemon_icon000`, currentX, 0);
      const shiny = addImage(this.scene, TEXTURE.BLANK, currentX - 15, -15);

      this.parties.push(icon);
      this.shinies.push(shiny);

      this.partyContainer.add(icon);
      this.partyContainer.add(shiny);

      currentX += contentWidth + spacing;
    }

    this.container.add(this.player);
    this.container.add(this.playerInfo);
    this.container.add(this.enemy);
    this.container.add(this.throwItem);
    this.container.add(this.enemyInfo);
    this.container.add(this.enemyInfoShiny);
    this.container.add(this.enemyInfoName);
    this.container.add(this.enemyInfoGender);
    this.container.add(this.enemyInfoType1);
    this.container.add(this.enemyInfoType2);
    this.container.add(this.heart);
    this.container.add(this.eatenBerry);
    this.container.add(this.effect);

    this.partyContainer.setScale(1.4);
    this.partyContainer.setVisible(false);
    this.partyContainer.setDepth(DEPTH.BATTLE + 3);
    this.partyContainer.setScrollFactor(0);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE + 2);
    this.container.setScrollFactor(0);
  }

  async show(data?: PokemonObject): Promise<void> {
    if (!data) throw Error('Not found wild pokemon');

    this.tempPokemonObject = data;

    this.eatenBerry.setTexture(TEXTURE.BLANK);

    const playerInfo = PlayerInfo.getInstance();
    const playerBackTexture = `${playerInfo?.getGender()}_${playerInfo?.getAvatar()}_back`;
    const enemyTexture = getBattlePokemonSpriteKey(data.getPokedex(), data.getShiny(), data.getGender());
    const eatenBerry = data.getEatenBerry();

    this.player.setTexture(playerBackTexture);
    this.enemy.setTexture(enemyTexture);
    this.enemyInfoName.setText(i18next.t(`pokemon:${data.getPokedex()}.name`));
    this.enemyInfoShiny.setVisible(data.getShiny());
    this.eatenBerry.setTexture(eatenBerry ? `item${eatenBerry}` : TEXTURE.BLANK);
    this.showGender(data);
    this.showType(data);

    for (let i = 0; i < MaxPartySlot; i++) {
      this.parties[i].setTexture(`pokemon_icon000`);
      this.shinies[i].setTexture(TEXTURE.BLANK);
    }

    const playerParty = playerInfo.getPartySlot();
    let idx = 0;
    for (const pokemon of playerParty) {
      let texture = getPokemonOverworldOrIconKey(pokemon);
      this.parties[idx].setTexture(texture ? `pokemon_icon${texture}` : `pokemon_icon000`);
      this.shinies[idx].setTexture(pokemon?.shiny ? TEXTURE.SHINY : TEXTURE.BLANK);
      idx++;
    }

    this.container.setVisible(true);
    this.partyContainer.setVisible(true);

    await this.showShinyEffect(data.getShiny());
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.partyContainer.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  private showShinyEffect(shiny: boolean): Promise<void> {
    return new Promise((resolve) => {
      if (!shiny) {
        resolve();
        return;
      }

      playSound(this.scene, AUDIO.SHINY);

      this.effect.setTexture(TEXTURE.SPARKLE);
      this.effect.anims.play({
        key: TEXTURE.SPARKLE,
        repeat: 0,
        frameRate: 30,
      });

      this.effect.once('animationcomplete', () => {
        this.effect.anims.stop();
        this.effect.setTexture(TEXTURE.BLANK);
        resolve();
      });
    });
  }

  private showGender(pokemon: PokemonObject) {
    this.enemyInfoGender.setPosition(this.enemyInfoName.x + this.enemyInfoName.displayWidth, -260);

    if (pokemon.getGender() === 'male') {
      this.enemyInfoGender.setText(`♂`);
      this.enemyInfoGender.setStyle(getTextStyle(TEXTSTYLE.GENDER_0));
    }
    if (pokemon.getGender() === 'female') {
      this.enemyInfoGender.setText(`♀`);
      this.enemyInfoGender.setStyle(getTextStyle(TEXTSTYLE.GENDER_1));
    }
  }

  private showType(pokemon: PokemonObject) {
    const type1 = getPokemonInfo(parseInt(pokemon.getPokedex()))?.type1;
    const type2 = getPokemonInfo(parseInt(pokemon.getPokedex()))?.type2;

    if (type1 && type2) {
      this.enemyInfoType1.setTexture(TEXTURE.TYPES_1, `types_1-${type1}`);
      this.enemyInfoType2.setTexture(TEXTURE.TYPES_1, `types_1-${type2}`);
    } else if (type1 && !type2) {
      this.enemyInfoType1.setTexture(TEXTURE.BLANK);
      this.enemyInfoType2.setTexture(TEXTURE.TYPES_1, `types_1-${type1}`);
    } else {
      this.enemyInfoType1.setTexture(TEXTURE.BLANK);
      this.enemyInfoType2.setTexture(TEXTURE.BLANK);
    }
  }

  private async startPlayerThrow(type: ItemCategory, item: string) {
    const playerInfo = PlayerInfo.getInstance();
    const playerBack = `${playerInfo?.getGender()}_${playerInfo?.getAvatar()}_back`;

    this.player.anims.play({
      key: playerBack,
      repeat: 0,
      frameRate: 10,
    });

    this.player.once('animationcomplete', async (anim: any, frame: any) => {
      if (anim.key === playerBack) {
        playSound(this.scene, AUDIO.THROW);
        await this.startItemThrow(type, item);
        await delay(this.scene, 200);
        this.player.setFrame(0);
        this.player.anims.stop();
      }
    });
  }

  private async startItemThrow(type: ItemCategory, item: string) {
    const fixedStartItemPosX: number = -300;
    const fixedStartItemPosY: number = 100;
    const fixedEndItemPosX: number = 500;
    const fixedEndItemPosY: number = -200;
    const startX = fixedStartItemPosX;
    const startY = fixedStartItemPosY;
    const endX = fixedEndItemPosX;
    const endY = fixedEndItemPosY;
    const peakHeight = -300; // 포물선 최고점 값. (더 작은 값일수록 높게 날아감.)
    const duration = 500;

    if (type === ItemCategory.POKEBALL) {
      this.throwItem.setScale(4);
      this.throwItem.anims.play({
        key: `${item}_launch`,
        repeat: 0,
        frameRate: 10,
      });
    } else if (type === ItemCategory.BERRY) {
      this.throwItem.setScale(2);
      this.throwItem.setTexture(`item${item}`);
    }

    this.scene.tweens.add({
      targets: this.throwItem,
      x: endX,
      duration: duration,
      ease: EASE.LINEAR,
      onUpdate: (tween) => {
        const progress = tween.progress;

        // 포물선 방정식: -4a(x - 0.5)^2 + 1 공식으로 y 값 계산.
        const parabola = -4 * peakHeight * (progress - 0.5) ** 2 + peakHeight;
        this.throwItem.y = startY + (endY - startY) * progress + parabola;
      },
      onComplete: async () => {
        if (type === ItemCategory.POKEBALL) await this.startEnterBall(item);
        else if (type === ItemCategory.BERRY) {
          await this.startBiteBerry(item);
          eventBus.emit(EVENT.POKEMON_BERRY);
        }
      },
    });
  }

  private async startEnterBall(item: string) {
    await delay(this.scene, 500);

    playSound(this.scene, AUDIO.BALL_ENTER);
    this.throwItem.anims.play({
      key: `${item}_enter`,
      repeat: 0,
      frameRate: 10,
    });

    await delay(this.scene, 400);

    this.enemy.setTintFill(0xffffff);
    this.scene.tweens.add({
      targets: this.enemy,
      duration: 600,
      ease: EASE.SINE_EASEIN,
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.enemy,
          scaleX: 0.1,
          scaleY: 0.1,
          alpha: 0,
          duration: 600,
          ease: EASE.CUBIC_EASEIN,
          onComplete: () => {
            this.enemy.setVisible(false);
            this.enemy.setTint(0xffffff);
            this.enemy.setScale(1);
            this.enemy.setAlpha(1);
            this.startDropBall(item);
          },
        });
      },
    });
  }

  private async startDropBall(item: string) {
    const fixedEndItemPosY: number = -260;
    const endY = fixedEndItemPosY + 170;

    let prevY = this.throwItem.y;
    let falling = true;
    let bounceCount = 0;

    this.scene.tweens.add({
      targets: this.throwItem,
      y: endY,
      duration: 500,
      ease: EASE.BOUNCE_EASEOUT,
      onStart: () => {
        this.throwItem.anims.play({
          key: `${item}_drop`,
          repeat: 0,
          frameRate: 30,
        });
      },
      onUpdate: async () => {
        const currentY = this.throwItem.y;

        if (falling && currentY >= prevY) {
          bounceCount++;
          playSound(this.scene, AUDIO.BALL_DROP);
          falling = false;
        }

        if (!falling && currentY < prevY) {
          falling = true;
        }

        prevY = currentY;
      },
      onComplete: async () => {
        eventBus.emit(EVENT.POKEMON_CATCH_CHECK, item);
      },
    });
  }

  private restore() {
    this.throwItem.setTexture(TEXTURE.BLANK);
    this.throwItem.setPosition(-230, +110);
    this.throwItem.stop();
  }

  private restoreSprite() {
    this.throwItem.clearTint();
    this.enemy.setScale(4);
    this.enemy.setAlpha(1);
    this.enemy.setVisible(true);
  }

  private startShakeBall(count: number = 3): Promise<void> {
    return new Promise((resolve) => {
      const shakeAngle = 20;
      const shakeDuration = 200;
      let current = 0;

      const playOneShake = async () => {
        if (current >= count) {
          resolve();
          return;
        }

        await delay(this.scene, 500);
        playSound(this.scene, AUDIO.BALL_SHAKE);

        // 0 → -10
        this.scene.tweens.add({
          targets: this.throwItem,
          angle: -shakeAngle,
          duration: shakeDuration,
          ease: EASE.QUART_EASEINOUT,
          onComplete: () => {
            // -10 → +10
            this.scene.tweens.add({
              targets: this.throwItem,
              angle: +shakeAngle,
              duration: shakeDuration,
              ease: EASE.QUART_EASEINOUT,
              onComplete: () => {
                // +10 → 0
                this.scene.tweens.add({
                  targets: this.throwItem,
                  angle: 0,
                  duration: shakeDuration,
                  ease: EASE.QUART_EASEINOUT,
                  onComplete: () => {
                    current++;
                    playOneShake();
                  },
                });
              },
            });
          },
        });
      };

      playOneShake();
    });
  }

  private async startExitBall(item: string, escape: boolean): Promise<void> {
    return new Promise((resolve) => {
      this.enemy.setScale(0.1);
      this.enemy.setAlpha(0);
      this.enemy.setVisible(true);
      this.enemy.setTintFill(0xffffff);

      playSound(this.scene, AUDIO.BALL_EXIT);

      this.scene.tweens.add({
        targets: this.enemy,
        scaleX: 4,
        scaleY: 4,
        alpha: 1,
        duration: 300,
        ease: EASE.LINEAR,
        onStart: () => {
          this.throwItem.anims.play({
            key: `${item}_exit`,
            repeat: 0,
            frameRate: 10,
          });
        },
        onComplete: async () => {
          this.enemy.clearTint();
          this.throwItem.setTexture(TEXTURE.BLANK);
          this.tempPokemonObject.setEatenBerry(null);
          this.eatenBerry.setTexture(TEXTURE.BLANK);
          await delay(this.scene, 600);

          if (!escape) eventBus.emit(EVENT.POKEMON_CATCH_FAIL);
          else this.startPokemonEscape();
          resolve();
        },
      });
    });
  }

  private async startCatchBall(): Promise<void> {
    await delay(this.scene, 500);

    return new Promise((resolve) => {
      playSound(this.scene, AUDIO.BALL_CATCH);
      this.throwItem.setTint(0x5a5a5a);
      eventBus.emit(EVENT.POKEMON_CATCH_SUCCESS, this.tempPokemonObject.getPokedex());
      resolve();
    });
  }

  private async startBiteBerry(item: string): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.throwItem,
        duration: 1000,
        ease: EASE.BACK_EASEIN,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        onComplete: () => {
          this.startPokemonEmotion();
          this.startEatenBerry(item);
          this.throwItem.setTexture(TEXTURE.BLANK);
          this.throwItem.setScale(2, 2);
          this.throwItem.setAlpha(1);
          resolve();
        },
      });
    });
  }

  private startPokemonEmotion() {
    this.heart.stop();

    this.heart.anims.play({
      key: 'emo_2',
      repeat: 0,
      frameRate: 7,
    });

    this.heart.once('animationcomplete', async () => {
      await delay(this.scene, 1000);
      this.heart.setTexture(TEXTURE.BLANK);
      this.heart.stop();
      this.restore();
    });
  }

  private startEatenBerry(item: string) {
    this.eatenBerry.setTexture(`item${item}`);
  }

  private showReward(candy: number, rewards: any[]) {
    this.rewardUi = new BattleRewardUi(this.scene);

    this.pokemonClean();

    this.rewardUi.show({
      pokedex: `${this.tempPokemonObject.getPokedex()}`,
      gender: `${this.tempPokemonObject.getGender()}`,
      shiny: this.tempPokemonObject.getShiny(),
      skill: null,
      candy: candy,
      form: 0,
      rewards: rewards,
    });
  }

  private startPokemonEscape() {
    this.pokemonClean();
    console.log(this.tempPokemonObject.getPokedex());
    eventBus.emit(EVENT.POKEMON_ESCAPE, this.tempPokemonObject.getPokedex());
  }

  private pokemonClean() {
    this.tempPokemonObject.capture();
    this.tempPokemonObject.destroy();
  }
}

export class BattleMessageUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private menuContainer!: Phaser.GameObjects.Container;
  private baseWindow!: Phaser.GameObjects.NineSlice;
  private menuWindow!: Phaser.GameObjects.NineSlice;
  private text!: Phaser.GameObjects.Text;
  private menuTexts: Phaser.GameObjects.Text[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];
  private tempPokemonObject!: PokemonObject;
  private lastChoice!: number;

  private ballMenuListUi!: MenuListUi | null;
  private ballMenuDummyUi!: BattleBallMenuDummyUi;
  private berryMenuListUi!: MenuListUi | null;
  private berryMenuDummyUi!: BattleBerryMenuDummyUi;

  private readonly baseWindowScale: number = 2;
  private readonly menuWindowScale: number = 3.2;
  private readonly menus: string[] = [i18next.t('menu:battleSelect0'), i18next.t('menu:battleSelect1'), i18next.t('menu:battleSelect3')];

  constructor(scene: InGameScene) {
    super(scene);

    this.ballMenuDummyUi = new BattleBallMenuDummyUi(scene);
    this.berryMenuDummyUi = new BattleBerryMenuDummyUi(scene);
    this.ballMenuListUi = new MenuListUi(this.scene, this.ballMenuDummyUi);
    this.berryMenuListUi = new MenuListUi(this.scene, this.berryMenuDummyUi);

    eventBus.on(EVENT.POKEMON_CATCH_FAIL, async () => {
      await this.handleMessageKeyInput({ type: 'battle', format: 'talk', content: i18next.t('message:battleFail'), speed: 20 });
      this.handleMenuKeyInput();
    });

    eventBus.on(EVENT.POKEMON_CATCH_SUCCESS, async (pokemon: string) => {
      this.cleanText();
      await this.showMessage({ type: 'battle', format: 'talk', content: replacePercentSymbol(i18next.t('message:battleSuccess'), [i18next.t(`pokemon:${pokemon}.name`)]), speed: 20 });
    });

    eventBus.on(EVENT.POKEMON_ESCAPE, async (pokemon: string) => {
      this.cleanText();
      await this.handleMessageKeyInput({ type: 'battle', format: 'talk', content: i18next.t('message:battleFail'), speed: 20 });
      playSound(this.scene, AUDIO.FLEE);
      await this.handleMessageKeyInput({
        type: 'battle',
        format: 'talk',
        content: replacePercentSymbol(i18next.t('message:battlePokemonEscape'), [i18next.t(`pokemon:${pokemon}.name`)]),
        speed: 20,
      });
      eventBus.emit(EVENT.POP_MODE);
      eventBus.emit(EVENT.BATTLE_FINISH);
    });

    eventBus.on(EVENT.POKEMON_BERRY, () => {
      this.handleMenuKeyInput();
    });
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);
    this.menuContainer = this.createContainer(width / 2 + 683, height / 2 + 420);

    this.baseWindow = addWindow(this.scene, TEXTURE.WINDOW_2, 0, 420, width / this.baseWindowScale + 20, 240 / this.baseWindowScale, 16, 16, 16, 16).setScale(this.baseWindowScale);
    this.text = addText(this.scene, -920, +350, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0).setScale(1);

    this.menuWindow = addWindow(this.scene, TEXTURE.WINDOW_2, 0, 0, 555 / this.menuWindowScale, 240 / this.menuWindowScale, 16, 16, 16, 16).setScale(this.menuWindowScale);
    this.menuTexts[0] = addText(this.scene, -200, -35, this.menus[0], TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5).setScale(0.9);
    this.menuTexts[1] = addText(this.scene, +60, -35, this.menus[1], TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5).setScale(0.9);
    this.menuTexts[2] = addText(this.scene, -200, +35, this.menus[2], TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5).setScale(0.9);

    this.dummys[0] = addImage(this.scene, TEXTURE.BLANK, -220, -35).setScale(2.4);
    this.dummys[1] = addImage(this.scene, TEXTURE.BLANK, +40, -35).setScale(2.4);
    this.dummys[2] = addImage(this.scene, TEXTURE.BLANK, -220, +35).setScale(2.4);

    this.container.add(this.baseWindow);
    this.container.add(this.text);

    this.menuContainer.add(this.menuWindow);
    this.menuContainer.add(this.menuTexts[0]);
    this.menuContainer.add(this.menuTexts[1]);
    this.menuContainer.add(this.menuTexts[2]);
    this.menuContainer.add(this.dummys[0]);
    this.menuContainer.add(this.dummys[1]);
    this.menuContainer.add(this.dummys[2]);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE + 4);
    this.container.setScrollFactor(0);

    this.menuContainer.setVisible(false);
    this.menuContainer.setDepth(DEPTH.BATTLE + 5);
    this.menuContainer.setScrollFactor(0);
  }

  async show(data?: PokemonObject): Promise<void> {
    if (!data) throw Error('Not found wild pokemon');

    this.ballMenuListUi?.setup({ scale: 1.6, etcScale: 0, windowWidth: 350, offsetX: 400, offsetY: 215, depth: DEPTH.BATTLE + 6, per: 6, info: [] });
    this.berryMenuListUi?.setup({ scale: 1.6, etcScale: 0, windowWidth: 350, offsetX: 400, offsetY: 215, depth: DEPTH.BATTLE + 6, per: 6, info: [] });

    this.tempPokemonObject = data;

    await this.handleMessageKeyInput({ type: 'battle', format: 'talk', content: replacePercentSymbol(i18next.t('message:battleIntro'), [i18next.t(`pokemon:${data.getPokedex()}.name`)]), speed: 20 });
    this.handleMenuKeyInput();
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.menuContainer.setVisible(false);
  }

  cleanText() {
    this.text.text = '';
  }

  showContainer() {
    this.container.setVisible(true);
    this.menuContainer.setVisible(false);
  }

  private cleanMenu() {
    this.menuContainer.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {
    this.cleanMenu();
    this.handleKeyInput();
  }

  handleKeyInput(...data: any[]) {
    const keys = [KEY.SELECT];
    const keyboard = KeyboardHandler.getInstance();
    keyboard.setAllowKey(keys);
  }

  handleMenuKeyInput() {
    const keys = [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT];
    const keyboard = KeyboardHandler.getInstance();
    const nickname = PlayerInfo.getInstance().getNickname();

    const maxChoice = 2;
    const cols = 2;
    const eatenBerry = this.tempPokemonObject.getEatenBerry();
    let choice = this.lastChoice ? this.lastChoice : 0;

    this.showMenu(nickname);

    this.dummys[choice].setTexture(TEXTURE.ARROW_B_R);

    this.menuTexts[1].setStyle(getTextStyle(eatenBerry ? TEXTSTYLE.MESSAGE_GRAY : TEXTSTYLE.MESSAGE_BLACK));

    if (this.tempPokemonObject) keyboard.setAllowKey(keys);
    keyboard.setKeyDownCallback(async (key) => {
      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            if (choice - cols >= 0) choice -= cols;
            break;
          case KEY.DOWN:
            if (choice + cols <= maxChoice) choice += cols;
            break;
          case KEY.LEFT:
            if (choice % cols !== 0) choice--;
            break;
          case KEY.RIGHT:
            if ((choice + 1) % cols !== 0 && choice + 1 <= maxChoice) choice++;
            break;
          case KEY.SELECT:
            playSound(this.scene, AUDIO.SELECT_0);

            const target = this.menus[choice];
            this.lastChoice = choice;
            if (target === i18next.t('menu:battleSelect0')) {
              this.handleBallMenuKeyInput();
            } else if (target === i18next.t('menu:battleSelect1')) {
              if (eatenBerry) {
                playSound(this.scene, AUDIO.BUZZER);
              } else {
                this.handleBerryMenuKeyInput();
              }
            } else if (target === i18next.t('menu:battleSelect3')) {
              this.dummys[choice].setTexture(TEXTURE.BLANK);
              this.lastChoice = 0;

              playSound(this.scene, AUDIO.FLEE);

              await this.handleMessageKeyInput({
                type: 'battle',
                format: 'talk',
                content: replacePercentSymbol(i18next.t('message:battleEscape'), [nickname]),
                speed: 20,
              });
              eventBus.emit(EVENT.POP_MODE);
              eventBus.emit(EVENT.BATTLE_FINISH);
              this.tempPokemonObject.scheduleRandomMovement();
            }
            break;
        }

        if (choice !== prevChoice) {
          playSound(this.scene, AUDIO.SELECT_0);

          this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
          this.dummys[choice].setTexture(TEXTURE.ARROW_B_R);
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  update(time?: number, delta?: number): void {}

  private async handleBallMenuKeyInput() {
    const balls = this.getItems(ItemCategory.POKEBALL);
    this.ballMenuDummyUi.balls = balls;
    const ret = await this.ballMenuListUi?.handleKeyInput(this.createListForm(ItemCategory.POKEBALL));

    if (ret === i18next.t('menu:cancelMenu')) {
      eventBus.emit(EVENT.UPDATE_CATCHRATE);
      this.handleMenuKeyInput();
    } else if (typeof ret === 'number') {
      this.ballMenuListUi?.clean();
      this.cleanText();
      this.pause(true);
      this.showMessage({
        type: 'battle',
        format: 'talk',
        content: replacePercentSymbol(i18next.t('message:battleUse'), [PlayerInfo.getInstance().getNickname(), i18next.t(`item:${balls[ret][0]}.name`)]),
        speed: 20,
      });
      eventBus.emit(EVENT.START_PLAYER_THROW, ItemCategory.POKEBALL, balls[ret][0]);
    }
  }

  private async handleBerryMenuKeyInput() {
    const berry = this.getItems(ItemCategory.BERRY);
    this.berryMenuDummyUi.berries = berry;
    this.berryMenuDummyUi.type1 = getPokemonInfo(Number(this.tempPokemonObject.getPokedex()))?.type1!;
    this.berryMenuDummyUi.type2 = getPokemonInfo(Number(this.tempPokemonObject.getPokedex()))?.type2!;

    const ret = await this.berryMenuListUi?.handleKeyInput(this.createListForm(ItemCategory.BERRY));

    if (ret === i18next.t('menu:cancelMenu')) {
      eventBus.emit(EVENT.UPDATE_CATCHRATE);
      this.handleMenuKeyInput();
    } else if (typeof ret === 'number') {
      this.berryMenuListUi?.clean();
      this.cleanText();
      this.pause(true);
      this.showMessage({
        type: 'battle',
        format: 'talk',
        content: replacePercentSymbol(i18next.t('message:battleUse'), [PlayerInfo.getInstance().getNickname(), i18next.t(`item:${berry[ret][0]}.name`)]),
        speed: 20,
      });
      eventBus.emit(EVENT.START_PLAYER_THROW, ItemCategory.BERRY, berry[ret][0]);
      this.tempPokemonObject.setEatenBerry(berry[ret][0]);

      const result = await feedBerryApi({ idx: this.tempPokemonObject.getIdx(), berry: berry[ret][0] });

      if (result?.success) {
        Bag.getInstance().useItem(berry[ret][0]);
      }
    }
  }

  private async handleMessageKeyInput(message: Message) {
    const keyboard = KeyboardHandler.getInstance();
    keyboard.setAllowKey([KEY.SELECT]);

    this.cleanText();
    const result = await this.showMessage(message);

    return new Promise((resolve) => {
      keyboard.setKeyDownCallback((key) => {
        if (key === KEY.SELECT && result) {
          this.cleanText();
          KeyboardHandler.getInstance().clearCallbacks();
          resolve(true);
        }
      });
    });
  }

  private showMessage(message: Message) {
    const text = message.content.split('');

    let index = 0;
    let speed = message.speed;

    return new Promise((resolve) => {
      const addNextChar = () => {
        if (index < text.length) {
          this.text.text += text[index];
          index++;
          this.scene.time.delayedCall(speed, addNextChar, [], this);
        } else {
          resolve(true);
        }
      };
      addNextChar();
    });
  }

  private showMenu(nickname: string) {
    this.menuContainer.setVisible(true);
    this.cleanText();
    this.showMessage({ type: 'battle', format: 'talk', content: replacePercentSymbol(i18next.t('message:battleThinking'), [nickname]), speed: 20 });
  }

  private createListForm(category: ItemCategory): ListForm[] {
    const ret: ListForm[] = [];
    const items = this.getItems(category);

    for (const [key, value] of items) {
      ret.push({
        name: i18next.t(`item:${key}.name`),
        nameImg: '',
        etc: `x${value.getStock()}`,
        etcImg: '',
      });
    }

    return ret;
  }

  private getItems(category: ItemCategory) {
    return Object.entries(Bag.getInstance().getCategory(category));
  }
}

export class BattleBallMenuDummyUi extends Ui {
  public balls: [string, PlayerItem][] = [];

  setup(data?: any): void {}

  show(data?: any): void {}

  clean(data?: any): void {}

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {
    const item = this.balls[data[0]][0];
    eventBus.emit(EVENT.UPDATE_CATCHRATE, item);
  }

  update(time?: number, delta?: number): void {}
}

export class BattleBerryMenuDummyUi extends Ui {
  public berries: [string, PlayerItem][] = [];
  public type1!: TYPE | null;
  public type2!: TYPE | null;

  setup(data?: any): void {}

  show(data?: any): void {}

  clean(data?: any): void {}

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {
    const item = this.berries[data[0]][0];
    eventBus.emit(EVENT.UPDATE_CATCHRATE, item, this.type1, this.type2);
  }

  update(time?: number, delta?: number): void {}
}
