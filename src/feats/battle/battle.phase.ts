import type { IGamePhase } from '@poposafari/core';
import { GameEvent, type GameScene } from '@poposafari/scenes/game.scene';
import { BattleUi } from './battle.ui';
import type { BattleContext, BattleModifiers, BattleState, CatchResult } from './battle.types';
import { toCatchResult } from './battle.types';
import { RewardPhase } from './reward/reward.phase';
import { BattleTutorialPhase } from './tutorial/battle-tutorial.phase';
import { MAP, OptionKey, SFX } from '@poposafari/types';
import i18next from '@poposafari/i18n';
import { screenFadeOut } from '@poposafari/utils/screen-fade';

export class BattlePhase implements IGamePhase {
  private readonly ui: BattleUi;
  private state: BattleState = { kind: 'intro' };
  private modifiers: BattleModifiers = { bait: false, rock: false };
  /** 튜토리얼 phase를 첫 idle 진입 시 1회만 push하기 위한 플래그. */
  private tutorialShown = false;

  constructor(
    private readonly scene: GameScene,
    private readonly ctx: BattleContext,
  ) {
    this.ui = new BattleUi(scene);
  }

  private isS000Tutorial(): boolean {
    return (
      this.ctx.locationLabel === 's000' && this.scene.getUser()?.getProfile().hasStarter === true
    );
  }

  private isBattleTutorialEnabled(): boolean {
    return this.scene.getOption().getOption(OptionKey.BATTLE_TUTORIAL) === 0;
  }

  enter(): void {
    void this.run();
  }

  exit(): void {
    this.ui.hide();
  }

  private async run(): Promise<void> {
    await this.ui.show(this.ctx);
    await this.ui.playPreIntro();
    await this.transition({ kind: 'intro' });
  }

