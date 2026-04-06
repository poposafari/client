import { GameScene } from '@poposafari/scenes';
import { MenuListUi } from '../menu/menu-list.ui';

export class SafariZoneListUi extends MenuListUi {
  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), {
      x: +1550,
      y: +400,
      visibleCount: 6,
      itemHeight: 0,
      showCancel: true,
    });
  }
}
