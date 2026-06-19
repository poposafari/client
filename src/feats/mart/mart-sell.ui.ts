import { BaseUi, InputManager, IRefreshableLanguage } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, MONEY_SYMBOL, TEXTSHADOW, TEXTSTYLE } from '@poposafari/types';
import { addText, addWindow } from '@poposafari/utils';
import { KeyGuideBarContainer } from '@poposafari/containers/key-guide-bar.container';
import i18next from '@poposafari/i18n';

export class MartSellUi extends BaseUi implements IRefreshableLanguage {
  scene: GameScene;

  private moneyContainer!: Phaser.GameObjects.Container;
  private window!: GWindow;
  private moneyLabelText!: GText;
  private moneyValueText!: GText;
  private inputGuide!: KeyGuideBarContainer;

  private moneyLookup: () => number = () => 0;

  constructor(scene: GameScene, inputManager: InputManager) {
    super(scene, inputManager, DEPTH.MESSAGE + 0.5);
    this.scene = scene;
    this.createLayout();
  }

  createLayout(): void {
    this.moneyContainer = this.scene.add.container(-648, -270);
    this.add(this.moneyContainer);

    this.window = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      0,
      700,
      180,
      4,
      16,
      16,
      16,
      16,
    ).setVisible(false);
    this.moneyContainer.add(this.window);

    this.moneyLabelText = addText(
      this.scene,
      -275,
      -55,
      '',
      80,
      '100',
      'left',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    ).setOrigin(0, 0);
    this.moneyContainer.add(this.moneyLabelText);

    this.moneyValueText = addText(
      this.scene,
      -275,
      +5,
      '',
      80,
      '100',
      'left',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    ).setOrigin(0, 0);
    this.moneyContainer.add(this.moneyValueText);

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
      descriptionTextStyle: TEXTSTYLE.WHITE,
      descriptionTextShadow: TEXTSHADOW.GRAY,
      gapKeyToDescription: 5,
      gapBetweenEntries: 25,
      gapInsideEntry: 4,
      align: 'right',
      maxWidth: this.scene.cameras.main.width - 60,
    });
    this.inputGuide.setPosition(+920, +500);
    this.add(this.inputGuide);
  }

  setMoneyPosition(x: number, y: number): void {
    this.moneyContainer.setPosition(x, y);
  }

  setMoneyLookup(lookup: () => number): void {
    this.moneyLookup = lookup;
    this.refreshMoney();
  }

  refreshMoney(): void {
    const amount = this.moneyLookup().toLocaleString();
    this.moneyLabelText.setText(i18next.t('mart:moneyLabel'));
    this.moneyValueText.setText(`${MONEY_SYMBOL} ${amount}`);
  }

  show(): void {
    const zoom = this.scene.cameras.main.zoom;
    this.setScale(zoom > 0 ? 1 / zoom : 1);
    this.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
  }

  onInput(_key: string): void {}
  errorEffect(_errorMsg: string): void {}
  waitForInput(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  onRefreshLanguage(): void {
    this.refreshMoney();
    this.inputGuide.getEntryKeycapText(0, 0)?.setText(i18next.t('etc:arrowKey'));
    this.inputGuide.setEntryDescription(0, i18next.t('etc:move'));
    this.inputGuide.setEntryDescription(1, i18next.t('etc:confirm'));
    this.inputGuide.setEntryDescription(2, i18next.t('etc:cancel'));
  }
}
