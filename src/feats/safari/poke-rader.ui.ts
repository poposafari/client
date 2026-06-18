import { BaseUi } from '@poposafari/core';
import { KeyGuideBarContainer } from '@poposafari/containers/key-guide-bar.container';
import { GameScene } from '@poposafari/scenes';
import {
  DEPTH,
  EASE,
  KEY,
  SFX,
  SYMBOL_ARROW_LEFT,
  SYMBOL_ARROW_RIGHT,
  TEXTCOLOR,
  TEXTSHADOW,
  TEXTSTYLE,
  TEXTURE,
} from '@poposafari/types';
import {
  addBackground,
  addImage,
  addSprite,
  addText,
  addWindow,
  getPokemonTexture,
} from '@poposafari/utils';
import i18next from 'i18next';

type TimePhase = 'dawn' | 'day' | 'dusk' | 'night';
type Weather = 'sunny' | 'rainy' | 'stormy' | 'foggy';

const TIMES: TimePhase[] = ['dawn', 'day', 'dusk', 'night'];
const WEATHERS: Weather[] = ['sunny', 'rainy', 'stormy', 'foggy'];
const TIME_I18N_KEY: Record<TimePhase, string> = {
  dawn: 'etc:timeDawn',
  day: 'etc:timeDay',
  dusk: 'etc:timeDusk',
  night: 'etc:timeNight',
};
const WEATHER_I18N_KEY: Record<Weather, string> = {
  sunny: 'etc:weather_sunny',
  rainy: 'etc:weather_rainy',
  stormy: 'etc:weather_stormy',
  foggy: 'etc:weather_foggy',
};

type FocusRow = 'grid' | 'time' | 'weather';
const FOCUS_ROWS: FocusRow[] = ['grid', 'time', 'weather'];

const GRID_COLS = 10;
const GRID_ROWS = 3;
const CELL_W = 160;
const CELL_H = 150;
const GRID_ORIGIN_X = -((GRID_COLS - 1) * CELL_W) / 2;
const GRID_ORIGIN_Y = -290;
const ICON_SCALE = 2.1;
const WEIGHT_TEXT_OFFSET_Y = 60;

const UNCAUGHT_TINT = 0x000000;

const WEIGHT_PCT_HIGH = 20;
const WEIGHT_PCT_LOW = 5;

const PANEL_TITLE_Y = -470;
const PANEL_TITLE_ICON_PADDING = 40;
const PANEL_TITLE_ICON_SCALE = 2;
const MAP_TITLE_Y = -370;
const CAUGHT_COUNT_X = -860;
const CAUGHT_COUNT_Y = MAP_TITLE_Y;
const TIME_ROW_Y = 250;
const WEATHER_ROW_Y = 400;
const ROW_LABEL_X = -800;
const OPT_START_X = -400;
const OPT_GAP = 380;

const ROW_CURSOR_X = -8;
const ROW_CURSOR_WIDTH = 1790;
const ROW_CURSOR_HEIGHT = 145;
const ROW_CURSOR_SCALE = 4;

const GRID_CURSOR_X = -8;
const GRID_CURSOR_Y = -130;
const GRID_CURSOR_WIDTH = 1790;
const GRID_CURSOR_HEIGHT = 610;

const PAGE_SIZE = GRID_COLS * GRID_ROWS;
const PAGE_TEXT_X = 0;
const PAGE_TEXT_Y = +130;

const CURSOR_PULSE_SCALE = 1.02;
const CURSOR_PULSE_DELAY = 100;
const CURSOR_PULSE_DURATION = 350;

function normalizePokedexId(id: string): string {
  return id.split('_')[0].padStart(4, '0');
}

function getWeightColor(pct: number): TEXTCOLOR {
  if (pct >= WEIGHT_PCT_HIGH) return TEXTCOLOR.SIG_0;
  if (pct >= WEIGHT_PCT_LOW) return TEXTCOLOR.RARE;
  return TEXTCOLOR.RED;
}

