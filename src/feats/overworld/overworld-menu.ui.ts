import { GameScene } from '@poposafari/scenes';
import { TEXTURE } from '@poposafari/types';
import { MenuUi } from '../menu/menu-ui';
import i18next from '@poposafari/i18n';

/** 자식에서 icon을 지정하면 MenuUi가 해당 행에 GImage를 생성한다. 없으면 아이콘 없이 표시. */
const MENU_ITEMS = () => [
  { key: 'pokedex', label: i18next.t('menu:pokedex'), icon: TEXTURE.ICON_POKEDEX },
  { key: 'pc', label: i18next.t('menu:pc'), icon: TEXTURE.ICON_PC },
  { key: 'bag', label: i18next.t('menu:bag'), icon: TEXTURE.ICON_BAG_M },
  { key: 'option', label: i18next.t('menu:option'), icon: TEXTURE.ICON_OPTION },
  { key: 'title', label: i18next.t('menu:backToTitle'), icon: TEXTURE.ICON_EXIT },
  { key: 'cancel', label: i18next.t('menu:cancel'), icon: TEXTURE.ICON_CANCEL },
];

const YES_NO_ITEMS = () => [
  { key: 'yes', label: i18next.t('menu:yes') },
  { key: 'no', label: i18next.t('menu:no') },
];

export class OverworldMenuUi extends MenuUi {
  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), {
      y: +720,
      itemHeight: 100,
      iconScale: 4,
    });
  }

  async waitForInput(initialCursorIndex?: number): Promise<{ key: string; cursorIndex: number }> {
    const options = initialCursorIndex !== undefined ? { initialCursorIndex } : undefined;
    const ret = await this.waitForSelect(MENU_ITEMS(), options);

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
