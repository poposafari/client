import { PartyListContainer } from '@poposafari/containers/party-list.container';
import type { GameScene } from '@poposafari/scenes/game.scene';
import { GameEvent } from '@poposafari/scenes/game.scene';
import DayNightFilter from '@poposafari/utils/day-night-filter';
import {
  DEPTH,
  SYMBOL_MALE,
  TEXTCOLOR,
  TEXTSHADOW,
  TEXTSTROKE,
  TEXTSTYLE,
  TEXTURE,
} from '@poposafari/types';
import type { PokemonRank } from '@poposafari/types';
import {
  addContainer,
  addImage,
  addText,
  getPokemonI18Name,
  updatePokemonGenderIcon,
} from '@poposafari/utils';
import type { BattleAction, BattleContext, BattleModifiers } from '../battle.types';
import { LOCATION_HUD, PLAYER_HUD, WILD_HUD } from '../battle.constants';
import { HudTooltipManager } from '@poposafari/feats/overworld/hud-tooltip.manager';
import i18next from 'i18next';

const TIME_I18N_KEY: Record<string, string> = {
  dawn: 'etc:timeDawn',
  day: 'etc:timeDay',
  dusk: 'etc:timeDusk',
  night: 'etc:timeNight',
};

export class BattleInfoUi extends Phaser.GameObjects.Container {
  private wildHudContainer!: GContainer;
  private playerHudContainer!: GContainer;
  private locationContainer!: GContainer;
  private rateContainer!: GContainer;
  private partyList!: PartyListContainer;

  private wildNameText!: GText;
  private wildLevelSymbol!: GImage;
  private wildLevelText!: GText;
  private wildGenderText!: GText;
  private wildCatchCntIcon!: GImage;
  private wildCatchCnt!: GText;
  private wildShiny!: GImage;
  private catchRateText!: GText;
  private fleeRateText!: GText;
  private catchPreviewText!: GText;
  private fleePreviewText!: GText;
  private catchArrowIcon!: GImage;
  private fleeArrowIcon!: GImage;
  private locationText!: GText;
  private locationLabel: string = '';
  private currentTime: string = '';

  private battleTurn: number = 1;
  private battleTurnText!: GText;

  private playerSafariTitle!: GText;
  private playerLeftSafari!: GText;

  private baseCapture = 0;
  private baseFlee = 0;
  private partyBonus = 0;

  private tooltipManager?: HudTooltipManager;
  /** catch rate 툴팁이 현재 표시값과 동일한 분해를 보여주도록, 마지막 표시 modifiers를 보관. */
  private currentModifiers: BattleModifiers = { bait: false, rock: false };

  // 서버 LEVEL_CURVE (server/lib/constants/level-curve.ts)와 동일하게 유지.
  private static readonly PARTY_LEVEL_COEF = 0.002;
  private static readonly PARTY_LEVEL_CAP = 0.2;
  private static readonly PARTY_SHINY_BONUS = 0.05;
  private static readonly PARTY_TIER_BONUS: Record<PokemonRank, number> = {
    common: 0,
    rare: 0.01,
    epic: 0.02,
    legendary: 0.03,
  };
  private static readonly PARTY_SLOT_COUNT = 6;
  private static readonly CAPTURE_RATE_CAP = 0.999;
  private static readonly FLEE_RATE_CAP = 0.9;

  constructor(scene: GameScene) {
    super(scene, 0, 0);
    this.setScrollFactor(0);
    this.setDepth(DEPTH.HUD + 1);
    scene.add.existing(this);
  }

  private safariBallCount = 0;

