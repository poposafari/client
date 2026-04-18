import type { GameScene } from '@poposafari/scenes';
import type { OverworldUi } from '../overworld/overworld.ui';

export interface KeyItemContext {
  scene: GameScene;
  overworldUi: OverworldUi;
}

export interface KeyItemHandler {
  use(ctx: KeyItemContext): void | Promise<void>;
}
