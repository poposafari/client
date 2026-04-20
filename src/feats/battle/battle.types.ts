import type { SafariWildInfo } from '@poposafari/scenes/game.scene';

export type BattleModifiers = { bait: boolean; rock: boolean };
export type BattleAction = { type: 'ball' } | { type: 'feed' } | { type: 'mud' } | { type: 'run' };

/** POST /api/game/safari/catch 응답 매핑.*/
export type CatchReward = { candyId: string; candyQuantity: number };

export interface ExpReward {
  gained: number;
  level: number;
  exp: number;
  leveledUp: boolean;
}

export interface CaughtPokemon {
  id: number;
  pokedexId: string;
  level: number;
  gender: number;
  isShiny: boolean;
  nickname: string | null;
  natureId: string;
  abilityId: string;
  heldItemId: string | null;
  skills: string[];
  boxNumber: number;
  gridNumber: number;
  ballId: number;
  caughtLocation: string;
}

export type CatchResult =
  | { kind: 'caught'; pokemon: CaughtPokemon; reward: CatchReward; expReward: ExpReward }
  | { kind: 'fail' }
  | { kind: 'flee' };

export type BattleState =
  | { kind: 'intro' }
  | { kind: 'appear' }
  | { kind: 'idle' }
  | { kind: 'throwing'; action: BattleAction }
  | { kind: 'result'; outcome: CatchResult }
  | { kind: 'exiting'; reason: 'catch' | 'flee_wild' | 'flee_player' };

/** BattlePhase 진입 시 오버월드로부터 넘겨받는 컨텍스트. */
export interface BattleContext {
  wild: SafariWildInfo;
  /** 배경/플랫폼 텍스처 선택용. `bg_${area}_${time}` 형태. */
  area: string;
  time: 'dawn' | 'day' | 'dusk' | 'night';
  /** HUD 우상단에 표시되는 장소명(i18n 적용된 문자열). */
  locationLabel: string;
  /**
   * BattlePhase 종료 시(성공/도망/실패 무관) 호출되어 오버월드 측 정리에 사용된다.
   * - 'caught' 또는 'flee_wild': 야생 오브젝트 제거
   * - 'flee_player': 야생 잠금/freeze 해제 후 랜덤 워크 재개
   */
  onResolved?: (reason: 'catch' | 'flee_wild' | 'flee_player') => void;
}

/** 서버 safari catch 요청/응답 DTO. ApiManager.safariCatch 에서 사용. */
export interface SafariCatchReq {
  uid: string;
}

export type SafariCatchRes =
  | {
      result: 'caught';
      pokemon: CaughtPokemon;
      reward: CatchReward;
      expReward: ExpReward;
    }
  | { result: 'fail' }
  | { result: 'flee' };

export function toCatchResult(res: SafariCatchRes): CatchResult {
  switch (res.result) {
    case 'caught':
      return {
        kind: 'caught',
        pokemon: res.pokemon,
        reward: res.reward,
        expReward: res.expReward,
      };
    case 'fail':
      return { kind: 'fail' };
    case 'flee':
      return { kind: 'flee' };
  }
}
