import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { OverworldMenuPhase } from './overworld-menu.phase';
import { OverworldUi } from './overworld.ui';
import { StartingPhase } from '../starting/starting.phase';

export class OverworldPhase implements IGamePhase {
  private overworldUi: OverworldUi | null = null;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    const mapRegistry = this.scene.getMapRegistry();
    const location = this.scene.getUser()?.getProfile()?.lastLocation?.map ?? 'p003';
    const mapConfig = mapRegistry.get(location);

    if (!mapConfig) {
      throw new Error(`Map not found: ${location}`);
    }

    const mapView = this.scene.getMapBuilder().build(mapConfig);
    this.overworldUi = new OverworldUi(this.scene);
    this.overworldUi.setMapView(mapView);
    this.overworldUi.setMapConfig(mapConfig);
    this.overworldUi.onMenuRequested = () => {
      this.scene.pushPhase(new OverworldMenuPhase(this.scene));
    };
    this.overworldUi.onInteractivePhaseRequested = (_object, phaseKey) => {
      if (phaseKey === 'professor') {
        if (this.scene.getUser()?.getProfile().isNewbie) {
          this.scene.pushPhase(new StartingPhase(this.scene));
        } else {
          console.log('너 뉴비 아닌데? ');
        }
      }
    };
    this.overworldUi.show();

    if (this.scene.consumeFadeInOnOverworldEnter()) {
      const pipeline = this.scene.getFadeToBlackPipeline();
      if (pipeline) {
        pipeline.setProgress(1);
        this.scene.tweens.add({
          targets: pipeline,
          progress: 0,
          duration: 300,
          ease: 'Linear',
        });
      }
    }
  }

  update(time: number, delta: number): void {
    this.overworldUi?.update(time, delta);
  }

  onResume(): void {
    this.overworldUi?.syncMenuToggleIcon(false);
  }

  exit(): void {
    this.overworldUi?.destroy();
    this.overworldUi = null;
  }

  onRefreshLanguage?(): void {
    this.overworldUi?.onRefreshLanguage();
  }
}
