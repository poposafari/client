import { GameScene } from '@poposafari/scenes';
import { TEXTURE } from '@poposafari/types';
import { MenuUi } from '../menu/menu-ui';
import i18next from '@poposafari/i18n';

const BASE_MENU_ITEMS = (gender: 'male' | 'female') => [
  { key: 'pokedex', label: i18next.t('etc:pokedex'), icon: TEXTURE.ICON_POKEDEX },
  { key: 'pc', label: i18next.t('etc:pc'), icon: TEXTURE.ICON_PC },
  {
    key: 'bag',
    label: i18next.t('etc:bag'),
    icon: gender === 'female' ? TEXTURE.ICON_BAG_F : TEXTURE.ICON_BAG_M,
  },
  { key: 'option', label: i18next.t('etc:option'), icon: TEXTURE.ICON_OPTION },
];

const PLAZA_ITEM = () => ({
  key: 'plaza',
  label: i18next.t('etc:backToPlaza'),
  icon: TEXTURE.ICON_EXIT_1,
});

const POKE_RADER_ITEM = () => ({
  key: 'pokeRader',
  label: i18next.t('etc:pokeRader'),
  icon: TEXTURE.ICON_POKE_RADER,
});

const TITLE_ITEM = () => ({
  key: 'title',
  label: i18next.t('etc:backToTitle'),
  icon: TEXTURE.ICON_EXIT_0,
});

const CANCEL_ITEM = () => ({
  key: 'cancel',
  label: i18next.t('etc:menuCancel'),
  icon: TEXTURE.ICON_CANCEL,
});

const MENU_ITEMS = (inSafari: boolean, gender: 'male' | 'female') => {
  const items = BASE_MENU_ITEMS(gender);
  if (inSafari) {
    items.push(POKE_RADER_ITEM());
    items.push(PLAZA_ITEM());
  }
  items.push(TITLE_ITEM());
  items.push(CANCEL_ITEM());
  return items;
};

const NEWBIE_MENU_ITEMS = () => [
  { key: 'option', label: i18next.t('etc:option'), icon: TEXTURE.ICON_OPTION },
  TITLE_ITEM(),
  CANCEL_ITEM(),
];

const YES_NO_ITEMS = () => [
  { key: 'yes', label: i18next.t('etc:yes') },
  { key: 'no', label: i18next.t('etc:no') },
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

  private isNewbie(): boolean {
    const profile = this.scene.getUser()?.getProfile();
    return profile?.lastLocation.map === 's000' && profile?.hasStarter === true;
  }

  async waitForInput(initialCursorKey?: string): Promise<{ key: string; cursorKey: string }> {
    const inSafari = this.isInSafari();
    const gender = this.scene.getUser()?.getProfile().gender ?? 'male';
    const items = this.isNewbie() ? NEWBIE_MENU_ITEMS() : MENU_ITEMS(inSafari, gender);
    const foundIndex = initialCursorKey
      ? items.findIndex((item) => item.key === initialCursorKey)
      : -1;
    const initialCursorIndex = foundIndex >= 0 ? foundIndex : 0;
    const ret = await this.waitForSelect(items, { initialCursorIndex });

    this.hide();

    const lastIndex = this.getLastSelectedIndex();
    return {
      key: ret?.key ?? 'cancel',
      cursorKey: items[lastIndex]?.key ?? items[0].key,
    };
  }

  async runBackToTitle(): Promise<boolean> {
    const question = this.scene.getMessage('question');

    await question.showMessage(i18next.t('etc:backToTitlePrompt'), {
      resolveWhen: 'displayed',
    });

    const choice = await this.waitForSelect(YES_NO_ITEMS());
    return choice?.key === 'yes';
  }
}
