export type TranslationFossil = {
  [key: string]: string;
};

export const fossil: TranslationFossil = {
  greeting: 'Do you have any fossils that need restoring?\nLet me restore them for you!',
  confirmOne: 'Restore the {{name}}?',
  confirmTwo: 'Restore the {{name1}} and {{name2}}?',
  received: '{{nickname}} received\nthe {{name}}!',
};
