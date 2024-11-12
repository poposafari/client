import { MODE } from '../enums/mode';
import { GlobalManager, ModeManager } from '../managers';
import { BaseScene } from './base-scene';

export class InGameScene extends BaseScene {
  private modeManager!: ModeManager;

  constructor() {
    super('InGameScene');
  }

  create() {
    this.modeManager = new ModeManager(this);
    this.modeManager.registerModes();

    GlobalManager.register('mode', this.modeManager);
  }
}
