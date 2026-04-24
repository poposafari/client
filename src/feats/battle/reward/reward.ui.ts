import i18next from 'i18next';
import { BaseUi, InputManager, LEVEL_CURVE } from '@poposafari/core';
import type { GameScene } from '@poposafari/scenes/game.scene';
import {
  ANIMATION,
  DEPTH,
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
  addSprite,
  addText,
  addWindow,
  getPokedexId,
  getPokemonI18Name,
  getPokemonTexture,
  updatePokemonGenderIcon,
} from '@poposafari/utils';
import { PokemonTypeContainer } from '@poposafari/containers/pokemon-type.container';
import {
  equippedCostumesToParts,
  getDefaultOverworldKeys,
  getHairTextureKey,
  getOutfitTextureKey,
  getSkinTextureKey,
} from '@poposafari/feats/overworld/overworld-costume-keys';
import type { CatchReward, CaughtPokemon, ExpReward } from '../battle.types';
import { SHARE_ENV } from 'worker_threads';

export interface RewardDisplayData {
  pokemon: CaughtPokemon;
  rewards: CatchReward[];
  expReward: ExpReward;
  beforeLevel: number;
  beforeExp: number;
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

  // ── 경험치 컨테이너 (reward 바로 아래) ──────────────────────────
  exp: {
    x: +530,
    y: -180,
    width: 450,
    height: 460,
  },
  // 경험치 내부 (컨테이너 로컬 좌표)
  userSpriteX: +10,
  userSpriteY: 0,
  userSpriteScale: 5.4,
  levelTextX: +10,
  levelTextY: -20,
  expGainedLabelX: -180,
  expGainedValueX: +140,
  expGainedY: +60,
  expBarX: 0,
  expBarY: +120,
  expBarWidth: 350,
  expBarHeight: 40,
  expNumberY: +170,

  // ── 힌트 (루트 기준) ─────────────────────────────────────────────
  hintY: +450,

  // ── 경험치 바 색상 ───────────────────────────────────────────────
  expBarFill: 0x66cc40,
  expBarBg: 0x222222,
  expBarStroke: 0xffffff,
} as const;

const RANK_COLOR: Record<PokemonRank, string> = {
  common: TEXTCOLOR.COMMON,
  rare: TEXTCOLOR.RARE,
  epic: TEXTCOLOR.EPIC,
  legendary: TEXTCOLOR.LEGENDARY,
};

const RANK_LOCALE: Record<PokemonRank, string> = {
  common: 'menu:tierCommon',
  rare: 'menu:tierRare',
  epic: 'menu:tierEpic',
  legendary: 'menu:tierLegendary',
};

export class RewardUi extends BaseUi {
  private resolver: (() => void) | null = null;

  // ── exp bar runtime refs ────────────────────────────────────────
  private expInner: Phaser.GameObjects.Rectangle | null = null;
  private expNumberText: Phaser.GameObjects.Text | null = null;
  private levelText: Phaser.GameObjects.Text | null = null;
  private expContainer: Phaser.GameObjects.Container | null = null;

  private animating = false;
  private skipRequested = false;
  private finalLevel = 1;
  private finalExp = 0;

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
    const { pokemon, rewards, expReward, beforeLevel, beforeExp, userSnapshot } = data;
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

    // ── 경험치 컨테이너: 유저 스프라이트 + 레벨/경험치 ─────────────
    const expContainer = scene.add.container(CONST.exp.x, CONST.exp.y);
    this.add(expContainer);
    this.expContainer = expContainer;
    expContainer.add(
      addWindow(
        scene,
        TEXTURE.WINDOW_3,
        0,
        0,
        CONST.exp.width,
        CONST.exp.height,
        2.4,
        16,
        16,
        16,
        16,
      ),
    );
    this.buildUserSection(beforeLevel, beforeExp, expReward, userSnapshot, expContainer);

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
    const lvText = addText(
      scene,
      CONST.infoStartX,
      CONST.infoNameY + 50,
      `(+${pokemon.level})`,
      40,
      '100',
      'left',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.NONE,
    ).setOrigin(0, 0.5);
    target.add(lvText);
    cursorX += lvText.width + 14;

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
      : i18next.t('menu:rewardNone');
    const skillText =
      pokemon.skills.length > 0
        ? i18next.t(`pokemonHiddenMove:${pokemon.skills[0]}`, { defaultValue: pokemon.skills[0] })
        : i18next.t('menu:rewardNone');

