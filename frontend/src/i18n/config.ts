import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enUS from './locales/en-US.json';
import ptBR from './locales/pt-BR.json';

const browserLanguage = 'pt-BR'; // Definido como 'pt-BR' para fins de teste
//const browserLanguage = typeof navigator !== 'undefined' ? navigator.language : 'pt-BR';
const initialLanguage = browserLanguage.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en-US';

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: ptBR },
      'en-US': { translation: enUS },
    },
    lng: initialLanguage,
    fallbackLng: 'pt-BR',
    supportedLngs: ['pt-BR', 'en-US'],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
