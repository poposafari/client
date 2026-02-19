export enum KEY {
  // --- 특수 키 ---
  BACKSPACE = 'Backspace',
  TAB = 'Tab',
  ENTER = 'Enter',
  SHIFT = 'ShiftLeft', // 기본적으로 왼쪽 Shift 기준 (필요시 ShiftRight 추가)
  CTRL = 'ControlLeft', // 기본적으로 왼쪽 Ctrl 기준
  ALT = 'AltLeft', // 기본적으로 왼쪽 Alt 기준
  PAUSE = 'Pause',
  CAPS_LOCK = 'CapsLock',
  ESC = 'Escape',
  SPACE = 'Space',
  PAGE_UP = 'PageUp',
  PAGE_DOWN = 'PageDown',
  END = 'End',
  HOME = 'Home',

  // --- 방향키 ---
  LEFT = 'ArrowLeft',
  UP = 'ArrowUp',
  RIGHT = 'ArrowRight',
  DOWN = 'ArrowDown',

  // --- 기능 키 ---
  INSERT = 'Insert',
  DELETE = 'Delete',

  // --- 숫자 (상단 숫자키 기준) ---
  ZERO = 'Digit0',
  ONE = 'Digit1',
  TWO = 'Digit2',
  THREE = 'Digit3',
  FOUR = 'Digit4',
  FIVE = 'Digit5',
  SIX = 'Digit6',
  SEVEN = 'Digit7',
  EIGHT = 'Digit8',
  NINE = 'Digit9',

  // --- 알파벳 (A~Z) ---
  // event.code는 대소문자 구분 없이 항상 'Key + 대문자' 형식을 반환합니다.
  A = 'KeyA',
  B = 'KeyB',
  C = 'KeyC',
  D = 'KeyD',
  E = 'KeyE',
  F = 'KeyF',
  G = 'KeyG',
  H = 'KeyH',
  I = 'KeyI',
  J = 'KeyJ',
  K = 'KeyK',
  L = 'KeyL',
  M = 'KeyM',
  N = 'KeyN',
  O = 'KeyO',
  P = 'KeyP',
  Q = 'KeyQ',
  R = 'KeyR',
  S = 'KeyS',
  T = 'KeyT',
  U = 'KeyU',
  V = 'KeyV',
  W = 'KeyW',
  X = 'KeyX',
  Y = 'KeyY',
  Z = 'KeyZ',

  // --- 펑션 키 (F1~F12) ---
  F1 = 'F1',
  F2 = 'F2',
  F3 = 'F3',
  F4 = 'F4',
  F5 = 'F5',
  F6 = 'F6',
  F7 = 'F7',
  F8 = 'F8',
  F9 = 'F9',
  F10 = 'F10',
  F11 = 'F11',
  F12 = 'F12',
}
