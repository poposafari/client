export type TranslationError = {
  [key: string]: string;
};

export const error: TranslationError = {
  NETWORK_ERROR: '네트워크가 원할하지 않습니다.',
  INTERNAL_SERVER_ERROR: 'ㅈㅅ 서버 문제임.',
  NOT_FOUND: '리소스를 찾을 수 없습니다.',
  DTO_INVALID: '? 뭘 보낸거임 ?',
  SESSION_MISSING: '',
  SESSION_EXPIRED: '세션이 만료되었습니다',
  ACCOUNT_ALREADY_EXIST: '이미 등록된 계정입니다.',
  EMPTY_USERNAME: '아이디를 입력해주세요.',
  EMPTY_PASSWORD: '비밀번호를 입력해주세요.',
  INVALID_USERNAME_OR_PASSWORD: '아이디 또는 비밀번호가 일치하지\n않습니다.',
  EXCEED_REQUEST: '요청 시도 횟수가 너무 많습니다.',
  INVALID_INPUT_USERNAME: '아이디는 5자 이상 20자 이하로\n입력하셔야 합니다.',
  INVALID_INPUT_PASSWORD: '비밀번호는 5자 이상 20자 이하로\n입력하셔야 합니다.',
  NOT_MATCH_PASSWORD_AND_REPASSWORD: '비밀번호가 일치하지 않습니다.',
  EMPTY_NICKNAME: '닉네임을 입력해주세요.',
  INVALID_COSTUME: '올바르지 않은 코스튬입니다.',
  INVALID_NICKNAME: '닉네임은 2자 이상 12자 이하로\n입력하셔야 합니다.',
  KICKED: '다른 기기에서 접속했습니다.\n다시 로그인해 주세요.',
  POKEMON_NOT_FOUND: '해당 포켓몬을 찾을 수 없습니다.',
  EVOLUTION_NOT_AVAILABLE: '진화할 수 없는 포켓몬입니다.',
  EVOLUTION_COST_INVALID: '올바르지 않은 진화 조건입니다.',
  EVOLUTION_COST_NOT_ENOUGH: '진화에 필요한 재료가 부족합니다.',
};
