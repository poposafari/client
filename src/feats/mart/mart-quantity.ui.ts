import { BaseUi, IInputHandler, InputManager } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, KEY, MONEY_SYMBOL, SFX, TEXTSHADOW, TEXTSTYLE } from '@poposafari/types';
import { addText, addWindow } from '@poposafari/utils';
import i18next from 'i18next';

export interface MartQuantityUiProps {
  mode: 'buy' | 'sell';
  itemId: string;
  unitPrice: number;
  min: 1;
  max: number;
}

export class MartQuantityUi extends BaseUi implements IInputHandler {
  scene: GameScene;

  private window!: GWindow;
  private quantityText!: GText;
  private totalText!: GText;
  private hintText!: GText;

  private quantity = 1;
  private props!: MartQuantityUiProps;

  private offsetX = +1590;
  private offsetY = +730;

  private resolveQuantity: ((qty: number | null) => void) | null = null;

  constructor(scene: GameScene, inputManager: InputManager) {
    super(scene, inputManager, DEPTH.MESSAGE + 2);
    this.scene = scene;
    this.createLayout();
  }

  createLayout(): void {
    this.window = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      0,
      650,
      150,
      4,
      16,
      16,
      16,
      16,
    );
    this.add(this.window);

    this.quantityText = addText(
      this.scene,
      -200,
      0,
      '',
      70,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.add(this.quantityText);

    this.totalText = addText(
      this.scene,
      -80,
      0,
      '',
      70,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.add(this.totalText);

    this.hintText = addText(
      this.scene,
      +300,
      +270,
      i18next.t('mart:quantityGuide'),
      70,
      '100',
      'left',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    ).setOrigin(1, 0);
    this.add(this.hintText);

    this.setPosition(this.offsetX, this.offsetY);
  }

  setOffset(offsetX: number, offsetY: number): void {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.setPosition(this.offsetX, this.offsetY);
  }

  onInput(key: string): void {
    switch (key) {
      case KEY.DOWN:
        this.adjustQuantity(-1);
        break;
      case KEY.UP:
        this.adjustQuantity(1);
        break;
      case KEY.RIGHT:
        this.adjustQuantity(10);
        break;
      case KEY.LEFT:
        this.adjustQuantity(-10);
        break;
      case KEY.Z:
      case KEY.ENTER:
        this.finish(this.quantity);
        break;
      case KEY.X:
      case KEY.ESC:
        this.finish(null);
        break;
    }
  }

  errorEffect(_errorMsg: string): void {}
  waitForInput(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  private adjustQuantity(delta: number): void {
    const { min, max } = this.props;
    this.scene.getAudio().playEffect(SFX.CURSOR_0);

    let next = this.quantity + delta;
    if (next > max) {
      next = this.quantity === max ? min : max;
    } else if (next < min) {
      next = this.quantity === min ? max : min;
    }
    this.quantity = next;
    this.refreshDisplay();
  }

  private refreshDisplay(): void {
    this.quantityText.setText(`x${this.quantity}`);
    const total = this.quantity * this.props.unitPrice;
    this.totalText.setText(`${MONEY_SYMBOL} ${total.toLocaleString()}`);
  }

  open(props: MartQuantityUiProps): Promise<number | null> {
    this.props = props;
    this.quantity = props.min;

    const itemName = i18next.exists(`item:${props.itemId}.name`)
      ? i18next.t(`item:${props.itemId}.name`)
      : props.itemId;
    this.refreshDisplay();
    this.show();

    return new Promise((resolve) => {
      this.resolveQuantity = resolve;
    });
  }

  private finish(result: number | null): void {
    if (this.resolveQuantity) {
      this.hide();
      this.resolveQuantity(result);
      this.resolveQuantity = null;
    }
  }
}
