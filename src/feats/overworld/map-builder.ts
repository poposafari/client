import { MapConfig, MapRegistry } from '@poposafari/core/map.registry';
import { GameScene } from '@poposafari/scenes';
import { MapView } from './map-view';

export class MapBuilder {
  constructor(
    private scene: GameScene,
    private registry: MapRegistry,
  ) {}

  build(config: MapConfig): MapView {
    const mapView = new MapView(this.scene);
    mapView.setup(config);
    return mapView;
  }
}
