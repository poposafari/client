import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { enConfig } from './locales/en/config';
import { jpConfig } from './locales/jp/config';
import { koConfig } from './locales/ko/config';
import { TEXTFONT } from './types';

const fonts = [new FontFace(TEXTFONT.BW, 'url(./font/pokemon-bw.ttf')];

function initLanguageFromBrowser(): void {
  const existingLang = localStorage.getItem('i18nextLng');
  if (existingLang) {
    return;
  }
  const browserLang = navigator.language || (navigator.languages && navigator.languages[0]) || 'en';
  localStorage.setItem('i18nextLng', browserLang);
}

async function initFonts() {
  const results = await Promise.allSettled(fonts.map((font) => font.load()));
  for (const result of results) {
    if (result.status === 'fulfilled') {
      document.fonts?.add(result.value);
    } else {
      console.error(result.reason);
    }
  }
}

export async function initI18n(): Promise<void> {
  initLanguageFromBrowser();

  i18next.use(LanguageDetector);
  await i18next.init({
    nonExplicitSupportedLngs: true,
    fallbackLng: 'en',
    load: 'languageOnly',
    supportedLngs: ['en', 'ko', 'jp'],
    resources: {
      en: {
        ...enConfig,
      },
      ko: {
        ...koConfig,
      },
      jp: {
        ...jpConfig,
      },
    },
  });

  await initFonts();
}

export default i18next;
