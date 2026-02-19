export function replacePlaceholders(template: string, ...values: string[]): string {
  let index = 0;
  return template.replace(/\*/g, () => values[index++] ?? '');
}

export const toGenderCode = (gender: 'male' | 'female') => {
  return gender === 'male' ? 'm' : 'f';
};

export const getGlobalLanguageName = (language: string) => {
  let ret = 'N/A';

  switch (language) {
    case 'en':
      ret = 'English';
      break;
    case 'ko':
      ret = '한국어';
      break;
    case 'jp':
      ret = '日本語';
      break;
  }

  return ret;
};

const SPLASH_BASE_FONT_SIZE = 80;
const SPLASH_FONT_SIZE_STEP = 6;

export function getRandomSplash(splash: Record<string, string>): {
  text: string;
  fontSize: number;
} {
  const values = Object.values(splash);
  if (values.length === 0) return { text: '', fontSize: SPLASH_BASE_FONT_SIZE };
  const text = values[Math.floor(Math.random() * values.length)];
  const step = Math.floor(text.length / SPLASH_FONT_SIZE_STEP);
  const fontSize = SPLASH_BASE_FONT_SIZE - step * SPLASH_FONT_SIZE_STEP;
  return { text, fontSize };
}

export interface PokemonTexture {
  key: string; // Phaser Atlas Key (예: 'pokemon.front')
  frame: string; // Internal Frame Name (예: 'shiny/0079_galar_female.png')
}

/**
 * 포켓몬 아틀라스 키와 프레임 이름을 반환합니다.
 *
 * 생성 규칙:
 * 1. 기본: "0025"
 * 2. 폼 추가: "0052_galar" (form이 있을 경우)
 * 3. 암컷 추가: "0052_galar_female" (isFemale일 경우)
 * 4. 확장자: "0052_galar_female.png"
 * 5. 이로치: "shiny/0052_galar_female.png" (isShiny일 경우 맨 앞 폴더 추가)
 *
 * @param type - 에셋 타입 ('icon' | 'sprite' | 'overworld')
 * @param pokemonId - 포켓몬 도감 번호 (예: '0025', '0052')
 * @param form - 폼 이름 (예: 'galar', 'alola', 'hisui', 'paldea'). 없으면 undefined/null/빈문자열
 * @param options - 옵션 (이로치 여부, 암컷 여부)
 */
export function getPokemonTexture(
  type: 'icon' | 'sprite' | 'overworld',
  pokemonKey: string,
  options: { isShiny?: boolean; isFemale?: boolean } = {},
): PokemonTexture {
  // 1. 아틀라스 키 결정 (대분류)
  let atlasKey: string;
  switch (type) {
    case 'sprite':
      atlasKey = 'pokemon.front';
      break;
    case 'icon':
      atlasKey = 'pokemon.icon';
      break;
    case 'overworld':
      atlasKey = 'pokemon.overworld';
      break;
    default:
      // 타입 안정성을 위해 에러 처리 혹은 기본값 설정
      console.warn(`Invalid pokemon texture type: ${type}`);
      atlasKey = 'pokemon.front';
  }

  // 2. 프레임 이름 조합
  // 시작: "0079_galar"
  let frameName = pokemonKey;

  // 암컷 처리: "0079_galar_female" (맨 뒤에 붙음)
  if (options.isFemale) {
    frameName += '_female';
  }

  // 이로치 처리: "shiny/0079_galar_female.png" (맨 앞에 폴더 경로 붙음)
  if (options.isShiny) {
    frameName = `shiny/${frameName}`;
  }

  return { key: atlasKey, frame: frameName };
}
