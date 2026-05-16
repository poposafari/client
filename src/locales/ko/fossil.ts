export type TranslationFossil = {
  [key: string]: string;
};

export const fossil: TranslationFossil = {
  greeting: '복원이 필요한 화석이 있니?\n내가 복원해줄게!',
  confirmOne: '{{name, 을/를}} 복원할거니?',
  confirmTwo: '{{name1}}, {{name2, 을/를}} 복원할거니?',
  received: '{{nickname, 은/는}}\n{{name, 을/를}} 받았다!',
};
