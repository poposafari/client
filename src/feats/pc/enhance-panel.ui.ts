import {
  BaseUi,
  EXP_CANDY_VALUE,
  IInputHandler,
  POKEMON_LEVEL_MAX,
  pokemonExpProgress,
  pokemonLevelFromExp,
  pokemonTotalExpForLevel,
} from '@poposafari/core';
import { ExpBarContainer } from '@poposafari/containers/exp-bar.container';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, GrowthGroup, KEY, SFX, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addImage, addText, addWindow } from '@poposafari/utils';
import i18next from 'i18next';

export interface EnhancePanelOpenParams {
  candyId: string;
  candyMax: number;
  currentLevel: number;
  currentExp: number;
  group: GrowthGroup;
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
  private candyName!: GText;
  private candyQtyText!: GText;
  private leftArrow!: GImage;
  private rightArrow!: GImage;
  private amountText!: GText;
  private levelPreview!: GText;
  private expBar!: ExpBarContainer;
  private expPreviewText!: GText;

  private candyId = '';
  private candyMax = 0;
  private candyExpValue = 0;
  private currentLevel = 1;
  private currentExp = 0;
  private group: GrowthGroup = 'medium_fast';
  private capExp = 0;
  private amount = 1;

  private resolver: ((result: EnhancePanelResult) => void) | null = null;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.MESSAGE);
    this.scene = scene;
    this.createLayout();
    this.setVisible(false);
  }

  createLayout(): void {
    const width = 850;
    const height = 600;

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
      -130,
      i18next.t('pc:enhancePrompt'),
      60,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    // 좌측: 캔디 아이콘 + 이름 + 수량
    this.candyIcon = addImage(this.scene, TEXTURE.BLANK, undefined, -290, +0).setScale(4);
    this.candyName = addText(
      this.scene,
      -220,
      -30,
      '',
      55,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setOrigin(0, 0.5);
    this.candyQtyText = addText(
      this.scene,
      -220,
      +30,
      'x0',
      60,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setOrigin(0, 0.5);

    // 우측: ◀ {amount} ▶
    this.leftArrow = addImage(this.scene, TEXTURE.CURSOR_WHITE, undefined, +120, +0)
      .setScale(3)
      .setFlipX(true);
    this.amountText = addText(
      this.scene,
      +230,
      +0,
      '1',
      80,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.rightArrow = addImage(this.scene, TEXTURE.CURSOR_WHITE, undefined, +340, +0).setScale(3);

    this.expBar = new ExpBarContainer(this.scene, 0, +180, {
      width: 400,
      height: 32,
      scale: 2,
    });

    this.expPreviewText = addText(
      this.scene,
      0,
      +230,
      '',
      40,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    this.levelPreview = addText(
      this.scene,
      0,
      +290,
      '',
      70,
      '100',
      'center',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    );

    this.add([
      this.window,
      this.promptText,
      this.candyIcon,
      this.candyName,
      this.candyQtyText,
      this.leftArrow,
      this.amountText,
      this.rightArrow,
      this.expBar,
      this.expPreviewText,
      this.levelPreview,
    ]);

    this.setY(405);
  }

  open(params: EnhancePanelOpenParams): Promise<EnhancePanelResult> {
    this.candyId = params.candyId;
    this.candyMax = Math.max(0, params.candyMax);
    this.currentLevel = params.currentLevel;
    this.currentExp = params.currentExp;
    this.group = params.group;
    this.capExp = pokemonTotalExpForLevel(POKEMON_LEVEL_MAX, this.group);
    this.candyExpValue = EXP_CANDY_VALUE[this.candyId] ?? 0;

    const max = this.getMaxAllowed();
    this.amount = max > 0 ? 1 : 0;

    this.candyIcon.setTexture(this.candyId);
    this.candyName.setText(i18next.t(`item:${this.candyId}.name`));
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
    if (this.candyMax <= 0) return 0;
    if (this.candyExpValue <= 0) return 0;
    if (this.currentExp >= this.capExp) return 0;
    const remainingExp = this.capExp - this.currentExp;
    const candiesToCap = Math.ceil(remainingExp / this.candyExpValue);
    return Math.min(this.candyMax, candiesToCap);
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

    const expGain = this.candyExpValue * this.amount;
    const newExp = Math.min(this.currentExp + expGain, this.capExp);
    const newLevel = pokemonLevelFromExp(newExp, this.group);

    this.expBar.setProgress(newLevel, newExp, this.group);

    const afterProg = pokemonExpProgress(newLevel, newExp, this.group);
    this.expPreviewText.setText(
      `EXP ${this.currentExp} (+${expGain}) → ${newExp} / ${afterProg.next}`,
    );

    this.levelPreview.setText(`Lv.${this.currentLevel} → Lv.${newLevel}`);
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
