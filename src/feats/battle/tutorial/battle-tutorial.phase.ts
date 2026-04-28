import type { IGamePhase } from '@poposafari/core';
import type { GameScene } from '@poposafari/scenes/game.scene';
import { OptionKey } from '@poposafari/types';
import { BattleTutorialUi } from './battle-tutorial.ui';

export interface BattleTutorialContext {
  onComplete: () => void;
}

const TUTORIAL_LINES = [
  'msg:s000_battle_intro_0',
  'msg:s000_battle_intro_1',
  'msg:s000_tutorial_ball_0',
  'msg:s000_tutorial_ball_1',
  'msg:s000_tutorial_feed_0',
  'msg:s000_tutorial_feed_1',
  'msg:s000_tutorial_mud_0',
  'msg:s000_tutorial_mud_1',
  'msg:s000_tutorial_run_0',
  'msg:s000_tutorial_run_1',
];

export class BattleTutorialPhase implements IGamePhase {
  private ui: BattleTutorialUi | null = null;

  constructor(
    private readonly scene: GameScene,
    private readonly ctx: BattleTutorialContext,
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
    this.ui = new BattleTutorialUi(this.scene);
    this.ui.show();
    await this.ui.showLines(TUTORIAL_LINES);

    const optionManager = this.scene.getOption();
    optionManager.updateOption(OptionKey.BATTLE_TUTORIAL, 1);
    optionManager.saveToCache();

    this.ctx.onComplete();
    this.scene.popPhase();
  }
}
