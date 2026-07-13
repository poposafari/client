import type { PokemonRank } from '@poposafari/types';

// 파티 보너스 계산 상수.
// 서버 LEVEL_CURVE (server/lib/constants/level-curve.ts)와 동일하게 유지해야 한다.
export const PARTY_BONUS = {
  LEVEL_COEF: 0.002,
  LEVEL_CAP: 0.2,
  SHINY_BONUS: 0.05,
  TIER_BONUS: {
    common: 0,
    uncommon: 0.01,
    rare: 0.02,
    'super-rare': 0.03,
    'ultra-rare': 0.04,
    epic: 0.05,
    unique: 0.06,
    legendary: 0.07,
  } as Record<PokemonRank, number>,
  SLOT_COUNT: 6,
} as const;

export function resolvePokemonTier(
  stored: string | null | undefined,
  masterRank: PokemonRank,
): PokemonRank {
  return stored ? (stored as PokemonRank) : masterRank;
}

// 파티 1마리가 실제 포획률에 더해주는 보너스(÷6 반영분).
// 6마리의 반환값을 모두 더하면 전투 화면의 partyBonus(= Σ기여값 ÷ 6)와 정확히 일치한다.
export function partyMemberCaptureBonus(
  level: number,
  isShiny: boolean,
  rank: PokemonRank,
): number {
  const lvlBonus = Math.min(PARTY_BONUS.LEVEL_CAP, level * PARTY_BONUS.LEVEL_COEF);
  const shinyBonus = isShiny ? PARTY_BONUS.SHINY_BONUS : 0;
  const tierBonus = PARTY_BONUS.TIER_BONUS[rank] ?? 0;
  return (lvlBonus + shinyBonus + tierBonus) / PARTY_BONUS.SLOT_COUNT;
}
