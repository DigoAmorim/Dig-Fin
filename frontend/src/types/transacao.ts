export type TransactionType = 'expense' | 'income' | 'transfer';
export type TransactionOrigin = 'card' | 'pix' | 'withdrawal' | 'card_refund' | 'deposit' | 'transfer';

export interface Transacao {
  id: string;
  type: TransactionType;
  description: string;
  date: string;
  competenceDate: string;
  subcategoryId: number | null;
  subcategoryName: string | null;
  origin: TransactionOrigin | null;
  accountId: string | null;
  accountName: string | null;
  cardId: string | null;
  cardName: string | null;
  installment: number;
  installments: number;
  amount: number;
  installmentGroupId: string;
}

export interface TransacaoInput {
  type: TransactionType;
  description: string;
  date: string;
  subcategoryId?: number;
  origin: TransactionOrigin;
  accountId?: string;
  destinationAccountId?: string;
  cardId?: string;
  installments: number;
  installmentAmount: number;
}
