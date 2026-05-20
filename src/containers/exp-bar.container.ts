import { POKEMON_LEVEL_MAX, isPokemonMaxLevel, pokemonExpProgress } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { TEXTURE, type GrowthGroup } from '@poposafari/types';
import { addWindow } from '@poposafari/utils';

export interface ExpBarOptions {
  width?: number;
  height?: number;
  scale?: number;
  nineSlice?: { left: number; right: number; top: number; bottom: number };
  innerPaddingX?: number;
  innerPaddingY?: number;
  fillColor?: number;
  maxFillColor?: number;
}

export interface AnimateExpOptions {
  beforeLevel: number;
  beforeExp: number;
  afterLevel: number;
  afterExp: number;
  group: GrowthGroup;
  totalDuration?: number;
  onLevelUp?: (newLevel: number) => Promise<void> | void;
  shouldSkip?: () => boolean;
}

const DEFAULT_WIDTH = 250;
const DEFAULT_HEIGHT = 48;
const DEFAULT_SCALE = 2;
const DEFAULT_NINE_SLICE = { left: 4, right: 4, top: 4, bottom: 4 };
const DEFAULT_INNER_PAD_X = 6;
const DEFAULT_INNER_PAD_Y = 9;
const DEFAULT_FILL = 0x4992fb;
const DEFAULT_MAX_FILL = 0xf2c14e;

export class ExpBarContainer extends Phaser.GameObjects.Container {
  scene: GameScene;
  private frame!: GWindow;
  private inner!: Phaser.GameObjects.Rectangle;
  private innerMaxWidth = 0;
  private innerLeftX = 0;
  private fillColor = DEFAULT_FILL;
  private maxFillColor = DEFAULT_MAX_FILL;

  constructor(scene: GameScene, x = 0, y = 0, options: ExpBarOptions = {}) {
    super(scene, x, y);
    this.scene = scene;
    this.setScrollFactor(0);
    this.build(options);
    scene.add.existing(this);
  }

  private build(options: ExpBarOptions): void {
    const width = options.width ?? DEFAULT_WIDTH;
    const height = options.height ?? DEFAULT_HEIGHT;
    const scale = options.scale ?? DEFAULT_SCALE;
    const slice = options.nineSlice ?? DEFAULT_NINE_SLICE;
    const padX = options.innerPaddingX ?? DEFAULT_INNER_PAD_X;
    const padY = options.innerPaddingY ?? DEFAULT_INNER_PAD_Y;
    this.fillColor = options.fillColor ?? DEFAULT_FILL;
    this.maxFillColor = options.maxFillColor ?? DEFAULT_MAX_FILL;

    this.frame = addWindow(
      this.scene,
      TEXTURE.WINDOW_EXP,
      0,
      0,
      width,
      height,
      scale,
      slice.left,
      slice.right,
      slice.top,
      slice.bottom,
    );
    this.add(this.frame);

    this.innerMaxWidth = Math.max(0, width - padX * 2);
    this.innerLeftX = -width / 2 + padX;
    const innerHeight = Math.max(0, height - padY * 2);
    this.inner = this.scene.add
      .rectangle(this.innerLeftX, 0, 0, innerHeight, this.fillColor, 1)
      .setOrigin(0, 0.5);
    this.inner.setScrollFactor(0);
    this.add(this.inner);
  }

  setProgress(level: number, exp: number, group: GrowthGroup): void {
    if (isPokemonMaxLevel(level)) {
      this.inner.width = this.innerMaxWidth;
      this.inner.fillColor = this.maxFillColor;
      return;
    }
    const prog = pokemonExpProgress(level, exp, group);
    this.inner.width = this.innerMaxWidth * prog.ratio;
    this.inner.fillColor = this.fillColor;
  }

  setRatio(ratio: number, atMaxLevel = false): void {
    const r = Math.max(0, Math.min(1, ratio));
    this.inner.width = this.innerMaxWidth * r;
    this.inner.fillColor = atMaxLevel ? this.maxFillColor : this.fillColor;
  }

  resetFill(): void {
    this.inner.width = 0;
    this.inner.fillColor = this.fillColor;
  }

  getInnerMaxWidth(): number {
    return this.innerMaxWidth;
  }

  async animate(opts: AnimateExpOptions): Promise<void> {
    const wholeLevelUps = Math.max(0, opts.afterLevel - opts.beforeLevel);
    const totalSteps = wholeLevelUps + 1;
    const totalDuration = opts.totalDuration ?? 1500;

    let curLevel = opts.beforeLevel;

    for (let step = 0; step < totalSteps; step++) {
      if (opts.shouldSkip?.()) break;
      if (isPokemonMaxLevel(curLevel)) break;

      const isLast = step === totalSteps - 1;
      const targetRatio = isLast
        ? pokemonExpProgress(opts.afterLevel, opts.afterExp, opts.group).ratio
        : 1;
      const segDuration = Math.max(120, totalDuration / totalSteps);
      await this.tweenWidth(this.innerMaxWidth * targetRatio, segDuration);

      if (!isLast && curLevel < POKEMON_LEVEL_MAX) {
        const nextLevel = curLevel + 1;
        if (opts.onLevelUp) await opts.onLevelUp(nextLevel);
        curLevel = nextLevel;
        this.resetFill();
      }
    }
  }

  private tweenWidth(targetWidth: number, duration: number): Promise<void> {
    return new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: this.inner,
        width: Math.max(0, targetWidth),
        duration: Math.max(120, duration),
        ease: 'Cubic.easeOut',
        onComplete: () => resolve(),
      });
    });
  }

  override setVisible(value: boolean): this {
    super.setVisible(value);
    this.frame.setVisible(value);
    this.inner.setVisible(value);
    return this;
  }
}
