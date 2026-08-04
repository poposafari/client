import { BaseUi } from '@poposafari/core';
import { KeyGuideBarContainer } from '@poposafari/containers/key-guide-bar.container';
import { PokemonTypeContainer } from '@poposafari/containers/pokemon-type.container';
import { PokedexAreaMapContainer } from './pokedex-area-map.container';
import { GameScene } from '@poposafari/scenes';
import {
  DEPTH,
  GameAction,
  SFX,
  SYMBOL_FEMALE,
  SYMBOL_MALE,
  TEXTCOLOR,
  TEXTSHADOW,
  TEXTSTYLE,
  TEXTURE,
  type PokemonRank,
} from '@poposafari/types';
import {
  addBackground,
  addImage,
  addText,
  getPokedexBaseId,
  getPokemonI18Name,
  getPokemonTexture,
  screenFadeIn,
  screenFadeOut,
  setAutoWordWrap,
  updateTextColor,
} from '@poposafari/utils';
import i18next from 'i18next';

/** 목록 ↔ 상세 전환에 쓰는 암전 시간. 페이지 안에서만 오가므로 짧게 잡는다. */
const FADE_DURATION = 250;

const RANK_COLOR: Record<PokemonRank, string> = {
  common: TEXTCOLOR.COMMON,
  uncommon: TEXTCOLOR.UNCOMMON,
  rare: TEXTCOLOR.RARE,
  'super-rare': TEXTCOLOR.SUPER_RARE,
  'ultra-rare': TEXTCOLOR.ULTRA_RARE,
  epic: TEXTCOLOR.EPIC,
  unique: TEXTCOLOR.UNIQUE,
  legendary: TEXTCOLOR.LEGENDARY,
};

const RANK_LOCALE: Record<PokemonRank, string> = {
  common: 'etc:tierCommon',
  uncommon: 'etc:tierUncommon',
  rare: 'etc:tierRare',
  'super-rare': 'etc:tierSuperRare',
  'ultra-rare': 'etc:tierUltraRare',
  epic: 'etc:tierEpic',
  unique: 'etc:tierUnique',
  legendary: 'etc:tierLegendary',
};

export enum PokedexDetailPage {
  INFO,
  AREA,
  // FORMS,
}

const PAGE_ORDER: ReadonlyArray<PokedexDetailPage> = [
  PokedexDetailPage.INFO,
  PokedexDetailPage.AREA,
  // PokedexDetailPage.FORMS,
];

const PAGE_TITLE_TEXTURE: Record<PokedexDetailPage, TEXTURE> = {
  [PokedexDetailPage.INFO]: TEXTURE.POKEDEX_TITLE_INFO,
  [PokedexDetailPage.AREA]: TEXTURE.POKEDEX_TITLE_AREA,
  // [PokedexDetailPage.FORMS]: TEXTURE.POKEDEX_TITLE_FORMS,
};

/** 페이지마다 배경 텍스처가 다르다(AREA는 지도를 얹을 넓은 흰 박스). */
const PAGE_BG_TEXTURE: Record<PokedexDetailPage, TEXTURE> = {
  [PokedexDetailPage.INFO]: TEXTURE.BG_POKEDEX_0,
  [PokedexDetailPage.AREA]: TEXTURE.BG_POKEDEX_1,
  // [PokedexDetailPage.FORMS]: TEXTURE.BG_POKEDEX_0,
};

const TITLE_ALPHA_ACTIVE = 1;
const TITLE_ALPHA_INACTIVE = 0.5;

