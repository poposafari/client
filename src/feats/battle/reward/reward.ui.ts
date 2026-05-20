import i18next from 'i18next';
import { BaseUi, InputManager } from '@poposafari/core';
import type { GameScene } from '@poposafari/scenes/game.scene';
import {
  DEPTH,
  type GrowthGroup,
  KEY,
  PokemonData,
  type PokemonRank,
  SFX,
  SYMBOL_MALE,
  TEXTCOLOR,
  TEXTSHADOW,
  TEXTSTYLE,
  TEXTURE,
} from '@poposafari/types';
import {
  addImage,
  addText,
  addWindow,
  getPokedexId,
  getPokemonI18Name,
  getPokemonTexture,
  updatePokemonGenderIcon,
} from '@poposafari/utils';
import { PokemonTypeContainer } from '@poposafari/containers/pokemon-type.container';
import { ExpBarContainer } from '@poposafari/containers/exp-bar.container';
import type { CaughtPokemon, PartyExpReward, RewardItem } from '../battle.types';
import type { PartySnapshotEntry } from './reward.phase';

export interface RewardDisplayData {
  pokemon: CaughtPokemon;
  rewards: RewardItem[];
  partySnapshot: PartySnapshotEntry[];
  partyExp: PartyExpReward[];
  userSnapshot: {
    gender: 'male' | 'female';
    equippedCostumes: { costumeId: string }[];
  };
}

const CONST = {
  // ── 메인 컨테이너 (포켓몬 정보) ──────────────────────────────────
  main: {
    x: -200,
    y: -110,
    width: 1000,
    height: 600,
  },

  // 메인 내부 (컨테이너 로컬 좌표)
  tierX: -15,
  tierY: -190,
  spriteX: -235,
  spriteY: -30,
  spriteScale: 2.2,

  infoStartX: -10,
  infoDexNoY: -230,
  infoNameY: -140,
  infoTypeY: -40,
  infoType1OffX: +65,
  infoType2OffX: +200,
  infoRow1Y: +30, // 성격 | 특성
  infoRow2Y: +150, // 지닌물건 | 스킬
  infoColGap: 250,

  // ── 보상 컨테이너 (메인 바로 아래) ──────────────────────────────
  reward: {
    x: -200,
    y: +285,
    width: 1000,
    height: 180,
  },
  // 보상 내부 (컨테이너 로컬 좌표)
  rwY: 0,
  rwIconOffY: -20,
  rwQtyOffY: 0,
  rwNameOffY: +35,
  rwSlotWidth: 200,

  // ── 파티 EXP 패널 (오른쪽 세로 리스트) ──────────────────────────
  partyPanel: {
    x: +560,
    y: -10,
    width: 520,
    height: 800,
  },
  partyTitleY: -350,
  partyRowStartY: -240,
  partyRowGap: 110,
  partyIconX: -160,
  partyIconScale: 2,
  partyLevelX: -85,
  partyLevelY: -25,
  partyBarX: -80,
  partyBarY: +15,
  partyBarWidth: 250,
  partyBarHeight: 22,
  partyGainedX: +140,
  partyGainedY: -30,

  // ── 힌트 (루트 기준) ─────────────────────────────────────────────
  hintY: +450,
} as const;

const RANK_COLOR: Record<PokemonRank, string> = {
  common: TEXTCOLOR.COMMON,
  rare: TEXTCOLOR.RARE,
  epic: TEXTCOLOR.EPIC,
  legendary: TEXTCOLOR.LEGENDARY,
};

const RANK_LOCALE: Record<PokemonRank, string> = {
  common: 'etc:tierCommon',
  rare: 'etc:tierRare',
  epic: 'etc:tierEpic',
  legendary: 'etc:tierLegendary',
};

interface PartyExpRow {
  id: number;
  group: GrowthGroup;
  beforeLevel: number;
  beforeExp: number;
  afterLevel: number;
  afterExp: number;
  gained: number;
  levelText: Phaser.GameObjects.Text;
  gainedText: Phaser.GameObjects.Text;
  expBar: ExpBarContainer;
}

export class RewardUi extends BaseUi {
  private resolver: (() => void) | null = null;

