import i18next from 'i18next';
import { ANIMATION, AUDIO, BATTLE_AREA, DEPTH, EASE, EVENT, ItemCategory, KEY, MessageEndDelay, TextSpeed, TEXTSTYLE, TEXTURE, TIME, TYPE, UI } from '../../enums';
import { WildOverworldObj } from '../../obj/wild-overworld-obj';
import { InGameScene } from '../../scenes/ingame-scene';
import { delay, getTextStyle, playEffectSound, runFadeEffect, runFlashEffect, runWipeRifghtToLeftEffect, startModalAnimation, stopPostPipeline, Ui } from '../ui';
import { checkItemType, getBattleArea, getCurrentTimeOfDay, getPokemonType, matchPokemonWithRarityRate, matchTypeWithBerryRate, replacePercentSymbol } from '../../utils/string-util';
import { PlayerGlobal } from '../../core/storage/player-storage';
import { getPokemonInfo } from '../../data';
import { MAX_PARTY_SLOT } from '../../constants';
import { PC } from '../../core/storage/pc-storage';
import { TalkMessageUi } from '../talk-message-ui';
import { Option } from '../../core/storage/player-option';
import { Keyboard } from '../../core/manager/keyboard-manager';
import { Game } from '../../core/manager/game-manager';
import { MenuListUi } from '../menu-list-ui';
import { CatchRewardRes, CatchWildFailRes, CatchWildSuccessRes, GetPcRes, ListForm, PokemonGender, WildRes } from '../../types';
import { PlayerItem } from '../../obj/player-item';
import { Bag } from '../../core/storage/bag-storage';
import { catchWildApi, feedWildEatenBerryApi } from '../../api';
import { Event } from '../../core/manager/event-manager';

enum BATTLE_PHASE {
  IDLE = 'IDLE',
  TUTORIAL = 'TUTORIAL',

  USE_BALL = 'USE_BALL',
  USE_BERRY = 'USE_BERRY',
  USE_ITEM = 'USE_ITEM',

  SHOW_BALL_LIST = 'SHOW_BALL_LIST',
  SHOW_BERRY_LIST = 'SHOW_BERRY_LIST',
  SHOW_ITEM_LIST = 'SHOW_ITEM_LIST',

  ENTER_WILD = 'ENTER_WILD',
  CHECK_CATCH_WILD = 'CHECK_CATCH_WILD',
  CATCH_SUCCESS_WILD = 'CATCH_SUCCESS_WILD',
  CATCH_FAIL_WILD = 'CATCH_FAIL_WILD',
  FLEE_WILD = 'FLEE_WILD',
  FLEE_PLAYER = 'FLEE_PLAYER',
}

export class Battle extends Ui {
  private tutorialContainer!: Phaser.GameObjects.Container;
  private tutorialBg!: Phaser.GameObjects.Image;

  private phaseQueue: BATTLE_PHASE[] = [];
  private isProcessingPhase: boolean = false;
  private battleSprite: BattleSpriteUi;
  private battleInfo: BattleInfoUi;
  private baseUi: BattleBaseUi;
  private idleUi: BattleIdleUi;
  private battleMenuListUi: BattleMenuListUi;
  private battleRewardUi: BattleRewardUi;

  private area: BATTLE_AREA | null = null;
  private time: TIME | null = null;

  private talkMessage: TalkMessageUi;

  private targetWild: WildOverworldObj | null = null;

  constructor(scene: InGameScene) {
    super(scene);

    this.battleSprite = new BattleSpriteUi(scene, this);
    this.battleInfo = new BattleInfoUi(scene, this);
    this.baseUi = new BattleBaseUi(scene, this, this.battleSprite, this.battleInfo);
    this.idleUi = new BattleIdleUi(scene, this);
    this.battleMenuListUi = new BattleMenuListUi(scene, this);
    this.talkMessage = new TalkMessageUi(scene);
    this.battleRewardUi = new BattleRewardUi(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.tutorialContainer = this.createContainer(width / 2, height / 2);
    this.tutorialBg = this.addBackground(TEXTURE.BG_BLACK).setOrigin(0.5, 0.5).setAlpha(0.5);
    this.tutorialContainer.add(this.tutorialBg);

    this.battleSprite.setup();
    this.battleInfo.setup();
    this.battleRewardUi.setup();
    this.baseUi.setup();
    this.idleUi.setup();
    this.battleMenuListUi.setup();
    this.talkMessage.setup();

    this.tutorialContainer.setVisible(false);
    this.tutorialContainer.setDepth(DEPTH.MESSAGE - 1);
    this.tutorialContainer.setScrollFactor(0);
  }

  async show(data: WildOverworldObj): Promise<void> {
    const currentTimeOfDay = getCurrentTimeOfDay();

    this.targetWild = data;
    this.area = getBattleArea(PlayerGlobal.getData()?.location || '') || null;
    this.time = currentTimeOfDay;

    if (this.time === TIME.DAWN) this.time = TIME.NIGHT;
    if (this.area === BATTLE_AREA.CAVE) this.time = TIME.DAY;

    await this.baseUi.show();
    if (Option.getTutorial() && Option.getClientTutorial('battle')) {
      this.addPhase(BATTLE_PHASE.TUTORIAL);
    } else {
      this.addPhase(BATTLE_PHASE.IDLE);
    }
  }

  protected onClean(): void {
    Event.emit(EVENT.ENABLE_DAY_NIGHT_FILTER);

    this.baseUi.clean();
    this.battleSprite.clean();
    this.battleInfo.clean();
    this.idleUi.clean();
    this.talkMessage.clean();
    this.battleMenuListUi.clean();
    this.targetWild = null;
    this.area = null;
    this.time = null;
  }

  pause(onoff: boolean, data?: any): void {}
  handleKeyInput(...data: any[]) {}
  update(time?: number, delta?: number): void {}

  clean(): void {
    Event.emit(EVENT.ENABLE_DAY_NIGHT_FILTER);

    this.idleUi.clean();
    this.battleSprite.clean();
    this.battleInfo.clean();
    this.baseUi.clean();
  }

  addPhase(phase: BATTLE_PHASE, data?: unknown): void {
    if (this.phaseQueue.includes(phase) || (this.isProcessingPhase && this.phaseQueue.length > 0)) {
      return;
    }

    this.phaseQueue.push(phase);

    const task = this.phaseQueue.shift();

    if (task) {
      void this.handlePhase(task, data);
    }
  }

  updateCatchRate(berry: string | null, ball: string | null) {
    this.battleInfo.updateCatchRate(berry, ball);
  }

  async showTutorial() {
    await this.talkMessage.show({
      type: 'default',
      content: i18next.t('message:tutorial_battle_0'),
      speed: Option.getTextSpeed()!,
      endDelay: MessageEndDelay.DEFAULT,
    });
    await this.talkMessage.show({
      type: 'default',
      content: i18next.t('message:tutorial_battle_1'),
      speed: Option.getTextSpeed()!,
      endDelay: MessageEndDelay.DEFAULT,
    });
    await this.talkMessage.show({
      type: 'default',
      content: i18next.t('message:tutorial_battle_2'),
      speed: Option.getTextSpeed()!,
      endDelay: MessageEndDelay.DEFAULT,
    });
    await this.talkMessage.show({
      type: 'default',
      content: i18next.t('message:tutorial_battle_3'),
      speed: Option.getTextSpeed()!,
      endDelay: MessageEndDelay.DEFAULT,
    });
    await this.talkMessage.show({
      type: 'default',
      content: i18next.t('message:tutorial_battle_4'),
      speed: Option.getTextSpeed()!,
      endDelay: MessageEndDelay.DEFAULT,
    });
  }

  private async handlePhase(phase: BATTLE_PHASE, data?: unknown): Promise<void> {
    this.isProcessingPhase = true;

    try {
      switch (phase) {
        case BATTLE_PHASE.IDLE:
          this.updateCatchRate(null, null);
          this.idleUi.show();
          break;
        case BATTLE_PHASE.TUTORIAL:
          this.tutorialContainer.setVisible(true);
          await this.showTutorial();
          Option.setClientTutorial(false, 'battle');
          this.tutorialContainer.setVisible(false);
          this.addPhase(BATTLE_PHASE.IDLE);
          break;
        case BATTLE_PHASE.SHOW_BALL_LIST:
          this.idleUi.hide();
          this.idleUi.hideMessageText();
          await this.battleMenuListUi.show('ball');
          break;
        case BATTLE_PHASE.SHOW_BERRY_LIST:
          this.idleUi.hide();
          this.idleUi.hideMessageText();
          await this.battleMenuListUi.show('berry');
          break;
        case BATTLE_PHASE.SHOW_ITEM_LIST:
          this.idleUi.hide();
          this.idleUi.hideMessageText();
          await this.battleMenuListUi.show('tool');
          break;
        case BATTLE_PHASE.USE_BALL:
        case BATTLE_PHASE.USE_BERRY:
        case BATTLE_PHASE.USE_ITEM:
          Bag.useItem(data as string);
          this.idleUi.useItem(data as string);
          await this.battleSprite.readyThrowItem(data as string);
          await this.battleSprite.runThrowItem(data as string);
          break;
        case BATTLE_PHASE.ENTER_WILD:
          await this.battleSprite.enterItem(data as string);
          break;
        case BATTLE_PHASE.CHECK_CATCH_WILD:
          const parties = PC.getParty().map((party) => {
            if (party) return party!.getIdx();
            else return null;
          });

          const apiRet = await catchWildApi({ idx: this.targetWild?.getData().idx ?? 0, ball: data as string, berry: null, parties: parties });

          console.log(apiRet);

          if (apiRet && apiRet.result) {
            if (apiRet.data.catch) {
              const ret = apiRet.data as CatchWildSuccessRes;
              const rewardCandy = ret.rewards.candy;
              const rewardItems = ret.rewards.items;
              const rewardPc = ret.rewards.pc;

              this.addPhase(BATTLE_PHASE.CATCH_SUCCESS_WILD, { pc: rewardPc, wild: this.targetWild?.getData() as WildRes, candy: rewardCandy, items: rewardItems });
            } else {
              const ret = apiRet.data as CatchWildFailRes;
              this.addPhase(BATTLE_PHASE.CATCH_FAIL_WILD, { item: data as string, flee: ret.flee });
            }
          }
          break;
        case BATTLE_PHASE.CATCH_SUCCESS_WILD:
          await this.battleSprite.runShakeBall(3);
          await this.battleSprite.runCatchBall();
          playEffectSound(this.scene, AUDIO.CONG);
          await this.talkMessage.show({
            type: 'default',
            content: replacePercentSymbol(i18next.t('message:battle_catch_success'), [i18next.t(`pokemon:${this.targetWild?.getData().pokedex}.name`)]),
            speed: TextSpeed.CONG,
            endDelay: MessageEndDelay.CONG,
          });
          await this.battleRewardUi.show(data as BattleRewardData);
          await this.exitBattle();

          break;
        case BATTLE_PHASE.CATCH_FAIL_WILD:
          await this.battleSprite.runShakeBall(Math.floor(Math.random() * 2));
          await this.battleSprite.runFailBall(data as { item: string; flee: boolean });
          this.updateEatenBerry(null);
          await this.talkMessage.show({
            type: 'default',
            content: replacePercentSymbol(i18next.t('message:battle_catch_fail'), [i18next.t(`pokemon:${this.targetWild?.getData().pokedex}.name`)]),
            speed: Option.getTextSpeed()!,
            endDelay: MessageEndDelay.DEFAULT,
          });

          if ((data as { flee: boolean }).flee) {
            await this.fleeWild();
          } else {
            this.addPhase(BATTLE_PHASE.IDLE);
          }
          break;
        case BATTLE_PHASE.FLEE_WILD:
          break;
        case BATTLE_PHASE.FLEE_PLAYER:
          await this.fleePlayer();
          break;
        default:
          throw new Error(`Unknown phase: ${phase}`);
      }
    } finally {
      this.isProcessingPhase = false;
      if (this.phaseQueue.length > 0) {
        const nextTask = this.phaseQueue.shift();
        if (nextTask) {
          void this.handlePhase(nextTask);
        }
      }
    }
  }

  updateEatenBerry(berry: string | null) {
    this.targetWild?.updateData({ eaten_berry: berry });
    this.battleInfo.updateEatenBerry(berry);
  }

  private async fleePlayer(): Promise<void> {
    playEffectSound(this.scene, AUDIO.FLEE);

    await this.talkMessage.show({
      type: 'default',
      content: replacePercentSymbol(i18next.t('message:battle_flee_player'), [PlayerGlobal.getData()?.nickname]),
      speed: Option.getTextSpeed()!,
      endDelay: MessageEndDelay.FLEE,
    });

    this.clean();
    runFadeEffect(this.scene, 1000, 'in');

    this.targetWild?.scheduleRandomMovement();
    await Game.removeUi(UI.BATTLE);
  }

  private async fleeWild(): Promise<void> {
    playEffectSound(this.scene, AUDIO.FLEE);
    await this.talkMessage.show({
      type: 'default',
      content: replacePercentSymbol(i18next.t('message:battle_flee_wild'), [i18next.t(`pokemon:${this.targetWild?.getData().pokedex}.name`)]),
      speed: Option.getTextSpeed()!,
      endDelay: MessageEndDelay.FLEE,
    });
    this.clean();
    runFadeEffect(this.scene, 1000, 'in');

    this.targetWild?.caught();
    await Game.removeUi(UI.BATTLE);
  }

  private async exitBattle(): Promise<void> {
    this.clean();
    this.targetWild?.caught();
    runFadeEffect(this.scene, 1000, 'in');
    await Game.removeUi(UI.BATTLE);
  }

  getTargetWild(): WildOverworldObj | null {
    return this.targetWild;
  }

  getArea(): BATTLE_AREA | null {
    return this.area;
  }

  getTime(): TIME | null {
    return this.time;
  }
}

export class BattleBaseUi extends Ui {
  private battle: Battle;
  private battleSprite: BattleSpriteUi;
  private battleInfo: BattleInfoUi;
  private introMessage: TalkMessageUi;

