const RESERVED_NICKNAME_WORDS = ['admin', 'null', 'undefined'];

export function isValidUsername(username: string): boolean {
  return /^[a-z0-9]{6,20}$/.test(username);
}

export function isValidPassword(password: string): boolean {
  if (!/^[a-zA-Z0-9!@#$%^&*]{8,20}$/.test(password)) return false;
  if (!/[a-zA-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

export type NicknameError =
  | 'EMPTY_NICKNAME'
  | 'WHITESPACE_NICKNAME'
  | 'INVALID_NICKNAME'
  | 'INVALID_NICKNAME_CHARS'
  | 'RESERVED_NICKNAME';

/**
 * 닉네임을 검증하고 실패 사유 코드를 반환한다. 유효하면 null.
 * 반환되는 코드는 그대로 i18n error 네임스페이스의 키로 사용된다.
 */
export function validateNickname(nickname: string): NicknameError | null {
  if (/\s/.test(nickname)) return 'WHITESPACE_NICKNAME';
  const trimmed = nickname.trim();
  if (trimmed === '') return 'EMPTY_NICKNAME';
  if (trimmed.length < 2 || trimmed.length > 12) return 'INVALID_NICKNAME';
  if (!/^[\p{L}\p{N}]+$/u.test(trimmed)) return 'INVALID_NICKNAME_CHARS';
  const lower = trimmed.toLowerCase();
  if (RESERVED_NICKNAME_WORDS.some((w) => lower.includes(w))) return 'RESERVED_NICKNAME';
  return null;
}

export function isValidNickname(nickname: string): boolean {
  return validateNickname(nickname) === null;
}
