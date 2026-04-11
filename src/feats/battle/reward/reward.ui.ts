import i18next from 'i18next';
import { BaseUi, InputManager } from '@poposafari/core';
import type { GameScene } from '@poposafari/scenes/game.scene';
import {
  DEPTH,
  KEY,
  SYMBOL_MALE,
  TEXTCOLOR,
  TEXTSHADOW,
  TEXTSTROKE,
  TEXTSTYLE,
  TEXTURE,
} from '@poposafari/types';
import {
  addImage,
  addText,
  addWindow,
  getPokemonI18Name,
  getPokemonTexture,
  getPokemonTypeFrame,
  updatePokemonGenderIcon,
} from '@poposafari/utils';
import type { CatchReward, CaughtPokemon } from '../battle.types';

export interface RewardDisplayData {
  pokemon: CaughtPokemon;
  rewards: CatchReward[];
}

const CONST = {
  base: { width: 760, height: 980 },

  tierY: -430,
  shinyX: +315,
  spriteY: -280,
  spriteScale: 2.3,

  // ── 내부 화이트 패널 ─────────────────────────────────────────────────────
  panel: { width: 700, height: 710, y: +100 },

  typeY: 0,
  dexNoY: -130,
  nameY: -70,

  // 구분선 1 (그리드 위)
  divider1Y: +50,

  // Row: 레벨 | 성격 | 특성 | 지닌도구 | 기술  (5 열)
  rLblY: +90,
  rValY: +150,
  rCols: [-260, -130, 0, +130, +260] as const,

  // 구분선 2 (보상 위)
  divider2Y: +210,

  // 보상 영역 (1~4개 가로 배치)
  rwY: +290,
  rwIconOffY: -15,
  rwQtyOffY: 0,
  rwNameOffY: +30,
  rwSlotWidth: 180,

  // 보관 위치
  boxY: +355,

  hintY: +420,

  // 구분선 공통
  dividerWidth: 640,
  dividerColor: 0xcccccc,
  dividerAlpha: 0.6,
} as const;

// ── Tier 스타일 ────────────────────────────────────────────────────────────────
const TIER_LABEL: Record<string, string> = {
  common: 'COMMON',
  rare: '◆  RARE',
  epic: '◆  EPIC',
  legendary: '★  LEGENDARY',
};
const TIER_COLOR: Record<string, string> = {
  common: TEXTCOLOR.LIGHT_GRAY,
  rare: TEXTCOLOR.RARE,
  epic: TEXTCOLOR.EPIC,
  legendary: TEXTCOLOR.LEGENDARY,
};

export class RewardUi extends BaseUi {
  private resolver: (() => void) | null = null;

  constructor(
    scene: GameScene,
    private readonly inputManager2: InputManager,
  ) {
    super(scene, inputManager2, DEPTH.HUD + 10);
  }

  createLayout(): void {}

  onInput(key: string): void {
    if (key === KEY.Z || key === KEY.ENTER) {
      this.resolveAndHide();
    }
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
    super.show();
    await this.slideUpReveal();
  }

