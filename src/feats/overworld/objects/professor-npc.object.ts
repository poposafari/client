import type { NpcConfig, ReactionStep } from '@poposafari/core/map.registry';
import { GameScene } from '@poposafari/scenes';
import { DIRECTION } from '../overworld.constants';
import { NpcObject } from './npc.object';
import i18next from 'i18next';

export class ProfessorNpcObject extends NpcObject {
  scene: GameScene;

  constructor(scene: GameScene, config: NpcConfig) {
    super(scene, config);
    this.scene = scene;
  }

  override getPhaseRequest(): string | null {
    return 'professor';
  }

  override reaction(direction: DIRECTION): ReactionStep[] {
    this.lookAt(direction);
    return [];
  }
}
