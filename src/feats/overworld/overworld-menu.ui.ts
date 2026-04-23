import { GameScene } from '@poposafari/scenes';
import { TEXTURE } from '@poposafari/types';
import { MenuUi } from '../menu/menu-ui';
import i18next from '@poposafari/i18n';

const BASE_MENU_ITEMS = (gender: 'male' | 'female') => [
  { key: 'pc', label: i18next.t('menu:pc'), icon: TEXTURE.ICON_PC },
  {
    key: 'bag',
    label: i18next.t('menu:bag'),
    icon: gender === 'female' ? TEXTURE.ICON_BAG_F : TEXTURE.ICON_BAG_M,
  },
  { key: 'option', label: i18next.t('menu:option'), icon: TEXTURE.ICON_OPTION },
  { key: 'title', label: i18next.t('menu:backToTitle'), icon: TEXTURE.ICON_EXIT_0 },
];

const PLAZA_ITEM = () => ({
  key: 'plaza',
  label: i18next.t('menu:backToPlaza'),
  icon: TEXTURE.ICON_EXIT_1,
});

const CANCEL_ITEM = () => ({
  key: 'cancel',
  label: i18next.t('menu:cancel'),
  icon: TEXTURE.ICON_CANCEL,
});

const MENU_ITEMS = (inSafari: boolean, gender: 'male' | 'female') => {
  const items = BASE_MENU_ITEMS(gender);
  if (inSafari) {
    items.push(PLAZA_ITEM());
  }
  items.push(CANCEL_ITEM());
  return items;
};

const YES_NO_ITEMS = () => [
  { key: 'yes', label: i18next.t('menu:yes') },
  { key: 'no', label: i18next.t('menu:no') },
];

export class OverworldMenuUi extends MenuUi {
  constructor(scene: GameScene, offsetY: number) {
    super(scene, scene.getInputManager(), {
      y: offsetY,
      itemHeight: 100,
      iconScale: 4,
    });
  }

  private isInSafari(): boolean {
    const map = this.scene.getUser()?.getProfile().lastLocation.map ?? '';
    return map.startsWith('s');
  }

  async waitForInput(initialCursorIndex?: number): Promise<{ key: string; cursorIndex: number }> {
    const inSafari = this.isInSafari();
    const gender = this.scene.getUser()?.getProfile().gender ?? 'male';
    const options = initialCursorIndex !== undefined ? { initialCursorIndex } : undefined;
    const ret = await this.waitForSelect(MENU_ITEMS(inSafari, gender), options);

    this.hide();

    return {
      key: ret?.key ?? 'cancel',
      cursorIndex: this.getLastSelectedIndex(),
    };
  }

  async runBackToTitle(): Promise<boolean> {
    const question = this.scene.getMessage('question');

    await question.showMessage(i18next.t('msg:backToTitle'), {
      resolveWhen: 'displayed',
    });

    const choice = await this.waitForSelect(YES_NO_ITEMS());
    return choice?.key === 'yes';
  }
}
