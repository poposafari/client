import { ItemCategory, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { BaseBagUi } from './base-bag.ui';
import { BAG_CATEGORIES } from './bag.constants';
import { KeyGuideBarContainer } from '@poposafari/containers/key-guide-bar.container';
import i18next from '@poposafari/i18n';

export class BagUi extends BaseBagUi {
  private inputGuide!: KeyGuideBarContainer;

  protected getBackgroundTexture(): TEXTURE {
    return this.scene.getUser()?.getProfile().gender === 'female'
      ? TEXTURE.BG_BAG_F
      : TEXTURE.BG_BAG_M;
  }

  protected getCategories(): ItemCategory[] {
    return BAG_CATEGORIES;
  }

  createLayout(): void {
    super.createLayout();

    // 좌측 정렬 가이드 바 — 화면 하단. 콘텐츠 길이가 길어지면 setScale 로 자동 축소.
    this.inputGuide = new KeyGuideBarContainer(this.scene);
    this.inputGuide.create({
      entries: [
        { keys: [i18next.t('etc:arrowKey')], description: i18next.t('etc:move') },
        { keys: ['Z', 'ENTER'], description: i18next.t('etc:confirm') },
        { keys: ['X', 'ESC'], description: i18next.t('etc:cancel') },
      ],
      keycapTextSize: 30,
      keycapPaddingX: 50,
      keycapPaddingY: 40,
      keycapScale: 2,
      keycapTextYOffset: -5,
      descriptionTextSize: 50,
      descriptionTextStyle: TEXTSTYLE.BLACK, // 가방 배경이 밝아 WHITE 가독성↓ → BLACK
      descriptionTextShadow: TEXTSHADOW.GRAY,
      gapKeyToDescription: 5,
      gapBetweenEntries: 25,
      gapInsideEntry: 4,
      align: 'right',
      maxWidth: this.scene.cameras.main.width - 60,
    });
    this.inputGuide.setPosition(+920, +520);
    this.add(this.inputGuide);
  }

  onRefreshLanguage(): void {
    super.onRefreshLanguage();
    this.inputGuide.getEntryKeycapText(0, 0)?.setText(i18next.t('etc:arrowKey'));
    this.inputGuide.setEntryDescription(0, i18next.t('etc:move'));
    this.inputGuide.setEntryDescription(1, i18next.t('etc:confirm'));
    this.inputGuide.setEntryDescription(2, i18next.t('etc:cancel'));
  }
}