    this.addInfoPair(
      xBase,
      CONST.infoRow1Y,
      i18next.t('menu:rewardNature'),
      i18next.t(`nature:${pokemon.natureId}`, { defaultValue: pokemon.natureId }),
      target,
    );
    this.addInfoPair(
      xBase + CONST.infoColGap,
      CONST.infoRow1Y,
      i18next.t('menu:rewardAbility'),
      i18next.t(`ability:${pokemon.abilityId}`, { defaultValue: pokemon.abilityId }),
      target,
    );

    this.addInfoPair(xBase, CONST.infoRow2Y, i18next.t('menu:rewardHeldItem'), heldItem, target);
    this.addInfoPair(
      xBase + CONST.infoColGap,
      CONST.infoRow2Y,
      i18next.t('menu:rewardSkills'),
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

  private buildRewardGrid(rewards: CatchReward[], target: Phaser.GameObjects.Container): void {
    const scene = this.scene as GameScene;
    const count = Math.min(rewards.length, 4);
    if (count === 0) return;

    const totalWidth = count * CONST.rwSlotWidth;
    const startX = -totalWidth / 2 + CONST.rwSlotWidth / 2;

    for (let i = 0; i < count; i++) {
      const rw = rewards[i];
      const slotX = startX + i * CONST.rwSlotWidth;

      // candyId 가 그대로 텍스처 키. 없으면 기본 아이콘으로 대체.
      const iconKey = scene.textures.exists(rw.candyId) ? rw.candyId : TEXTURE.ICON_CANDY;
      target.add(
        addImage(scene, iconKey, undefined, slotX, CONST.rwY + CONST.rwIconOffY).setScale(4),
      );
      target.add(
        addText(
          scene,
          slotX + 8,
          CONST.rwY + CONST.rwQtyOffY,
          `x${rw.candyQuantity}`,
          50,
          '100',
          'left',
          TEXTSTYLE.WHITE,
          TEXTSHADOW.GRAY,
        ),
      );
      const candyName = i18next.t(`item:${rw.candyId}.name`, { defaultValue: rw.candyId });
      target.add(
        addText(
          scene,
          slotX,
          CONST.rwY + CONST.rwNameOffY,
          candyName,
          50,
          '100',
          'center',
          TEXTSTYLE.WHITE,
          TEXTSHADOW.GRAY,
        ),
      );
    }
  }

  private buildUserSection(
    beforeLevel: number,
    beforeExp: number,
    expReward: ExpReward,
    userSnapshot: RewardDisplayData['userSnapshot'],
    target: Phaser.GameObjects.Container,
  ): void {
    const scene = this.scene as GameScene;

    // ── 유저 overworld 스프라이트 (skin/hair/outfit 3레이어) ─────────
    const { gender, equippedCostumes: equipped } = userSnapshot;
    const parts = equipped.length ? equippedCostumesToParts(equipped) : null;
    const defaults = getDefaultOverworldKeys(scene, gender);

    const skinKeyReq = parts?.skin ? getSkinTextureKey(parts.skin) : defaults.skin;
    const hairKeyReq = parts?.hair ? getHairTextureKey(gender, parts.hair) : defaults.hair;
    const outfitKeyReq = parts?.outfit
      ? getOutfitTextureKey(gender, parts.outfit)
      : defaults.outfit;

    const skinKey = scene.textures.exists(skinKeyReq) ? skinKeyReq : defaults.skin;
    const hairKey = scene.textures.exists(hairKeyReq) ? hairKeyReq : defaults.hair;
    const outfitKey = scene.textures.exists(outfitKeyReq) ? outfitKeyReq : defaults.outfit;

    const downFrame = `${ANIMATION.PLAYER_OVERWORLD_SKIN}-0`;
    for (const key of [skinKey, outfitKey, hairKey]) {
      if (!scene.textures.exists(key)) continue;
      const sprite = addSprite(scene, key, undefined, CONST.userSpriteX, CONST.userSpriteY);
      sprite.setScale(CONST.userSpriteScale);
      sprite.setOrigin(0.5, 1);
      if (scene.textures.get(key).has(downFrame)) {
        sprite.setFrame(downFrame);
      }
      target.add(sprite);
    }

    // ── 레벨 텍스트 ─────────────────────────────────────────────────
    this.levelText = addText(
      scene,
      CONST.levelTextX,
      CONST.levelTextY,
      `Lv.${beforeLevel}`,
      60,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    target.add(this.levelText);

    // ── 획득 경험치 라벨 + 값 ───────────────────────────────────────
    const expGainedLabel = addText(
      scene,
      CONST.expGainedLabelX,
      CONST.expGainedY,
      i18next.t('menu:rewardExpGained', { defaultValue: '획득 경험치' }),
      50,
      '100',
      'left',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    );
    target.add(expGainedLabel);
    const expGainedValue = addText(
      scene,
      CONST.expGainedValueX,
      CONST.expGainedY - 20,
      `+${expReward.gained}`,
      50,
      '100',
      'right',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    target.add(expGainedValue);

    // ── 경험치 바 (outer + inner) ───────────────────────────────────
    const outer = scene.add.rectangle(
      CONST.expBarX,
      CONST.expBarY,
      CONST.expBarWidth,
      CONST.expBarHeight,
      CONST.expBarBg,
      0.35,
    );
    outer.setStrokeStyle(3, CONST.expBarStroke);
    outer.setOrigin(0.5, 0.5);
    outer.setScrollFactor(0);
    target.add(outer);

    const innerMaxW = CONST.expBarWidth - 6;
    const innerX = CONST.expBarX - innerMaxW / 2;
    const initRatio = LEVEL_CURVE.isMaxLevel(beforeLevel)
      ? 1
      : Math.min(1, beforeExp / LEVEL_CURVE.expToNext(beforeLevel));
    this.expInner = scene.add.rectangle(
      innerX,
      CONST.expBarY,
      innerMaxW * initRatio,
      CONST.expBarHeight - 8,
      CONST.expBarFill,
      1,
    );
    this.expInner.setOrigin(0, 0.5);
    this.expInner.setScrollFactor(0);
    target.add(this.expInner);

    // ── 경험치 수치 텍스트 ─────────────────────────────────────────
    const initNeed = LEVEL_CURVE.isMaxLevel(beforeLevel) ? 0 : LEVEL_CURVE.expToNext(beforeLevel);
    const initLabel = LEVEL_CURVE.isMaxLevel(beforeLevel) ? 'MAX' : `${beforeExp} / ${initNeed}`;
    this.expNumberText = addText(
      scene,
      CONST.expBarX,
      CONST.expNumberY,
      initLabel,
      40,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    target.add(this.expNumberText);

    this.finalLevel = expReward.level;
    this.finalExp = expReward.exp;
  }

  // ── 경험치 바 채우기 애니메이션 ──────────────────────────────────
  private async animateExpGain(data: RewardDisplayData): Promise<void> {
    const { beforeLevel, beforeExp, expReward } = data;
    if (!this.expInner || !this.expNumberText || !this.levelText) {
      this.animating = false;
      return;
    }
    const innerMaxW = CONST.expBarWidth - 6;
    if (expReward.gained <= 0) {
      this.snapToFinal(innerMaxW);
      this.animating = false;
      return;
    }

    let curLevel = beforeLevel;
    let curExp = beforeExp;
    let remaining = expReward.gained;

    const audio = (this.scene as GameScene).getAudio();
    const willFill = !LEVEL_CURVE.isMaxLevel(curLevel);
    const expGainLoop = willFill ? audio.playEffectLoop(SFX.EXP_GAIN) : null;

    try {
      while (remaining > 0 && !LEVEL_CURVE.isMaxLevel(curLevel)) {
        if (this.skipRequested) break;

        const need = LEVEL_CURVE.expToNext(curLevel);
        const canTake = need - curExp;
        const take = Math.min(remaining, canTake);
        const nextExp = curExp + take;

        await this.tweenInnerTo(nextExp / need, innerMaxW, 700 * (take / Math.max(1, need)));

        curExp = nextExp;
        remaining -= take;
        this.updateExpText(curLevel, curExp);

        if (curExp >= need && curLevel < LEVEL_CURVE.USER_LEVEL_MAX) {
          if (this.skipRequested) break;
          await this.playLevelUpEffect(curLevel + 1);
          curLevel += 1;
          curExp = 0;
          this.expInner.width = 0;
          this.levelText?.setText(`Lv.${curLevel}`);
          this.updateExpText(curLevel, 0);
        }
      }
    } finally {
      audio.stopEffectLoop(expGainLoop);
    }

    this.snapToFinal(innerMaxW);
    this.animating = false;
    this.skipRequested = false;
  }

  private snapToFinal(innerMaxW: number): void {
    if (!this.expInner || !this.levelText) return;
    const lvl = this.finalLevel;
    const exp = this.finalExp;
    this.levelText.setText(`Lv.${lvl}`);
    if (LEVEL_CURVE.isMaxLevel(lvl)) {
      this.expInner.width = innerMaxW;
      this.expNumberText?.setText('MAX');
      return;
    }
    const need = LEVEL_CURVE.expToNext(lvl);
    const ratio = need > 0 ? Math.min(1, exp / need) : 0;
    this.expInner.width = innerMaxW * ratio;
    this.expNumberText?.setText(`${exp} / ${need}`);
  }

  private updateExpText(level: number, exp: number): void {
    if (!this.expNumberText) return;
    if (LEVEL_CURVE.isMaxLevel(level)) {
      this.expNumberText.setText('MAX');
      return;
    }
    const need = LEVEL_CURVE.expToNext(level);
    this.expNumberText.setText(`${exp} / ${need}`);
  }

  private tweenInnerTo(ratio: number, innerMaxW: number, duration: number): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!this.expInner) return resolve();
      this.scene.tweens.add({
        targets: this.expInner,
        width: innerMaxW * Math.max(0, Math.min(1, ratio)),
        duration: Math.max(120, duration),
        ease: 'Cubic.easeOut',
        onComplete: () => resolve(),
      });
    });
  }

