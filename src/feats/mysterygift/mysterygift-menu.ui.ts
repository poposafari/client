import { GameScene } from '@poposafari/scenes';
import { MenuListUi } from '../menu';
import { InputManager } from '@poposafari/core';

export class MysterygiftMenuUi extends MenuListUi {
  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), {
      x: -430,
      y: +40,
      width: 900,
      visibleCount: 9,
      itemHeight: 5,
      showCancel: true,
    });
  }
}
