import i18n from 'i18next';

export const supportedLanguages = ['pt-BR', 'en-US'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

void i18n.init({
    resources: {
        'pt-BR': {
            translation: {
                errors: {
                    invalidId: 'ID inválido.',
                    cardBrandNotFound: 'Bandeira não encontrada.',
                    cardBrandInUse: 'A bandeira está sendo utilizada por um cartão de crédito.',
                    cardBrandDescriptionRequired: 'A descrição é obrigatória.',
                    cardBrandDescriptionTooLong: 'A descrição deve ter no máximo 50 caracteres.',
                    cardBrandDescriptionDuplicate: 'Já existe uma bandeira com essa descrição.',
                    selectedCardBrandNotFound: 'A bandeira selecionada não foi encontrada.',
                    creditCardOrBrandNotFound: 'Cartão de crédito ou bandeira não encontrada.',
                    creditCardNotFound: 'Cartão de crédito não encontrado.',
                    creditCardNameRequired: 'O nome do cartão é obrigatório.',
                    creditCardNameTooLong: 'O nome do cartão deve ter no máximo 50 caracteres.',
                    creditCardBrandRequired: 'A bandeira do cartão é obrigatória.',
                    creditCardDueDayInvalid: 'O dia de vencimento deve estar entre 1 e 31.',
                    internal: 'Erro interno do servidor.',
                },
            },
        },
        'en-US': {
            translation: {
                errors: {
                    invalidId: 'Invalid ID.',
                    cardBrandNotFound: 'Card brand not found.',
                    cardBrandInUse: 'This card brand cannot be deleted because it is being used by a credit card.',
                    cardBrandDescriptionRequired: 'Description is required.',
                    cardBrandDescriptionTooLong: 'Description must be at most 50 characters long.',
                    cardBrandDescriptionDuplicate: 'A card brand with this description already exists.',
                    selectedCardBrandNotFound: 'The selected card brand was not found.',
                    creditCardOrBrandNotFound: 'Credit card or card brand not found.',
                    creditCardNotFound: 'Credit card not found.',
                    creditCardNameRequired: 'Card name is required.',
                    creditCardNameTooLong: 'Card name must be at most 50 characters long.',
                    creditCardBrandRequired: 'Card brand is required.',
                    creditCardDueDayInvalid: 'Due day must be between 1 and 31.',
                    internal: 'Internal server error.',
                },
            },
        },
    },
    fallbackLng: 'pt-BR',
    supportedLngs: [...supportedLanguages],
});

export const getLanguageFromHeader = (acceptLanguage?: string): SupportedLanguage => {
    const requestedLanguage = acceptLanguage?.split(',')[0]?.trim().toLowerCase();
    return requestedLanguage?.startsWith('en') ? 'en-US' : 'pt-BR';
};

export const translate = (key: string, language: SupportedLanguage): string => (
    i18n.t(key, { lng: language })
);
