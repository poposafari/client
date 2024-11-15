import { MODE } from '../enums/mode';
import { GlobalManager, MessageManager, ModeManager } from '../managers';
import { BaseScene } from './base-scene';

export class InGameScene extends BaseScene {
  private modeManager!: ModeManager;
  public ui!: Phaser.GameObjects.Container;

  constructor() {
    super('InGameScene');
  }

  create() {
    this.ui = this.add.container(0, 0);
    this.add.existing(this.ui);
    this.ui.setScale(2);

    this.modeManager = new ModeManager(this);
    GlobalManager.register('mode', this.modeManager);

    this.modeManager.registerModes();
    this.modeManager.changeMode(MODE.LOGIN);

    const messageManager = MessageManager.getInstance();
    messageManager.initialize(this);
  }
}
