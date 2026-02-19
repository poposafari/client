export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-z0-9]{5,20}$/;

  return usernameRegex.test(username);
}

export function isValidPassword(password: string): boolean {
  const passwordRegex = /^[A-Za-z0-9!@#$%^&*()_+]{5,20}$/;

  return passwordRegex.test(password);
}

export function isValidNickname(nickname: string): boolean {
  const nicknameRegex = /^[\p{L}0-9]{1,20}$/u;

  return nicknameRegex.test(nickname);
}