  private async transition(next: BattleState): Promise<void> {
    this.state = next;

    switch (next.kind) {
      case 'intro': {
        await this.ui.playIntro();
        return this.transition({ kind: 'appear' });
      }

      case 'appear': {
        await this.ui.playAppear(this.ctx);
        return this.transition({ kind: 'idle' });
      }

      case 'idle': {
        this.ui.setModifiers(this.modifiers);

        if (!this.tutorialShown && this.isBattleTutorialEnabled()) {
          this.tutorialShown = true;
          await new Promise<void>((resolve) => {
            this.scene.pushPhase(new BattleTutorialPhase(this.scene, { onComplete: resolve }));
          });
        }
        await this.ui.showIdlePrompt();
        const action = await this.ui.waitForCommand();
        switch (action.type) {
          case 'ball':
            return this.transition({ kind: 'throwing', action });
          case 'feed': {
            this.modifiers = { bait: true, rock: false };
            const fled = await this.handleBaitOrRock('bait');
            if (fled) {
              return this.transition({ kind: 'exiting', reason: 'flee_wild' });
            }
            this.ui.incrementTurn();
            return this.transition({ kind: 'idle' });
          }
          case 'mud': {
            this.modifiers = { bait: false, rock: true };
            const fled = await this.handleBaitOrRock('rock');
            if (fled) {
              return this.transition({ kind: 'exiting', reason: 'flee_wild' });
            }
            this.ui.incrementTurn();
            return this.transition({ kind: 'idle' });
          }
          case 'run':
            return this.transition({ kind: 'exiting', reason: 'flee_player' });
        }
        return;
      }

      case 'throwing': {
        const user = this.scene.getUser();
        if (user) {
          user.decreaseItemQuantity('safari-ball', 1);
          const entry = user.getItemBag()?.get('safari-ball');
          this.ui.updateSafariBallCount(entry?.quantity ?? 0);
        }
        await this.ui.showUsedBallMessage();

        // API 호출을 애니메이션 전에 수행하여 결과에 따라 shake 횟수를 결정한다.
        let outcome: CatchResult;
        try {
          const res = await this.scene.getApi().safariCatch({
            uid: this.ctx.wild.uid,
          });
          const user = this.scene.getUser();
          const party = user?.getParty();
          if (user && party && party.length > 0) {
            user.setParty(
              party.map((p) => ({
                ...p,
                friendship: Math.min((p.friendship ?? 0) + 2, 255),
              })),
            );
          }
          outcome = res ? toCatchResult(res) : { kind: 'fail' };
        } catch (e) {
          outcome = { kind: 'fail' };
        }

        const shakeCount = outcome.kind === 'caught' ? 3 : Math.floor(Math.random() * 4);
        await this.ui.playBallThrow(shakeCount);

        this.modifiers = { bait: false, rock: false };
        return this.transition({ kind: 'result', outcome });
      }

      case 'result': {
        if (next.outcome.kind === 'caught') {
          await this.ui.playBallCatchAnim();
          await this.ui.showCaughtTalk();
          const { pokemon, reward, expReward } = next.outcome;

          const user = this.scene.getUser();
          const beforeProfile = user?.getProfile();
          const beforeLevel = beforeProfile?.level ?? 1;
          const beforeExp = beforeProfile?.exp ?? 0;
          const userSnapshot = {
            gender: beforeProfile?.gender ?? 'male',
            equippedCostumes: [...(user?.getEquippedCostumes() ?? [])],
          };
          user?.addPokemonToBox({
            id: pokemon.id,
            pokedexId: pokemon.pokedexId,
            level: pokemon.level,
            gender: pokemon.gender,
            isShiny: pokemon.isShiny,
            nickname: pokemon.nickname,
            abilityId: pokemon.abilityId,
            natureId: pokemon.natureId,
            skills: pokemon.skills,
            heldItemId: pokemon.heldItemId ? pokemon.heldItemId : null,
            boxNumber: pokemon.boxNumber,
            gridNumber: pokemon.gridNumber,
            ballId: pokemon.ballId,
            caughtLocation: pokemon.caughtLocation,
            caughtAt: new Date().toISOString(),
            friendship: 0,
          });

          if (user && reward?.candyId && reward.candyQuantity > 0) {
            const existing = user.getItemBag()?.get(reward.candyId);
            user.updateItemQuantity(
              reward.candyId,
              (existing?.quantity ?? 0) + reward.candyQuantity,
            );
          }

          await new Promise<void>((resolve) => {
            this.scene.pushPhase(
              new RewardPhase(this.scene, {
                pokemon,
                rewards: [reward],
                expReward,
                beforeLevel,
                beforeExp,
                userSnapshot,
                onComplete: resolve,
              }),
            );
          });
          user?.setLevelAndExp(expReward.level, expReward.exp);
          this.scene.events.emit(GameEvent.PROFILE_CHANGED);

          return this.transition({ kind: 'exiting', reason: 'catch' });
        }
        if (next.outcome.kind === 'flee') {
          // "안돼! 볼에서 나와버렸다!" → "{name} 도망쳤다!" → 배틀 종료.

          await this.ui.playBallFailAnim();
          await this.ui.showBallEscapeTalk();
          await this.ui.showWildFledTalk();
          return this.transition({ kind: 'exiting', reason: 'flee_wild' });
        }
        // fail: "볼에서 나와버렸다!" → "상황을 살피고 있다." → idle 복귀.
        await this.ui.playBallFailAnim();
        await this.ui.showBallEscapeTalk();
        await this.ui.showWatchingTalk();
        this.ui.incrementTurn();
        return this.transition({ kind: 'idle' });
      }

      case 'exiting': {
        await this.ui.playExit(next.reason);
        this.ctx.onResolved?.(next.reason);
        this.scene.popPhase();
        await this.ui.playExitFadeOut();

        if (next.reason === 'catch' && this.isS000Tutorial()) {
          const talk = this.scene.getMessage('talk');
          await talk.showMessage(i18next.t('msg:s000_caught_0'), { name: '', showHint: false });
          await talk.showMessage(i18next.t('msg:s000_caught_1'), { name: '', showHint: false });
          await talk.showMessage(i18next.t('msg:s000_caught_2'), { name: '', showHint: false });
          this.scene.getUser()?.setHasStarter(false);
          this.scene.events.emit(GameEvent.PROFILE_CHANGED);

          await screenFadeOut(this.scene);
          this.scene.setPendingScreenFadeIn();
          this.scene.requestMapTransition({
            location: MAP.PLAZA_001,
            x: 50,
            y: 30,
          });
        }
        return;
      }
    }
  }

  private async handleBaitOrRock(kind: 'bait' | 'rock'): Promise<boolean> {
    if (kind === 'bait') {
      await this.ui.showThrewFeedIdle();
      await this.ui.playFeed();
      await this.ui.playWildEat();
    } else {
      await this.ui.showThrewMudIdle();
      await this.ui.playMud();
      await this.ui.playWildAngry();
    }

    let result: 'stay' | 'flee' = 'stay';
    try {
      const api = this.scene.getApi();
      const res =
        kind === 'bait'
          ? await api.safariBait({ uid: this.ctx.wild.uid })
          : await api.safariRock({ uid: this.ctx.wild.uid });
      if (res?.result === 'flee') result = 'flee';
    } catch {}

    if (kind === 'bait') {
      await this.ui.showEatingFocusTalk();
    } else {
      await this.ui.showAngryTalk();
    }

    if (result === 'flee') {
      await this.ui.showWildFledTalk();
      return true;
    }
    await this.ui.showWatchingTalk();
    return false;
  }

  /** 디버그/테스트용. */
  getState(): BattleState {
    return this.state;
  }

  getModifiers(): BattleModifiers {
    return { ...this.modifiers };
  }

  getContext(): BattleContext {
    return this.ctx;
  }
}
