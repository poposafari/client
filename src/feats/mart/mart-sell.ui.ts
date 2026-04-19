import { BaseUi, InputManager, IRefreshableLanguage } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, MONEY_SYMBOL, TEXTSHADOW, TEXTSTYLE } from '@poposafari/types';
import { addText, addWindow } from '@poposafari/utils';
import i18next from '@poposafari/i18n';

export class MartSellUi extends BaseUi implements IRefreshableLanguage {
  scene: GameScene;

  private moneyContainer!: Phaser.GameObjects.Container;
  private window!: GWindow;
  private moneyLabelText!: GText;
  private moneyValueText!: GText;

  private moneyLookup: () => number = () => 0;

  constructor(scene: GameScene, inputManager: InputManager) {
    super(scene, inputManager, DEPTH.MESSAGE_TOP);
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
  }
}
