import type { ReactionStep } from '@poposafari/core/map.registry';
import { GameScene } from '@poposafari/scenes';
import { DIRECTION } from '../overworld.constants';
import { BaseObject, type BaseObjectOptions, type ObjectName } from './base.object';

export class InteractiveObject extends BaseObject {
  constructor(
    scene: GameScene,
    texture: string,
    tileX: number,
    tileY: number,
    name: ObjectName,
    nameOffsetY: number,
    options?: BaseObjectOptions,
  ) {
    super(scene, texture, tileX, tileY, name, nameOffsetY, options);
  }

  reaction(_direction: DIRECTION): ReactionStep[] {
    return [];
  }

  getPhaseRequest(): string | null {
    return null;
  }
}
