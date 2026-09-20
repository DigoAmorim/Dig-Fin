export type TipoTransacao = 'expense' | 'income' | 'transfer';
export type OrigemTransacao = 'card' | 'pix' | 'withdrawal' | 'card_refund' | 'deposit' | 'transfer';

export interface Transacao {
    id: string;
    type: TipoTransacao;
    description: string;
    date: string;
    competenceDate: string;
    subcategoryId: number | null;
    subcategoryName: string | null;
    origin: OrigemTransacao | null;
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
    type: TipoTransacao;
    description: string;
    date: string;
    subcategoryId?: number;
    origin?: OrigemTransacao;
    accountId?: string;
    destinationAccountId?: string;
    cardId?: string;
    installments: number;
    installmentAmount: number;
}

export interface TransacaoUpdateInput {
    description: string;
    date: string;
    amount: number;
}
