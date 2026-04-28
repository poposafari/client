import i18next from 'i18next';
import type { GameScene } from '@poposafari/scenes/game.scene';
import { GameEvent } from '@poposafari/scenes/game.scene';
import DayNightFilter from '@poposafari/utils/day-night-filter';
import type { BattleAction, BattleContext, BattleModifiers, CatchResult } from './battle.types';
import { BattleBaseUi } from './ui/battle-base.ui';
import { BattleSpriteUi } from './ui/battle-sprite.ui';
import { BattleInfoUi } from './ui/battle-info.ui';
import { BattleIdleUi } from './ui/battle-idle.ui';
import { BattleIdleMessageUi } from './ui/battle-idle-message.ui';
import { displayBattleIntro } from './anim/battle-intro';
import {
  playBallCatch,
  playBallFail,
  playBallThrow,
  playFeedThrow,
  playMudThrow,
} from './anim/ball-throw';
import WipeRightToLeftShader from '@poposafari/utils/wipe-rl-shader';
import { PLAYER_HUD } from './battle.constants';
import { SFX } from '@poposafari/types';
import { getPokemonI18Name } from '@poposafari/utils';

export class BattleUi {
  private base!: BattleBaseUi;
  private sprite!: BattleSpriteUi;
  private info!: BattleInfoUi;
  private idle!: BattleIdleUi;
  private idleMessage!: BattleIdleMessageUi;

  private built = false;
  private ctx!: BattleContext;
  private firstIdlePrompt = true;
  private currentModifiers: import('./battle.types').BattleModifiers = { bait: false, rock: false };

  constructor(private readonly scene: GameScene) {
    this.onGameTimeChanged = this.onGameTimeChanged.bind(this);
  }

  private onGameTimeChanged(_timeOfDay: string): void {
    if (!this.built) return;
    const newTime = DayNightFilter.getBattleTime();
    const area = this.ctx.area;
    const duration = 2000;
    this.base.crossfadeBackground(area, newTime, duration);
    this.sprite.crossfadePlatforms(area, newTime, duration);
  }

  async show(ctx: BattleContext): Promise<void> {
    this.ctx = ctx;
    if (!this.built) {
      this.base = new BattleBaseUi(this.scene);
      this.sprite = new BattleSpriteUi(this.scene);
      this.info = new BattleInfoUi(this.scene);
      this.idle = new BattleIdleUi(this.scene, this.scene.getInputManager());
      this.idleMessage = new BattleIdleMessageUi(this.scene);

      this.base.build(ctx);
      this.sprite.build(ctx);
      this.info.build(ctx);
      this.idle.setBallDisabled(this.info.getSafariBallCount() <= 0);
      this.built = true;
    }

    this.scene.events.on(GameEvent.GAME_TIME_CHANGED, this.onGameTimeChanged);
    this.firstIdlePrompt = true;
  }

  async playPreIntro(): Promise<void> {
    const cam = this.scene.cameras.main;

    for (let i = 0; i < 2; i++) {
      await new Promise<void>((resolve) => {
        cam.flash(100, 0, 0, 0);
        cam.once('cameraflashcomplete', () => resolve());
      });
    }

    const wipeSeconds = 0.6;
    cam.setPostPipeline(WipeRightToLeftShader.KEY);
    const pipe = cam.getPostPipeline(WipeRightToLeftShader.KEY as unknown as string) as
      | WipeRightToLeftShader
      | WipeRightToLeftShader[]
      | null;
    const p = Array.isArray(pipe) ? pipe[0] : pipe;
    if (p) {
      p.setDuration(wipeSeconds * 2);
      p.resetTime();
    }
    await new Promise<void>((resolve) =>
      this.scene.time.delayedCall(wipeSeconds * 1000, () => resolve()),
    );
    cam.removePostPipeline(WipeRightToLeftShader.KEY);
  }

  private playPlayerHudSlideIn(): void {
    if (!this.info) return;
    const playerHud = this.info.getPlayerHudContainer();
    playerHud.x = PLAYER_HUD.fromX;
    this.scene.tweens.add({
      targets: playerHud,
      x: PLAYER_HUD.toX,
      duration: PLAYER_HUD.durationMs,
      ease: Phaser.Math.Easing.Quadratic.Out,
    });
  }

  hide(): void {
    this.scene.events.off(GameEvent.GAME_TIME_CHANGED, this.onGameTimeChanged);
    if (!this.built) return;
    this.base.hide();
    this.sprite.hide();
    this.info.hide();
    try {
      this.idleMessage?.forceClose();
    } catch {}

    try {
      this.idle.hide();
    } catch {}
  }