const LAYOUT = {
  /** 상단 타이틀 행 — 3개 타이틀을 가로로 나열하고 양 끝에 좌우 커서를 둔다. */
  title: { y: -495, gap: 420, scale: 3, cursorGap: 180, cursorScale: 3 },
  /** A. 우상단 박스 — 녹색 헤더(번호/이름) + 흰 본문(분류/티어) */
  boxA: {
    textX: +30,
    rightX: 920,
    headerY: -345,
    bodyX: 900,
    bodyY: -265,
    badgeX: -20,
    tierX: +410,
    tierY: -125,
  },
  /** B. 우중단 박스 — 2×2. 좌열=키/몸무게, 우열=성비/포획률 */
  boxB: { col1X: 0, col2X: 440, row1Y: -25, row2Y: 55, valueGap: 10, genderGap: 30 },
  /** C. 하단 와이드 박스 — 도감 설명 */
  boxC: { textX: -850, textY: 170, wrapWidth: 1600 },
  /** D. 좌측 빈 그리드 — 스프라이트/타입/포획수 */
  boxD: { spriteX: -510, spriteY: -150, typeY: -130, type1X: +560, type2X: +800, countY: 105 },
  /** AREA 페이지 지도 — bg_pokedex_1의 흰 박스 안에 들어가도록 축소해 배치한다. */
  area: { x: -35, y: -10, scale: 0.6 },
  /** 하단 녹색 바 — 키 가이드(우측 정렬이라 x는 바의 우측 끝) */
  guide: { x: 915, y: 495 },
} as const;

export class PokedexDetailUi extends BaseUi {
  private bg!: GImage;
  private inputGuide!: KeyGuideBarContainer;

  private front!: GImage;
  private type1!: PokemonTypeContainer;
  private type2!: PokemonTypeContainer;

  private dexNoNameSymbol!: GImage;
  private dexNoName!: GText;
  private species!: GText;
  private tier!: GText;

  private heightSymbol!: GText;
  private heightValue!: GText;
  private weightSymbol!: GText;
  private weightValue!: GText;
  private genderMale!: GText;
  private genderFemale!: GText;
  private captureSymbol!: GText;
  private captureValue!: GText;

  private description!: GText;

  private areaMap!: PokedexAreaMapContainer;

  private titles!: Record<PokedexDetailPage, GImage>;
  private titleCursorLeft!: GImage;
  private titleCursorRight!: GImage;

  private pageContainers!: Record<PokedexDetailPage, GContainer>;
  private page: PokedexDetailPage = PokedexDetailPage.INFO;

  private resolveClose: (() => void) | null = null;

