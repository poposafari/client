export type TranslationFossil = {
  [key: string]: string;
};

export const fossil: TranslationFossil = {
  greeting: '¿Tienes algún fósil que necesite restauración?\n¡Yo te lo restauro!',
  confirmOne: '¿Restaurar el {{name}}?',
  confirmTwo: '¿Restaurar el {{name1}} y el {{name2}}?',
  received: '¡{{nickname}} recibió\nel {{name}}!',
};
