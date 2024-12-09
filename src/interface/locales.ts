export interface TranslationDefault {
  [key: string]: string;
}

export interface TranslationItemInfo {
  name: string;
  description: string;
}

export interface TranslationItem {
  [key: string]: TranslationItemInfo;
}