function parseSafariMapNumber(mapKey: string): number | null {
  const m = mapKey.match(/^s(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

function getWeatherI18nKey(weather: Weather, mapKey: string): string {
  const mapNum = parseSafariMapNumber(mapKey);
  if (mapNum !== null && mapNum >= 19 && mapNum <= 31) {
    if (weather === 'rainy') return 'etc:weather_snowy';
    if (weather === 'stormy') return 'etc:weather_blizzard';
  } else if (mapNum !== null && mapNum >= 39 && mapNum <= 45) {
    if (weather === 'rainy') return 'etc:weather_sandwind';
    if (weather === 'stormy') return 'etc:weather_sandstorm';
  }
  return WEATHER_I18N_KEY[weather];
}

export class PokeRaderUi extends BaseUi {
  private bg!: GImage;
  private panelTitleText!: GText;
  private panelTitleIconLeft!: GImage;
  private panelTitleIconRight!: GImage;
  private mapNameText!: GText;
  private caughtCountText!: GText;
  private pageText!: GText;
  private timeRowLabel!: GText;
  private weatherRowLabel!: GText;
  private timeOptionTexts: GText[] = [];
  private weatherOptionTexts: GText[] = [];
  private rowCursor!: GWindow;
  private cursorTween: Phaser.Tweens.Tween | null = null;
  private inputGuide!: KeyGuideBarContainer;
  private iconSprites: Phaser.GameObjects.Sprite[] = [];
  private weightTexts: GText[] = [];

  private focusRow: FocusRow = 'grid';
  private page: number = 0;
  private time: TimePhase = 'day';
  private weather: Weather = 'sunny';
  private mapKey: string = '';
  private caughtSet: Set<string> = new Set();

  private resolveExit: (() => void) | null = null;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.MESSAGE);
    this.initState();
    this.createLayout();
    this.rebuildIcons();
    this.updateFilterHighlights();
    this.playCursorPulse();
  }

  private initState(): void {
    const scene = this.scene as GameScene;
    const user = scene.getUser();
    this.mapKey = user?.getProfile().lastLocation.map ?? '';

    const phase = scene.getGameTimeState()?.phase;
    if (phase && (TIMES as string[]).includes(phase)) {
      this.time = phase as TimePhase;
    }
    const weather = scene.getWeatherState()?.weather;
    if (weather && (WEATHERS as string[]).includes(weather)) {
      this.weather = weather as Weather;
    }

    const pokedex = user?.getPokedex() ?? [];
    this.caughtSet = new Set(
      pokedex.filter((p) => p.caughtCount > 0).map((p) => normalizePokedexId(p.pokedexId)),
    );
  }

  createLayout(): void {
    const scene = this.scene as GameScene;
    this.bg = addBackground(scene, TEXTURE.BG_POKE_RADER);
    this.add(this.bg);

    this.panelTitleText = addText(
      scene,
      0,
      PANEL_TITLE_Y,
      i18next.t('etc:pokeRader_title'),
      70,
      '500',
      'center',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    const iconOffset = this.panelTitleText.displayWidth / 2 + PANEL_TITLE_ICON_PADDING;
    this.panelTitleIconLeft = addImage(
      scene,
      TEXTURE.ICON_POKE_RADER,
      undefined,
      -iconOffset,
      PANEL_TITLE_Y,
    ).setScale(PANEL_TITLE_ICON_SCALE);
    this.panelTitleIconRight = addImage(
      scene,
      TEXTURE.ICON_POKE_RADER,
      undefined,
      +iconOffset,
      PANEL_TITLE_Y,
    ).setScale(PANEL_TITLE_ICON_SCALE);
    this.add([this.panelTitleText, this.panelTitleIconLeft, this.panelTitleIconRight]);

    const entry = scene.getMasterData().getMap(this.mapKey);
    const mapLabel = i18next.t(`map:${this.mapKey}`);
    this.mapNameText = addText(
      scene,
      0,
      MAP_TITLE_Y,
      mapLabel,
      80,
      '100',
      'center',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.add(this.mapNameText);

    this.caughtCountText = addText(
      scene,
      CAUGHT_COUNT_X,
      CAUGHT_COUNT_Y,
      '',
      60,
      '500',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.add(this.caughtCountText);

    this.pageText = addText(
      scene,
      PAGE_TEXT_X,
      PAGE_TEXT_Y,
      '',
      60,
      '500',
      'center',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.add(this.pageText);

    this.timeRowLabel = addText(
      scene,
      ROW_LABEL_X,
      TIME_ROW_Y,
      i18next.t('etc:tooltip_time'),
      70,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.weatherRowLabel = addText(
      scene,
      ROW_LABEL_X,
      WEATHER_ROW_Y,
      i18next.t('etc:tooltip_weather'),
      70,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.add([this.timeRowLabel, this.weatherRowLabel]);

    for (let i = 0; i < TIMES.length; i++) {
      const t = addText(
        scene,
        OPT_START_X + i * OPT_GAP,
        TIME_ROW_Y,
        i18next.t(TIME_I18N_KEY[TIMES[i]]),
        70,
        '500',
        'center',
        TEXTSTYLE.BLACK,
        TEXTSHADOW.GRAY,
      );
      this.timeOptionTexts.push(t);
      this.add(t);
    }
    for (let i = 0; i < WEATHERS.length; i++) {
      const t = addText(
        scene,
        OPT_START_X + i * OPT_GAP,
        WEATHER_ROW_Y,
        i18next.t(getWeatherI18nKey(WEATHERS[i], this.mapKey)),
        70,
        '500',
        'center',
        TEXTSTYLE.BLACK,
        TEXTSHADOW.GRAY,
      );
      this.weatherOptionTexts.push(t);
      this.add(t);
    }

    this.rowCursor = addWindow(
      scene,
      TEXTURE.WINDOW_CURSOR,
      ROW_CURSOR_X,
      TIME_ROW_Y,
      ROW_CURSOR_WIDTH,
      ROW_CURSOR_HEIGHT,
      ROW_CURSOR_SCALE,
      16,
      16,
      16,
      16,
    );
    this.add(this.rowCursor);

    this.inputGuide = new KeyGuideBarContainer(scene);
    this.inputGuide.create({
      entries: [
        { keys: [i18next.t('etc:arrowKey')], description: i18next.t('etc:move') },
        { keys: ['X', 'ESC'], description: i18next.t('etc:cancel') },
      ],
      keycapTextSize: 30,
      keycapPaddingX: 50,
      keycapPaddingY: 40,
      keycapScale: 2,
      keycapTextYOffset: -5,
      descriptionTextSize: 50,
      descriptionTextStyle: TEXTSTYLE.BLACK,
      descriptionTextShadow: TEXTSHADOW.GRAY,
      gapKeyToDescription: 5,
      gapBetweenEntries: 25,
      gapInsideEntry: 4,
      align: 'right',
      maxWidth: scene.cameras.main.width - 60,
    });
    this.inputGuide.setPosition(+895, +500);
    this.add(this.inputGuide);
  }

  private getCurrentList(): { id: string; weight: number }[] {
    const entry = (this.scene as GameScene).getMasterData().getMap(this.mapKey);
    const list = entry?.wild?.[this.time]?.[this.weather] ?? [];
    return [...list].sort((a, b) => b.weight - a.weight);
  }

  private rebuildIcons(): void {
    const scene = this.scene as GameScene;
    for (const s of this.iconSprites) s.destroy();
    for (const t of this.weightTexts) t.destroy();
    this.iconSprites = [];
    this.weightTexts = [];

    const fullList = this.getCurrentList();
    const total = fullList.reduce((sum, item) => sum + (item.weight > 0 ? item.weight : 0), 0);

    const totalPages = Math.max(1, Math.ceil(fullList.length / PAGE_SIZE));
    this.page = Math.min(Math.max(this.page, 0), totalPages - 1);

    const start = this.page * PAGE_SIZE;
    const list = fullList.slice(start, start + PAGE_SIZE);

    for (let i = 0; i < list.length; i++) {
      const { id, weight } = list[i];
      const col = i % GRID_COLS;
      const row = Math.floor(i / GRID_COLS);
      const x = GRID_ORIGIN_X + col * CELL_W;
      const y = GRID_ORIGIN_Y + row * CELL_H;

      const tex = getPokemonTexture('icon', id);
      const sprite = addSprite(scene, tex.key, tex.frame + '_0', x, y);
      sprite.setScale(ICON_SCALE);
      if (!this.caughtSet.has(normalizePokedexId(id))) {
        sprite.setTintFill(UNCAUGHT_TINT);
      }
      this.iconSprites.push(sprite);

      const pct = total > 0 ? (weight / total) * 100 : 0;
      const weightText = addText(
        scene,
        x,
        y + WEIGHT_TEXT_OFFSET_Y,
        `${pct.toFixed(1)}%`,
        50,
        '500',
        'center',
        TEXTSTYLE.YELLOW,
        TEXTSHADOW.GRAY,
      );
      weightText.setColor(getWeightColor(pct));
      this.weightTexts.push(weightText);
    }

    this.add([...this.iconSprites, ...this.weightTexts]);

    let caughtCount = 0;
    for (const item of fullList) {
      if (this.caughtSet.has(normalizePokedexId(item.id))) caughtCount++;
    }

    const label = i18next.t('etc:pokeRader_caughtSpecies');
    this.caughtCountText.setText(`${label}: ${caughtCount} / ${fullList.length}`);
    this.pageText.setText(
      `${SYMBOL_ARROW_LEFT} ${this.page + 1} / ${totalPages} ${SYMBOL_ARROW_RIGHT}`,
    );
  }

  private updateFilterHighlights(): void {
    const selectedColor = TEXTCOLOR.RARE;
    const idleColor = TEXTCOLOR.BLACK;

    for (let i = 0; i < TIMES.length; i++) {
      this.timeOptionTexts[i].setColor(TIMES[i] === this.time ? selectedColor : idleColor);
    }
    for (let i = 0; i < WEATHERS.length; i++) {
      this.weatherOptionTexts[i].setColor(WEATHERS[i] === this.weather ? selectedColor : idleColor);
    }

    this.updateCursor();
  }

  private updateCursor(): void {
    const scale = ROW_CURSOR_SCALE;
    if (this.focusRow === 'grid') {
      this.rowCursor.setSize(GRID_CURSOR_WIDTH / scale, GRID_CURSOR_HEIGHT / scale);
      this.rowCursor.setPosition(GRID_CURSOR_X, GRID_CURSOR_Y);
    } else {
      this.rowCursor.setSize(ROW_CURSOR_WIDTH / scale, ROW_CURSOR_HEIGHT / scale);
      this.rowCursor.setPosition(
        ROW_CURSOR_X,
        this.focusRow === 'time' ? TIME_ROW_Y : WEATHER_ROW_Y,
      );
    }
  }

  private playCursorPulse(): void {
    const scene = this.scene as GameScene;
    const base = ROW_CURSOR_SCALE;
    this.cursorTween?.stop();
    this.rowCursor.setScale(base);
    this.cursorTween = scene.tweens.add({
      targets: this.rowCursor,
      scaleX: base * CURSOR_PULSE_SCALE,
      scaleY: base * CURSOR_PULSE_SCALE,
      delay: CURSOR_PULSE_DELAY,
      duration: CURSOR_PULSE_DURATION,
      ease: EASE.LINEAR,
      yoyo: true,
      repeat: -1,
    });
  }

  private cycleFocusValue(delta: number): void {
    if (this.focusRow === 'time') {
      const idx = TIMES.indexOf(this.time);
      this.time = TIMES[(idx + delta + TIMES.length) % TIMES.length];
    } else {
      const idx = WEATHERS.indexOf(this.weather);
      this.weather = WEATHERS[(idx + delta + WEATHERS.length) % WEATHERS.length];
    }
    this.page = 0;
    this.rebuildIcons();
    this.updateFilterHighlights();
    this.playCursorPulse();
  }

  private changePage(delta: number): void {
    const totalPages = Math.max(1, Math.ceil(this.getCurrentList().length / PAGE_SIZE));
    if (totalPages <= 1) return;
    this.page = (this.page + delta + totalPages) % totalPages;
    this.rebuildIcons();
    this.playCursorPulse();
  }

  onInput(key: string): void {
    switch (key) {
      case KEY.ESC:
      case KEY.X:
        (this.scene as GameScene).getAudio().playEffect(SFX.CURSOR_0);
        this.finishExit();
        return;
      case KEY.UP:
      case KEY.DOWN: {
        (this.scene as GameScene).getAudio().playEffect(SFX.CURSOR_0);
        const idx = FOCUS_ROWS.indexOf(this.focusRow);
        const delta = key === KEY.UP ? -1 : +1;
        this.focusRow = FOCUS_ROWS[(idx + delta + FOCUS_ROWS.length) % FOCUS_ROWS.length];
        this.updateFilterHighlights();
        this.playCursorPulse();
        return;
      }
      case KEY.LEFT:
        (this.scene as GameScene).getAudio().playEffect(SFX.CURSOR_0);
        if (this.focusRow === 'grid') this.changePage(-1);
        else this.cycleFocusValue(-1);
        return;
      case KEY.RIGHT:
        (this.scene as GameScene).getAudio().playEffect(SFX.CURSOR_0);
        if (this.focusRow === 'grid') this.changePage(+1);
        else this.cycleFocusValue(+1);
        return;
    }
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

  private finishExit(): void {
    if (!this.resolveExit) return;
    this.cursorTween?.stop();
    this.cursorTween = null;
    const resolve = this.resolveExit;
    this.resolveExit = null;
    resolve();
  }
}
