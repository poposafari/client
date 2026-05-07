import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { MaintenanceUi } from './maintenance.ui';

export class MaintenancePhase implements IGamePhase {
  private ui!: MaintenanceUi;

  constructor(private scene: GameScene) {}

  enter(): void {
    this.ui = new MaintenanceUi(this.scene);
    this.ui.show();
  }

  exit(): void {
    if (this.ui) {
      this.ui.hide();
      this.ui.destroy();
    }
  }

  onRefreshLanguage(): void {
    if (this.ui) this.ui.onRefreshLanguage();
  }
}
