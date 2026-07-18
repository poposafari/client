import { BaseUi, LanguageItmes } from '@poposafari/core';
import { KeyGuideBarContainer } from '@poposafari/containers/key-guide-bar.container';
import { GameScene } from '@poposafari/scenes';
import {
  DEPTH,
  EASE,
  KEY,
  LANGUAGE_KEY,
  OptionKey,
  SFX,
  SYMBOL_ARROW_LEFT,
  SYMBOL_ARROW_RIGHT,
  TEXTCOLOR,
  TEXTSHADOW,
  TEXTSTYLE,
  TEXTURE,
} from '@poposafari/types';
import { addBackground, addText, addWindow, getGlobalLanguageName } from '@poposafari/utils';
import i18next from '@poposafari/i18n';

type OptionCategory = 'general' | 'sound' | 'screen' | 'keyboard';
const CATEGORIES: OptionCategory[] = ['general', 'sound', 'screen', 'keyboard'];
const CATEGORY_I18N: Record<OptionCategory, string> = {
  general: 'option:categoryGeneral',
  sound: 'option:categorySound',
  screen: 'option:categoryScreen',
  keyboard: 'option:categoryKeyboard',
};

const CATEGORY_KEYS: Record<OptionCategory, string[]> = {
  general: [
    OptionKey.TEXT_SPEED,
    OptionKey.WILD_SPAWN_CRY,
    OptionKey.BATTLE_TUTORIAL,
    OptionKey.PC_TUTORIAL,
  ],
  sound: [
    OptionKey.MASTER_VOLUME,
    OptionKey.SFX_VOLUME,
    OptionKey.BGM_VOLUME,
    OptionKey.BATTLE_BGM,
  ],
  screen: [LANGUAGE_KEY, OptionKey.WINDOW],
  keyboard: [],
};

const VOLUME_VALUES = () => [
  i18next.t('option:off'),
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
];

const ARROW_STYLE_KEYS: ReadonlySet<string> = new Set<string>([
  OptionKey.WINDOW,
  OptionKey.BATTLE_BGM,
  LANGUAGE_KEY,
]);

type FocusRow = 'category' | 'list';

interface RowModel {
  key: string;
  label: string;
  values: string[];
  valueIndex: number;
  settable: boolean;
}

interface RowSlot {
  label: GText;
  parts: GText[];
}

const QUIT_KEY = '__quit';
const VISIBLE_ROWS = 9;

export class OptionUi extends BaseUi {
  private bg!: GImage;
  private topWindow!: GWindow;
  private midWindow!: GWindow;
  private botWindow!: GWindow;

  private titleText!: GText;
  private categoryTexts: GText[] = [];
  private catArrowLeft!: GText;
  private catArrowRight!: GText;
  private rowSlots: RowSlot[] = [];
  private focusCursor!: GWindow;
  private cursorTween: Phaser.Tweens.Tween | null = null;
  private inputGuide!: KeyGuideBarContainer;

  private scrollTrack!: GWindow;
  private scrollThumb!: GWindow;

  private focus: FocusRow = 'category';
  private categoryIndex = 0;
  private listCursor = 0;
  private scrollIndex = 0;
  private rows: RowModel[] = [];

  private windowDirty = false;
  private languageDirty = false;
  private resolveExit: (() => void) | null = null;

