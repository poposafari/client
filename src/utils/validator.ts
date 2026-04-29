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

export function isValidNickname(nickname: string): boolean {
  const trimmed = nickname.trim();
  if (!/^[\p{L}\p{N}]{2,12}$/u.test(trimmed)) return false;
  const lower = trimmed.toLowerCase();
  if (RESERVED_NICKNAME_WORDS.some((w) => lower.includes(w))) return false;
  return true;
}