  private async playLevelUpEffect(newLevel: number): Promise<void> {
    const scene = this.scene as GameScene;
    scene.getAudio().playEffect(SFX.EXP_FULL);
    const flash = addText(
      scene,
      CONST.expBarX,
      CONST.levelTextY - 30,
      'LEVEL UP!',
      54,
      '120',
      'center',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.DARK_YELLOW,
    );
    flash.setAlpha(0);
    flash.setScale(0.6);
    if (this.expContainer) {
      this.expContainer.add(flash);
    } else {
      this.add(flash);
    }

    await new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: flash,
        alpha: { from: 0, to: 1 },
        scale: { from: 0.6, to: 1.15 },
        duration: 220,
        ease: 'Back.easeOut',
        onComplete: () => resolve(),
      });
    });
    if (this.levelText) {
      this.levelText.setText(`Lv.${newLevel}`);
      this.scene.tweens.add({
        targets: this.levelText,
        scale: { from: 1.3, to: 1.0 },
        duration: 280,
        ease: 'Back.easeOut',
      });
    }
    await new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: flash,
        alpha: 0,
        y: flash.y - 14,
        delay: 360,
        duration: 280,
        ease: 'Sine.easeIn',
        onComplete: () => {
          flash.destroy();
          resolve();
        },
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
