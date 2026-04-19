import { BaseUi, IInputHandler, InputManager, IRefreshableLanguage } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import {
  DEPTH,
  IMenuItem,
  MONEY_SYMBOL,
  TEXTCOLOR,
  TEXTSHADOW,
  TEXTSTYLE,
  TEXTURE,
} from '@poposafari/types';
import { addBackground, addSprite, addText } from '@poposafari/utils';
import { ItemDetailContainer } from '@poposafari/containers/item-detail.container';
import i18next from '@poposafari/i18n';
import { MenuListUi } from '../menu/menu-list.ui';

export class MartBuyUi extends BaseUi implements IInputHandler, IRefreshableLanguage {
  scene: GameScene;

  private readonly FONT_SIZE = 70;

  private background!: GImage;
  private detail!: ItemDetailContainer;
  private bagText!: GText;
  private moneyLabelText!: GText;
  private moneyValueText!: GText;
  private menuList!: MenuListUi;
  private npcSprite!: GSprite;

  private quantityLookup: (itemId: string) => number = () => 0;
  private moneyLookup: () => number = () => 0;
  private currentItemId = '';

  private resolveSelection: ((itemId: string | null) => void) | null = null;

  constructor(scene: GameScene, inputManager: InputManager) {
    super(scene, inputManager, DEPTH.MESSAGE - 1);
    this.scene = scene;
    this.createLayout();
  }

  createLayout(): void {
    this.background = addBackground(this.scene, TEXTURE.BG_MART);
    this.add(this.background);

    this.npcSprite = addSprite(this.scene, TEXTURE.BLANK, 0, -640, -110);
    this.npcSprite.setScale(7);
    this.npcSprite.setVisible(false);
    this.add(this.npcSprite);

    this.detail = new ItemDetailContainer(this.scene, {
      icon: {
        x: -793,
        y: +380,
        scale: 6,
      },
      name: {
        x: 0,
        y: 0,
        fontSize: this.FONT_SIZE,
        style: TEXTSTYLE.WHITE,
        shadow: TEXTSHADOW.GRAY,
        visible: false,
      },
      desc: {
        x: -630,
        y: +270,
        fontSize: 85,
        style: TEXTSTYLE.WHITE,
        shadow: TEXTSHADOW.GRAY,
        visible: true,
      },
    });
    this.add(this.detail);

    this.bagText = addText(
      this.scene,
      -950,
      +140,
      '',
      85,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setOrigin(0, 0);
    this.add(this.bagText);

    this.moneyLabelText = addText(
      this.scene,
      -895,
      -510,
      '',
      80,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    ).setOrigin(0, 0);
    this.add(this.moneyLabelText);

    this.moneyValueText = addText(
      this.scene,
      -340,
      -460,
      '',
      80,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    ).setOrigin(1, 0);
    this.add(this.moneyValueText);

    this.menuList = new MenuListUi(this.scene, this.inputManager, {
      x: +1280,
      y: +376,
      width: 1121,
      visibleCount: 6,
      itemHeight: 70,
      showCancel: true,
      borderPadding: 110,
    });
    this.menuList.setWindowVisible(false);
    this.menuList.setCursorTexture(TEXTURE.CURSOR_BLACK);
    this.menuList.setCursorScale(3);
    this.menuList.setHighlightColor(null);
    this.menuList.setDefaultColor(TEXTCOLOR.BLACK);
    this.menuList.onCursorMove = (_i, item) => this.updateDetail(item.key);
    this.menuList.onSelect = (item) => this.finish(item.key);
    this.menuList.onCancel = () => this.finish(null);
  }

  private updateDetail(itemId: string): void {
    this.currentItemId = itemId;
    this.detail.update(itemId);
    this.refreshBagText();
  }

  private refreshBagText(): void {
    if (
      !this.currentItemId ||
      this.currentItemId === '__empty__' ||
      this.currentItemId === 'cancel'
    ) {
      this.bagText.setText('');
      return;
    }
    const count = this.quantityLookup(this.currentItemId);
    this.bagText.setText(i18next.t('mart:inBag', { count }));
  }

  setNpcTextureKey(textureKey: string): void {
    if (!textureKey || !this.scene.textures.exists(textureKey)) {
      this.npcSprite.setVisible(false);
      return;
    }
    this.npcSprite.setTexture(textureKey);
    this.npcSprite.setFrame(0);
    this.npcSprite.setVisible(true);
  }

  setQuantityLookup(lookup: (itemId: string) => number): void {
    this.quantityLookup = lookup;
    this.refreshBagText();
  }

  setMoneyLookup(lookup: () => number): void {
    this.moneyLookup = lookup;
    this.refreshMoneyText();
  }

  private refreshMoneyText(): void {
    const amount = this.moneyLookup().toLocaleString();
    this.moneyLabelText.setText(i18next.t('mart:moneyLabel'));
    this.moneyValueText.setText(`${MONEY_SYMBOL} ${amount}`);
  }

  refresh(): void {
    this.refreshBagText();
    this.refreshMoneyText();
  }

  onInput(key: string): void {
    this.menuList.onInput(key);
  }

  errorEffect(_errorMsg: string): void {}
  waitForInput(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  setItems(items: IMenuItem[]): void {
    this.menuList.setItems(items);
    this.updateDetail(items[0]?.key ?? '');
  }

  waitForSelect(): Promise<string | null> {
    if (!this.visible) {
      this.menuList.show();
      this.show();
    }
    return new Promise((resolve) => {
      this.resolveSelection = resolve;
    });
  }

  hide(): void {
    super.hide();
    this.menuList.hide();
  }

  updateWindow(): void {
    this.menuList.updateWindow();
  }

  onRefreshLanguage(): void {
    this.menuList.onRefreshLanguage();
    this.refreshBagText();
    this.refreshMoneyText();
  }

  destroy(fromScene?: boolean): void {
    this.menuList.destroy(fromScene);
    super.destroy(fromScene);
  }

  private finish(result: string | null): void {
    if (this.resolveSelection) {
      this.resolveSelection(result);
      this.resolveSelection = null;
    }
  }
}
