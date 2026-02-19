import { GameScene } from '@poposafari/scenes';
import { MenuUi } from '../menu/menu-ui';
import i18next from '@poposafari/i18n';

export class DeleteAccountMenuUi extends MenuUi {
  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), {
      y: +800,
      itemHeight: 70,
    });
  }
}
