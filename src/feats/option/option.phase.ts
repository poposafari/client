import { IGamePhase, LanguageItmes } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { OptionUi } from './option.ui';
import { OptionMenuUi, IOptionItem } from './option-menu.ui';
import i18next from 'i18next';
import { Language, LANGUAGE_KEY, OptionKey } from '@poposafari/types';
import { getGlobalLanguageName } from '@poposafari/utils';

function defaultOptionItems(): IOptionItem[] {
  return [
    {
      key: OptionKey.TEXT_SPEED,
      label: i18next.t('option:textSpeed'),
      values: [
        i18next.t('option:speedNormal'),
        i18next.t('option:speedFast'),
        i18next.t('option:speedFaster'),
      ],
      valueIndex: 3,
    },
    {
      key: OptionKey.MASTER_VOLUME,
      label: i18next.t('option:masterVolume'),
      values: [i18next.t('option:off'), '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      valueIndex: 3,
    },
    {
      key: OptionKey.SFX_VOLUME,
      label: i18next.t('option:sfxVolume'),
      values: [i18next.t('option:off'), '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      valueIndex: 3,
    },
    {
      key: OptionKey.BGM_VOLUME,
      label: i18next.t('option:bgmVolume'),
      values: [i18next.t('option:off'), '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      valueIndex: 3,
    },
    {
      key: LANGUAGE_KEY,
      label: i18next.t('option:language'),
      values: LanguageItmes.map((language) => getGlobalLanguageName(language)),
      valueIndex: 0,
    },
    {
      key: OptionKey.WINDOW,
      label: i18next.t('option:windowType'),
      values: ['1', '2', '3', '4'],
      valueIndex: 0,
    },
    {
      key: OptionKey.PC_TUTORIAL,
      label: i18next.t('option:pcTutorial'),
      values: [i18next.t('option:on'), i18next.t('option:off')],
      valueIndex: 0,
    },
    {
      key: OptionKey.BATTLE_TUTORIAL,
      label: i18next.t('option:battleTutorial'),
      values: [i18next.t('option:on'), i18next.t('option:off')],
      valueIndex: 0,
    },
    {
      key: OptionKey.BAG_TUTORIAL,
      label: i18next.t('option:bagTutorial'),
      values: [i18next.t('option:on'), i18next.t('option:off')],
      valueIndex: 0,
    },
    {
      key: OptionKey.SAFFARI_TUTORIAL,
      label: i18next.t('option:safariTutorial'),
      values: [i18next.t('option:on'), i18next.t('option:off')],
      valueIndex: 0,
    },
  ];
}

export class OptionPhase implements IGamePhase {
  private ui!: OptionUi;
  private optionMenu!: OptionMenuUi;

  constructor(private scene: GameScene) {}

  private resolveValueIndex(stored: unknown, valuesLength: number): number {
    const n = Number(stored);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(n, valuesLength - 1));
  }

  /** 현재 저장된 옵션 값 + 현재 언어로 옵션 목록을 만든다. */
  private buildOptionItems(): IOptionItem[] {
    const items = defaultOptionItems();
    const optionManager = this.scene.getOption();
    for (const item of items) {
      const stored = optionManager.getOption(item.key as OptionKey);
      item.valueIndex = this.resolveValueIndex(stored, item.values.length);
    }
    return items;
  }

  enter(): void {
    const { width, height } = this.scene.cameras.main;
    const listWidth = width;
    const itemCnt = 6;
    const itemHeight = 10;

    this.optionMenu = new OptionMenuUi(this.scene, this.scene.getInputManager(), {
      x: +960,
      y: +540,
      width: listWidth - 105,
      height: height - 310,
      visibleCount: itemCnt,
      itemHeight: itemHeight,
    });
    this.ui = new OptionUi(this.scene);

    this.ui.show();
    this.optionMenu.setOptionItems(this.buildOptionItems(), [
      this.ui.topWindow,
      this.ui.bottomWindow,
    ]);

    this.optionMenu.waitForSelect().then(() => {
      this.scene.popPhase();
    });
  }

  exit(): void {
    this.optionMenu.hide();
    this.optionMenu.destroy();
    this.ui.hide();
    this.ui.destroy();

    this.scene.getOption().saveToCache();
  }

  onRefreshLanguage?(): void {
    this.optionMenu.setOptionItems(
      this.buildOptionItems(),
      [this.ui.topWindow, this.ui.bottomWindow],
      true,
    );
    this.ui.onRefreshLanguage();
  }

  onPause?(): void {}
  onResume?(): void {}
}
