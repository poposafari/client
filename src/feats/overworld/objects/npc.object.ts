import type { NpcConfig, ReactionStep } from '@poposafari/core/map.registry';
import { GameScene } from '@poposafari/scenes';
import { DIRECTION } from '../overworld.constants';
import { TEXTCOLOR, TEXTURE } from '@poposafari/types';
import { InteractiveObject } from './interactive.object';

/** 방향별 reaction 프레임: UP=0, DOWN=12, LEFT=8, RIGHT=4 */
const REACTION_FRAME_BY_DIRECTION: Record<DIRECTION, number> = {
  [DIRECTION.UP]: 0,
  [DIRECTION.DOWN]: 12,
  [DIRECTION.LEFT]: 8,
  [DIRECTION.RIGHT]: 4,
  [DIRECTION.NONE]: 0,
};

const DEFAULT_DIRECTION: Record<DIRECTION, number> = {
  [DIRECTION.UP]: 12,
  [DIRECTION.DOWN]: 0,
  [DIRECTION.LEFT]: 8,
  [DIRECTION.RIGHT]: 4,
  [DIRECTION.NONE]: 0,
};

const NPC_SCALE = 1.5;

export class NpcObject extends InteractiveObject {
  private readonly npcKey: string;
  private readonly reactionSteps: ReactionStep[];

  constructor(scene: GameScene, config: NpcConfig) {
    super(
      scene,
      config.key,
      config.x,
      config.y,
      { text: config.name, color: TEXTCOLOR.YELLOW },
      100,
    );
    this.npcKey = config.key;
    this.reactionSteps = config.reaction ?? [];
    this.sprite.setScale(NPC_SCALE);
    this.shadow.setScale(3);
    const frameIndex = DEFAULT_DIRECTION[config.direction] ?? 0;
    this.stopSpriteAnimation(frameIndex);

    if (this.npcKey === TEXTURE.BLANK) {
      this.shadow.setVisible(false);
    }
  }

  getNpcKey(): string {
    return this.npcKey;
  }

  getReactionSteps(): ReactionStep[] {
    return this.reactionSteps;
  }

  override getPhaseRequest(): string | null {
    return null;
  }

  override reaction(direction: DIRECTION): ReactionStep[] {
    this.lookAt(direction);
    return this.reactionSteps;
  }

  lookAt(direction: DIRECTION): void {
    const frameIndex = REACTION_FRAME_BY_DIRECTION[direction] ?? 0;
    this.stopSpriteAnimation(frameIndex);
  }
}
