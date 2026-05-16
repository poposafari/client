import { BaseUi } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, TEXTCOLOR, TEXTSHADOW, TEXTSTYLE } from '@poposafari/types';
import { addText } from '@poposafari/utils';

const VISIBLE_COUNT = 3;
const LABEL_GAP = 200;
const ARROW_OFFSET = 30;
const FONT_SIZE = 80;
const ORIGIN_X = 1455;
const ORIGIN_Y = 150;

export class PokedexFilterUi extends BaseUi {
  private labels: GText[] = [];
  private arrowLeft!: GText;
  private arrowRight!: GText;
  private countText!: GText;

  private filterLabels: string[];
  private countLabel: string;

  constructor(scene: GameScene, filterLabels: string[], countLabel: string) {
    super(scene, scene.getInputManager(), DEPTH.MESSAGE);
    this.filterLabels = filterLabels;
    this.countLabel = countLabel;
    this.createLayout();
  }

  createLayout(): void {
    const scene = this.scene as GameScene;
    this.setPosition(ORIGIN_X, ORIGIN_Y);

    const totalWidth = VISIBLE_COUNT * LABEL_GAP;
    const startX = -totalWidth / 2 + LABEL_GAP / 2;
    const endX = startX + (VISIBLE_COUNT - 1) * LABEL_GAP;

    this.arrowLeft = addText(
      scene,
      startX - LABEL_GAP / 2 - ARROW_OFFSET,
      0,
      '←',
      FONT_SIZE,
      '100',
      'center',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.arrowLeft.setOrigin(0.5, 0.5);
    this.add(this.arrowLeft);

    for (let i = 0; i < VISIBLE_COUNT; i++) {
      const label = addText(
        scene,
        startX + i * LABEL_GAP,
        0,
        '',
        FONT_SIZE,
        '100',
        'center',
        TEXTSTYLE.BLACK,
        TEXTSHADOW.GRAY,
      );
      label.setOrigin(0.5, 0.5);
      this.labels.push(label);
      this.add(label);
    }

    this.arrowRight = addText(
      scene,
      endX + LABEL_GAP / 2 + ARROW_OFFSET,
      0,
      '→',
      FONT_SIZE,
      '100',
      'center',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.arrowRight.setOrigin(0.5, 0.5);
    this.add(this.arrowRight);

    this.countText = addText(
      scene,
      +400,
      -110,
      '0/0',
      65,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setOrigin(1, 0.5);

    this.add(this.countText);
  }

  setActiveFilter(activeIdx: number): void {
    const total = this.filterLabels.length;
    const half = Math.floor(VISIBLE_COUNT / 2);
    let startIdx = activeIdx - half;
    startIdx = Math.max(0, Math.min(startIdx, total - VISIBLE_COUNT));

    for (let i = 0; i < VISIBLE_COUNT; i++) {
      const filterIdx = startIdx + i;
      const label = this.labels[i];
      label.setText(this.filterLabels[filterIdx] ?? '');
      label.setColor(filterIdx === activeIdx ? TEXTCOLOR.RARE : TEXTCOLOR.BLACK);
    }
  }

  setCounts(caught: number, total: number): void {
    this.countText.setText(`${this.countLabel}  ${caught}/${total}`);
  }

  onInput(_key: string): void {}

  errorEffect(_errorMsg: string): void {}

  waitForInput(): Promise<never> {
    return new Promise(() => {});
  }
}
