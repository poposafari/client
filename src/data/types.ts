export function getPokemonType(type: string) {
  switch (type) {
    case 'None':
      return 0;
    case 'fire':
      return 1;
    case 'water':
      return 2;
    case 'electric':
      return 3;
    case 'grass':
      return 4;
    case 'ice':
      return 5;
    case 'fighting':
      return 6;
    case 'poison':
      return 7;
    case 'ground':
      return 8;
    case 'flying':
      return 9;
    case 'psychic':
      return 10;
    case 'bug':
      return 11;
    case 'rock':
      return 12;
    case 'ghost':
      return 13;
    case 'dragon':
      return 14;
    case 'dark':
      return 15;
    case 'steel':
      return 16;
    case 'fairy':
      return 17;
  }
}