  private transitioning = false;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.MESSAGE_TOP);
    this.createLayout();
  }

  createLayout(): void {
    const scene = this.scene as GameScene;
    this.bg = addBackground(scene, TEXTURE.BG_POKEDEX_0);
    this.add(this.bg);

    this.createTitleLayout();
    this.createAreaLayout();
    this.createSpriteLayout();
    this.createHeaderLayout();
    this.createStatLayout();
    this.createDescriptionLayout();
    this.createInputGuide();

    this.pageContainers = {
      [PokedexDetailPage.INFO]: this.createPageContainer([
        this.front,
        this.type1,
        this.type2,
        this.dexNoNameSymbol,
        this.dexNoName,
        this.species,
        this.tier,
        this.heightSymbol,
        this.heightValue,
        this.weightSymbol,
        this.weightValue,
        this.genderMale,
        this.genderFemale,
        this.captureSymbol,
        this.captureValue,
        this.description,
      ]),
      [PokedexDetailPage.AREA]: this.createPageContainer([this.areaMap]),
      // TODO: FORMS(폼 목록) 페이지 구현 시 여기에 오브젝트를 채운다.
      // [PokedexDetailPage.FORMS]: this.createPageContainer([]),
    };

    // 페이지 컨테이너는 나중에 add되어 위로 올라간다. 페이지와 무관하게 항상 보여야 하는
    // 타이틀 행/키 가이드를 다시 맨 위로 올린다(AREA의 바다 판이 키 가이드를 덮는 것 방지).
    for (const p of PAGE_ORDER) this.bringToTop(this.titles[p]);
    this.bringToTop(this.titleCursorLeft);
    this.bringToTop(this.titleCursorRight);
    this.bringToTop(this.inputGuide);

    this.setPage(PokedexDetailPage.INFO);
  }

  private createPageContainer(objects: Phaser.GameObjects.GameObject[]): GContainer {
    const container = this.scene.add.container(0, 0);
    container.add(objects);
    this.add(container);
    return container;
  }

  private createAreaLayout(): void {
    const { area } = LAYOUT;
    this.areaMap = new PokedexAreaMapContainer(this.scene as GameScene, area.x, area.y);
    this.areaMap.setScale(area.scale);
    this.add(this.areaMap);
  }

  private createTitleLayout(): void {
    const scene = this.scene as GameScene;
    const { title } = LAYOUT;

    const startX = -((PAGE_ORDER.length - 1) / 2) * title.gap;
    const endX = startX + (PAGE_ORDER.length - 1) * title.gap;

    const titles = {} as Record<PokedexDetailPage, GImage>;
    PAGE_ORDER.forEach((page, i) => {
      const image = addImage(
        scene,
        PAGE_TITLE_TEXTURE[page],
        undefined,
        startX + i * title.gap,
        title.y,
      ).setScale(title.scale);
      titles[page] = image;
      this.add(image);
    });
    this.titles = titles;

    this.titleCursorLeft = addImage(
      scene,
      TEXTURE.CURSOR_WHITE,
      undefined,
      startX - title.cursorGap,
      title.y,
    )
      .setScale(title.cursorScale)
      .setFlipX(true);
    this.titleCursorRight = addImage(
      scene,
      TEXTURE.CURSOR_WHITE,
      undefined,
      endX + title.cursorGap,
      title.y,
    ).setScale(title.cursorScale);

    this.add([this.titleCursorLeft, this.titleCursorRight]);
  }

  private setPage(page: PokedexDetailPage): void {
    this.page = page;
    this.bg.setTexture(PAGE_BG_TEXTURE[page]);

    for (const p of PAGE_ORDER) {
      this.titles[p].setAlpha(p === page ? TITLE_ALPHA_ACTIVE : TITLE_ALPHA_INACTIVE);
      this.pageContainers[p].setVisible(p === page);
    }
  }

  private shiftPage(delta: -1 | 1): void {
    const total = PAGE_ORDER.length;
    const nextIdx = (PAGE_ORDER.indexOf(this.page) + delta + total) % total;
    this.setPage(PAGE_ORDER[nextIdx]);
  }

  private createSpriteLayout(): void {
    const scene = this.scene as GameScene;
    const { boxD } = LAYOUT;

    this.front = addImage(scene, 'pokemon.front', '0001', boxD.spriteX, boxD.spriteY).setScale(3.2);

    this.type1 = new PokemonTypeContainer(scene, boxD.type1X, boxD.typeY).setScale(1.7);
    this.type2 = new PokemonTypeContainer(scene, boxD.type2X, boxD.typeY).setScale(1.7);

    this.add([this.front, this.type1, this.type2]);
  }

  private createHeaderLayout(): void {
    const scene = this.scene as GameScene;
    const { boxA } = LAYOUT;

    this.dexNoNameSymbol = addImage(
      scene,
      TEXTURE.OWNED,
      undefined,
      boxA.badgeX,
      boxA.headerY,
    ).setScale(2.6);

    this.dexNoName = addText(
      scene,
      boxA.textX,
      boxA.headerY,
      '',
      95,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.NONE,
    ).setStroke(TEXTCOLOR.GRAY, 14);
    this.dexNoName.setOrigin(0, 0.5);

    this.species = addText(
      scene,
      boxA.bodyX,
      boxA.bodyY,
      '',
      86,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.NONE,
    ).setStroke(TEXTCOLOR.GRAY, 14);
    this.species.setOrigin(1, 0.5);

    this.tier = addText(
      scene,
      boxA.tierX,
      boxA.tierY,
      '',
      85,
      '200',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.tier.setOrigin(1, 0.5);

    this.add([this.dexNoNameSymbol, this.dexNoName, this.species, this.tier]);
  }

  private createStatLayout(): void {
    const scene = this.scene as GameScene;
    const { boxB } = LAYOUT;

    const mkSymbol = (x: number, y: number) => {
      const t = addText(scene, x, y, '', 70, '100', 'left', TEXTSTYLE.BLACK, TEXTSHADOW.NONE);
      t.setOrigin(0, 0.5);
      t.setColor(TEXTCOLOR.GRAY);
      return t;
    };
    const mkValue = (x: number, y: number) => {
      const t = addText(scene, x, y, '', 70, '100', 'left', TEXTSTYLE.BLACK, TEXTSHADOW.GRAY);
      t.setOrigin(0, 0.5);
      return t;
    };

    this.heightSymbol = mkSymbol(boxB.col1X, boxB.row1Y);
    this.heightValue = mkValue(boxB.col1X, boxB.row1Y);
    this.weightSymbol = mkSymbol(boxB.col1X, boxB.row2Y + 10);
    this.weightValue = mkValue(boxB.col1X, boxB.row2Y + 10);

    this.genderMale = mkValue(boxB.col2X, boxB.row1Y);
    this.genderFemale = mkValue(boxB.col2X, boxB.row1Y);
    this.captureSymbol = mkSymbol(boxB.col2X, boxB.row2Y);
    this.captureValue = mkValue(boxB.col2X, boxB.row2Y);

    this.add([
      this.heightSymbol,
      this.heightValue,
      this.weightSymbol,
      this.weightValue,
      this.genderMale,
      this.genderFemale,
      this.captureSymbol,
      this.captureValue,
    ]);

    this.setSymbols();
  }

  private setSymbols(): void {
    const gap = LAYOUT.boxB.valueGap;

    this.heightSymbol.setText(i18next.t('etc:height'));
    this.weightSymbol.setText(i18next.t('etc:weight'));
    this.captureSymbol.setText(i18next.t('etc:pokedexCaptureRate'));

    const columns: Array<Array<[GText, GText]>> = [
      [
        [this.heightSymbol, this.heightValue],
        [this.weightSymbol, this.weightValue],
      ],
      [[this.captureSymbol, this.captureValue]],
    ];

    for (const column of columns) {
      const valueX = Math.max(...column.map(([symbol]) => symbol.x + symbol.displayWidth)) + gap;
      for (const [, value] of column) value.setX(valueX);
    }
  }

  private createDescriptionLayout(): void {
    const scene = this.scene as GameScene;
    const { boxC } = LAYOUT;

    this.description = addText(
      scene,
      boxC.textX,
      boxC.textY,
      '',
      75,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.description.setOrigin(0, 0);

    setAutoWordWrap(this.description, boxC.wrapWidth);

    this.add(this.description);
  }

  private createInputGuide(): void {
    this.inputGuide = new KeyGuideBarContainer(this.scene as GameScene);
    this.inputGuide.create({
      entries: [
        { keys: [i18next.t('etc:arrowKey')], description: i18next.t('etc:move') },
        { actions: [GameAction.CANCEL], description: i18next.t('etc:cancel') },
      ],
      keycapTextSize: 40,
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
    this.inputGuide.setPosition(LAYOUT.guide.x, LAYOUT.guide.y);
    this.add(this.inputGuide);
  }

  async open(pokedexKey: string): Promise<void> {
    this.setPage(PokedexDetailPage.INFO);
    this.setContent(pokedexKey);

    this.transitioning = true;
    await screenFadeOut(this.scene, { duration: FADE_DURATION });
    this.show();
    await screenFadeIn(this.scene, { duration: FADE_DURATION });
    this.transitioning = false;

    return new Promise((resolve) => {
      this.resolveClose = resolve;
    });
  }

  private setContent(pokedexKey: string): void {
    const scene = this.scene as GameScene;
    const masterData = scene.getMasterData();
    const pokedex = scene.getUser()?.getPokedex() ?? [];

    const base = getPokedexBaseId(pokedexKey);
    const hasVariant = pokedexKey !== base;
    const data = masterData.getPokemonData(pokedexKey) ?? masterData.getPokemonData(base);
    const caughtCount = pokedex.find((p) => p.pokedexId === pokedexKey)?.caughtCount ?? 0;

    const tex = getPokemonTexture('sprite', pokedexKey);
    this.front.setTexture(tex.key, tex.frame);
    this.front.clearTint();

    this.areaMap.setPokemon(pokedexKey);

    this.dexNoName.setText(`${base}  ${getPokemonI18Name(pokedexKey)}`);

    const speciesBase = i18next.t(`pokemon:${base}.species`, { defaultValue: '' });
    this.species.setText(
      hasVariant
        ? i18next.t(`pokemon:${pokedexKey}.species`, { defaultValue: speciesBase })
        : speciesBase,
    );

    const descBase = i18next.t(`pokemon:${base}.description`, { defaultValue: '' });
    this.description.setText(
      hasVariant
        ? i18next.t(`pokemon:${pokedexKey}.description`, { defaultValue: descBase })
        : descBase,
    );

    if (!data) {
      this.clearMasterFields();
      return;
    }

    this.type1.setType(data.type1);
    if (data.type2) this.type2.setType(data.type2);
    else this.type2.clear();

    this.tier.setText(i18next.t(RANK_LOCALE[data.rank]));
    this.tier.setColor(RANK_COLOR[data.rank]);

    this.heightValue.setText(`${data.height_m}m`);
    this.weightValue.setText(`${data.weight_kg}kg`);
    this.setGender(data.rate.male, data.rate.female);
    this.captureValue.setText(formatRate(data.rate.capture));
  }

  private setGender(male: number, female: number): void {
    const { col2X, genderGap } = LAYOUT.boxB;

    if (male <= 0 && female <= 0) {
      this.genderMale.setText(i18next.t('etc:pokedexGenderless')).setVisible(true);
      this.genderMale.setX(col2X);
      updateTextColor(this.genderMale, TEXTCOLOR.BLACK, TEXTSHADOW.GRAY);
      this.genderFemale.setVisible(false);
      return;
    }

    this.genderMale.setVisible(male > 0);
    if (male > 0) {
      this.genderMale.setText(`${SYMBOL_MALE}${formatRate(male)}`);
      this.genderMale.setX(col2X);
      updateTextColor(this.genderMale, TEXTCOLOR.MALE, TEXTSHADOW.GRAY);
    }

    this.genderFemale.setVisible(female > 0);
    if (female > 0) {
      this.genderFemale.setText(`${SYMBOL_FEMALE}${formatRate(female)}`);
      this.genderFemale.setX(
        male > 0 ? this.genderMale.x + this.genderMale.displayWidth + genderGap : col2X,
      );
      updateTextColor(this.genderFemale, TEXTCOLOR.FEMALE, TEXTSHADOW.GRAY);
    }
  }

  private clearMasterFields(): void {
    this.type1.clear();
    this.type2.clear();
    this.tier.setText('');
    this.heightValue.setText('');
    this.weightValue.setText('');
    this.genderMale.setVisible(false);
    this.genderFemale.setVisible(false);
    this.captureValue.setText('');
  }

  onInput(_key: string, action: GameAction | null): void {
    if (this.transitioning) return;

    const audio = (this.scene as GameScene).getAudio();

    if (action === GameAction.LEFT || action === GameAction.RIGHT) {
      audio.playEffect(SFX.CURSOR_0);
      this.shiftPage(action === GameAction.LEFT ? -1 : 1);
      return;
    }

    if (action !== GameAction.CANCEL) return;
    audio.playEffect(SFX.CURSOR_0);
    void this.close();
  }

  /** 들어올 때와 같은 암전으로 목록 화면에 돌려준다. */
  private async close(): Promise<void> {
    this.transitioning = true;
    await screenFadeOut(this.scene, { duration: FADE_DURATION });
    this.hide();
    await screenFadeIn(this.scene, { duration: FADE_DURATION });
    this.transitioning = false;

    if (this.resolveClose) {
      const resolve = this.resolveClose;
      this.resolveClose = null;
      resolve();
    }
  }

  errorEffect(_errorMsg: string): void {}

  waitForInput(): Promise<never> {
    return new Promise(() => {});
  }
}

function formatRate(rate: number): string {
  const pct = rate * 100;
  return `${Number.isInteger(pct) ? pct : pct.toFixed(1)}%`;
}