  private W = 0;
  private readonly TOP_PANEL_Y = -473;
  private readonly MID_PANEL_Y = -340;
  private readonly BOT_PANEL_Y = +130;
  private readonly TOP_PANEL_H = 130;
  private readonly MID_PANEL_H = 130;
  private readonly BOT_PANEL_H = 802;
  private readonly CAT_GAP = 460;
  private readonly CAT_ARROW_X = 860;
  private readonly ROW_SIDE_INSET = 70;
  private ROW_LABEL_X = -820;
  private ROW_VALUE_RIGHT_X = +820;
  private readonly ROW_START_Y = -205;
  private readonly ROW_STEP = 85;
  private readonly CURSOR_SCALE = 3.4;
  private readonly CURSOR_NINE_V = 4;
  /** 커서 윈도우 높이(중간 패널=카테고리 포커스, px). 줄이면 커서가 얇아진다. */
  private readonly CURSOR_H_CATEGORY = 100;
  /** 커서 윈도우 높이(하단 패널=리스트 행 포커스, px). 줄이면 커서가 얇아진다. */
  private readonly CURSOR_H_LIST = 90;
  private readonly SCROLL_X = +908;
  private readonly SCROLL_W = 24;
  private readonly SCROLL_SCALE = 2;
  private readonly SCROLL_THUMB_MIN_H = 60;
  /** 트랙을 행 영역보다 위아래로 더 늘리는 양(px). 0 이면 행 영역과 정확히 같다. */
  private readonly SCROLL_PAD = 6;
  /** 스크롤바(트랙+썸) 전체를 y축으로 미는 양(px). 음수=위로, 양수=아래로. 높이는 안 변한다. */
  private readonly SCROLL_OFFSET_Y = 0;
  /** 스크롤이 있을 때 리스트 커서 우측 끝과 스크롤바 사이 간격(px). */
  private readonly CURSOR_SCROLL_GAP = 0;

