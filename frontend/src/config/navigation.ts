export type PageKey =
  | 'dashboard'
  | 'transactions'
  | 'card-brands'
  | 'bank-institutions'
  | 'bank-accounts'
  | 'credit-cards'
  | 'categories'
  | 'pluggy';

export const pageTitleKeys: Record<PageKey, string> = {
  dashboard: 'navigation.overview',
  transactions: 'navigation.transactions',
  'card-brands': 'navigation.cardBrands',
  'bank-institutions': 'navigation.bankInstitutions',
  'bank-accounts': 'navigation.bankAccounts',
  'credit-cards': 'navigation.creditCards',
  categories: 'navigation.categories',
  pluggy: 'navigation.pluggy',
};