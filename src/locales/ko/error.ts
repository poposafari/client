export type TranslationError = {
  [key: string]: string;
};

export const error: TranslationError = {
  unknown: '예기치 못한 오류가 발생했습니다.',
  network: '네트워크가 원할하지 않습니다.',
  intervalServer: 'ㅈㅅ 서버 문제임',
  notFound: '리소스를 찾을 수 없습니다.',
  invalidDTO: '값이 일치하지 않습니다.',
  sessionExpired: '세션이 만료되었습니다.',
  userAlreadyExist: '이미 등록된 사용자입니다.',
  emptyUsername: '아이디를 입력해주세요.',
  emptyPassword: '비밀번호를 입력해주세요.',
  invalidUsernameOrPassword: '아이디 또는 비밀번호가 일치하지\n않습니다.',
  exceedTryLogin: '로그인 시도 횟수가 너무 많습니다.\n지금은 로그인하실 수 없습니다.',
  invalidInputUsername: '아이디는 5자 이상 20자 이하로\n입력하셔야 합니다.',
  invalidInputPassword: '비밀번호는 5자 이상 20자 이하로\n입력하셔야 합니다.',
  notMatchPasswordAndRePassword: '비밀번호가 일치하지 않습니다.',
  emptyNickname: '닉네임을 입력해주세요.',
  invalidCostume: '올바르지 않은 코스튬입니다.',
  invalidNickname: '닉네임은 2자 이상 12자 이하로\n입력하셔야 합니다.',
};
