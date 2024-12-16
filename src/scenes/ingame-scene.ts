import { MODE } from '../enums/mode';
import { GlobalManager, KeyboardManager, MessageManager, ModeManager, PlayerManager } from '../managers';
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

    const playerManager = PlayerManager.getInstance();
    playerManager.initialize(false, 1, 'Seophohoho');

    const keyboardMananger = KeyboardManager.getInstance();
    keyboardMananger.initialize(this);

    this.modeManager.registerModes();

    const messageManager = MessageManager.getInstance();
    messageManager.initialize(this);

    this.modeManager.changeMode(MODE.NONE);
  }

  update(time: number, delta: number): void {
    if (this.modeManager.isOverworldMode()) {
      this.modeManager.getCurrentMode().update(time, delta);
    }
  }
}
