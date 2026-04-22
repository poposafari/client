import type { IGamePhase } from '@poposafari/core';
import type { GameScene } from '@poposafari/scenes/game.scene';
import type { CatchReward, CaughtPokemon, ExpReward } from '../battle.types';
import { RewardUi } from './reward.ui';
import { SFX } from '@poposafari/types';

export interface RewardContext {
  pokemon: CaughtPokemon;
  rewards: CatchReward[];
  expReward: ExpReward;
  beforeLevel: number;
  beforeExp: number;
  userSnapshot: {
    gender: 'male' | 'female';
    equippedCostumes: { costumeId: string }[];
  };
  onComplete: () => void;
}

export class RewardPhase implements IGamePhase {
  private ui: RewardUi | null = null;

  constructor(
    private readonly scene: GameScene,
    private readonly ctx: RewardContext,
  ) {}

  enter(): void {
    void this.run();
  }

  exit(): void {
    this.ui?.hide();
    this.ui?.destroy();
    this.ui = null;
  }

  private async run(): Promise<void> {
    this.scene.getAudio().playEffect(SFX.REWARD);
    this.ui = new RewardUi(this.scene, this.scene.getInputManager());
    await this.ui.build({
      pokemon: this.ctx.pokemon,
      rewards: this.ctx.rewards,
      expReward: this.ctx.expReward,
      beforeLevel: this.ctx.beforeLevel,
      beforeExp: this.ctx.beforeExp,
      userSnapshot: this.ctx.userSnapshot,
    });
    await this.ui.waitForInput();
    this.ctx.onComplete();
    this.scene.popPhase();
  }
}
