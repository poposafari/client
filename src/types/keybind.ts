export enum GameAction {
  CONFIRM = 'CONFIRM',
  CANCEL = 'CANCEL',
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  MENU = 'MENU',
  RUNNING = 'RUNNING',
  MAP = 'MAP',
  QUICKSLOT = 'QUICKSLOT',
  GRAB = 'GRAB',
}

export const KEYBIND_CACHE_KEY = 'poposafari.keybind';
export const DEFAULT_CANCEL_CODE = 'Escape';

export const FIXED_ACTIONS: ReadonlySet<GameAction> = new Set([
  GameAction.UP,
  GameAction.DOWN,
  GameAction.LEFT,
  GameAction.RIGHT,
]);

/** 각 액션의 기본 물리 키(event.code). */
export const DEFAULT_KEYBINDS: Record<GameAction, string> = {
  [GameAction.CONFIRM]: 'Enter',
  [GameAction.CANCEL]: DEFAULT_CANCEL_CODE,
  [GameAction.UP]: 'ArrowUp',
  [GameAction.DOWN]: 'ArrowDown',
  [GameAction.LEFT]: 'ArrowLeft',
  [GameAction.RIGHT]: 'ArrowRight',
  [GameAction.MENU]: 'KeyS',
  [GameAction.RUNNING]: 'KeyR',
  [GameAction.MAP]: 'KeyM',
  [GameAction.QUICKSLOT]: 'KeyA',
  [GameAction.GRAB]: 'KeyG',
};

/** 옵션 화면에 행으로 나열할 액션 순서. */
export const KEYBIND_ACTION_ORDER: GameAction[] = [
  GameAction.CONFIRM,
  GameAction.CANCEL,
  GameAction.UP,
  GameAction.DOWN,
  GameAction.LEFT,
  GameAction.RIGHT,
  GameAction.MENU,
  GameAction.RUNNING,
  GameAction.MAP,
  GameAction.QUICKSLOT,
  GameAction.GRAB,
];

/** 액션 → 옵션 화면 라벨 i18n 키. */
export const KEYBIND_ACTION_I18N: Record<GameAction, string> = {
  [GameAction.CONFIRM]: 'option:keyConfirm',
  [GameAction.CANCEL]: 'option:keyCancel',
  [GameAction.UP]: 'option:keyUp',
  [GameAction.DOWN]: 'option:keyDown',
  [GameAction.LEFT]: 'option:keyLeft',
  [GameAction.RIGHT]: 'option:keyRight',
  [GameAction.MENU]: 'option:keyMenu',
  [GameAction.RUNNING]: 'option:keyRunning',
  [GameAction.MAP]: 'option:keyMap',
  [GameAction.QUICKSLOT]: 'option:keyQuickslot',
  [GameAction.GRAB]: 'option:keyGrab',
};

/** 특수 키(event.code) → 표시 라벨 매핑. 목록에 없으면 codeToLabel이 규칙 기반으로 처리. */
const SPECIAL_CODE_LABEL: Record<string, string> = {
  Escape: 'Esc',
  Enter: 'Enter',
  Space: 'Space',
  Backspace: 'Bksp',
  Tab: 'Tab',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  ShiftLeft: 'Shift',
  ShiftRight: 'Shift',
  ControlLeft: 'Ctrl',
  ControlRight: 'Ctrl',
  AltLeft: 'Alt',
  AltRight: 'Alt',
  CapsLock: 'Caps',
};

/**
 * event.code를 사람이 읽는 짧은 라벨로 변환한다.
 * 예: 'KeyS' → 'S', 'Digit1' → '1', 'ArrowUp' → '↑', 'Escape' → 'Esc'.
 */
export function codeToLabel(code: string): string {
  if (code in SPECIAL_CODE_LABEL) return SPECIAL_CODE_LABEL[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return `Num ${code.slice(6)}`;
  return code;
}
