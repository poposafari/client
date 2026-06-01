export type TranslationFossil = {
  [key: string]: string;
};

export const fossil: TranslationFossil = {
  greeting: 'Avez-vous des fossiles à restaurer ?\nJe peux les restaurer pour vous !',
  confirmOne: 'Restaurer {{name}} ?',
  confirmTwo: 'Restaurer {{name1}} et {{name2}} ?',
  received: '{{nickname}} a reçu\n{{name}} !',
};
