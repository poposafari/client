import { GameScene } from '@poposafari/scenes';
import { MenuUi } from '../menu/menu-ui';
import i18next from '@poposafari/i18n';

const MENU_ITEMS = () => [
  { key: 'yes', label: i18next.t('menu:yes') },
  { key: 'yes', label: i18next.t('menu:yes') },
];

export class StartingMenuUi extends MenuUi {
  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), {
      y: +800,
      itemHeight: 70,
    });
  }

  async waitForInput(): Promise<any> {
    const ret = await this.waitForSelect(MENU_ITEMS());

    this.hide();

    return ret?.key ?? 'cancel';
  }
}
