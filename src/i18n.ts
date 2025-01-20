import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { enConfig } from './locales/en/config';
import { koConfig } from './locales/ko/config';

const fonts = [
  new FontFace('font_0', 'url(./font/PokePT_Wansung.ttf)'),
  new FontFace('font_1', 'url(./font/unifont-15.1.05.otf'),
  new FontFace('font_2', 'url(./font/pokemon-emerald-pro.ttf'),
  new FontFace('font_3', 'url(./font/pkmn.ttf'),
  new FontFace('font_4', 'url(./font/pokemon-bw.ttf'),
  new FontFace('font_5', 'url(./font/pokemon-dppt.ttf'),
];

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
  i18next.use(LanguageDetector);
  await i18next.init({
    nonExplicitSupportedLngs: true,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ko'],
    resources: {
      en: {
        ...enConfig,
      },
      ko: {
        ...koConfig,
      },
    },
  });

  await initFonts();
}

export default i18next;
