import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { OverworldUi } from './overworld-ui';

export class LabOverworld extends OverworldUi {
  private mode: OverworldMode;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }
}
