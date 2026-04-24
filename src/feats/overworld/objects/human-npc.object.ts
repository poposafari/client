import type { NpcConfig, ReactionStep } from '@poposafari/core/map.registry';
import { GameScene } from '@poposafari/scenes';
import { DIRECTION } from '../overworld.constants';
import { MovingNpcObject } from './moving-npc.object';
import type { IOverworldBlockingRef, IOverworldMapAdapter } from './movable.object';

const HUMAN_NPC_SCALE = 1.5;
// 0~3=DOWN, 4~7=LEFT, 8~11=RIGHT, 12~15=UP
const HUMAN_STOP_FRAMES = [12, 0, 4, 8];

export class HumanNpcObject extends MovingNpcObject {
  private readonly reactionSteps: ReactionStep[];

  constructor(
    scene: GameScene,
    config: NpcConfig,
    mapAdapter: IOverworldMapAdapter | null,
    blockingRefs?: IOverworldBlockingRef[],
  ) {
    super(scene, config.key, config.x, config.y, config.name, config.direction, {
      mapAdapter,
      blockingRefs,
      path: config.path,
      scale: HUMAN_NPC_SCALE,
    });
    this.reactionSteps = config.reaction ?? [];
    this.stopFrameNumbers = HUMAN_STOP_FRAMES;
    this.lookAt(config.direction);
  }

  override reaction(direction: DIRECTION): ReactionStep[] {
    this.lookAt(this.oppositeDirection(direction));
    return this.reactionSteps;
  }

  protected override getWalkAnimationKey(direction: DIRECTION): string {
    return `${this.getSprite().texture.key}_walk_${direction}`;
  }
}
