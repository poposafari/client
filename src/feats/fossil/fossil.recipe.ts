export interface FossilRecipe {
  id: number;
  ingredients: string[];
  pokedexId: string;
}

export const FOSSIL_RECIPES: FossilRecipe[] = [
  { id: 1, ingredients: ['helix-fossil'], pokedexId: '0138' },
  { id: 2, ingredients: ['dome-fossil'], pokedexId: '0140' },
  { id: 3, ingredients: ['old-amber'], pokedexId: '0142' },
  { id: 4, ingredients: ['root-fossil'], pokedexId: '0345' },
  { id: 5, ingredients: ['claw-fossil'], pokedexId: '0347' },
  { id: 6, ingredients: ['skull-fossil'], pokedexId: '0408' },
  { id: 7, ingredients: ['armor-fossil'], pokedexId: '0410' },
  { id: 8, ingredients: ['cover-fossil'], pokedexId: '0564' },
  { id: 9, ingredients: ['plume-fossil'], pokedexId: '0566' },
  { id: 10, ingredients: ['jaw-fossil'], pokedexId: '0696' },
  { id: 11, ingredients: ['sail-fossil'], pokedexId: '0698' },
  { id: 12, ingredients: ['fossilized-bird', 'fossilized-drake'], pokedexId: '0880' },
  { id: 13, ingredients: ['fossilized-bird', 'fossilized-dino'], pokedexId: '0881' },
  { id: 14, ingredients: ['fossilized-fish', 'fossilized-drake'], pokedexId: '0882' },
  { id: 15, ingredients: ['fossilized-fish', 'fossilized-dino'], pokedexId: '0883' },
];
