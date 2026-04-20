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
import i18next from 'i18next';

const TIME_I18N_KEY: Record<string, string> = {
  dawn: 'menu:timeDawn',
  day: 'menu:timeDay',
  dusk: 'menu:timeDusk',
  night: 'menu:timeNight',
};

export class BattleInfoUi extends Phaser.GameObjects.Container {
  private wildHudContainer!: GContainer;
  private playerHudContainer!: GContainer;
  private locationContainer!: GContainer;
  private rateContainer!: GContainer;
  private partyList!: PartyListContainer;

  private wildNameText!: GText;
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

  // 서버 LEVEL_CURVE (server/lib/constants/level-curve.ts)와 동일하게 유지.
  private static readonly PARTY_LEVEL_COEF = 0.0003;
  private static readonly PARTY_LEVEL_CAP = 0.3;
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

    const wildBox = addImage(scene, 'databox_normal_foe', undefined, -84, -50).setScale(3.2);
    this.wildHudContainer.add(wildBox);

    this.wildNameText = addText(
      scene,
      -470,
      -75,
      getPokemonI18Name(ctx.wild.pokedexId),
      90,
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
      90,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    updatePokemonGenderIcon(ctx.wild.gender, this.wildGenderText);
    this.wildHudContainer.add(this.wildGenderText);

    this.wildLevelText = addText(
      scene,
      this.wildGenderText.x + this.wildGenderText.displayWidth + 5,
      -72,
      `(+${ctx.wild.level})`,
      75,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.wildHudContainer.add(this.wildLevelText);

    this.wildCatchCntIcon = addImage(scene, TEXTURE.ICON_OWNED, undefined, -445, -10)
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

    // ── 플레이어 HUD ───────────────────────────────
    this.playerHudContainer = addContainer(scene, 0, PLAYER_HUD.x, height / 2 + PLAYER_HUD.yOffset);

    const playerBox = addImage(scene, 'databox_safari', undefined, +79, 0).setScale(3.2);
    this.playerSafariTitle = addText(
      scene,
      -220,
      -50,
      i18next.t('menu:safariBall'),
      70,
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
      -220,
      +10,
      i18next.t('menu:safariLeft', { count: this.safariBallCount }),
      70,
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
    this.partyList.setPosition(camW / 2 + 620 - PLAYER_HUD.x, 80);
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
    });

    this.setVisible(false);
  }

  private buildLocationString(): string {
    const mapName = i18next.t(`menu:${this.locationLabel}`);
    const timeKey = TIME_I18N_KEY[this.currentTime] ?? 'menu:timeDay';
    const timeName = i18next.t(timeKey);
    return `${mapName} - ${timeName}`;
  }

  private buildTurnString(): string {
    return i18next.t('menu:battleTurn', { turn: this.battleTurn });
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
    this.playerLeftSafari.setText(i18next.t('menu:safariLeft', { count }));
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

    const tierBonus: Record<string, number> = {
      common: 0,
      rare: 0,
      epic: 0.03,
      legendary: 0.05,
      mythical: 0.05,
    };

    let maxBonus = 0;
    for (const p of party) {
      const masterPokemon = scene.getMasterData().getPokemonData(String(p.pokedexId));
      const rank: PokemonRank = masterPokemon?.rank ?? 'common';
      const lvlBonus = Math.min(
        BattleInfoUi.PARTY_LEVEL_CAP,
        p.level * BattleInfoUi.PARTY_LEVEL_COEF,
      );
      const shinyBonus = p.isShiny ? 0.03 : 0;
      const tBonus = tierBonus[rank] ?? 0;
      maxBonus = Math.max(maxBonus, lvlBonus + shinyBonus + tBonus);
    }
    return maxBonus;
  }

  private computeRates(modifiers: BattleModifiers): { capture: number; flee: number } {
    let captureMul = 1.0;
    let fleeMul = 1.0;

    if (modifiers.bait) {
      captureMul = 0.5;
      fleeMul = 0.5;
    } else if (modifiers.rock) {
      captureMul = 1.5;
      fleeMul = 2.0;
    }

    const capture = Math.min(
      this.baseCapture * captureMul + this.partyBonus,
      BattleInfoUi.CAPTURE_RATE_CAP,
    );
    const flee = Math.min(this.baseFlee * fleeMul, BattleInfoUi.FLEE_RATE_CAP);
    return { capture, flee };
  }

  /** 현재 modifiers 기반으로 확률 표시를 갱신한다. */
  updateRateDisplay(modifiers: BattleModifiers): void {
    const { capture, flee } = this.computeRates(modifiers);
    this.catchRateText?.setText(
      i18next.t('menu:battleCatchRate', { rate: (capture * 100).toFixed(1) }),
    );
    this.fleeRateText?.setText(i18next.t('menu:battleFleeRate', { rate: (flee * 100).toFixed(1) }));
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
