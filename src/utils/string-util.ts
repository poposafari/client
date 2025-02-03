export function createZeroPad(value: number): string {
  return value.toString().padStart(3, '0');
}

export function isPokedexShiny(pokedex: string) {
  return pokedex.endsWith('s');
}

export function trimLastChar(pokedex: string) {
  return pokedex.slice(0, -1);
}
