import type { GrowthGroup } from '@poposafari/types';

export const POKEMON_LEVEL_MAX = 100;
const POKEMON_LEVEL_MIN = 1;
const DEFAULT_GROWTH_GROUP: GrowthGroup = 'medium_fast';

export const EXP_CANDY_VALUE: Record<string, number> = {
  'experience-candy-xs': 100,
  'experience-candy-s': 800,
  'experience-candy-m': 3_000,
  'experience-candy-l': 10_000,
  'experience-candy-xl': 30_000,
};

export const EXP_CANDY_IDS = [
  'experience-candy-xs',
  'experience-candy-s',
  'experience-candy-m',
  'experience-candy-l',
  'experience-candy-xl',
] as const;

export type ExpCandyId = (typeof EXP_CANDY_IDS)[number];

export function isExpCandyId(itemId: string): itemId is ExpCandyId {
  return Object.prototype.hasOwnProperty.call(EXP_CANDY_VALUE, itemId);
}

export function pokemonTotalExpForLevel(
  level: number,
  group: GrowthGroup = DEFAULT_GROWTH_GROUP,
): number {
  const n = Math.max(POKEMON_LEVEL_MIN, Math.min(POKEMON_LEVEL_MAX, Math.floor(level)));
  if (n === 1) return 0;
  switch (group) {
    case 'fast':
      return Math.floor((4 * n ** 3) / 5);
    case 'medium_fast':
      return n ** 3;
    case 'medium_slow':
      return Math.floor((6 * n ** 3) / 5 - 15 * n ** 2 + 100 * n - 140);
    case 'slow':
      return Math.floor((5 * n ** 3) / 4);
    case 'erratic':
      return erraticTotal(n);
    case 'fluctuating':
      return fluctuatingTotal(n);
  }
}

function erraticTotal(n: number): number {
  if (n <= 50) return Math.floor((n ** 3 * (100 - n)) / 50);
  if (n <= 68) return Math.floor((n ** 3 * (150 - n)) / 100);
  if (n <= 98) return Math.floor((n ** 3 * Math.floor((1911 - 10 * n) / 3)) / 500);
  return Math.floor((n ** 3 * (160 - n)) / 100);
}

function fluctuatingTotal(n: number): number {
  if (n <= 15) return Math.floor((n ** 3 * (Math.floor((n + 1) / 3) + 24)) / 50);
  if (n <= 35) return Math.floor((n ** 3 * (n + 14)) / 50);
  return Math.floor((n ** 3 * (Math.floor(n / 2) + 32)) / 50);
}

export function isPokemonMaxLevel(level: number): boolean {
  return level >= POKEMON_LEVEL_MAX;
}

export interface PokemonExpProgress {
  /** 현재 레벨 도달 시점의 누적 EXP */
  current: number;
  /** 다음 레벨 도달에 필요한 누적 EXP (만렙이면 current와 동일) */
  next: number;
  /** 현재 레벨 안에서 진행 비율 0..1 (만렙이면 1) */
  ratio: number;
  /** 현재 레벨 안에서 누적된 EXP (0..(next-current)) */
  withinLevel: number;
  /** 다음 레벨까지 남은 EXP (만렙이면 0) */
  remaining: number;
}

/**
 * 누적 EXP로 현재 레벨을 역산. 서버 `lib/utils/exp-curve.ts:levelFromExp`와 동일.
 * 시각 미리보기에만 사용 — 실제 레벨은 서버 응답이 권위.
 */
export function pokemonLevelFromExp(
  exp: number,
  group: GrowthGroup = DEFAULT_GROWTH_GROUP,
): number {
  const safeExp = Math.max(0, Math.floor(exp));
  let lo = POKEMON_LEVEL_MIN;
  let hi = POKEMON_LEVEL_MAX;
  while (lo < hi) {
    const mid = (lo + hi + 1) >>> 1;
    if (pokemonTotalExpForLevel(mid, group) <= safeExp) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

export function pokemonExpProgress(
  level: number,
  exp: number,
  group: GrowthGroup = DEFAULT_GROWTH_GROUP,
): PokemonExpProgress {
  if (isPokemonMaxLevel(level)) {
    const c = pokemonTotalExpForLevel(POKEMON_LEVEL_MAX, group);
    return { current: c, next: c, ratio: 1, withinLevel: 0, remaining: 0 };
  }
  const current = pokemonTotalExpForLevel(level, group);
  const next = pokemonTotalExpForLevel(level + 1, group);
  const span = Math.max(1, next - current);
  const within = Math.max(0, Math.min(span, exp - current));
  return {
    current,
    next,
    ratio: within / span,
    withinLevel: within,
    remaining: Math.max(0, next - exp),
  };
}