  build(ctx: BattleContext): void {
    const scene = this.scene as GameScene;
    const { height } = scene.cameras.main;
    const { width: camW } = scene.cameras.main;

    // ── 야생 HUD ───────────────────────────────────
    this.wildHudContainer = addContainer(scene, 0, WILD_HUD.x, height / 2 + WILD_HUD.yOffset);

    const wildBox = addImage(scene, 'databox_normal_foe', undefined, -30, -50).setScale(3.2);
    this.wildHudContainer.add(wildBox);

    this.wildNameText = addText(
      scene,
      -410,
      -75,
      getPokemonI18Name(ctx.wild.pokedexId),
      80,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.wildHudContainer.add(this.wildNameText);

    this.wildGenderText = addText(
      scene,
      this.wildNameText.x + this.wildNameText.displayWidth + 5,
      -75,
      SYMBOL_MALE,
      75,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    updatePokemonGenderIcon(ctx.wild.gender, this.wildGenderText);
    this.wildHudContainer.add(this.wildGenderText);

    this.wildLevelSymbol = addImage(scene, TEXTURE.ICON_LV, undefined, 180, -72).setScale(3.2);
    this.wildHudContainer.add(this.wildLevelSymbol);

    this.wildLevelText = addText(
      scene,
      this.wildLevelSymbol.x + 40,
      -77,
      `${ctx.wild.level}`,
      72,
      '500',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.wildHudContainer.add(this.wildLevelText);

    this.wildCatchCntIcon = addImage(scene, TEXTURE.ICON_OWNED, undefined, -400, -10)
      .setScale(2.4)
      .setVisible(ctx.wild.caughtCount > 0);
    this.wildHudContainer.add(this.wildCatchCntIcon);

    if (ctx.wild.isShiny) {
      this.wildShiny = addImage(
        scene,
        TEXTURE.ICON_SHINY,
        undefined,
        this.wildLevelText.x + this.wildLevelText.displayWidth + 30,
        -75,
      ).setScale(3);
      this.wildHudContainer.add(this.wildShiny);
    }

    this.add(this.wildHudContainer);

    // ── 확률 HUD (좌상단) ──────────────────────────
    this.initRates(scene, ctx);

    const rateX = 40;
    const rateY = 60;
    this.rateContainer = addContainer(scene, 0, rateX, rateY);

    this.catchRateText = addText(
      scene,
      0,
      0,
      '',
      70,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.rateContainer.add(this.catchRateText);

    this.catchPreviewText = addText(
      scene,
      0,
      0,
      '',
      70,
      '100',
      'left',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.DARK_YELLOW,
    );
    this.rateContainer.add(this.catchPreviewText);

    this.fleeRateText = addText(
      scene,
      0,
      70,
      '',
      70,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.rateContainer.add(this.fleeRateText);

    this.fleePreviewText = addText(
      scene,
      0,
      70,
      '',
      70,
      '100',
      'left',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.DARK_YELLOW,
    );
    this.rateContainer.add(this.fleePreviewText);

    this.catchArrowIcon = addImage(scene, TEXTURE.ICON_RATE_UP, undefined, 0, 0)
      .setScale(2)
      .setVisible(false);
    this.rateContainer.add(this.catchArrowIcon);

    this.fleeArrowIcon = addImage(scene, TEXTURE.ICON_RATE_UP, undefined, 0, 70)
      .setScale(2)
      .setVisible(false);
    this.rateContainer.add(this.fleeArrowIcon);

    this.add(this.rateContainer);
    this.updateRateDisplay({ bait: false, rock: false });

    const tooltipLayer = addContainer(scene, DEPTH.HUD + 2, camW / 2, height / 2);
    this.add(tooltipLayer);
    this.tooltipManager = new HudTooltipManager(scene, tooltipLayer);
    this.tooltipManager.register(this.catchRateText, () => this.buildCatchRateTooltip());
    this.tooltipManager.register(this.fleeRateText, () => this.buildFleeRateTooltip());

    // ── 플레이어 HUD ───────────────────────────────
    this.playerHudContainer = addContainer(scene, 0, PLAYER_HUD.x, height / 2 + PLAYER_HUD.yOffset);

    const playerBox = addImage(scene, 'databox_safari', undefined, +50, 0).setScale(3.2);
    this.playerSafariTitle = addText(
      scene,
      -250,
      -60,
      i18next.t('battle:safariBall'),
      75,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    const user = scene.getUser();
    const bagEntry = user?.getItemBag()?.get('safari-ball');
    this.safariBallCount = bagEntry?.quantity ?? 0;

    this.playerLeftSafari = addText(
      scene,
      -250,
      +0,
      i18next.t('battle:safariLeft', { count: this.safariBallCount }),
      75,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );

    this.partyList = new PartyListContainer(scene);
    this.partyList.create({
      orientation: 'horizontal',
      slotSize: 90,
      spacing: 20,
      iconScale: 1.8,
      showLevel: true,
      nineSlice: { left: 8, right: 8, top: 8, bottom: 8 },
      frameVisible: false,
    });
    this.partyList.setPosition(camW / 2 + 600 - PLAYER_HUD.x, 80);
    this.partyList.refresh();

    this.playerHudContainer.add(playerBox);
    this.playerHudContainer.add(this.playerSafariTitle);
    this.playerHudContainer.add(this.playerLeftSafari);
    this.playerHudContainer.add(this.partyList);

    this.add(this.playerHudContainer);

    // ── 장소/시간 HUD ─────────────────────────────

    const rightEdge = camW - 30; // 화면 우측 끝에서 30px 여백
    this.locationContainer = addContainer(scene, 0, rightEdge, height / 2 + LOCATION_HUD.yOffset);

    this.locationLabel = ctx.locationLabel;
    this.currentTime = DayNightFilter.getCurrentTimeLabel();

    this.locationText = addText(
      scene,
      0,
      0,
      this.buildLocationString(),
      80,
      '100',
      'right',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.locationText.setOrigin(1, 0);
    this.locationContainer.add(this.locationText);

    this.battleTurnText = addText(
      scene,
      0,
      80,
      this.buildTurnString(),
      80,
      '100',
      'right',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.DARK_YELLOW,
    );
    this.battleTurnText.setOrigin(1, 0);
    this.locationContainer.add(this.battleTurnText);

    this.add(this.locationContainer);

    scene.events.on(GameEvent.GAME_TIME_CHANGED, this.onGameTimeChanged, this);
    this.once('destroy', () => {
      scene.events.off(GameEvent.GAME_TIME_CHANGED, this.onGameTimeChanged, this);
      this.tooltipManager?.destroy();
      this.tooltipManager = undefined;
    });

    this.setVisible(false);
  }

  private buildLocationString(): string {
    const mapName = i18next.t(`map:${this.locationLabel}`);
    const timeKey = TIME_I18N_KEY[this.currentTime] ?? 'etc:timeDay';
    const timeName = i18next.t(timeKey);
    return `${mapName} - ${timeName}`;
  }

  private buildTurnString(): string {
    return i18next.t('battle:turn', { turn: this.battleTurn });
  }

  incrementTurn(): void {
    this.battleTurn++;
    this.battleTurnText?.setText(this.buildTurnString());
  }

  private onGameTimeChanged = (timeOfDay: string): void => {
    this.currentTime = timeOfDay;
    this.locationText?.setText(this.buildLocationString());
  };

  show(): void {
    this.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
  }

  refreshParty(): void {
    this.partyList?.refresh();
  }

  updateSafariBallCount(count: number): void {
    this.safariBallCount = count;
    this.playerLeftSafari.setText(i18next.t('battle:safariLeft', { count }));
  }

  getSafariBallCount(): number {
    return this.safariBallCount;
  }

  // Step 3 인트로 연출에서 사용.
  getWildHudContainer() {
    return this.wildHudContainer;
  }
  getPlayerHudContainer() {
    return this.playerHudContainer;
  }

  // ── 확률 계산 ────────────────────────────────────

  private initRates(scene: GameScene, ctx: BattleContext): void {
    const pokemonData = scene.getMasterData().getPokemonData(ctx.wild.pokedexId);
    this.baseCapture = pokemonData?.rate.capture ?? 0;
    this.baseFlee = pokemonData?.rate.flee ?? 0;
    this.partyBonus = this.calculatePartyBonus(scene);
  }

  private calculatePartyBonus(scene: GameScene): number {
    const user = scene.getUser();
    if (!user) return 0;
    const party = user.getParty();
    if (!party || party.length === 0) return 0;

    let sum = 0;
    for (const p of party) {
      const masterPokemon = scene.getMasterData().getPokemonData(String(p.pokedexId));
      const rank: PokemonRank = masterPokemon?.rank ?? 'common';
      const lvlBonus = Math.min(
        BattleInfoUi.PARTY_LEVEL_CAP,
        p.level * BattleInfoUi.PARTY_LEVEL_COEF,
      );
      const shinyBonus = p.isShiny ? BattleInfoUi.PARTY_SHINY_BONUS : 0;
      const tBonus = BattleInfoUi.PARTY_TIER_BONUS[rank] ?? 0;
      sum += lvlBonus + shinyBonus + tBonus;
    }
    return sum / BattleInfoUi.PARTY_SLOT_COUNT;
  }

  private modifierMultipliers(modifiers: BattleModifiers): {
    captureMul: number;
    fleeMul: number;
  } {
    if (modifiers.bait) return { captureMul: 0.5, fleeMul: 0.5 };
    if (modifiers.rock) return { captureMul: 1.5, fleeMul: 1.25 };
    return { captureMul: 1.0, fleeMul: 1.0 };
  }

  private computeRates(modifiers: BattleModifiers): { capture: number; flee: number } {
    const { captureMul, fleeMul } = this.modifierMultipliers(modifiers);

    const capture = Math.min(
      this.baseCapture * captureMul + this.partyBonus,
      BattleInfoUi.CAPTURE_RATE_CAP,
    );
    const flee = Math.min(this.baseFlee * fleeMul, BattleInfoUi.FLEE_RATE_CAP);
    return { capture, flee };
  }

  private buildCatchRateTooltip(): string {
    const { captureMul } = this.modifierMultipliers(this.currentModifiers);
    const base = (this.baseCapture * 100).toFixed(1);

    let result = i18next.t('battle:catchRateBase', { rate: base });

    if (this.partyBonus > 0) {
      const bonus = (this.partyBonus * 100).toFixed(1);
      result += ` + ${i18next.t('battle:catchRatePartyBonus', { rate: bonus })}`;
    }

    const modifierKey = this.currentModifiers.bait
      ? 'battle:catchRateFeed'
      : this.currentModifiers.rock
        ? 'battle:catchRateMud'
        : null;
    if (modifierKey) {
      const delta = this.baseCapture * (captureMul - 1);
      const rate = (Math.abs(delta) * 100).toFixed(1);
      const sign = delta >= 0 ? '+' : '-';
      result += ` ${sign} ${i18next.t(modifierKey, { rate })}`;
    }

    return result;
  }

  private buildFleeRateTooltip(): string {
    const { fleeMul } = this.modifierMultipliers(this.currentModifiers);
    const base = (this.baseFlee * 100).toFixed(1);

    let result = i18next.t('battle:fleeRateBase', { rate: base });

    const modifierKey = this.currentModifiers.bait
      ? 'battle:catchRateFeed'
      : this.currentModifiers.rock
        ? 'battle:catchRateMud'
        : null;
    if (modifierKey) {
      const delta = this.baseFlee * (fleeMul - 1);
      const rate = (Math.abs(delta) * 100).toFixed(1);
      const sign = delta >= 0 ? '+' : '-';
      result += ` ${sign} ${i18next.t(modifierKey, { rate })}`;
    }

    return result;
  }

  /** 현재 modifiers 기반으로 확률 표시를 갱신한다. */
  updateRateDisplay(modifiers: BattleModifiers): void {
    this.currentModifiers = modifiers;
    const { capture, flee } = this.computeRates(modifiers);
    this.catchRateText?.setText(
      i18next.t('battle:catchRate', { rate: (capture * 100).toFixed(1) }),
    );
    this.fleeRateText?.setText(i18next.t('battle:fleeRate', { rate: (flee * 100).toFixed(1) }));
    this.catchPreviewText?.setText('');
    this.fleePreviewText?.setText('');
    this.catchArrowIcon?.setVisible(false);
    this.fleeArrowIcon?.setVisible(false);
  }

  /**
   * 커서가 가리키는 액션에 따른 예상 확률 프리뷰를 표시한다.
   * 현재 확률 → 예상 확률 비교를 보여준다.
   */
  updateRatePreview(modifiers: BattleModifiers, hoveredAction: BattleAction): void {
    const current = this.computeRates(modifiers);

    let previewModifiers: BattleModifiers;
    switch (hoveredAction.type) {
      case 'feed':
        previewModifiers = { bait: true, rock: false };
        break;
      case 'mud':
        previewModifiers = { bait: false, rock: true };
        break;
      case 'ball':
      case 'run':
      default:
        previewModifiers = modifiers;
        break;
    }

    const preview = this.computeRates(previewModifiers);

    if (hoveredAction.type === 'feed' || hoveredAction.type === 'mud') {
      const capDiff = preview.capture - current.capture;
      const fleeDiff = preview.flee - current.flee;

      this.catchPreviewText?.setText(`→ ${(preview.capture * 100).toFixed(1)}%`);
      this.catchPreviewText?.setX(this.catchRateText.x + this.catchRateText.displayWidth + 20);
      this.applyRateColor(this.catchPreviewText, capDiff);
      this.applyArrowIcon(this.catchArrowIcon, this.catchPreviewText, capDiff);

      this.fleePreviewText?.setText(`→ ${(preview.flee * 100).toFixed(1)}%`);
      this.fleePreviewText?.setX(this.fleeRateText.x + this.fleeRateText.displayWidth + 20);
      this.applyRateColor(this.fleePreviewText, fleeDiff);
      this.applyArrowIcon(this.fleeArrowIcon, this.fleePreviewText, fleeDiff);
    } else {
      this.catchPreviewText?.setText('');
      this.fleePreviewText?.setText('');
      this.catchArrowIcon?.setVisible(false);
      this.fleeArrowIcon?.setVisible(false);
    }
  }

  private applyRateColor(text: GText | undefined, diff: number): void {
    if (!text) return;
    if (diff > 0) {
      text.setColor(TEXTCOLOR.RATE_UP);
      text.setShadow(4, 3, '#166534');
    } else if (diff < 0) {
      text.setColor(TEXTCOLOR.RATE_DOWN);
      text.setShadow(4, 3, '#991b1b');
    } else {
      text.setColor(TEXTCOLOR.WHITE);
      text.setShadow(4, 3, TEXTCOLOR.GRAY);
    }
  }

  private applyArrowIcon(
    icon: GImage | undefined,
    previewText: GText | undefined,
    diff: number,
  ): void {
    if (!icon || !previewText) return;
    if (diff === 0) {
      icon.setVisible(false);
      return;
    }
    icon.setTexture(diff > 0 ? TEXTURE.ICON_RATE_UP : TEXTURE.ICON_RATE_DOWN);
    icon.setX(previewText.x + previewText.displayWidth + 35);
    icon.setY(previewText.y + previewText.displayHeight / 2 - 25);
    icon.setVisible(true);
  }
}
