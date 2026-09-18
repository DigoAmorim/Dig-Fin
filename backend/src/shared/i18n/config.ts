import i18n from 'i18next';
import enUS from './locales/en-US.json';
import ptBR from './locales/pt-BR.json';

export const supportedLanguages = ['pt-BR', 'en-US'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

void i18n.init({
    resources: {
        'pt-BR': { translation: ptBR },
        'en-US': { translation: enUS },
    },
    fallbackLng: 'pt-BR',
    supportedLngs: [...supportedLanguages],
});

export const getLanguageFromHeader = (acceptLanguage?: string): SupportedLanguage => {
    const requestedLanguage = acceptLanguage?.split(',')[0]?.trim().toLowerCase();
    return requestedLanguage?.startsWith('en') ? 'en-US' : 'pt-BR';
};

export const translate = (
    key: string,
    language: SupportedLanguage,
    params: Record<string, unknown> = {},
): string => (
    i18n.t(key, { lng: language, ...params })
);
