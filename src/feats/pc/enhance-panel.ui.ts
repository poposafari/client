import { BaseUi, IInputHandler } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, KEY, SFX, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addImage, addText, addWindow } from '@poposafari/utils';
import i18next from 'i18next';

export interface EnhancePanelOpenParams {
  candyId: string;
  candyMax: number;
  currentLevel: number;
  maxLevel: number;
}

export interface EnhancePanelResult {
  confirmed: boolean;
  amount: number;
}

const STEP_SMALL = 1;
const STEP_LARGE = 10;

export class EnhancePanelUi extends BaseUi implements IInputHandler {
  scene: GameScene;

  private window!: GWindow;
  private promptText!: GText;
  private candyIcon!: GImage;
  private candyQtyText!: GText;
  private leftArrow!: GImage;
  private rightArrow!: GImage;
  private amountText!: GText;
  private levelPreview!: GText;
  private candySymbol!: GText;
  private amountSymbol!: GText;

  private candyId = '';
  private candyMax = 0;
  private currentLevel = 0;
  private maxLevel = 999;
  private amount = 1;

  private resolver: ((result: EnhancePanelResult) => void) | null = null;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.MESSAGE);
    this.scene = scene;
    this.createLayout();
    this.setVisible(false);
  }

  createLayout(): void {
    const width = 750;
    const height = 550;

    this.window = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      +80,
      width,
      height,
      3,
      16,
      16,
      16,
      16,
    );

    this.promptText = addText(
      this.scene,
      0,
      -70,
      i18next.t('pc:enhancePrompt'),
      60,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    // 좌측: 캔디 아이콘 + 수량
    this.candySymbol = addText(
      this.scene,
      -230,
      60,
      '',
      60,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.candyIcon = addImage(this.scene, TEXTURE.BLANK, undefined, -250, +90).setScale(4);
    this.candyQtyText = addText(
      this.scene,
      -200,
      +90,
      'x0',
      70,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setOrigin(0, 0.5);

    // 우측: ◀ {amount} ▶
    this.leftArrow = addImage(this.scene, TEXTURE.CURSOR_WHITE, undefined, +40, +90)
      .setScale(3)
      .setFlipX(true);
    this.amountText = addText(
      this.scene,
      +140,
      +90,
      '1',
      80,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.rightArrow = addImage(this.scene, TEXTURE.CURSOR_WHITE, undefined, +240, +90).setScale(3);

    // 우측 하단: {curr} → {new}
    this.levelPreview = addText(
      this.scene,
      0,
      +250,
      '',
      80,
      '100',
      'center',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    );

    this.add([
      this.window,
      this.promptText,
      this.candyIcon,
      this.candyQtyText,
      this.leftArrow,
      this.amountText,
      this.rightArrow,
      this.levelPreview,
    ]);

    this.setY(405);
  }

  open(params: EnhancePanelOpenParams): Promise<EnhancePanelResult> {
    this.candyId = params.candyId;
    this.candyMax = Math.max(0, params.candyMax);
    this.currentLevel = params.currentLevel;
    this.maxLevel = params.maxLevel;
    this.amount = Math.min(1, this.getMaxAllowed());
    if (this.amount < 1) this.amount = 1;

    this.candyIcon.setTexture(this.candyId);
    this.candyQtyText.setText(`x${this.candyMax}`);
    this.refreshAmount();

    this.show();
    this.setVisible(true);

    return new Promise<EnhancePanelResult>((resolve) => {
      this.resolver = resolve;
    });
  }

  override hide(): void {
    this.setVisible(false);
    super.hide();
  }

  onInput(key: string): void {
    const max = this.getMaxAllowed();
    if (max <= 0) {
      if (key === KEY.ESC || key === KEY.X) this.resolve(false);
      return;
    }

    switch (key) {
      case KEY.LEFT:
        this.setAmount(this.amount <= 1 ? max : this.amount - STEP_SMALL);
        this.playCursor();
        break;
      case KEY.RIGHT:
        this.setAmount(this.amount >= max ? 1 : this.amount + STEP_SMALL);
        this.playCursor();
        break;
      case KEY.UP:
        this.setAmount(Math.min(max, this.amount + STEP_LARGE));
        this.playCursor();
        break;
      case KEY.DOWN:
        this.setAmount(Math.max(1, this.amount - STEP_LARGE));
        this.playCursor();
        break;
      case KEY.Z:
      case KEY.ENTER:
        this.playCursor();
        this.resolve(true);
        break;
      case KEY.ESC:
      case KEY.X:
        this.playCursor();
        this.resolve(false);
        break;
    }
  }

  private getMaxAllowed(): number {
    return Math.min(this.candyMax, Math.max(0, this.maxLevel - this.currentLevel));
  }

  private setAmount(next: number): void {
    const max = this.getMaxAllowed();
    if (max <= 0) {
      this.amount = 0;
    } else {
      this.amount = Math.min(Math.max(1, next), max);
    }
    this.refreshAmount();
  }

  private refreshAmount(): void {
    this.amountText.setText(String(this.amount));
    const next = this.currentLevel + this.amount;
    this.levelPreview.setText(`(+${this.currentLevel}) → (+${next})`);
  }

  private playCursor(): void {
    this.scene.getAudio().playEffect(SFX.CURSOR_0);
  }

  private resolve(confirmed: boolean): void {
    const result: EnhancePanelResult = { confirmed, amount: this.amount };
    this.hide();
    const r = this.resolver;
    this.resolver = null;
    r?.(result);
  }

  errorEffect(_errorMsg: string): void {}

  waitForInput(): Promise<unknown> {
    return new Promise(() => {});
  }
}