  async playIntro(): Promise<void> {
    await displayBattleIntro(
      this.scene,
      this.base,
      this.sprite,
      this.info,
      this.ctx.wild.isShiny,
      this.ctx.wild.pokedexId,
    );
  }

  async playAppear(ctx: BattleContext): Promise<void> {
    const name = getPokemonI18Name(ctx.wild.pokedexId);
    const msg = i18next.t('menu:battleMessageAppear', { name });
    this.base?.hideMessageBox();
    try {
      await this.scene.getMessage('talk').showMessage(msg, { showHint: false });
    } finally {
      this.base?.showMessageBox();
    }
  }

  async showIdlePrompt(): Promise<void> {
    const nickname = this.scene.getUser()?.getProfile().nickname ?? '';
    this.base?.hideMessageBox();
    if (this.firstIdlePrompt) {
      this.firstIdlePrompt = false;

      this.playPlayerHudSlideIn();
    }
    await this.idleMessage.showMessage(i18next.t('menu:battleMessageIdle', { nickname }));
  }

  /** BALL/FEED/MUD 선택 시 "{nickname}은 ~를 던졌다" 메시지를 타이핑 연출로 표시. */
  async showThrowMessage(kind: 'ball' | 'feed' | 'mud'): Promise<void> {
    const nickname = this.scene.getUser()?.getProfile().nickname ?? '';
    const key =
      kind === 'ball'
        ? 'menu:battleMessageThrewBall'
        : kind === 'feed'
          ? 'menu:battleMessageThrewFeed'
          : 'menu:battleMessageThrewMud';
    this.base?.hideMessageBox();
    await this.idleMessage.showMessage(i18next.t(key, { nickname }));
  }

  /** modifiers 변경 시 확률 HUD를 갱신한다. */
  setModifiers(modifiers: BattleModifiers): void {
    this.currentModifiers = { ...modifiers };
    this.info?.updateRateDisplay(this.currentModifiers);
  }

  /** 루트 커맨드 입력 대기. BattleIdleUi 로 위임. */
  async waitForCommand(): Promise<BattleAction> {
    this.idle.setOnCursorChange((action) => {
      this.info?.updateRatePreview(this.currentModifiers, action);
    });
    const result = await this.idle.waitForInput();
    this.idle.setOnCursorChange(null);
    return result;
  }

  async playFeed(): Promise<void> {
    await playFeedThrow(this.scene, this.sprite);
  }

  async playMud(): Promise<void> {
    await playMudThrow(this.scene, this.sprite);
  }

  async playBallThrow(shakeCount: number = 3): Promise<void> {
    await playBallThrow(this.scene, this.sprite, shakeCount);
  }

  async playResult(outcome: CatchResult): Promise<void> {
    if (outcome.kind === 'caught') {
      await playBallCatch(this.scene, this.sprite);
      this.base?.setMessage(
        i18next.t('menu:battleMessageCaught', { name: this.ctx.wild.pokedexId }),
      );
      return;
    }
    if (outcome.kind === 'flee') {
      await playBallFail(this.scene, this.sprite);
      await this.playWildFleeMessage();
      return;
    }
    await playBallFail(this.scene, this.sprite);
    this.base?.setMessage(i18next.t('menu:battleMessageFail'));
  }

  /** "야생 포켓몬이 도망쳤다!" 메시지. BALL fail-flee 와 FEED/MUD 유도 flee 양쪽에서 사용. */
  async playWildFleeMessage(): Promise<void> {
    this.idleMessage?.forceClose();
    this.base?.hideMessageBox();
    try {
      await this.scene
        .getMessage('talk')
        .showMessage(i18next.t('menu:battleMessageFlee'), { showHint: false });
    } finally {
      this.base?.showMessageBox();
    }
  }

