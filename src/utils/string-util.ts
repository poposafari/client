export function createZeroPad(value: number): string {
  return value.toString().padStart(3, '0');
}

export function isPokedexShiny(pokedex: string) {
  return pokedex.endsWith('s');
}

export function isFemale(pokedex: string) {
  return pokedex[4] === 'f';
}

export function getOriginPokedex(key: string) {
  return key.split('_')[0];
}

export function getGenderAndShinyInfo(key: string) {
  return key.split('_')[1];
}

export function trimLastChar(pokedex: string) {
  return pokedex.slice(0, -1);
}