  /** 상단 "옵션" 타이틀 폰트 크기. */
  private readonly TITLE_FONT_SIZE = 90;
  /** 중간 패널 카테고리(일반/사운드/화면/키보드) 폰트 크기. */
  private readonly CATEGORY_FONT_SIZE = 90;
  /** 하단 패널 콘텐트(옵션 라벨 + 설정값) 폰트 크기. */
  private readonly CONTENT_FONT_SIZE = 90;
  /** 인라인 스타일 값들 사이 간격(px). 예: `보통  빠르게  더 빠르게`. */
  private readonly PART_GAP = 50;
  /** 화살표 스타일에서 화살표↔값 간격(px). 예: `← 프레임 1 →`. */
  private readonly ARROW_GAP = 20;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.MESSAGE);
    this.W = scene.cameras.main.width;
    const panelHalf = (this.W - 40) / 2; // 패널은 makeWindow 에서 폭 W-40 로 그려진다.
    this.ROW_LABEL_X = -(panelHalf - this.ROW_SIDE_INSET);
    this.ROW_VALUE_RIGHT_X = panelHalf - this.ROW_SIDE_INSET;
    this.createLayout();
    this.rebuildAll();
  }

  createLayout(): void {
    const scene = this.scene as GameScene;
    const winTex = scene.getOption().getWindow();
    const panelW = this.W - 40;

    this.bg = addBackground(scene, TEXTURE.BLANK);
    this.add(this.bg);

    this.topWindow = this.makeWindow(winTex, this.TOP_PANEL_Y, panelW, this.TOP_PANEL_H);
    this.midWindow = this.makeWindow(winTex, this.MID_PANEL_Y, panelW, this.MID_PANEL_H);
    this.botWindow = this.makeWindow(winTex, this.BOT_PANEL_Y, panelW, this.BOT_PANEL_H);
    this.add([this.topWindow, this.midWindow, this.botWindow]);

    this.titleText = addText(
      scene,
      -900,
      this.TOP_PANEL_Y,
      '',
      this.TITLE_FONT_SIZE,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.add(this.titleText);

    for (let i = 0; i < CATEGORIES.length; i++) {
      const x = (i - (CATEGORIES.length - 1) / 2) * this.CAT_GAP;
      const t = addText(
        scene,
        x,
        this.MID_PANEL_Y,
        '',
        this.CATEGORY_FONT_SIZE,
        '500',
        'center',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      );
      this.categoryTexts.push(t);
      this.add(t);
    }

    this.catArrowLeft = addText(
      scene,
      -this.CAT_ARROW_X,
      this.MID_PANEL_Y,
      SYMBOL_ARROW_LEFT,
      this.CATEGORY_FONT_SIZE,
      '500',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.catArrowRight = addText(
      scene,
      +this.CAT_ARROW_X,
      this.MID_PANEL_Y,
      SYMBOL_ARROW_RIGHT,
      this.CATEGORY_FONT_SIZE,
      '500',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.add([this.catArrowLeft, this.catArrowRight]);

    for (let i = 0; i < VISIBLE_ROWS; i++) {
      const y = this.ROW_START_Y + i * this.ROW_STEP;
      const label = addText(
        scene,
        this.ROW_LABEL_X,
        y,
        '',
        this.CONTENT_FONT_SIZE,
        '100',
        'left',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      );
      label.setOrigin(0, 0.5);
      this.rowSlots.push({ label, parts: [] });
      this.add(label);
    }

    this.focusCursor = addWindow(
      scene,
      TEXTURE.WINDOW_CURSOR_Y,
      0,
      this.MID_PANEL_Y,
      this.W - 80,
      this.CURSOR_H_CATEGORY,
      this.CURSOR_SCALE,
      16,
      16,
      this.CURSOR_NINE_V,
      this.CURSOR_NINE_V,
    );
    this.add(this.focusCursor);

    this.scrollTrack = addWindow(
      scene,
      TEXTURE.SLIDER_BG,
      this.SCROLL_X,
      this.trackTopY(),
      this.SCROLL_W,
      this.trackHeight(),
      this.SCROLL_SCALE,
      4,
      4,
      4,
      4,
    );
    this.scrollTrack.setOrigin(0.5, 0);
    this.scrollThumb = addWindow(
      scene,
      TEXTURE.SLIDER,
      this.SCROLL_X,
      this.trackTopY(),
      this.SCROLL_W,
      this.SCROLL_THUMB_MIN_H,
      this.SCROLL_SCALE,
      4,
      4,
      4,
      4,
    );
    this.scrollThumb.setOrigin(0.5, 0);
    this.add([this.scrollTrack, this.scrollThumb]);

    this.inputGuide = new KeyGuideBarContainer(scene);
    this.inputGuide.create(this.buildInputGuideOptions());
    this.inputGuide.setPosition(this.W / 2 - 40, this.TOP_PANEL_Y);
    this.add(this.inputGuide);
  }

  private makeWindow(tex: TEXTURE, y: number, width: number, height: number): GWindow {
    return addWindow(this.scene, tex, 0, y, width, height, 3.2, 16, 16, 16, 16);
  }

  private trackTopY(): number {
    return this.ROW_START_Y - this.ROW_STEP / 2 - this.SCROLL_PAD + this.SCROLL_OFFSET_Y;
  }

  private trackHeight(): number {
    return VISIBLE_ROWS * this.ROW_STEP + this.SCROLL_PAD * 2;
  }

  private makeValueText(y: number): GText {
    const t = addText(
      this.scene,
      this.ROW_VALUE_RIGHT_X,
      y,
      '',
      this.CONTENT_FONT_SIZE,
      '500',
      'right',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    t.setOrigin(1, 0.5);
    return t;
  }

  private currentCategory(): OptionCategory {
    return CATEGORIES[this.categoryIndex];
  }

  private resolveValueIndex(stored: unknown, valuesLength: number): number {
    const n = Number(stored);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(n, valuesLength - 1));
  }

  private currentLanguageIndex(): number {
    const lng = (i18next.language || 'en').slice(0, 2);
    const idx = LanguageItmes.indexOf(lng);
    return idx >= 0 ? idx : 0;
  }

  private isQuitRow(row: RowModel | undefined): boolean {
    return !!row && row.key === QUIT_KEY;
  }

  private buildRows(): RowModel[] {
    const category = this.currentCategory();
    const rows: RowModel[] = [];

    if (category === 'keyboard') {
      const mk = (label: string, value: string): RowModel => ({
        key: label,
        label,
        values: [value],
        valueIndex: 0,
        settable: false,
      });
      rows.push(
        mk(i18next.t('etc:move'), i18next.t('etc:arrowKey')),
        mk(i18next.t('etc:confirm'), 'Z / Enter'),
        mk(i18next.t('etc:cancel'), 'X / Esc'),
      );
    } else {
      const optionManager = (this.scene as GameScene).getOption();
      for (const key of CATEGORY_KEYS[category]) {
        const { label, values } = this.optionMeta(key);
        const valueIndex =
          key === LANGUAGE_KEY
            ? this.currentLanguageIndex()
            : this.resolveValueIndex(optionManager.getOption(key as OptionKey), values.length);
        rows.push({ key, label, values, valueIndex, settable: true });
      }
    }

    rows.push({
      key: QUIT_KEY,
      label: i18next.t('etc:cancel'),
      values: [],
      valueIndex: 0,
      settable: false,
    });

    return rows;
  }

  private optionMeta(key: string): { label: string; values: string[] } {
    switch (key) {
      case OptionKey.TEXT_SPEED:
        return {
          label: i18next.t('option:textSpeed'),
          values: [
            i18next.t('option:speedNormal'),
            i18next.t('option:speedFast'),
            i18next.t('option:speedFaster'),
          ],
        };
      case OptionKey.MASTER_VOLUME:
        return { label: i18next.t('option:masterVolume'), values: VOLUME_VALUES() };
      case OptionKey.SFX_VOLUME:
        return { label: i18next.t('option:sfxVolume'), values: VOLUME_VALUES() };
      case OptionKey.BGM_VOLUME:
        return { label: i18next.t('option:bgmVolume'), values: VOLUME_VALUES() };
      case OptionKey.BATTLE_BGM:
        return {
          label: i18next.t('option:battleBgm'),
          values: ['1', '2', '3'].map((n) => `${i18next.t('option:battleBgmValue')} ${n}`),
        };
      case OptionKey.WINDOW:
        return {
          label: i18next.t('option:frameType'),
          values: ['1', '2', '3', '4'].map((n) => `${i18next.t('option:frameValue')} ${n}`),
        };
      case OptionKey.WILD_SPAWN_CRY:
        return {
          label: i18next.t('option:wildSpawnCry'),
          values: [i18next.t('option:on'), i18next.t('option:off')],
        };
      case OptionKey.BATTLE_TUTORIAL:
        return {
          label: i18next.t('option:battleTutorial'),
          values: [i18next.t('option:on'), i18next.t('option:off')],
        };
      case OptionKey.PC_TUTORIAL:
        return {
          label: i18next.t('option:pcTutorial'),
          values: [i18next.t('option:on'), i18next.t('option:off')],
        };
      case LANGUAGE_KEY:
        return {
          label: i18next.t('option:language'),
          values: LanguageItmes.map((language) => getGlobalLanguageName(language)),
        };
      default:
        return { label: key, values: [''] };
    }
  }

  rebuildAll(): void {
    this.titleText.setText(i18next.t('etc:option'));
    this.refreshWindowTexture();
    this.refreshCategoryLabels();
    this.rebuildList();
    this.inputGuide.recreate(this.buildInputGuideOptions());
  }

  private buildInputGuideOptions() {
    return {
      entries: [
        { keys: [i18next.t('etc:arrowKey')], description: i18next.t('etc:move') },
        { keys: ['X', 'ESC'], description: i18next.t('etc:cancel') },
      ],
      keycapTextSize: 36,
      keycapPaddingX: 40,
      keycapPaddingY: 30,
      keycapScale: 2,
      keycapTextYOffset: -5,
      descriptionTextSize: 46,
      gapKeyToDescription: 8,
      gapBetweenEntries: 30,
      gapInsideEntry: 4,
      align: 'right' as const,
      maxWidth: this.W / 2 - 200,
    };
  }

  private refreshWindowTexture(): void {
    const tex = (this.scene as GameScene).getOption().getWindow();
    this.topWindow.setTexture(tex);
    this.midWindow.setTexture(tex);
    this.botWindow.setTexture(tex);
  }

  private refreshCategoryLabels(): void {
    for (let i = 0; i < CATEGORIES.length; i++) {
      this.categoryTexts[i].setText(i18next.t(CATEGORY_I18N[CATEGORIES[i]]));
      this.categoryTexts[i].setColor(i === this.categoryIndex ? TEXTCOLOR.YELLOW : TEXTCOLOR.WHITE);
    }
  }

  private maxScrollIndex(): number {
    return Math.max(0, this.rows.length - VISIBLE_ROWS);
  }

  private clampScrollToCursor(): void {
    this.scrollIndex = Math.min(this.scrollIndex, this.maxScrollIndex());
    if (this.listCursor < this.scrollIndex) {
      this.scrollIndex = this.listCursor;
    } else if (this.listCursor >= this.scrollIndex + VISIBLE_ROWS) {
      this.scrollIndex = this.listCursor - VISIBLE_ROWS + 1;
    }
    this.scrollIndex = Math.max(0, Math.min(this.scrollIndex, this.maxScrollIndex()));
  }

  private rebuildList(): void {
    this.rows = this.buildRows();
    if (this.listCursor >= this.rows.length) {
      this.listCursor = Math.max(0, this.rows.length - 1);
    }
    this.clampScrollToCursor();
    this.renderRows();
    this.refreshCursorAndHighlights();
  }

  private renderRows(): void {
    for (let i = 0; i < VISIBLE_ROWS; i++) {
      const slot = this.rowSlots[i];
      const row = this.rows[this.scrollIndex + i];
      if (!row) {
        slot.label.setVisible(false);
        for (const p of slot.parts) p.setVisible(false);
        continue;
      }
      this.renderRow(slot, row, i);
    }
    this.updateScrollBar();
  }

  private updateScrollBar(): void {
    const overflow = this.rows.length > VISIBLE_ROWS;
    this.scrollTrack.setVisible(overflow);
    this.scrollThumb.setVisible(overflow);
    if (!overflow) return;

    const track = this.trackHeight();
    const thumbH = Math.max(this.SCROLL_THUMB_MIN_H, (VISIBLE_ROWS / this.rows.length) * track);
    const ratio = this.maxScrollIndex() === 0 ? 0 : this.scrollIndex / this.maxScrollIndex();

    this.scrollThumb.setSize(this.SCROLL_W / this.SCROLL_SCALE, thumbH / this.SCROLL_SCALE);
    this.scrollThumb.setY(this.trackTopY() + (track - thumbH) * ratio);
  }

  /**
   * 값 표시 파트 목록을 만든다.
   * - 화살표 스타일: `← 현재값 →` (값이 많거나 라벨이 긴 옵션)
   * - 인라인 스타일: 모든 값을 나열하고 현재값만 강조 (볼륨·속도·켜기/끄기)
   */
  private buildValueParts(row: RowModel): { text: string; color: TEXTCOLOR }[] {
    if (!row.settable) {
      return [{ text: row.values[0] ?? '', color: TEXTCOLOR.WHITE }];
    }
    if (ARROW_STYLE_KEYS.has(row.key)) {
      const current = row.values[row.valueIndex] ?? '';
      return [
        { text: SYMBOL_ARROW_LEFT, color: TEXTCOLOR.WHITE },
        { text: current, color: TEXTCOLOR.YELLOW },
        { text: SYMBOL_ARROW_RIGHT, color: TEXTCOLOR.WHITE },
      ];
    }
    return row.values.map((val, vi) => ({
      text: val,
      color: vi === row.valueIndex ? TEXTCOLOR.YELLOW : TEXTCOLOR.WHITE,
    }));
  }

  private renderRow(slot: RowSlot, row: RowModel, rowIndex: number): void {
    const y = this.ROW_START_Y + rowIndex * this.ROW_STEP;
    slot.label.setVisible(true).setText(row.label);

    const parts = this.buildValueParts(row);
    const gap = ARROW_STYLE_KEYS.has(row.key) ? this.ARROW_GAP : this.PART_GAP;

    while (slot.parts.length < parts.length) {
      const t = this.makeValueText(y);
      slot.parts.push(t);
      this.add(t);
    }

    let x = this.ROW_VALUE_RIGHT_X;
    for (let i = parts.length - 1; i >= 0; i--) {
      const t = slot.parts[i];
      t.setVisible(true).setText(parts[i].text).setColor(parts[i].color);
      t.setY(y);
      t.setX(x);
      x -= t.width + gap;
    }
    for (let i = parts.length; i < slot.parts.length; i++) {
      slot.parts[i].setVisible(false);
    }
  }

  private refreshRowValue(index: number): void {
    const slotIndex = index - this.scrollIndex;
    if (slotIndex < 0 || slotIndex >= VISIBLE_ROWS) return;
    const slot = this.rowSlots[slotIndex];
    const row = this.rows[index];
    if (!slot || !row) return;
    this.renderRow(slot, row, slotIndex);
  }

  private refreshCursorAndHighlights(): void {
    this.refreshCategoryLabels();
    this.updateCursor();
  }

  private updateCursor(): void {
    const scale = this.CURSOR_SCALE;
    if (this.focus === 'category') {
      this.focusCursor.setSize((this.W - 80) / scale, this.CURSOR_H_CATEGORY / scale);
      this.focusCursor.setPosition(0, this.MID_PANEL_Y);
    } else {
      const y = this.ROW_START_Y + (this.listCursor - this.scrollIndex) * this.ROW_STEP;
      const overflow = this.rows.length > VISIBLE_ROWS;
      const reserve = overflow ? this.SCROLL_W + this.CURSOR_SCROLL_GAP : 0;
      this.focusCursor.setSize((this.W - 80 - reserve) / scale, this.CURSOR_H_LIST / scale);
      this.focusCursor.setPosition(-reserve / 2, y);
    }
  }

  onInput(key: string): void {
    const audio = (this.scene as GameScene).getAudio();
    switch (key) {
      case KEY.ESC:
      case KEY.X:
        audio.playEffect(SFX.CURSOR_0);
        this.finishExit();
        return;

      case KEY.Z:
      case KEY.ENTER:
        if (this.focus === 'list' && this.isQuitRow(this.rows[this.listCursor])) {
          audio.playEffect(SFX.CURSOR_0);
          this.finishExit();
        }
        return;

      case KEY.LEFT:
      case KEY.RIGHT: {
        const delta = key === KEY.LEFT ? -1 : +1;
        if (this.focus === 'category') this.cycleCategory(delta);
        else this.changeValue(delta);
        return;
      }

      case KEY.UP:
      case KEY.DOWN: {
        const delta = key === KEY.UP ? -1 : +1;
        this.moveVertical(delta);
        return;
      }
    }
  }

  private cycleCategory(delta: number): void {
    (this.scene as GameScene).getAudio().playEffect(SFX.CURSOR_0);
    this.categoryIndex = (this.categoryIndex + delta + CATEGORIES.length) % CATEGORIES.length;
    this.listCursor = 0;
    this.scrollIndex = 0;
    this.rebuildList();
  }

  private moveVertical(delta: number): void {
    const audio = (this.scene as GameScene).getAudio();

    if (this.focus === 'category') {
      if (this.rows.length === 0) return;
      audio.playEffect(SFX.CURSOR_0);
      this.focus = 'list';
      this.listCursor = delta > 0 ? 0 : this.rows.length - 1;
      this.clampScrollToCursor();
      this.renderRows();
      this.refreshCursorAndHighlights();
      return;
    }

    audio.playEffect(SFX.CURSOR_0);
    const next = this.listCursor + delta;
    if (next < 0) {
      this.focus = 'category';
      this.refreshCursorAndHighlights();
      return;
    }

    this.listCursor = next >= this.rows.length ? 0 : next;
    const prevScroll = this.scrollIndex;
    this.clampScrollToCursor();
    if (this.scrollIndex !== prevScroll) this.renderRows();
    this.refreshCursorAndHighlights();
  }

  private changeValue(delta: number): void {
    const row = this.rows[this.listCursor];
    if (!row || !row.settable || row.values.length === 0) return;

    const audio = (this.scene as GameScene).getAudio();
    audio.playEffect(SFX.CURSOR_0);

    row.valueIndex = (row.valueIndex + delta + row.values.length) % row.values.length;

    if (row.key === LANGUAGE_KEY) {
      const language = LanguageItmes[row.valueIndex];
      i18next.changeLanguage(language).then(() => {
        this.languageDirty = true;
        this.rebuildAll();
      });
      return;
    }

    (this.scene as GameScene).getOption().updateOption(row.key as OptionKey, row.valueIndex);
    if (row.key === OptionKey.WINDOW) {
      this.refreshWindowTexture();
      this.windowDirty = true;
    }
    this.refreshRowValue(this.listCursor);
  }

  errorEffect(_errorMsg: string): void {}

  waitForInput(): Promise<never> {
    return new Promise(() => {});
  }

  waitForExit(): Promise<void> {
    return new Promise((resolve) => {
      this.resolveExit = resolve;
    });
  }

  getDirty(): { windowDirty: boolean; languageDirty: boolean } {
    return { windowDirty: this.windowDirty, languageDirty: this.languageDirty };
  }

  onRefreshLanguage(): void {
    this.rebuildAll();
  }

  private finishExit(): void {
    if (!this.resolveExit) return;
    this.cursorTween?.stop();
    this.cursorTween = null;
    const resolve = this.resolveExit;
    this.resolveExit = null;
    resolve();
  }
}