  private container!: Phaser.GameObjects.Container;
  private effectContainer!: Phaser.GameObjects.Container;
  private baseWindow!: Phaser.GameObjects.NineSlice;
  private bg!: Phaser.GameObjects.Image;
  private overlay0!: Phaser.GameObjects.Image;
  private overlay1!: Phaser.GameObjects.Image;
  private particleEffect!: Phaser.GameObjects.Image;
  private effect!: Phaser.GameObjects.Sprite;

  private readonly baseWindowScale: number = 4;

  constructor(scene: InGameScene, battle: Battle, battleSprite: BattleSpriteUi, battleInfo: BattleInfoUi) {
    super(scene);
    this.battle = battle;
    this.battleSprite = battleSprite;
    this.battleInfo = battleInfo;

    this.introMessage = new TalkMessageUi(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.introMessage.setup();

    this.container = this.createContainer(width / 2, height / 2);
    this.effectContainer = this.createContainer(width / 2, height / 2);

    this.baseWindow = this.addWindow(Option.getFrame('text') as string, 0, +410, 480, 260 / this.baseWindowScale, 16, 16, 16, 16).setScale(this.baseWindowScale);
    this.bg = this.addBackground(TEXTURE.BG_BLACK).setOrigin(0.5, 0.5).setScale(4);
    this.overlay0 = this.addBackground(TEXTURE.BG_BLACK).setOrigin(0.5, 0.5);
    this.overlay1 = this.addBackground(TEXTURE.BG_BLACK).setOrigin(0.5, 0.5);
    this.effect = this.createSprite(TEXTURE.BLANK, +500, -200).setScale(8).setOrigin(0.5, 0.5);

    this.particleEffect = this.addImage(TEXTURE.PARTICLE_BALL_1, 0, 0).setOrigin(0.5, 0.5).setScale(6);

    this.overlay0.setTintFill(0xffffff);
    this.overlay1.setTintFill(0xffffff);
    this.overlay0.setAlpha(0);
    this.overlay1.setAlpha(0);
    this.particleEffect.setVisible(false);
    this.overlay0.setVisible(false);
    this.overlay1.setVisible(false);
    this.baseWindow.setVisible(false);

    this.container.add(this.bg);
    this.container.add(this.overlay0);
    this.container.add(this.particleEffect);
    this.container.add(this.baseWindow);
    this.container.add(this.overlay1);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE + 1);
    this.container.setScrollFactor(0);

    this.effectContainer.add(this.effect);

    this.effectContainer.setVisible(false);
    this.effectContainer.setDepth(DEPTH.BATTLE + 3);
    this.effectContainer.setScrollFactor(0);
  }

  async show(): Promise<void> {
    this.bg.setTexture(`bg_${this.battle.getArea()}_${this.battle.getTime()}`);

    await this.intro();
    await this.introMessage.show({
      type: 'default',
      content: replacePercentSymbol(i18next.t('message:battle_intro1'), [i18next.t(`pokemon:${this.battle.getTargetWild()?.getData().pokedex}.name`)]),
      speed: Option.getTextSpeed()!,
      endDelay: MessageEndDelay.DEFAULT,
    });
  }

