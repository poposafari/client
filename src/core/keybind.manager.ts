import {
  codeToLabel,
  DEFAULT_KEYBINDS,
  FIXED_ACTIONS,
  GameAction,
  KEYBIND_ACTION_ORDER,
  KEYBIND_CACHE_KEY,
} from '@poposafari/types';
import { debugLog } from '@poposafari/utils';

export type RebindResult =
  | 'ok' // 정상 반영(스왑 포함)
  | 'locked' // 방향키 등 재바인딩 불가 액션
  | 'reserved'; // 고정 키(화살표)를 다른 액션에 할당 시도

export class KeybindManager {
  private bindings: Record<GameAction, string> = { ...DEFAULT_KEYBINDS };

  constructor() {
    this.init();
  }

  private init(): void {
    const raw = localStorage.getItem(KEYBIND_CACHE_KEY);
    if (!raw) {
      this.saveToCache();
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (this.validateCache(parsed)) {
        this.bindings = parsed;
      } else {
        this.saveToCache();
      }
    } catch {
      this.saveToCache();
    }
  }

  saveToCache(): void {
    debugLog('saveToCache(keybind)', this.bindings);
    localStorage.setItem(KEYBIND_CACHE_KEY, JSON.stringify(this.bindings));
  }

  validateCache(obj: unknown): obj is Record<GameAction, string> {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return false;
    const o = obj as Record<string, unknown>;
    const actions = KEYBIND_ACTION_ORDER;
    if (Object.keys(o).length !== actions.length) return false;
    const allStrings = actions.every((action) => {
      const code = o[action];
      return typeof code === 'string' && code.length > 0;
    });
    if (!allStrings) return false;

    const fixedIntact = actions
      .filter((action) => FIXED_ACTIONS.has(action))
      .every((action) => o[action] === DEFAULT_KEYBINDS[action]);
    if (!fixedIntact) return false;

    const codes = actions.map((a) => o[a] as string);
    if (new Set(codes).size !== codes.length) return false;
    return true;
  }

  isRebindable(action: GameAction): boolean {
    return !FIXED_ACTIONS.has(action);
  }

  private isFixedCode(code: string): boolean {
    return KEYBIND_ACTION_ORDER.some(
      (action) => FIXED_ACTIONS.has(action) && this.bindings[action] === code,
    );
  }

  getBinding(action: GameAction): string {
    return this.bindings[action];
  }

  getLabel(action: GameAction): string {
    return codeToLabel(this.bindings[action]);
  }

  resolveAction(code: string): GameAction | null {
    return KEYBIND_ACTION_ORDER.find((action) => this.bindings[action] === code) ?? null;
  }

  rebind(action: GameAction, code: string): RebindResult {
    if (!this.isRebindable(action)) return 'locked';
    if (this.isFixedCode(code)) return 'reserved';

    const current = this.bindings[action];
    if (current === code) return 'ok';

    const occupant = KEYBIND_ACTION_ORDER.find((a) => a !== action && this.bindings[a] === code);

    if (occupant) {
      this.bindings[occupant] = current;
    }
    this.bindings[action] = code;

    this.saveToCache();
    return 'ok';
  }

  /** 전체 기본값으로 초기화. */
  resetToDefault(): void {
    this.bindings = { ...DEFAULT_KEYBINDS };
    this.saveToCache();
  }
}
