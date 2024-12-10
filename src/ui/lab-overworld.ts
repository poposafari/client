import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { MAP_SCALE } from '../object/base-object';
import { InGameScene } from '../scenes/ingame-scene';
import { OverworldUi } from './overworld-ui';
import { addMap } from './ui';

export class LabOverworld extends OverworldUi {
  private layerContainer!: Phaser.GameObjects.Container;
  private foregroundContainer!: Phaser.GameObjects.Container;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene, mode);
  }

  setup(): void {
    this.setMap();
    super.setup();
  }

  show(): void {
    this.setMap();
    super.show();
    this.layerContainer.setVisible(true);
    this.foregroundContainer.setVisible(true);
  }

  clean(): void {
    super.clean();
    this.layerContainer.setVisible(false);
    this.foregroundContainer.setVisible(false);
  }

  setMap() {
    const width = this.getWidth();
    const height = this.getHeight();

    this.layerContainer = this.scene.add.container(width / 4, height / 4);

    const map = addMap(this.scene, TEXTURE.MAP_TEST);
    map.addTilesetImage(TEXTURE.MAP_GROUND, TEXTURE.MAP_GROUND);

    this.layerContainer.add(map.createLayer(0, TEXTURE.MAP_GROUND)!.setScale(MAP_SCALE).setDepth(0));
    this.layerContainer.add(map.createLayer(1, TEXTURE.MAP_GROUND)!.setScale(MAP_SCALE).setDepth(1));
    this.layerContainer.add(map.createLayer(2, TEXTURE.MAP_GROUND)!.setScale(MAP_SCALE).setDepth(2));

    this.foregroundContainer = this.scene.add.container(width / 4, height / 4);
    this.foregroundContainer.add(map.createLayer(3, TEXTURE.MAP_GROUND)!.setScale(MAP_SCALE));
    this.foregroundContainer.setDepth(9999);

    this.layerContainer.setVisible(false);
    this.foregroundContainer.setVisible(false);

    super.setMap(map);
  }
}