  async playExit(reason: 'catch' | 'flee_wild' | 'flee_player'): Promise<void> {
    if (reason === 'flee_player') {
      const nickname = this.scene.getUser()?.getProfile().nickname ?? '';
      this.scene.getAudio().playEffect(SFX.FLEE);
      this.idleMessage?.forceClose();
      this.base?.hideMessageBox();
      try {
        await this.scene
          .getMessage('talk')
          .showMessage(i18next.t('menu:battleMessageFleePlayer', { nickname }), {
            showHint: false,
          });
      } finally {
        this.base?.showMessageBox();
      }
    }

    const pipeline = this.scene.getFadeToBlackPipeline();
    if (!pipeline) return;
    pipeline.setProgress(0);
    await new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: pipeline,
        progress: 1,
        duration: 500,
        ease: 'Linear',
        onComplete: () => resolve(),
      });
    });
  }

  async playExitFadeOut(): Promise<void> {
    const pipeline = this.scene.getFadeToBlackPipeline();
    if (!pipeline) return;
    await new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: pipeline,
        progress: 0,
        duration: 500,
        ease: 'Linear',
        onComplete: () => resolve(),
      });
    });
  }

  async showMessage(msg: string): Promise<void> {
    this.base?.setMessage(msg);
  }

  incrementTurn(): void {
    this.info?.incrementTurn();
  }

  updateSafariBallCount(count: number): void {
    this.info?.updateSafariBallCount(count);
    this.idle?.setBallDisabled(count <= 0);
  }

  private getWildName(): string {
    return this.ctx.wild.pokedexId;
  }

  private async showTalk(key: string, vars?: Record<string, string>): Promise<void> {
    this.idleMessage?.forceClose();
    this.base?.hideMessageBox();
    try {
      await this.scene.getMessage('talk').showMessage(i18next.t(key, vars), { showHint: false });
    } finally {
      this.base?.showMessageBox();
    }
  }

  private async showIdleMessageBy(key: string, vars?: Record<string, string>): Promise<void> {
    this.base?.hideMessageBox();
    await this.idleMessage.showMessage(i18next.t(key, vars));
  }

  /** "{{nickname}}은(는)\n사파리볼을 사용했다." — idle 상단 메시지. */
  async showUsedBallMessage(): Promise<void> {
    const nickname = this.scene.getUser()?.getProfile().nickname ?? '';
    await this.showIdleMessageBy('menu:battleMessageUsedBall', { nickname });
  }

  /** "{{nickname}}은(는)\n먹이를 던졌다." — idle 상단 메시지. */
  async showThrewFeedIdle(): Promise<void> {
    const nickname = this.scene.getUser()?.getProfile().nickname ?? '';
    await this.showIdleMessageBy('menu:battleMessageThrewFeedNew', { nickname });
  }

  /** "{{nickname}}은(는)\n진흙을 던졌다." — idle 상단 메시지. */
  async showThrewMudIdle(): Promise<void> {
    const nickname = this.scene.getUser()?.getProfile().nickname ?? '';
    await this.showIdleMessageBy('menu:battleMessageThrewMudNew', { nickname });
  }

  /** "신난다-\n{{name}}을(를) 붙잡았다!" — talk 메시지(Z/ENTER 대기). */
  async showCaughtTalk(): Promise<void> {
    await this.showTalk('menu:battleMessageCaughtNew', {
      name: getPokemonI18Name(this.getWildName()),
    });
  }

  /** "안돼! 포켓몬이\n볼에서 나와버렸다!" — talk 메시지. */
  async showBallEscapeTalk(): Promise<void> {
    await this.showTalk('menu:battleMessageBallEscape');
  }

  /** "{{name}}은(는)\n상황을 살피고 있다." — talk 메시지. */
  async showWatchingTalk(): Promise<void> {
    await this.showTalk('menu:battleMessageWatching', {
      name: getPokemonI18Name(this.getWildName()),
    });
  }

  /** "{{name}}은(는)\n먹이를 먹는데 푹 빠졌다." — talk 메시지. */
  async showEatingFocusTalk(): Promise<void> {
    await this.showTalk('menu:battleMessageEatingFocus', {
      name: getPokemonI18Name(this.getWildName()),
    });
  }

  /** "{{name}}은(는)\n화내고 있다." — talk 메시지. */
  async showAngryTalk(): Promise<void> {
    await this.showTalk('menu:battleMessageAngry', { name: getPokemonI18Name(this.getWildName()) });
  }

  /** "{{name}}은(는) 도망쳤다!" — talk 메시지(야생 flee). */
  async showWildFledTalk(): Promise<void> {
    this.scene.getAudio().playEffect(SFX.FLEE);
    await this.showTalk('menu:battleMessageWildFled', {
      name: getPokemonI18Name(this.getWildName()),
    });
  }

  /** 야생 포켓몬 먹이 먹는 placeholder 모션. */
  async playWildEat(): Promise<void> {
    await this.sprite.playWildEatAnim();
  }

  /** 야생 포켓몬 화내는 placeholder 모션. */
  async playWildAngry(): Promise<void> {
    await this.sprite.playWildAngryAnim();
  }

  /** 볼 포획 성공 연출(흡수). 메시지는 phase 가 별도로 제어한다. */
  async playBallCatchAnim(): Promise<void> {
    await playBallCatch(this.scene, this.sprite);
  }

  /** 볼 포획 실패 연출(튕김). 메시지는 phase 가 별도로 제어한다. */
  async playBallFailAnim(): Promise<void> {
    await playBallFail(this.scene, this.sprite);
  }
}