  // ── party exp panel runtime refs ────────────────────────────────
  private partyRows: PartyExpRow[] = [];
  private partyContainer: Phaser.GameObjects.Container | null = null;

  private animating = false;
  private skipRequested = false;

  constructor(
    scene: GameScene,
    private readonly inputManager2: InputManager,
  ) {
    super(scene, inputManager2, DEPTH.HUD + 10);
  }

  createLayout(): void {}

  onInput(key: string): void {
    if (key !== KEY.Z && key !== KEY.ENTER) return;
    if (this.animating) {
      this.skipRequested = true;
      return;
    }
    this.resolveAndHide();
  }

  errorEffect(_msg: string): void {}

  waitForInput(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.resolver = resolve;
    });
  }

  async build(data: RewardDisplayData): Promise<void> {
    this.removeAll(true);
    this.buildLayout(data);
    this.setAlpha(0);
    this.animating = true;
    super.show();
    await this.slideUpReveal();
    await this.animateExpGain(data);
  }

  private buildLayout(data: RewardDisplayData): void {
    const scene = this.scene as GameScene;
    const { pokemon, rewards } = data;
    const pokemonData = scene.getMasterData().getPokemonData(pokemon.pokedexId);
    const rank: PokemonRank = pokemonData?.rank ?? 'common';

    // ── 배경 오버레이 (검정 반투명) ───────────────────────────────
    const { width: camW, height: camH } = scene.cameras.main;
    const backdrop = scene.add
      .rectangle(0, 0, camW * 2, camH * 2, 0x000000, 0.6)
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0);
    this.add(backdrop);

    // ── 메인 컨테이너: 포켓몬 정보 ─────────────────────────────────
    const mainContainer = scene.add.container(CONST.main.x, CONST.main.y);
    this.add(mainContainer);
    mainContainer.add(
      addWindow(
        scene,
        TEXTURE.WINDOW_3,
        0,
        0,
        CONST.main.width,
        CONST.main.height,
        2.4,
        16,
        16,
        16,
        16,
      ),
    );

    // Tier 배지
    const tierText = addText(
      this.scene,
      CONST.tierX,
      CONST.tierY,
      i18next.t(RANK_LOCALE[rank]),
      50,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.NONE,
    );
    tierText.setStyle({ color: RANK_COLOR[rank] });
    mainContainer.add(tierText);

    // 포켓몬 스프라이트
    const tex = getPokemonTexture(
      'sprite',
      pokemon.pokedexId,
      { isShiny: pokemon.isShiny, isFemale: pokemon.gender === 2 },
      scene,
    );
    mainContainer.add(
      addImage(scene, tex.key, tex.frame, CONST.spriteX, CONST.spriteY).setScale(CONST.spriteScale),
    );

    this.buildPokemonInfoColumn(pokemon, pokemonData, mainContainer);

    // ── 보상 컨테이너: 보상 아이템 윈도우 ──────────────────────────
    const rewardContainer = scene.add.container(CONST.reward.x, CONST.reward.y);
    this.add(rewardContainer);
    rewardContainer.add(
      addWindow(
        scene,
        TEXTURE.WINDOW_3,
        0,
        0,
        CONST.reward.width,
        CONST.reward.height,
        2.4,
        16,
        16,
        16,
        16,
      ),
    );
    this.buildRewardGrid(rewards, rewardContainer);

    // ── 파티 EXP 패널 (세로 리스트) ─────────────────────────────────
    const partyContainer = scene.add.container(CONST.partyPanel.x, CONST.partyPanel.y);
    this.add(partyContainer);
    this.partyContainer = partyContainer;
    partyContainer.add(
      addWindow(
        scene,
        TEXTURE.WINDOW_3,
        0,
        0,
        CONST.partyPanel.width,
        CONST.partyPanel.height,
        2.4,
        16,
        16,
        16,
        16,
      ),
    );
    this.buildPartySection(data, partyContainer);

    // ── Z/Enter 힌트 (루트) ────────────────────────────────────────
    const hintText = addText(
      scene,
      0,
      CONST.hintY,
      'Z / Enter',
      80,
      '120',
      'center',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    );
    hintText.setAlpha(1);
    this.add(hintText);
    this.scene.time.addEvent({
      delay: 450,
      loop: true,
      callback: () => {
        if (!hintText.active) return;
        hintText.setAlpha(hintText.alpha > 0 ? 0 : 1);
      },
    });
  }

  private buildPokemonInfoColumn(
    pokemon: CaughtPokemon,
    pokemonData: PokemonData | null,
    target: Phaser.GameObjects.Container,
  ): void {
    const scene = this.scene as GameScene;
    const xBase = CONST.infoStartX;

    // No.XXXX
    target.add(
      addText(
        scene,
        xBase,
        CONST.infoDexNoY,
        `No.${getPokedexId(pokemon.pokedexId)}`,
        40,
        '100',
        'left',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      ),
    );

    // Name + Gender + Lv + Shiny
    const pokemonName = getPokemonI18Name(pokemon.pokedexId);
    const nameText = addText(
      scene,
      xBase - 5,
      CONST.infoNameY,
      pokemonName,
      80,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    target.add(nameText);

    let cursorX = nameText.displayWidth + nameText.x;
    const genderText = addText(
      scene,
      cursorX,
      CONST.infoNameY,
      SYMBOL_MALE,
      70,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    ).setOrigin(0, 0.5);
    updatePokemonGenderIcon(pokemon.gender, genderText);
    target.add(genderText);

    const genderCursorX = genderText.displayWidth + genderText.x;
    const lvIcon = addImage(
      scene,
      TEXTURE.ICON_LV,
      undefined,
      CONST.infoStartX - 10,
      CONST.infoNameY + 50,
    )
      .setOrigin(0, 0.5)
      .setScale(2.4);
    target.add(lvIcon);
    const lvText = addText(
      scene,
      CONST.infoStartX + lvIcon.displayWidth + 5,
      CONST.infoNameY + 50,
      `${pokemon.level}`,
      40,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.NONE,
    ).setOrigin(0, 0.5);
    target.add(lvText);
    cursorX += lvIcon.displayWidth + 8 + lvText.width + 14;

    if (pokemon.isShiny) {
      const shinyInline = addImage(
        scene,
        TEXTURE.ICON_SHINY,
        undefined,
        genderCursorX + 30,
        CONST.infoNameY - 5,
      ).setScale(3.2);
      target.add(shinyInline);
    }

    // Type1 Type2
    const infoType1 = new PokemonTypeContainer(scene, xBase + CONST.infoType1OffX, CONST.infoTypeY);
    const infoType2 = new PokemonTypeContainer(scene, xBase + CONST.infoType2OffX, CONST.infoTypeY);
    target.add(infoType1);
    target.add(infoType2);

    if (pokemonData) {
      infoType1.setType(pokemonData.type1);
      if (pokemonData.type2) {
        infoType2.setType(pokemonData.type2);
      } else {
        infoType2.setVisible(false);
      }
    } else {
      infoType1.setVisible(false);
      infoType2.setVisible(false);
    }

    // Row1: 성격 | 특성
    // Row2: 지닌물건 | 스킬 (단일 텍스트)
    const heldItem = pokemon.heldItemId
      ? i18next.t(`item:${pokemon.heldItemId}.name`, { defaultValue: pokemon.heldItemId })
      : i18next.t('etc:noneSymbol');
    const skillText =
      pokemon.skills.length > 0
        ? i18next.t(`pokemonHiddenMove:${pokemon.skills[0]}`, { defaultValue: pokemon.skills[0] })
        : i18next.t('etc:noneSymbol');

    this.addInfoPair(
      xBase,
      CONST.infoRow1Y,
      i18next.t('etc:natureSymbol'),
      i18next.t(`nature:${pokemon.natureId}`, { defaultValue: pokemon.natureId }),
      target,
    );
    this.addInfoPair(
      xBase + CONST.infoColGap,
      CONST.infoRow1Y,
      i18next.t('etc:abilitySymbol'),
      i18next.t(`ability:${pokemon.abilityId}`, { defaultValue: pokemon.abilityId }),
      target,
    );

    this.addInfoPair(xBase, CONST.infoRow2Y, i18next.t('etc:heldItemSymbol'), heldItem, target);
    this.addInfoPair(
      xBase + CONST.infoColGap,
      CONST.infoRow2Y,
      i18next.t('etc:skillSymbol'),
      skillText,
      target,
    );
  }

  private addInfoPair(
    x: number,
    y: number,
    label: string,
    value: string,
    target: Phaser.GameObjects.Container,
  ): void {
    const scene = this.scene as GameScene;
    const lbl = addText(
      scene,
      x,
      y,
      label,
      50,
      '100',
      'left',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    ).setOrigin(0, 0.5);
    const val = addText(
      scene,
      x,
      y + 50,
      value,
      50,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setOrigin(0, 0.5);
    target.add(lbl);
    target.add(val);
  }

  private buildRewardGrid(rewards: RewardItem[], target: Phaser.GameObjects.Container): void {
    const scene = this.scene as GameScene;
    const count = Math.min(rewards.length, 4);
    if (count === 0) return;

    const totalWidth = count * CONST.rwSlotWidth;
    const startX = -totalWidth / 2 + CONST.rwSlotWidth / 2;

    for (let i = 0; i < count; i++) {
      const rw = rewards[i];
      const slotX = startX + i * CONST.rwSlotWidth;

      // itemId 가 그대로 텍스처 키. 없으면 기본 아이콘으로 대체.
      const iconKey = scene.textures.exists(rw.itemId) ? rw.itemId : TEXTURE.ICON_CANDY;
      target.add(
        addImage(scene, iconKey, undefined, slotX, CONST.rwY + CONST.rwIconOffY).setScale(4),
      );
      target.add(
        addText(
          scene,
          slotX + 8,
          CONST.rwY + CONST.rwQtyOffY,
          `x${rw.quantity}`,
          50,
          '100',
          'left',
          TEXTSTYLE.WHITE,
          TEXTSHADOW.GRAY,
        ),
      );
      const itemName = i18next.t(`item:${rw.itemId}.name`, { defaultValue: rw.itemId });
      target.add(
        addText(
          scene,
          slotX,
          CONST.rwY + CONST.rwNameOffY,
          itemName,
          30,
          '100',
          'center',
          TEXTSTYLE.WHITE,
          TEXTSHADOW.GRAY,
        ),
      );
    }
  }

  private buildPartySection(data: RewardDisplayData, target: Phaser.GameObjects.Container): void {
    const scene = this.scene as GameScene;
    this.partyRows = [];

    // 패널 타이틀
    target.add(
      addText(
        scene,
        0,
        CONST.partyTitleY,
        i18next.t('battle:rewardPartyExp', { defaultValue: 'PARTY EXP' }),
        56,
        '120',
        'center',
        TEXTSTYLE.YELLOW,
        TEXTSHADOW.DARK_YELLOW,
      ),
    );

    const expById = new Map((data.partyExp ?? []).map((e) => [e.id, e]));
    if (expById.size === 0) return;

    data.partySnapshot.forEach((snap, index) => {
      const entry = expById.get(snap.id);
      if (!entry) return;
      const rowY = CONST.partyRowStartY + index * CONST.partyRowGap;
      const row = this.buildPartyRow(snap, entry, rowY, target);
      if (row) this.partyRows.push(row);
    });
  }

  private buildPartyRow(
    snap: PartySnapshotEntry,
    entry: PartyExpReward,
    rowY: number,
    target: Phaser.GameObjects.Container,
  ): PartyExpRow | null {
    const scene = this.scene as GameScene;

    // 포켓몬 아이콘 (icon atlas는 ${pokedex}_0 형태의 첫 프레임을 사용)
    const tex = getPokemonTexture('icon', snap.pokedexId, { isShiny: snap.isShiny }, scene);
    const icon = addImage(scene, tex.key, tex.frame + '_0', CONST.partyIconX, rowY).setScale(
      CONST.partyIconScale,
    );
    target.add(icon);

    // 레벨 라벨 (시작값 = 캡쳐 직전 레벨)
    const levelText = addText(
      scene,
      CONST.partyLevelX,
      rowY + CONST.partyLevelY,
      `Lv.${snap.level}`,
      44,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    target.add(levelText);

    // +N EXP 텍스트
    const gainedText = addText(
      scene,
      CONST.partyGainedX,
      rowY + CONST.partyGainedY,
      entry.gained > 0 ? `+${entry.gained}` : '',
      36,
      '100',
      'right',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    );
    target.add(gainedText);

    const pokemonData = scene.getMasterData().getPokemonData(snap.pokedexId);
    const group: GrowthGroup = pokemonData?.growthGroup ?? 'medium_fast';

    const expBar = new ExpBarContainer(
      scene,
      CONST.partyBarX + CONST.partyBarWidth / 2,
      rowY + CONST.partyBarY,
      { width: CONST.partyBarWidth, height: CONST.partyBarHeight },
    );
    expBar.setProgress(snap.level, snap.exp, group);
    target.add(expBar);

    return {
      id: entry.id,
      group,
      beforeLevel: snap.level,
      beforeExp: snap.exp,
      afterLevel: entry.level,
      afterExp: entry.exp,
      gained: entry.gained,
      levelText,
      gainedText,
      expBar,
    };
  }

  private async animateExpGain(data: RewardDisplayData): Promise<void> {
    if (this.partyRows.length === 0) {
      this.animating = false;
      return;
    }

    const hasAnyGain = this.partyRows.some((r) => r.gained > 0);
    if (!hasAnyGain) {
      for (const row of this.partyRows) this.snapRowToFinal(row);
      this.animating = false;
      return;
    }

    const audio = (this.scene as GameScene).getAudio();
    const expGainLoop = audio.playEffectLoop(SFX.EXP_GAIN);

    try {
      await Promise.all(this.partyRows.map((row) => this.animateRow(row)));
    } finally {
      audio.stopEffectLoop(expGainLoop);
    }

    for (const row of this.partyRows) this.snapRowToFinal(row);
    this.animating = false;
    this.skipRequested = false;
  }

  private async animateRow(row: PartyExpRow): Promise<void> {
    if (row.gained <= 0) {
      this.snapRowToFinal(row);
      return;
    }

    await row.expBar.animate({
      beforeLevel: row.beforeLevel,
      beforeExp: row.beforeExp,
      afterLevel: row.afterLevel,
      afterExp: row.afterExp,
      group: row.group,
      shouldSkip: () => this.skipRequested,
      onLevelUp: async (newLevel) => {
        await this.flashLevelUp(row, newLevel);
      },
    });
  }

  private snapRowToFinal(row: PartyExpRow): void {
    row.levelText.setText(`Lv.${row.afterLevel}`);
    row.expBar.setProgress(row.afterLevel, row.afterExp, row.group);
  }

  private async flashLevelUp(row: PartyExpRow, newLevel: number): Promise<void> {
    const scene = this.scene as GameScene;
    scene.getAudio().playEffect(SFX.EXP_FULL);
    row.levelText.setText(`Lv.${newLevel}`);
    await new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: row.levelText,
        scale: { from: 1.35, to: 1.0 },
        duration: 240,
        ease: 'Back.easeOut',
        onComplete: () => resolve(),
      });
    });
  }

  private async slideUpReveal(): Promise<void> {
    const scene = this.scene as GameScene;
    const slideOffset = 80;
    this.y += slideOffset;

    const overlay = addWindow(
      scene,
      TEXTURE.WINDOW_0,
      0,
      0,
      CONST.main.width,
      CONST.main.height,
      3,
      16,
      16,
      16,
      16,
    );
    overlay.setTintFill(0xffffff);
    this.add(overlay);

    await new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: this,
        y: this.y - slideOffset,
        alpha: 1,
        duration: 500,
        ease: 'Cubic.easeOut',
      });
      this.scene.tweens.add({
        targets: overlay,
        alpha: 0,
        duration: 600,
        ease: 'Linear',
        onComplete: () => {
          overlay.destroy();
          resolve();
        },
      });
    });
  }

  private resolveAndHide(): void {
    if (!this.resolver) return;
    const r = this.resolver;
    this.resolver = null;
    this.hide();
    r();
  }
}