  protected onClean(): void {
    this.container.setVisible(false);
    this.effectContainer.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  async intro(): Promise<void> {
    await delay(this.scene, 100);
    await runFlashEffect(this.scene, 100);
    await runFlashEffect(this.scene, 100);
    runWipeRifghtToLeftEffect(this.scene);
    await delay(this.scene, 1000);
    Event.emit(EVENT.DISABLE_DAY_NIGHT_FILTER);
    await stopPostPipeline(this.scene);

    await this.displayBattleIntro();
  }

  private async displayBattleIntro(): Promise<void> {
    const width = this.getWidth();
    const height = this.getHeight();

    this.overlay0.setVisible(true);
    this.overlay0.setTintFill(0x000000);
    this.overlay0.setAlpha(1);
    this.container.setVisible(true);

    await delay(this.scene, 300);

    this.overlay0.setTintFill(0x367d96);

    this.baseWindow.setVisible(true);
    this.baseWindow.setTintFill(0x000000);
    const baseWindowStartY = height / 2 + 300;
    const baseWindowTargetY = +410;
    this.baseWindow.setY(baseWindowStartY);

    this.scene.tweens.add({
      targets: this.baseWindow,
      y: baseWindowTargetY,
      duration: 400,
      ease: EASE.QUAD_EASEOUT,
    });

    await delay(this.scene, 300);

    this.particleEffect.setVisible(true);
    this.particleEffect.setAlpha(0);
    this.particleEffect.setScale(0);

    this.overlay1.setVisible(true);
    this.overlay1.setTintFill(0xffffff);
    this.overlay1.setAlpha(0);

    return new Promise<void>((resolve) => {
      let completedCount = 0;
      const checkComplete = () => {
        completedCount++;
        if (completedCount === 3) {
          this.overlay0.setVisible(false);
          this.particleEffect.setVisible(false);

          resolve();
        }
      };

      this.scene.tweens.add({
        targets: this.particleEffect,
        alpha: 1,
        duration: 500,
        ease: EASE.QUAD_EASEOUT,
        onComplete: checkComplete,
      });

      this.scene.tweens.add({
        targets: this.particleEffect,
        scale: 22,
        duration: 500,
        ease: EASE.LINEAR,
        onComplete: checkComplete,
      });

      this.scene.tweens.add({
        targets: this.overlay1,
        alpha: 1,
        duration: 800,
        delay: 100,
        ease: EASE.QUAD_EASEOUT,
        onComplete: async () => {
          this.overlay0.setVisible(false);
          this.particleEffect.setVisible(false);
          this.battleSprite.show();
          this.battleSprite.intro();
          this.baseWindow.clearTint();
          this.scene.tweens.add({
            targets: this.overlay1,
            alpha: 0,
            duration: 1500,
            ease: EASE.QUAD_EASEIN,
            onComplete: checkComplete,
          });
          await delay(this.scene, 1200);
          this.battleInfo.showWildInfo();
          this.battleInfo.showPlayerInfo();

          await this.showShinyEffect(this.battle.getTargetWild()?.getData().shiny ?? false);
        },
      });
    });
  }

  private showShinyEffect(shiny: boolean): Promise<void> {
    return new Promise((resolve) => {
      if (!shiny) {
        resolve();
        return;
      }

      this.effectContainer.setVisible(true);
      playEffectSound(this.scene, AUDIO.SHINY);

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
}

export class BattleSpriteUi extends Ui {
  private battle: Battle;

  private playerContainer!: Phaser.GameObjects.Container;
  private wildContainer!: Phaser.GameObjects.Container;
  private player!: Phaser.GameObjects.Sprite;
  private playerBase!: Phaser.GameObjects.Image;
  private wild!: Phaser.GameObjects.Image;
  private wildShadow!: Phaser.GameObjects.Image;
  private wildBase!: Phaser.GameObjects.Image;
  private throwItem!: Phaser.GameObjects.Sprite;

  private wildInfoEmotion!: Phaser.GameObjects.Sprite;
  private wildInfoBerry!: Phaser.GameObjects.Sprite;
  private wildInfoEffect!: Phaser.GameObjects.Sprite;
  private wildInfoParticles!: Phaser.GameObjects.Image[];
  private wildInfoStars!: Phaser.GameObjects.Image[];
  private particleEnterBallBg0!: Phaser.GameObjects.Image;
  private particleEnterBallBg1!: Phaser.GameObjects.Sprite;
  private particles: Phaser.GameObjects.Image[] = [];
  private particleStars: Phaser.GameObjects.Image[] = [];

  private readonly playerPosX: number = 900;
  private readonly wildPosX: number = 1000;
  private readonly throwItemScale: number = 2.4;
  private readonly wildScale: number = 4.5;
  private readonly particleCnt: number = 8;
  private readonly particleScale: number = 2.4;

  constructor(scene: InGameScene, battle: Battle) {
    super(scene);
    this.battle = battle;
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.playerContainer = this.createContainer(width / 2, height / 2);
    this.wildContainer = this.createContainer(width / 2, height / 2);

    this.playerContainer.setPosition(900, height / 2);
    this.wildContainer.setPosition(1000, height / 2);

    this.playerBase = this.addImage('', -410, +202).setScale(2.4);
    this.player = this.createSprite('', -400, +16).setScale(4.4).setOrigin(0.5, 0.5);
    this.throwItem = this.createSprite(`item030`, -230, +110).setOrigin(0.5, 0.5).setScale(this.throwItemScale).setVisible(false);

    this.wildBase = this.addImage('', +500, -100).setOrigin(0.5, 0.5).setScale(2.8);
    this.wildShadow = this.addImage('', +500, -100).setScale(2.2).setOrigin(0.5, 0.5).setAlpha(0.5);
    this.wild = this.addImage('', +500, -200).setScale(this.wildScale).setOrigin(0.5, 0.5);

    this.playerContainer.add(this.playerBase);
    this.playerContainer.add(this.player);
    this.playerContainer.add(this.throwItem);
    this.wildContainer.add(this.wildBase);
    this.wildContainer.add(this.wildShadow);
    this.wildContainer.add(this.wild);
    for (let i = 0; i < this.particleCnt; i++) {
      const tex = TEXTURE.PARTICLE_BALL_0;
      const p = this.addImage(tex, 0, 0).setOrigin(0.5, 0.5).setAlpha(1).setVisible(false);

      this.particles.push(p);
      this.wildContainer.add(p);
    }

    for (let i = 0; i < 3; i++) {
      const p = this.addImage(TEXTURE.PARTICLE_STAR, 0, 0).setOrigin(0.5, 0.5).setAlpha(1).setVisible(false);
      this.particleStars.push(p);
      this.wildContainer.add(p);
    }

    this.particleEnterBallBg0 = this.addImage(TEXTURE.BLANK, 0, 0).setOrigin(0.5, 0.5).setAlpha(1).setVisible(false);
    this.particleEnterBallBg1 = this.createSprite(TEXTURE.BLANK, 0, 0).setOrigin(0.5, 0.5).setAlpha(1).setVisible(false);
    this.wildContainer.add(this.particleEnterBallBg0);
    this.wildContainer.add(this.particleEnterBallBg1);

    this.playerContainer.setVisible(false);
    this.playerContainer.setDepth(DEPTH.BATTLE + 3);
    this.playerContainer.setScrollFactor(0);

    this.wildContainer.setVisible(false);
    this.wildContainer.setDepth(DEPTH.BATTLE + 2);
    this.wildContainer.setScrollFactor(0);
  }

  show() {
    const targetWild = this.battle.getTargetWild()?.getData();
    const playerData = PlayerGlobal.getData();
    const area = this.battle.getArea();
    const time = this.battle.getTime();

    this.playerBase.setTexture(`pb_${area}_${time}`);
    this.wildBase.setTexture(`eb_${area}_${time}`);

    const playerTexture = `${playerData?.gender}_${playerData?.avatar}_back`;
    const PokemonData = getPokemonInfo(Number(targetWild?.pokedex));
    const shiny = targetWild?.shiny ? 's' : '';
    const gender = targetWild?.gender === 'male' ? 'm' : targetWild?.gender === 'female' ? 'f' : 'm';

    this.player.setTexture(playerTexture);
    this.wild.setTexture(`pokemon_sprite${targetWild?.pokedex}_${gender}${shiny}`);
    this.wild.setPosition(500, -200 + (PokemonData?.offsetY ?? 0));
    this.wildShadow.setTexture(`battle_shadow_${PokemonData?.shadow ?? 0}`);
    this.wildShadow.setPosition(500 + (PokemonData?.shadowOffsetX ?? 0), -100);

    this.playerContainer.setVisible(true);
    this.wildContainer.setVisible(true);
  }

  protected onClean(): void {
    this.playerContainer.setVisible(false);
    this.wildContainer.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  async intro(): Promise<void> {
    const width = this.getWidth();

    const playerStartX = 1500;
    const wildStartX = -500;

    this.playerContainer.setX(playerStartX);
    this.wildContainer.setX(wildStartX);

    return new Promise<void>((resolve) => {
      let completedCount = 0;
      const onComplete = () => {
        completedCount++;
        if (completedCount === 2) {
          playEffectSound(this.scene, `${parseInt(this.battle.getTargetWild()?.getData().pokedex!) ?? '1'}`);
          resolve();
        }
      };

      this.scene.tweens.add({
        targets: this.playerContainer,
        x: this.playerPosX,
        duration: 1200,
        ease: EASE.LINEAR,
        onComplete,
      });

      this.scene.tweens.add({
        targets: this.wildContainer,
        x: this.wildPosX,
        duration: 1200,
        ease: EASE.LINEAR,
        onComplete,
      });
    });
  }

  async readyThrowItem(item: string): Promise<void> {
    const playerData = PlayerGlobal.getData();

    this.scene.tweens.killTweensOf(this.throwItem);
    this.throwItem.setVisible(false);
    this.throwItem.setAngle(0);
    this.throwItem.setOrigin(0.5, 1);
    this.throwItem.setScale(this.throwItemScale);
    this.throwItem.setAlpha(1);

    return new Promise<void>((resolve) => {
      const hasAnim = this.player.anims.animationManager.exists(this.getPlayerThrowAnimKey());
      if (hasAnim) {
        this.player.anims.play({ key: this.getPlayerThrowAnimKey(), repeat: 0, frameRate: 8, delay: 0 });
        this.player.once('animationcomplete', () => {
          playEffectSound(this.scene, AUDIO.THROW);
          this.throwItem.setVisible(true);
          this.throwItem.setTexture(`item${item}`);
          resolve();
        });
      }
    });
  }

  async runThrowItem(item: string): Promise<void> {
    const startX: number = -300;
    const startY: number = 150;
    const endX: number = 600;
    const endY: number = -200;
    const peakHeight = -300;
    const duration = 500;

    return new Promise<void>((resolve) => {
      this.throwItem.setPosition(startX, startY);
      this.throwItem.setScale(this.throwItemScale);

      if (checkItemType(item) === ItemCategory.POKEBALL) {
        this.throwItem.anims.play({ key: `ball_${item}_launch`, repeat: 0, frameRate: 12 });
      }

      this.scene.tweens.add({
        targets: this.throwItem,
        x: endX,
        duration: duration,
        ease: EASE.LINEAR,
        onUpdate: (tween) => {
          const progress = tween.progress;
          const parabola = -4 * peakHeight * (progress - 0.5) ** 2 + peakHeight;
          this.throwItem.y = startY + (endY - startY) * progress + parabola;
        },
        onComplete: async () => {
          this.throwItem.setPosition(endX, endY);

          const animation = this.player.scene.anims.get(this.getPlayerThrowAnimKey());
          const firstFrame = animation.frames[0];
          this.player.setTexture(firstFrame.textureKey, firstFrame.textureFrame);

          const launchKey = this.getPokeballLaunchKey(item);
          if (this.throwItem.anims.animationManager.exists(launchKey)) {
            this.throwItem.anims.stop();

            await delay(this.scene, 200);

            const animation = this.throwItem.scene.anims.get(launchKey);
            const firstFrame = animation.frames[0];
            this.throwItem.setTexture(firstFrame.textureKey, firstFrame.textureFrame);
          }
          this.battle.addPhase(BATTLE_PHASE.ENTER_WILD, item);
          resolve();
        },
      });
    });
  }

  async enterItem(item: string) {
    const type = checkItemType(item);

    switch (type) {
      case ItemCategory.POKEBALL:
        await this.runEnterBall(item);
        await this.runDropBall(item);
        break;
      case ItemCategory.BERRY:
        await this.runEnterBerry(item);

        const ret = await feedWildEatenBerryApi({ idx: this.battle.getTargetWild()?.getData().idx!, berry: item });
        if (ret && ret.result) {
          this.battle.updateEatenBerry(item);
          this.battle.addPhase(BATTLE_PHASE.IDLE);
        } else {
          this.battle.addPhase(BATTLE_PHASE.IDLE);
        }
        break;
    }
  }

  private async runEnterBall(item: string) {
    const centerX = this.throwItem.x;
    const centerY = this.throwItem.y;
    const localCX = centerX;
    const localCY = centerY;

    for (const particle of this.particles) {
      this.scene.tweens.killTweensOf(particle);
      particle.setPosition(localCX, localCY);
      particle.setAlpha(2);
      particle.setScale(this.particleScale);
      particle.setVisible(false);
      particle.setAngle(0);
    }

    this.scene.tweens.killTweensOf(this.particleEnterBallBg0);
    this.particleEnterBallBg0.setPosition(localCX, localCY);
    this.particleEnterBallBg0.setScale(2);
    this.particleEnterBallBg0.setAlpha(1);
    this.particleEnterBallBg0.setOrigin(0.5, 1);
    this.particleEnterBallBg0.setVisible(false);

    this.scene.tweens.killTweensOf(this.particleEnterBallBg1);
    this.particleEnterBallBg1.setPosition(localCX, localCY);
    this.particleEnterBallBg1.setScale(2);
    this.particleEnterBallBg1.setAlpha(1);
    this.particleEnterBallBg1.setVisible(false);
    this.particleEnterBallBg1.setOrigin(0.5, 1);
    this.particleEnterBallBg1.anims.stop();

    this.scene.tweens.killTweensOf(this.wild);
    this.wild.clearTint();
    this.wild.setScale(this.wildScale);
    this.wild.setAlpha(1);
    this.wild.setVisible(true);

    this.throwItem.anims.stop();

    await delay(this.scene, 500);

    const ballEnter = new Promise<void>((resolve) => {
      const enterKey = `ball_${item}_enter`;
      this.wildShadow.setVisible(false);
      playEffectSound(this.scene, AUDIO.BALL_ENTER);
      this.throwItem.anims.play({ key: enterKey, repeat: 0, frameRate: 12 });
      this.throwItem.once('animationcomplete', () => resolve());
    });

    const wildShrink = new Promise<void>((resolve) => {
      this.wild.setTintFill(0xffffff);
      this.scene.tweens.add({
        targets: this.wild,
        duration: 500,
        ease: EASE.LINEAR,
        onComplete: () => {
          this.scene.tweens.add({
            targets: this.wild,
            scaleX: 0.1,
            scaleY: 0.1,
            alpha: 0,
            duration: 500,
            ease: EASE.LINEAR,
            onComplete: () => {
              this.wild.setVisible(false);
              this.wild.setTint(0xffffff);
              this.wild.setScale(1);
              this.wild.setAlpha(1);
              resolve();
            },
          });
        },
      });
    });

    const particleBurst = new Promise<void>((resolve) => {
      const maxRadius = 200;
      const spiralTurns = 0.3;
      const expandDuration = 500;
      const contractDuration = 500;

      let completedCount = 0;

      const done = () => {
        completedCount++;
        if (completedCount === this.particleCnt) {
          const animation = this.throwItem.scene.anims.get(`ball_${item}_launch`);
          const firstFrame = animation.frames[0];
          this.throwItem.setTexture(firstFrame.textureKey, firstFrame.textureFrame);
          resolve();
        }
      };
      const particleOffsetX = -100;
      const particleOffsetY = +30;
      this.particles.forEach((particle, index) => {
        particle.setPosition(localCX + particleOffsetX, localCY + particleOffsetY);
        particle.setScale(this.particleScale);
        particle.setAlpha(1);
        particle.setOrigin(0.5, 1);
        particle.setVisible(true);

        const startAngle = (index / this.particleCnt) * Math.PI * 2;

        const expand = { t: 0 } as { t: number };
        this.scene.tweens.add({
          targets: expand,
          t: 1,
          duration: expandDuration,
          ease: EASE.LINEAR,
          onUpdate: () => {
            const angle = startAngle - expand.t * spiralTurns * Math.PI * 2;
            const r = maxRadius * expand.t;
            particle.setPosition(localCX + r * Math.cos(angle) + particleOffsetX, localCY + r * Math.sin(angle) + particleOffsetY);
          },
          onComplete: () => {
            const contract = { t: 0 } as { t: number };
            this.scene.tweens.add({
              targets: contract,
              t: 1,
              duration: contractDuration,
              ease: EASE.LINEAR,
              onUpdate: () => {
                const angle = startAngle - spiralTurns * Math.PI * 2 - contract.t * spiralTurns * Math.PI * 2;
                const r = maxRadius * (1 - contract.t);
                particle.setPosition(localCX + r * Math.cos(angle) + particleOffsetX, localCY + r * Math.sin(angle) + particleOffsetY);
              },
              onComplete: () => {
                particle.setPosition(localCX + particleOffsetX, localCY + particleOffsetY);
                particle.setScale(this.particleScale);
                particle.setAlpha(0);
                done();
              },
            });
          },
        });
      });
    });

    await Promise.all([ballEnter, wildShrink, particleBurst]);

    await new Promise<void>((resolve) => {
      this.particleEnterBallBg1.setOrigin(0.5, 0.5);
      this.particleEnterBallBg1.setPosition(localCX - 100, localCY - 30);
      this.particleEnterBallBg1.setVisible(true);

      const animationKey = ANIMATION.PARTICLE_ENTER_BALL;
      this.particleEnterBallBg1.anims.play({ key: animationKey, repeat: 0, frameRate: 12 });

      this.scene.tweens.add({
        targets: this.particleEnterBallBg1,
        duration: 600,
        ease: EASE.LINEAR,
        onComplete: () => {
          this.scene.tweens.add({
            scaleX: 4,
            scaleY: 4,
            targets: this.particleEnterBallBg1,
            alpha: 0,
            duration: 600,
            ease: EASE.LINEAR,
            onComplete: () => {
              this.particleEnterBallBg1.setScale(4);
              this.particleEnterBallBg1.setAlpha(1);
              this.particleEnterBallBg1.setVisible(false);

              this.scene.tweens.add({
                targets: this.throwItem,
                tint: 0xffff00,
                duration: 200,
                ease: EASE.LINEAR,
                onComplete: () => {
                  this.scene.tweens.add({
                    targets: this.throwItem,
                    tint: 0xffffff,
                    duration: 200,
                    ease: EASE.LINEAR,
                    onComplete: () => {
                      this.throwItem.clearTint();
                      resolve();
                    },
                  });
                },
              });
            },
          });
        },
      });
    });
  }

  private async runDropBall(item: string): Promise<void> {
    return new Promise((resolve) => {
      const startY = this.throwItem.y;
      const targetY = -90;

      let prevY = startY;
      let falling = true;
      let bounceCount = 0;

      this.scene.tweens.add({
        targets: this.throwItem,
        y: targetY,
        duration: 500,
        ease: EASE.BOUNCE_EASEOUT,
        onUpdate: () => {
          const currentY = this.throwItem.y;

          if (falling && currentY >= prevY) {
            bounceCount++;
            playEffectSound(this.scene, AUDIO.BALL_DROP);
            falling = false;
          }

          if (!falling && currentY < prevY) {
            falling = true;
          }

          prevY = currentY;
        },
        onComplete: () => {
          this.throwItem.setY(targetY);
          this.battle.addPhase(BATTLE_PHASE.CHECK_CATCH_WILD, item);
          resolve();
        },
      });
    });
  }

  async runShakeBall(shakeCnt: number): Promise<void> {
    return new Promise((resolve) => {
      const shakeAngle = 20;
      const shakeDuration = 200;
      let current = 0;
      let cnt = shakeCnt;

      this.scene.tweens.killTweensOf(this.throwItem);
      this.throwItem.setAngle(0);
      this.throwItem.setOrigin(0.5, 1);

      const playOneShake = async () => {
        if (current >= cnt) {
          this.scene.tweens.add({
            targets: this.throwItem,
            angle: 0,
            duration: shakeDuration,
            ease: EASE.QUART_EASEOUT,
            onComplete: () => {
              resolve();
            },
          });
          return;
        }

        await delay(this.scene, 500);
        playEffectSound(this.scene, AUDIO.BALL_SHAKE);

        this.scene.tweens.add({
          targets: this.throwItem,
          angle: -shakeAngle,
          duration: shakeDuration,
          ease: EASE.QUART_EASEINOUT,
          onComplete: () => {
            this.scene.tweens.add({
              targets: this.throwItem,
              angle: shakeAngle,
              duration: shakeDuration,
              ease: EASE.QUART_EASEINOUT,
              onComplete: () => {
                this.scene.tweens.add({
                  targets: this.throwItem,
                  angle: 0,
                  duration: shakeDuration,
                  ease: EASE.QUART_EASEOUT,
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

  async runCatchBall(): Promise<void> {
    await delay(this.scene, 500);

    return new Promise((resolve) => {
      playEffectSound(this.scene, AUDIO.BALL_CATCH);

      this.throwItem.setTint(0x5a5a5a);

      const ballX = this.throwItem.x;
      const ballY = this.throwItem.y;

      this.particleStars.forEach((star) => {
        this.scene.tweens.killTweensOf(star);
        star.setPosition(ballX - 100, ballY);
        star.setScale(1);
        star.setAlpha(1);
        star.setVisible(true);
        star.setAngle(0);
      });

      let completedStars = 0;

      this.particleStars.forEach((star, index) => {
        const targetAngle = [10, 80, 190];
        const angle = targetAngle[index] * (Math.PI / 180);
        const distance = 100;
        const peakHeight = 150;
        const fallDistance = 10;
        const dummy = { t: 0 };

        this.scene.tweens.add({
          targets: dummy,
          t: 1,
          duration: 400,
          ease: EASE.LINEAR,
          onUpdate: () => {
            const t = dummy.t;
            const currentX = ballX + Math.cos(angle) * distance * t;

            // Y: 포물선 궤적 (물리적으로 정확한 포물선)
            // t=0: 시작점, t=0.5: 최고점, t=1: 끝점
            // 포물선 공식: y = -4h(t - 0.5)^2 + h
            const parabola = -4 * peakHeight * Math.pow(t - 0.5, 2) + peakHeight;
            const currentY = ballY - parabola + t * fallDistance;

            star.setPosition(currentX - 100, currentY);
            star.setAngle(t * 360);
          },
          onComplete: () => {
            this.scene.tweens.add({
              targets: star,
              scaleX: 0.5,
              scaleY: 0.5,
              alpha: 0,
              duration: 200,
              ease: EASE.LINEAR,
              onComplete: () => {
                star.setVisible(false);
                completedStars++;
                if (completedStars === this.particleStars.length) {
                  resolve();
                }
              },
            });
          },
        });
      });
    });
  }

  async runFailBall({ item, flee }: { item: string; flee: boolean }): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.killTweensOf(this.wild);
      this.wild.setScale(0.1);
      this.wild.setAlpha(0);
      this.wild.setVisible(true);
      this.wild.setTintFill(0xffffff);

      this.throwItem.anims.stop();

      playEffectSound(this.scene, AUDIO.BALL_EXIT);

      this.scene.tweens.add({
        targets: this.wild,
        scaleX: this.wildScale,
        scaleY: this.wildScale,
        alpha: 1,
        duration: 300,
        ease: EASE.LINEAR,
        onStart: () => {
          this.throwItem.anims.play({
            key: `ball_${item}_enter`,
            repeat: 0,
            frameRate: 10,
          });
        },
        onComplete: async () => {
          await delay(this.scene, 100);

          this.wild.clearTint();
          this.battle.getTargetWild()?.updateData({ eaten_berry: null });
          this.throwItem.setTexture(TEXTURE.BLANK);
          this.wildShadow.setVisible(true);
          resolve();
        },
      });
    });
  }

  private async runEnterBerry(item: string): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.throwItem,
        duration: 1000,
        ease: EASE.BACK_EASEIN,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        onComplete: () => {
          resolve();
        },
      });
    });
  }

  private getPlayerThrowAnimKey(): string {
    const playerData = PlayerGlobal.getData();
    return `${playerData?.gender}_${playerData?.avatar}_back`;
  }

  private getPokeballLaunchKey(item: string): string {
    return `ball_${item}_launch`;
  }
}

export class BattleInfoUi extends Ui {
  private battle: Battle;

  private playerInfoContainer!: Phaser.GameObjects.Container;
  private wildInfoContainer!: Phaser.GameObjects.Container;
  private playerInfo!: Phaser.GameObjects.Image;
  private wildInfo!: Phaser.GameObjects.Image;
  private wildInfoShiny!: Phaser.GameObjects.Image;
  private wildInfoName!: Phaser.GameObjects.Text;
  private wildInfoGender!: Phaser.GameObjects.Text;
  private wildInfoType1!: Phaser.GameObjects.Image;
  private wildInfoType2!: Phaser.GameObjects.Image;
  private wildOwnedIcon!: Phaser.GameObjects.Image;
  private wildCount!: Phaser.GameObjects.Text;
  private wildCountTitle!: Phaser.GameObjects.Text;
  private wildEatenBerry!: Phaser.GameObjects.Image;
  private wildEatenBerryDummy!: Phaser.GameObjects.Image;
  private captureRateTitle!: Phaser.GameObjects.Text;
  private captureRate!: Phaser.GameObjects.Text;
  private fleeRateTitle!: Phaser.GameObjects.Text;
  private fleeRate!: Phaser.GameObjects.Text;
  private rateSymbol!: Phaser.GameObjects.Text;
  private parties: Phaser.GameObjects.Image[] = [];
  private shinies: Phaser.GameObjects.Image[] = [];

  constructor(scene: InGameScene, battle: Battle) {
    super(scene);
    this.battle = battle;
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.playerInfoContainer = this.createContainer(1500, height / 2 + 125);
    this.wildInfoContainer = this.createContainer(500, height / 2 - 250);

    this.playerInfo = this.addImage(TEXTURE.BATTLE_BAR, 0, 0).setOrigin(0.5, 0.5).setScale(3);
    this.wildInfo = this.addImage(TEXTURE.BATTLE_BAR, 0, 0).setOrigin(0.5, 0.5).setScale(3);
    this.wildInfoName = this.addText(-340, -35, '', TEXTSTYLE.MESSAGE_WHITE).setOrigin(0, 0.5).setScale(1.1);
    this.wildInfoShiny = this.addImage(TEXTURE.ICON_SHINY, 0, 0).setOrigin(0.5, 0.5).setScale(2.8);

    this.wildEatenBerry = this.addImage(TEXTURE.BLANK, -335, +145).setOrigin(0.5, 0.5).setScale(2);
    this.wildEatenBerryDummy = this.addImage(TEXTURE.BLANK, -335, +145).setOrigin(0.5, 0.5).setScale(2);

    this.wildOwnedIcon = this.addImage(TEXTURE.ICON_OWNED, -330, -125).setOrigin(0.5, 0.5).setScale(2.8);
    this.wildCountTitle = this.addText(-300, -130, 'x', TEXTSTYLE.MESSAGE_WHITE).setOrigin(0, 0.5).setScale(0.8);
    this.wildCount = this.addText(-350, -135, '0', TEXTSTYLE.SPLASH_TEXT).setOrigin(0, 0.5).setScale(0.6);

    this.wildInfoGender = this.addText(0, 0, '♂♀', TEXTSTYLE.MESSAGE_WHITE).setOrigin(0, 0.5).setScale(1.1);
    this.wildInfoType1 = this.addImage(TEXTURE.BLANK, 110, -130).setScale(1.8);
    this.wildInfoType2 = this.addImage(TEXTURE.BLANK, 240, -130).setScale(1.8);
    this.captureRateTitle = this.addText(-350, 0, i18next.t('menu:battleCaptureRateTitle') + ' : ', TEXTSTYLE.MESSAGE_WHITE)
      .setOrigin(0, 0.5)
      .setScale(0.6);
    this.captureRate = this.addText(-350, 0, '000.0%', TEXTSTYLE.SPLASH_TEXT).setOrigin(0, 0.5).setScale(0.4);
    this.fleeRateTitle = this.addText(-350, 0, i18next.t('menu:battleFleeRateTitle') + ' : ', TEXTSTYLE.MESSAGE_WHITE)
      .setOrigin(0, 0.5)
      .setScale(0.6);
    this.fleeRate = this.addText(-350, 0, '000.0%', TEXTSTYLE.SPLASH_TEXT).setOrigin(0, 0.5).setScale(0.4);
    this.rateSymbol = this.addText(-350, 0, '/', TEXTSTYLE.MESSAGE_WHITE).setOrigin(0, 0.5).setScale(0.6);

    this.playerInfo.setFlipX(true);
    this.playerInfoContainer.add(this.playerInfo);

    const contentWidth = 80;
    const spacing = 20;
    let currentX = -215;
    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      const icon = this.addImage(`pokemon_icon000`, currentX, -45).setScale(1.4);
      const shiny = this.addImage(TEXTURE.BLANK, currentX - 30, -65).setScale(2.2);

      this.parties.push(icon);
      this.shinies.push(shiny);

      this.playerInfoContainer.add(icon);
      this.playerInfoContainer.add(shiny);

      currentX += contentWidth + spacing;
    }
    this.wildInfoContainer.add(this.wildInfo);
    this.wildInfoContainer.add(this.wildInfoName);
    this.wildInfoContainer.add(this.wildInfoShiny);
    this.wildInfoContainer.add(this.wildInfoGender);
    this.wildInfoContainer.add(this.wildInfoType1);
    this.wildInfoContainer.add(this.wildInfoType2);
    this.wildInfoContainer.add(this.captureRateTitle);
    this.wildInfoContainer.add(this.captureRate);
    this.wildInfoContainer.add(this.fleeRateTitle);
    this.wildInfoContainer.add(this.fleeRate);
    this.wildInfoContainer.add(this.wildOwnedIcon);
    this.wildInfoContainer.add(this.wildCount);
    this.wildInfoContainer.add(this.wildCountTitle);
    this.wildInfoContainer.add(this.rateSymbol);
    this.wildInfoContainer.add(this.wildEatenBerry);
    this.wildInfoContainer.add(this.wildEatenBerryDummy);

    this.playerInfoContainer.setVisible(false);
    this.playerInfoContainer.setDepth(DEPTH.BATTLE + 2);
    this.playerInfoContainer.setScrollFactor(0);

    this.wildInfoContainer.setVisible(false);
    this.wildInfoContainer.setDepth(DEPTH.BATTLE + 2);
    this.wildInfoContainer.setScrollFactor(0);
  }

  show(data?: any) {}

  showWildInfo(data?: any) {
    const targetWild = this.battle.getTargetWild()?.getData();

    this.wildInfoContainer.setVisible(true);
    delay(this.scene, 1500);
    this.wildInfoIntro();
    this.wildInfoName.setText(i18next.t(`pokemon:${targetWild?.pokedex}.name`));
    this.showGender();
    this.showType();
    this.showShiny();
    this.showCount();
    this.showCaptureRate();
    this.showFleeRate();
    this.updateEatenBerry(targetWild?.eaten_berry ?? null);
  }

  showPlayerInfo(data?: any) {
    this.playerInfoContainer.setVisible(true);

    let idx = 0;
    for (const party of PC.getParty()) {
      if (party) {
        this.parties[idx].setTexture(`pokemon_icon${party.getPokedex()}${party.getShiny() ? 's' : ''}`);
        this.shinies[idx].setTexture(party.getShiny() ? TEXTURE.ICON_SHINY : TEXTURE.BLANK);
      } else {
        this.parties[idx].setTexture('pokemon_icon000');
        this.shinies[idx].setTexture(TEXTURE.BLANK);
      }

      idx++;
    }

    this.playerInfoIntro();
  }

  protected onClean(): void {
    this.playerInfoContainer.setVisible(false);
    this.wildInfoContainer.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  wildInfoIntro() {
    const startX = -500;
    const endX = 500;
    this.wildInfoContainer.setX(startX);

    this.scene.tweens.add({
      targets: this.wildInfoContainer,
      x: endX,
      duration: 800,
      ease: EASE.QUAD_EASEOUT,
      onComplete: () => {},
    });
  }

  playerInfoIntro() {
    const startX = 2000;
    const endX = 1470;
    this.playerInfoContainer.setX(startX);

    this.scene.tweens.add({
      targets: this.playerInfoContainer,
      x: endX,
      duration: 800,
      ease: EASE.QUAD_EASEOUT,
      onComplete: () => {},
    });
  }

  private showGender() {
    const targetWild = this.battle.getTargetWild()?.getData();

    this.wildInfoGender.setPosition(this.wildInfoName.x + this.wildInfoName.displayWidth, -35);

    if (targetWild?.gender === 'male') {
      this.wildInfoGender.setText(`♂`);
      this.wildInfoGender.setStyle(getTextStyle(TEXTSTYLE.GENDER_0));
    }
    if (targetWild?.gender === 'female') {
      this.wildInfoGender.setText(`♀`);
      this.wildInfoGender.setStyle(getTextStyle(TEXTSTYLE.GENDER_1));
    }
  }

  private showType() {
    const targetWild = this.battle.getTargetWild()?.getData();

    const type1 = getPokemonType(targetWild?.type1 ?? null);
    const type2 = getPokemonType(targetWild?.type2 ?? null);

    if (type1 && type2) {
      this.wildInfoType1.setTexture(TEXTURE.TYPES, `types-${type1}`);
      this.wildInfoType2.setTexture(TEXTURE.TYPES, `types-${type2}`);
    } else if (type1 && !type2) {
      this.wildInfoType1.setTexture(TEXTURE.BLANK);
      this.wildInfoType2.setTexture(TEXTURE.TYPES, `types-${type1}`);
    } else {
      this.wildInfoType1.setTexture(TEXTURE.BLANK);
      this.wildInfoType2.setTexture(TEXTURE.BLANK);
    }
  }

  private showShiny() {
    const targetWild = this.battle.getTargetWild()?.getData();

    this.wildInfoShiny.setPosition(this.wildInfoGender.x + this.wildInfoGender.displayWidth + 25, -35);
    this.wildInfoShiny.setVisible(targetWild?.shiny ?? false);
  }

  private showCount() {
    const targetWild = this.battle.getTargetWild()?.getData();

    this.wildCount.setVisible(targetWild?.count === 0 ? false : true);
    this.wildCountTitle.setVisible(targetWild?.count === 0 ? false : true);
    this.wildOwnedIcon.setVisible(targetWild?.count === 0 ? false : true);

    this.wildCount.setPosition(this.wildCountTitle.x + this.wildCountTitle.displayWidth + 7, -130);
    this.wildCount.setText(targetWild?.count?.toString() ?? '0');
  }

  private showCaptureRate() {
    const targetWild = this.battle.getTargetWild()?.getData();

    this.captureRateTitle.setPosition(-350, +60);
    this.captureRate.setPosition(this.captureRateTitle.x + this.captureRateTitle.displayWidth + 7, +58);
    this.captureRate.setText(this.calcRate(targetWild?.baseRate ?? 0));

    this.rateSymbol.setPosition(this.captureRate.x + this.captureRate.displayWidth + 35, +58);
  }

  private showFleeRate() {
    const targetWild = this.battle.getTargetWild()?.getData();

    this.fleeRateTitle.setPosition(this.rateSymbol.x + this.rateSymbol.displayWidth + 35, +60);
    this.fleeRate.setPosition(this.fleeRateTitle.x + this.fleeRateTitle.displayWidth + 7, +58);
    this.fleeRate.setText(this.calcRate(targetWild?.fleeRate ?? 0));
  }

  private calcRate(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }

  updateEatenBerry(berry: string | null) {
    if (!berry) {
      this.wildEatenBerry.setTexture(TEXTURE.BLANK);
      this.wildEatenBerry.clearTint();
      this.wildEatenBerryDummy.setTexture(TEXTURE.BLANK);
      this.wildEatenBerryDummy.clearTint();
      return;
    }

    this.wildEatenBerry.setTexture(`item${berry}`);
    this.wildEatenBerryDummy.setTexture(`item${berry}`);
    this.wildEatenBerryDummy.setTintFill(0xffffff);
    this.wildEatenBerryDummy.setAlpha(1);
    this.wildEatenBerryDummy.setVisible(true);

    this.scene.tweens.add({
      targets: this.wildEatenBerryDummy,
      alpha: 0,
      duration: 500,
      ease: EASE.LINEAR,
      onComplete: () => {},
    });
  }

  updateCatchRate(berry: string | null, ball: string | null) {
    const targetWild = this.battle.getTargetWild()?.getData();

    let partyBonus = 0;
    for (const party of PC.getParty()) {
      if (party) {
        const shinyBonus = party.getShiny() ? 0.03 : 0;
        const countBonus = Math.min(party.getCount() * 0.005, 0.25);
        const rankBonus = matchPokemonWithRarityRate(party.getRank());

        partyBonus += shinyBonus + countBonus + rankBonus;
      }
    }

    let ballRate = 1.0;
    switch (ball) {
      case '002':
        ballRate = 1.0;
        break;
      case '003':
        ballRate = 1.5;
        break;
      case '004':
        ballRate = 2.0;
        break;
      default:
        ballRate = 1;
    }

    let targetBerry = !berry ? targetWild!.eaten_berry : berry;

    const berryRate = matchTypeWithBerryRate(targetBerry, targetWild!.type1!, targetWild!.type2!);
    const baseRate = targetWild!.baseRate * ballRate * berryRate;
    let finalRate = Math.min(baseRate + partyBonus, 1.0);

    if (ball === '001') finalRate = 1.0;

    this.captureRate.setText(this.calcRate(finalRate));
  }
}

export class BattleIdleUi extends Ui {
  private battle: Battle;

  private pokeballMenuList: MenuListUi;
  private berryMenuList: MenuListUi;
  private toolMenuList: MenuListUi;

  private menuContainer!: Phaser.GameObjects.Container;
  private messageContainer!: Phaser.GameObjects.Container;
  private menuWindow!: Phaser.GameObjects.NineSlice;
  private menuTexts: Phaser.GameObjects.Text[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];

  private lastChoice!: number;
  private isProcessing: boolean = false;

  private messageText!: Phaser.GameObjects.Text;
  private idleMessageTimers: Phaser.Time.TimerEvent[] = [];

  private readonly baseWindowScale: number = 4;
  private readonly menuWindowScale: number = 4;
  private readonly menus: string[] = [i18next.t('menu:battleSelect0'), i18next.t('menu:battleSelect1'), i18next.t('menu:battleSelect2'), i18next.t('menu:battleSelect3')];

  constructor(scene: InGameScene, battle: Battle) {
    super(scene);
    this.battle = battle;

    this.pokeballMenuList = new MenuListUi(scene, this);
    this.berryMenuList = new MenuListUi(scene, this);
    this.toolMenuList = new MenuListUi(scene, this);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.pokeballMenuList.setup({ scale: 1.8, etcScale: 2, windowWidth: 365, offsetX: 300, offsetY: 183, depth: DEPTH.MESSAGE - 1, per: 7, info: [], window: Option.getFrame('text') as string });

    this.berryMenuList.setup({ scale: 1.8, etcScale: 2, windowWidth: 328, offsetX: 362, offsetY: 183, depth: DEPTH.MESSAGE - 1, per: 7, info: [], window: Option.getFrame('text') as string });

    this.toolMenuList.setup({ scale: 1.8, etcScale: 2, windowWidth: 328, offsetX: 362, offsetY: 183, depth: DEPTH.MESSAGE - 1, per: 7, info: [], window: Option.getFrame('text') as string });

    this.menuContainer = this.createContainer(width / 2 + 660, height / 2 + 410);
    this.messageContainer = this.createContainer(width / 2 + 660, height / 2 + 410);
    this.menuWindow = this.addWindow(Option.getFrame('text') as string, -33, 0, 660 / this.menuWindowScale, 252 / this.menuWindowScale, 16, 16, 16, 16).setScale(this.menuWindowScale);
    this.menuTexts[0] = this.addText(-270, -35, this.menus[0], TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5).setScale(0.9);
    this.menuTexts[1] = this.addText(+30, -35, this.menus[1], TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5).setScale(0.9);
    this.menuTexts[2] = this.addText(-270, +35, this.menus[2], TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5).setScale(0.9);
    this.menuTexts[3] = this.addText(+30, +35, this.menus[3], TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0.5).setScale(0.9);

    this.messageText = this.addText(-1540, -75, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0).setScale(1);

    this.dummys[0] = this.addImage(TEXTURE.BLANK, -290, -35).setScale(2.4);
    this.dummys[1] = this.addImage(TEXTURE.BLANK, +10, -35).setScale(2.4);
    this.dummys[2] = this.addImage(TEXTURE.BLANK, -290, +35).setScale(2.4);
    this.dummys[3] = this.addImage(TEXTURE.BLANK, +10, +35).setScale(2.4);

    this.menuContainer.add(this.menuWindow);
    this.menuContainer.add(this.menuTexts[0]);
    this.menuContainer.add(this.menuTexts[1]);
    this.menuContainer.add(this.menuTexts[2]);
    this.menuContainer.add(this.menuTexts[3]);
    this.menuContainer.add(this.dummys[0]);
    this.menuContainer.add(this.dummys[1]);
    this.menuContainer.add(this.dummys[2]);
    this.menuContainer.add(this.dummys[3]);

    this.messageContainer.add(this.messageText);

    this.messageContainer.setVisible(false);
    this.messageContainer.setDepth(DEPTH.BATTLE + 3);
    this.messageContainer.setScrollFactor(0);

    this.menuContainer.setVisible(false);
    this.menuContainer.setDepth(DEPTH.BATTLE + 3);
    this.menuContainer.setScrollFactor(0);
  }

  show(data?: any) {
    this.isProcessing = false;
    this.menuContainer.setVisible(true);
    this.messageContainer.setVisible(true);

    this.intro();
    this.handleKeyInput();
  }

  protected onClean(): void {
    this.menuContainer.setVisible(false);
    this.messageContainer.setVisible(false);
    this.messageText.text = '';
    this.isProcessing = false;
  }

  pause(onoff: boolean, data?: any): void {}

  hide() {
    this.isProcessing = false;
    this.menuContainer.setVisible(false);
  }

  hideMessageText() {
    this.messageContainer.setVisible(false);
  }

  handleKeyInput(...data: any[]) {
    const targetWild = this.battle.getTargetWild()?.getData();
    const maxChoice = 3;
    const cols = 2;

    let choice = this.lastChoice ? this.lastChoice : 0;

    this.dummys[choice].setTexture(TEXTURE.ARROW_B);
    this.menuTexts[1].setStyle(getTextStyle(targetWild?.eaten_berry ? TEXTSTYLE.MESSAGE_GRAY : TEXTSTYLE.MESSAGE_BLACK));

    Keyboard.setAllowKey([KEY.ARROW_UP, KEY.ARROW_DOWN, KEY.ARROW_LEFT, KEY.ARROW_RIGHT, KEY.Z, KEY.ENTER]);
    Keyboard.setKeyDownCallback(async (key) => {
      if (this.isProcessing) {
        return;
      }

      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.ARROW_UP:
            if (choice - cols >= 0) choice -= cols;
            break;
          case KEY.ARROW_DOWN:
            if (choice + cols <= maxChoice) choice += cols;
            break;
          case KEY.ARROW_LEFT:
            if (choice % cols !== 0) choice--;
            break;
          case KEY.ARROW_RIGHT:
            if ((choice + 1) % cols !== 0 && choice + 1 <= maxChoice) choice++;
            break;
          case KEY.ENTER:
          case KEY.Z:
            if (this.isProcessing) {
              return;
            }

            this.isProcessing = true;
            playEffectSound(this.scene, AUDIO.SELECT_0);

            const target = this.menus[choice];
            this.lastChoice = choice;
            if (target === i18next.t('menu:battleSelect0')) {
              Keyboard.setKeyDownCallback(() => {});
              this.battle.addPhase(BATTLE_PHASE.SHOW_BALL_LIST);
            } else if (target === i18next.t('menu:battleSelect1')) {
              if (targetWild?.eaten_berry) {
                this.isProcessing = false;
                playEffectSound(this.scene, AUDIO.BUZZER);
              } else {
                Keyboard.setKeyDownCallback(() => {});
                this.battle.addPhase(BATTLE_PHASE.SHOW_BERRY_LIST);
              }
            } else if (target === i18next.t('menu:battleSelect2')) {
              this.isProcessing = false;
            } else if (target === i18next.t('menu:battleSelect3')) {
              this.battle.addPhase(BATTLE_PHASE.FLEE_PLAYER);
            }
            break;
        }

        if (choice !== prevChoice) {
          playEffectSound(this.scene, AUDIO.SELECT_0);

          this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
          this.dummys[choice].setTexture(TEXTURE.ARROW_B);
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
        this.isProcessing = false;
      }
    });
  }

  update(time?: number, delta?: number): void {}

  intro() {
    this.showIdleMessage(replacePercentSymbol(i18next.t('message:battle_idle'), [PlayerGlobal.getData()?.nickname]));
  }

  useItem(item: string) {
    this.showIdleMessage(replacePercentSymbol(i18next.t('message:battle_use'), [PlayerGlobal.getData()?.nickname, i18next.t(`item:${item}.name`)]));
  }

  showIdleMessage(message: string) {
    this.idleMessageTimers.forEach((timer) => {
      timer.remove();
    });
    this.idleMessageTimers = [];

    this.messageContainer.setVisible(true);

    this.messageText.text = '';

    const text = message.split('');
    let index = 0;
    let speed = Option.getTextSpeed()!;

    return new Promise((resolve) => {
      const addNextChar = () => {
        if (index < text.length) {
          this.messageText.text += text[index];
          index++;
          const timer = this.scene.time.delayedCall(speed, addNextChar, [], this);
          this.idleMessageTimers.push(timer);
        } else {
          this.idleMessageTimers = [];
          resolve(true);
        }
      };
      addNextChar();
    });
  }
}

export class BattleMenuListUi extends Ui {
  private battle: Battle;

  private pokeballMenuList: MenuListUi;
  private berryMenuList: MenuListUi;
  private toolMenuList: MenuListUi;
  private itemDescUi: BattleItemDescUi;

  constructor(scene: InGameScene, battle: Battle) {
    super(scene);
    this.battle = battle;

    this.itemDescUi = new BattleItemDescUi(scene, battle);
    this.pokeballMenuList = new MenuListUi(scene, this.itemDescUi);
    this.berryMenuList = new MenuListUi(scene, this.itemDescUi);
    this.toolMenuList = new MenuListUi(scene, this.itemDescUi);
  }

  setup(data?: any): void {
    this.itemDescUi.setup();

    this.pokeballMenuList.setup({ scale: 1.8, etcScale: 2, windowWidth: 365, offsetX: 300, offsetY: 183, depth: DEPTH.MESSAGE - 1, per: 7, info: [], window: Option.getFrame('text') as string });
    this.berryMenuList.setup({ scale: 1.8, etcScale: 2, windowWidth: 365, offsetX: 300, offsetY: 183, depth: DEPTH.MESSAGE - 1, per: 7, info: [], window: Option.getFrame('text') as string });
    this.toolMenuList.setup({ scale: 1.8, etcScale: 2, windowWidth: 365, offsetX: 300, offsetY: 183, depth: DEPTH.MESSAGE - 1, per: 7, info: [], window: Option.getFrame('text') as string });
  }

  async show(data?: 'ball' | 'berry' | 'tool'): Promise<void> {
    this.itemDescUi.show(data);

    if (data === 'ball') {
      const ret = await this.handlePokeBallMenuKeyInput();
      if (ret === 'cancel') {
        this.battle.addPhase(BATTLE_PHASE.IDLE);
        return;
      } else {
        this.battle.addPhase(BATTLE_PHASE.USE_BALL, ret.getKey());
      }
    } else if (data === 'berry') {
      const ret = await this.handleBerryMenuKeyInput();
      if (ret === 'cancel') {
        this.battle.addPhase(BATTLE_PHASE.IDLE);
        return;
      } else {
        this.battle.addPhase(BATTLE_PHASE.USE_BERRY, ret.getKey());
      }
    }
  }

  protected onClean(): void {}

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  private createPokeballMenuListForm(pokeballs: PlayerItem[]) {
    let ret: ListForm[] = [];

    for (const pokeball of pokeballs) {
      ret.push({
        name: i18next.t(`item:${pokeball.getKey()}.name`),
        nameImg: '',
        etc: `x${pokeball.getStock()}`,
        etcImg: '',
      });
    }

    return ret;
  }

  private createBerryMenuListForm(berries: PlayerItem[]) {
    let ret: ListForm[] = [];

    for (const berry of berries) {
      ret.push({
        name: i18next.t(`item:${berry.getKey()}.name`),
        nameImg: '',
        etc: `x${berry.getStock()}`,
        etcImg: '',
      });
    }

    return ret;
  }

  private async handlePokeBallMenuKeyInput(): Promise<'cancel' | PlayerItem> {
    const pokeballs = Object.values(Bag.getCategory(ItemCategory.POKEBALL));
    this.itemDescUi.setInfo(pokeballs);

    this.pokeballMenuList.updateInfo(this.createPokeballMenuListForm(pokeballs));
    const ret = await this.pokeballMenuList.handleKeyInput();

    this.pokeballMenuList.hide();
    this.itemDescUi.hide();
    if (ret === i18next.t('menu:cancelMenu')) {
      return 'cancel';
    } else {
      return pokeballs[ret as number];
    }
  }

  private async handleBerryMenuKeyInput(): Promise<'cancel' | PlayerItem> {
    const berries = Object.values(Bag.getCategory(ItemCategory.BERRY));
    this.itemDescUi.setInfo(berries);

    this.berryMenuList.updateInfo(this.createBerryMenuListForm(berries));
    const ret = await this.berryMenuList.handleKeyInput();

    this.berryMenuList.hide();
    this.itemDescUi.hide();
    if (ret === i18next.t('menu:cancelMenu')) {
      return 'cancel';
    } else {
      return berries[ret as number];
    }
  }
}

export class BattleItemDescUi extends Ui {
  private battle: Battle;

  private container!: Phaser.GameObjects.Container;
  private window!: Phaser.GameObjects.NineSlice;
  private item!: Phaser.GameObjects.Image;
  private text!: Phaser.GameObjects.Text;

  private itemInfo: PlayerItem[] = [];

  private readonly windowScale: number = 4;

  constructor(scene: InGameScene, battle: Battle) {
    super(scene);
    this.battle = battle;
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2 + 660, height / 2 + 410);
    this.window = this.addWindow(Option.getFrame('text') as string, 0, +410, 480, 260 / this.windowScale, 16, 16, 16, 16).setScale(this.windowScale);
    this.item = this.addImage(TEXTURE.BLANK, -1460, 0).setScale(2.4);
    this.text = this.addText(-1360, -65, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0).setScale(1);

    this.container.add(this.window);
    this.container.add(this.item);
    this.container.add(this.text);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE + 4);
    this.container.setScrollFactor(0);
  }

  show(data?: any) {
    this.container.setVisible(true);

    this.item.setTexture(`item${data}`);
    this.text.setText(i18next.t(`item:${data}.description`));
  }

  protected onClean(): void {}

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {
    const item = this.itemInfo[data[0]];
    if (item) {
      this.item.setTexture(`item${item.getKey()}`);
      this.text.setText(i18next.t(`item:${item.getKey()}.description`));

      if (checkItemType(item.getKey()) === ItemCategory.POKEBALL) {
        this.battle.updateCatchRate(null, item.getKey());
      } else if (checkItemType(item.getKey()) === ItemCategory.BERRY) {
        this.battle.updateCatchRate(item.getKey(), null);
      } else {
        this.battle.updateCatchRate(null, null);
      }
    }
  }

  update(time?: number, delta?: number): void {}

  hide() {
    this.container.setVisible(false);
    this.item.setTexture(TEXTURE.BLANK);
    this.text.setText('');
  }

  setInfo(items: PlayerItem[]) {
    this.itemInfo = items;
  }
}

type BattleRewardData = {
  pc: GetPcRes;
  wild: WildRes;
  candy: number;
  items: CatchRewardRes[];
};

export class BattleRewardUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private contentContainer!: Phaser.GameObjects.Container;
  private rewardContainer!: Phaser.GameObjects.Container;
  private targetContainers!: Phaser.GameObjects.Container[];
  private restoreTargetContainerPosY!: number[];

  private wild!: Phaser.GameObjects.Image;
  private wildPokedex!: Phaser.GameObjects.Text;
  private wildName!: Phaser.GameObjects.Text;
  private wildGender!: Phaser.GameObjects.Text;
  private wildShiny!: Phaser.GameObjects.Image;
  private type1!: Phaser.GameObjects.Image;
  private type2!: Phaser.GameObjects.Image;
  private wildSpecies!: Phaser.GameObjects.Text;
  private wildRank!: Phaser.GameObjects.Text;
  private rewardIcons: Phaser.GameObjects.Image[] = [];
  private rewardTexts: Phaser.GameObjects.Text[] = [];
  private rewardStocks: Phaser.GameObjects.Text[] = [];
  private rewardMessage!: Phaser.GameObjects.Text;
  private rewardMessageBlinkTween: Phaser.Tweens.Tween | null = null;

  private readonly windowWidth: number = 600;
  private readonly windowHeight: number = 400;
  private readonly overlay0Width: number = 448;
  private readonly overlay0Height: number = 40;
  private readonly overlay1Width: number = 310;
  private readonly overlay1Height: number = 60;
  private readonly rewardOverlayWidth: number = 900;
  private readonly rewardOverlayHeight: number = 200;
  private readonly ribbonWidth: number = 700;
  private readonly ribbonHeight: number = 130;
  private readonly textScale: number = 0.8;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);
    this.contentContainer = this.createContainer(width / 2, height / 2);
    this.rewardContainer = this.createContainer(width / 2, height / 2 + 260);

    this.wild = this.addImage('', -370, -130).setScale(4).setOrigin(0.5, 0.5);

    const bg = this.addBackground(TEXTURE.BG_BLACK).setOrigin(0.5, 0.5);
    const window = this.addWindow(TEXTURE.REWARD_WINDOW, 0, 0, this.windowWidth, this.windowHeight, 32, 32, 32, 32).setScale(2.4);
    const title = this.addText(0, -406, i18next.t('menu:reward_title'), TEXTSTYLE.ONLY_WHITE).setOrigin(0.5, 0.5).setScale(this.textScale).setStroke('#696969', 12);
    const overlay0 = this.addWindow(TEXTURE.REWARD_OVERLAY_0, 0, -396, this.overlay0Width, this.overlay0Height, 8, 8, 8, 8).setScale(3);
    const overlay1 = this.addWindow(TEXTURE.REWARD_OVERLAY_1, +270, -250, this.overlay1Width, this.overlay1Height, 8, 8, 8, 8).setScale(2.4);
    const overlay1Shadow = this.addWindow(TEXTURE.REWARD_OVERLAY_1, +280, -235, this.overlay1Width, this.overlay1Height, 8, 8, 8, 8).setScale(2.4).setAlpha(0.5).setTintFill(0x9f9f9f);

    const pokedexSymbol = this.addImage(TEXTURE.ICON_FOLLOW, -50, -285).setOrigin(0.5, 0.5).setScale(2);
    this.wildPokedex = this.addText(-10, -285, '0015', TEXTSTYLE.ONLY_WHITE).setOrigin(0, 0.5).setScale(this.textScale).setStroke('#696969', 12);
    this.wildName = this.addText(+120, -285, '한카리아스', TEXTSTYLE.ONLY_WHITE).setOrigin(0, 0.5).setScale(this.textScale).setStroke('#696969', 12);
    this.wildSpecies = this.addText(-80, -215, '', TEXTSTYLE.ONLY_WHITE).setOrigin(0, 0.5).setScale(this.textScale).setStroke('#696969', 12);
    const rankOverlay = this.addWindow(TEXTURE.REWARD_OVERLAY_2, +30, -70, 130, 70, 4, 4, 4, 4).setScale(2);
    const rankOverlayShadow = this.addWindow(TEXTURE.REWARD_OVERLAY_2, +40, -55, 130, 70, 4, 4, 4, 4).setScale(2).setAlpha(0.5).setTintFill(0x9f9f9f);
    const rankTitle = this.addText(+30, -135, i18next.t('menu:reward_rank'), TEXTSTYLE.ONLY_WHITE).setOrigin(0.5, 0).setScale(0.6).setStroke('#696969', 12);
    this.wildRank = this.addText(+30, -75, '', TEXTSTYLE.ONLY_WHITE).setOrigin(0.5, 0).setScale(0.8).setStroke('#696969', 12);
    const wildGenderOverlay = this.addWindow(TEXTURE.REWARD_OVERLAY_2, +265, -70, 80, 70, 4, 4, 4, 4).setScale(2);
    const wildGenderOverlayShadow = this.addWindow(TEXTURE.REWARD_OVERLAY_2, +275, -55, 80, 70, 4, 4, 4, 4).setScale(2).setAlpha(0.5).setTintFill(0x9f9f9f);
    const wildGenderTitle = this.addText(+265, -135, i18next.t('menu:reward_gender'), TEXTSTYLE.ONLY_WHITE).setOrigin(0.5, 0).setScale(0.6).setStroke('#696969', 12);
    this.wildGender = this.addText(+265, -40, '♂♀', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0.5, 0.5).setScale(this.textScale);
    this.type1 = this.addImage(TEXTURE.TYPES, +430, -112).setScale(2);
    this.type2 = this.addImage(TEXTURE.TYPES, +570, -112).setScale(2);
    const rewardOverlay = this.addWindow(TEXTURE.REWARD_OVERLAY_3, 0, +250, this.rewardOverlayWidth, this.rewardOverlayHeight, 16, 16, 16, 16).setScale(1.4);
    const ribbon = this.addImage(TEXTURE.RIBBON, 0, +110).setScale(1);
    const ribbonText = this.addText(0, +100, i18next.t('menu:reward_ribbon'), TEXTSTYLE.ONLY_WHITE).setOrigin(0.5, 0.5).setScale(this.textScale).setStroke('#696969', 12);
    ribbon.setDisplaySize(this.ribbonWidth, this.ribbonHeight);

    this.rewardMessage = this.addText(0, +423, i18next.t('menu:reward_message'), TEXTSTYLE.ONLY_WHITE).setOrigin(0.5, 0.5).setScale(0.6).setStroke('#696969', 12);

    this.wildShiny = this.addImage(TEXTURE.ICON_SHINY, -600, -285).setOrigin(0.5, 0.5).setScale(2.8);

    bg.setAlpha(0.5);
    this.container.add(bg);
    this.contentContainer.add(window);
    this.contentContainer.add(overlay0);
    this.contentContainer.add(title);
    this.contentContainer.add(overlay1Shadow);
    this.contentContainer.add(overlay1);
    this.contentContainer.add(this.wild);
    this.contentContainer.add(pokedexSymbol);
    this.contentContainer.add(this.wildPokedex);
    this.contentContainer.add(this.wildName);
    this.contentContainer.add(this.wildSpecies);
    this.contentContainer.add(rankOverlayShadow);
    this.contentContainer.add(rankOverlay);
    this.contentContainer.add(rankTitle);
    this.contentContainer.add(this.wildRank);
    this.contentContainer.add(wildGenderOverlayShadow);
    this.contentContainer.add(wildGenderOverlay);
    this.contentContainer.add(wildGenderTitle);
    this.contentContainer.add(this.wildGender);
    this.contentContainer.add(this.type1);
    this.contentContainer.add(this.type2);
    this.contentContainer.add(rewardOverlay);
    this.contentContainer.add(ribbon);
    this.contentContainer.add(ribbonText);
    this.contentContainer.add(this.wildShiny);
    this.contentContainer.add(this.rewardMessage);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TOP);
    this.container.setScrollFactor(0);

    this.contentContainer.setVisible(false);
    this.contentContainer.setDepth(DEPTH.TOP + 1);
    this.contentContainer.setScrollFactor(0);

    this.rewardContainer.setVisible(false);
    this.rewardContainer.setDepth(DEPTH.TOP + 2);
    this.rewardContainer.setScrollFactor(0);

    this.targetContainers = [this.contentContainer, this.rewardContainer];
    this.restoreTargetContainerPosY = [this.contentContainer.y, this.rewardContainer.y];
  }

  async show(data: BattleRewardData): Promise<void> {
    const wildData = data.wild;
    const pcData = data.pc;
    const candy = data.candy;
    const rewards = data.items;

    const shiny = wildData.shiny ? 's' : '';
    const gender = wildData.gender === 'male' ? 'm' : wildData.gender === 'female' ? 'f' : 'm';

    PC.addPokemonAfterCatch(pcData);

    this.wild.setTexture(`pokemon_sprite${wildData.pokedex}_${gender}${shiny}`);
    this.wildPokedex.setText(`${wildData.pokedex}`);
    this.wildName.setText(i18next.t(`pokemon:${wildData.pokedex}.name`));
    this.updateGenderSummary(wildData.gender);
    this.updateTypeSummary(getPokemonType(wildData.type1)!, getPokemonType(wildData.type2)!);
    this.updateShiny(wildData.shiny);
    this.wildSpecies.setText(i18next.t(`pokemon:${wildData.pokedex}.species`));
    this.wildRank.setText(i18next.t(`menu:${wildData.rank}`));

    this.cleanRewards();
    this.updateCandy(candy);
    this.updateRewards(rewards);

    playEffectSound(this.scene, AUDIO.REWARD);
    this.container.setVisible(true);
    for (const container of this.targetContainers) {
      container.y += 70;
      container.setAlpha(0);
      container.setVisible(true);
      startModalAnimation(this.scene, container, 500, 70);
    }

    this.contentContainer.setVisible(true);
    this.rewardContainer.setVisible(true);

    this.startRewardMessageBlink();

    return new Promise((resolve) => {
      Keyboard.setAllowKey([KEY.Z, KEY.ENTER]);
      Keyboard.setKeyDownCallback((key) => {
        if (key === KEY.Z || key === KEY.ENTER) {
          this.stopRewardMessageBlink();
          this.clean();
          resolve();
        }
      });
    });
  }

  protected onClean(): void {
    this.stopRewardMessageBlink();

    this.container.setVisible(false);
    this.contentContainer.setVisible(false);
    this.rewardContainer.setVisible(false);

    for (let i = 0; i < this.targetContainers.length; i++) {
      this.targetContainers[i].y = this.restoreTargetContainerPosY[i];
      this.targetContainers[i].setAlpha(1);
      this.targetContainers[i].setVisible(false);
    }
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  private updateGenderSummary(gender: PokemonGender) {
    if (gender === 'female') {
      this.wildGender.setText(`♀`);
      this.wildGender.setStyle(getTextStyle(TEXTSTYLE.GENDER_1));
    } else if (gender === 'male') {
      this.wildGender.setText(`♂`);
      this.wildGender.setStyle(getTextStyle(TEXTSTYLE.GENDER_0));
    } else {
      this.wildGender.setText(``);
    }
  }

  private updateTypeSummary(type_1: TYPE, type_2: TYPE) {
    type_1 ? this.type1.setTexture(TEXTURE.TYPES, `types-${type_1}`) : this.type1.setTexture(TEXTURE.BLANK);
    type_2 ? this.type2.setTexture(TEXTURE.TYPES, `types-${type_2}`) : this.type2.setTexture(TEXTURE.BLANK);
  }

  private updateShiny(shiny: boolean) {
    this.wildShiny.setX(this.wildName.x + this.wildName.displayWidth + 20);
    this.wildShiny.setTexture(shiny ? TEXTURE.ICON_SHINY : TEXTURE.BLANK);
  }

  private updateRewards(rewards: CatchRewardRes[]) {
    for (const reward of rewards) {
      this.updateRewardIcon(reward.item);
      this.updateRewardText(reward.item);
      this.updateRewardStock(reward.stock);
    }

    this.repositionRewards();
  }

  private updateCandy(candy: number) {
    const candyIcon = this.addImage(TEXTURE.ICON_CANDY, 0, 0).setScale(4);
    const candyText = this.addText(0, 0, i18next.t('menu:candy'), TEXTSTYLE.ONLY_WHITE).setScale(0.5).setStroke('#696969', 12);
    const candyStock = this.addText(0, 0, `x${candy}`, TEXTSTYLE.ONLY_WHITE).setScale(0.5).setStroke('#696969', 12);

    this.rewardIcons.push(candyIcon);
    this.rewardTexts.push(candyText);
    this.rewardStocks.push(candyStock);

    this.rewardContainer.add(candyIcon);
    this.rewardContainer.add(candyText);
    this.rewardContainer.add(candyStock);

    this.repositionRewards();
  }

  private repositionRewards() {
    const itemSpacing = 200;
    const totalItems = this.rewardIcons.length;

    if (totalItems === 0) return;

    const totalWidth = (totalItems - 1) * itemSpacing;
    const startX = -totalWidth / 2;
    for (let i = 0; i < totalItems; i++) {
      const x = startX + i * itemSpacing;
      this.rewardIcons[i].setPosition(x, -10);
      this.rewardTexts[i].setPosition(x, +70);
      this.rewardStocks[i].setPosition(x + 35, 30);
    }
  }

  private cleanRewards() {
    this.rewardIcons.forEach((icon) => icon.destroy());
    this.rewardTexts.forEach((text) => text.destroy());
    this.rewardStocks.forEach((stock) => stock.destroy());

    this.rewardIcons = [];
    this.rewardTexts = [];
    this.rewardStocks = [];

    this.rewardContainer.removeAll(true);
  }

  private updateRewardIcon(item: string) {
    const icon = this.addImage(`item${item}`, 0, 0).setScale(2);
    this.rewardIcons.push(icon);
    this.rewardContainer.add(icon);
  }

  private updateRewardText(item: string) {
    const text = this.addText(0, 0, i18next.t(`item:${item}.name`), TEXTSTYLE.ONLY_WHITE)
      .setScale(0.5)
      .setStroke('#696969', 12);
    this.rewardTexts.push(text);
    this.rewardContainer.add(text);
  }

  private updateRewardStock(value: number) {
    const stock = this.addText(0, 0, `x${value}`, TEXTSTYLE.ONLY_WHITE).setScale(0.5).setStroke('#696969', 12);
    this.rewardStocks.push(stock);
    this.rewardContainer.add(stock);
  }

  private startRewardMessageBlink(): void {
    this.stopRewardMessageBlink();
    this.rewardMessageBlinkTween = this.scene.tweens.add({
      targets: this.rewardMessage,
      alpha: 0,
      duration: 500,
      ease: EASE.LINEAR,
      yoyo: true,
      repeat: -1,
    });
  }

  private stopRewardMessageBlink(): void {
    if (this.rewardMessageBlinkTween) {
      this.scene.tweens.killTweensOf(this.rewardMessage);
      this.rewardMessageBlinkTween = null;
      this.rewardMessage.setAlpha(1);
    }
  }
}