  private buildLayout(data: RewardDisplayData): void {
    const scene = this.scene as GameScene;
    const { pokemon, rewards } = data;
    const pokemonData = scene.getMasterData().getPokemonData(pokemon.pokedexId);
    const rank = pokemonData?.rank ?? 'common';

    // ── 베이스 패널 ───────────────────────────────────────────────────────────
    this.add(
      addWindow(
        scene,
        TEXTURE.WINDOW_3,
        0,
        0,
        CONST.base.width,
        CONST.base.height,
        3,
        16,
        16,
        16,
        16,
      ),
    );

    // ── 내부 화이트 패널 ──────────────────────────────────────────────────────
    this.add(
      addWindow(
        scene,
        TEXTURE.WINDOW_WHITE,
        0,
        CONST.panel.y,
        CONST.panel.width,
        CONST.panel.height,
        1,
        16,
        16,
        16,
        16,
      ),
    );

    // ── Tier 배지 (상단 좌) + Shiny 아이콘 (상단 우) ─────────────────────────
    const tierLabel = TIER_LABEL[rank] ?? rank.toUpperCase();
    const tierColor = TIER_COLOR[rank] ?? TEXTCOLOR.LIGHT_GRAY;
    this.add(
      scene.add
        .text(-CONST.base.width / 2 + 40, CONST.tierY, tierLabel, {
          fontSize: '42px',
          fontFamily: 'bw_font',
          color: tierColor,
        })
        .setOrigin(0, 0.5)
        .setScrollFactor(0),
    );
    if (pokemon.isShiny) {
      this.add(
        addImage(scene, TEXTURE.ICON_SHINY, undefined, CONST.shinyX, CONST.tierY).setScale(2),
      );
    }

    // ── 포켓몬 스프라이트 (크게) ──────────────────────────────────────────────
    const tex = getPokemonTexture(
      'sprite',
      pokemon.pokedexId,
      { isShiny: pokemon.isShiny, isFemale: pokemon.gender === 2 },
      scene,
    );
    this.add(addImage(scene, tex.key, tex.frame, 0, CONST.spriteY).setScale(CONST.spriteScale));

    // ── 화이트 패널: 타입 아이콘 ─────────────────────────────────────────────
    if (pokemonData) {
      const hasTwo = !!pokemonData.type2;
      const typeScale = 1.5;
      const typeHalfW = 16 * typeScale;
      const typeGap = 56;
      this.add(
        addImage(
          scene,
          TEXTURE.TYPES,
          getPokemonTypeFrame(pokemonData.type1),
          hasTwo ? -(typeHalfW + typeGap / 2) : 0,
          CONST.typeY,
        ).setScale(typeScale),
      );
      if (hasTwo) {
        this.add(
          addImage(
            scene,
            TEXTURE.TYPES,
            getPokemonTypeFrame(pokemonData.type2!),
            typeHalfW + typeGap / 2,
            CONST.typeY,
          ).setScale(typeScale),
        );
      }
    }

    // ── 도감 번호 ────────────────────────────────────────────────────────────
    this.add(
      addText(
        scene,
        0,
        CONST.dexNoY,
        `No.${pokemon.pokedexId}`,
        45,
        '100',
        'center',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.NONE,
      ).setStroke(TEXTCOLOR.GRAY, 6),
    );

    // ── 포켓몬 이름 + 성별 기호 (이름 바로 옆) ──────────────────────────────
    const pokemonName = getPokemonI18Name(pokemon.pokedexId);

    const nameText = addText(
      scene,
      0,
      CONST.nameY,
      pokemonName,
      95,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.NONE,
    ).setStroke(TEXTCOLOR.GRAY, 8);
    this.add(nameText);

    const genderText = addText(
      scene,
      nameText.x + nameText.width / 2 + 15,
      CONST.nameY,
      SYMBOL_MALE,
      80,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    updatePokemonGenderIcon(pokemon.gender, genderText);
    this.add(genderText);

    // ── 구분선 1 (그리드 위) ─────────────────────────────────────────────────
    this.add(this.createDivider(scene, CONST.divider1Y));

    // ── Grid Row: 레벨 | 성격 | 특성 | 지닌도구 | 기술 (5 열) ───────────────
    const [RC0, RC1, RC2, RC3, RC4] = CONST.rCols;

    const heldItem = pokemon.heldItemId
      ? i18next.t(`item:${pokemon.heldItemId}.name`, { defaultValue: pokemon.heldItemId })
      : i18next.t('menu:rewardNone');
    const skillsText =
      pokemon.skills.length > 0 ? pokemon.skills.join(', ') : i18next.t('menu:rewardNone');

    const cells = [
      { x: RC0, label: 'Lv', value: `${pokemon.level}` },
      {
        x: RC1,
        label: i18next.t('menu:rewardNature'),
        value: i18next.t(`nature:${pokemon.natureId}`, { defaultValue: pokemon.natureId }),
      },
      {
        x: RC2,
        label: i18next.t('menu:rewardAbility'),
        value: i18next.t(`ability:${pokemon.abilityId}`, { defaultValue: pokemon.abilityId }),
      },
      { x: RC3, label: i18next.t('menu:rewardHeldItem'), value: heldItem },
      { x: RC4, label: i18next.t('menu:rewardSkills'), value: skillsText },
    ];
    for (const cell of cells) {
      this.add(
        addText(
          scene,
          cell.x,
          CONST.rLblY,
          cell.label,
          36,
          '100',
          'center',
          TEXTSTYLE.SIG_0,
          TEXTSHADOW.NONE,
        ).setAlpha(0.75),
      );
      this.add(
        addText(
          scene,
          cell.x,
          CONST.rValY,
          cell.value,
          42,
          '100',
          'center',
          TEXTSTYLE.BLACK,
          TEXTSHADOW.NONE,
        ).setAlpha(0.75),
      );
    }

    // ── 구분선 2 (보상 위) ───────────────────────────────────────────────────
    this.add(this.createDivider(scene, CONST.divider2Y));

    // ── 보상 (1~4개 가로 배치, 중앙 기준) ────────────────────────────────────
    const count = Math.min(rewards.length, 4);
    const totalWidth = count * CONST.rwSlotWidth;
    const startX = -totalWidth / 2 + CONST.rwSlotWidth / 2;

    for (let i = 0; i < count; i++) {
      const rw = rewards[i];
      const slotX = startX + i * CONST.rwSlotWidth;

      this.add(
        addImage(
          scene,
          TEXTURE.ICON_CANDY,
          undefined,
          slotX,
          CONST.rwY + CONST.rwIconOffY,
        ).setScale(2.4),
      );
      this.add(
        addText(
          scene,
          slotX + 10,
          CONST.rwY + CONST.rwQtyOffY,
          `x${rw.candyQuantity}`,
          42,
          '100',
          'left',
          TEXTSTYLE.BLACK,
          TEXTSHADOW.NONE,
        ),
      );
      const candyName = i18next.t(`item:${rw.candyId}.name`, { defaultValue: rw.candyId });
      this.add(
        addText(
          scene,
          slotX,
          CONST.rwY + CONST.rwNameOffY,
          candyName,
          32,
          '100',
          'center',
          TEXTSTYLE.BLACK,
          TEXTSHADOW.NONE,
        ),
      );
    }

    // ── 보관 위치 ─────────────────────────────────────────────────────────────
    // const boxText = i18next.t('menu:rewardBoxLocation', {
    //   box: pokemon.boxNumber,
    //   defaultValue: `BOX ${pokemon.boxNumber}에 보관되었다!`,
    // });
    // this.add(
    //   addText(scene, 0, CONST.boxY, boxText, 38, '100', 'center', TEXTSTYLE.WHITE, TEXTSHADOW.GRAY),
    // );

    // ── Z/Enter 힌트 ──────────────────────────────────────────────────────────
    const hintText = addText(
      scene,
      0,
      CONST.hintY,
      'Z / Enter',
      52,
      '120',
      'center',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.DARK_YELLOW,
    );
    hintText.setAlpha(0);
    this.add(hintText);
    this.scene.tweens.add({
      targets: hintText,
      alpha: { from: 0, to: 0.6 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /** 수평 구분선을 생성한다. */
  private createDivider(scene: GameScene, y: number): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    g.lineStyle(2, CONST.dividerColor, CONST.dividerAlpha);
    g.lineBetween(-CONST.dividerWidth / 2, y, CONST.dividerWidth / 2, y);
    g.setScrollFactor(0);
    return g;
  }

  private async slideUpReveal(): Promise<void> {
    const scene = this.scene as GameScene;
    const slideOffset = 80;
    this.y += slideOffset;

    // 컨테이너를 덮는 흰색 오버레이
    const overlay = addWindow(
      scene,
      TEXTURE.WINDOW_0,
      0,
      0,
      CONST.base.width,
      CONST.base.height,
      3,
      16,
      16,
      16,
      16,
    );
    overlay.setTintFill(0xffffff);
    this.add(overlay);

    await new Promise<void>((resolve) => {
      // 슬라이드업 + 페이드인
      this.scene.tweens.add({
        targets: this,
        y: this.y - slideOffset,
        alpha: 1,
        duration: 500,
        ease: 'Cubic.easeOut',
      });

      // 오버레이 페이드아웃
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
