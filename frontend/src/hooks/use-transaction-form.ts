import { useState } from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { transacaoApi } from '../lib/transacao-api.ts';
import { translateApiError } from '../lib/api-error.ts';
import type { CartaoCredito } from '../types/cartao-credito.ts';
import type { ContaBancaria } from '../types/conta-bancaria.ts';
import type { Subcategoria } from '../types/categoria.ts';
import type { TransactionOrigin } from '../types/transacao.ts';

type TransactionType = 'expense' | 'income' | 'transfer';

export interface TransactionFormState {
  type: TransactionType;
  description: string;
  date: string;
  subcategoryId: string;
  origin: TransactionOrigin | '';
  accountId: string;
  cardId: string;
  installments: string;
  installmentAmount: string;
  destinationAccountId: string;
}

const emptyForm = (): TransactionFormState => ({
  type: 'expense', description: '', date: format(new Date(), 'yyyy-MM-dd'),
  subcategoryId: '', origin: '', accountId: '', cardId: '', installments: '',
  installmentAmount: '', destinationAccountId: '',
});

interface UseTransactionFormOptions {
  subcategories: Subcategoria[];
  accounts: ContaBancaria[];
  cards: CartaoCredito[];
  onCreated: (transactions: Awaited<ReturnType<typeof transacaoApi.create>>) => void;
}

export function useTransactionForm({ subcategories, accounts, cards, onCreated }: UseTransactionFormOptions) {
  const { t } = useTranslation();
  const [form, setForm] = useState<TransactionFormState>(emptyForm);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');

  const update = <K extends keyof TransactionFormState>(key: K, value: TransactionFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };
  const updateType = (type: TransactionType) => {
    setForm((current) => ({ ...current, type, origin: '', accountId: '', cardId: '', destinationAccountId: '', installments: '', installmentAmount: '' }));
    setError('');
  };
  const updateOrigin = (origin: TransactionOrigin) => {
    setForm((current) => ({ ...current, origin, accountId: '', cardId: '', installments: origin === 'card_refund' ? '1' : '', installmentAmount: '' }));
    setError('');
  };
  const open = () => { setForm(emptyForm()); setError(''); setIsOpen(true); };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const installments = form.type === 'transfer' ? 1 : form.origin === 'card' || form.origin === 'card_refund' ? Number(form.installments) : 1;
    const installmentAmount = Number(form.installmentAmount.replace(',', '.'));
    const subcategory = subcategories.find((item) => String(item.id) === form.subcategoryId);
    const account = accounts.find((item) => item.id === form.accountId);
    const card = cards.find((item) => item.id === form.cardId);
    if (form.type === 'transfer') {
      if (!form.date || !form.accountId || !form.destinationAccountId || form.accountId === form.destinationAccountId || !Number.isFinite(installmentAmount) || installmentAmount <= 0) return setError(t('transactions.transferValidation'));
      try {
        const created = await transacaoApi.create({ type: 'transfer', description: 'Transferência Bancária', date: form.date, origin: 'transfer', accountId: form.accountId, destinationAccountId: form.destinationAccountId, installments: 1, installmentAmount });
        onCreated(created); setIsOpen(false); toast.success(t('transactions.transferCreated'));
      } catch (submissionError) { setError(translateApiError(submissionError)); }
      return;
    }
    if (!form.description.trim() || !subcategory || !form.date || !Number.isInteger(installments) || installments < 1 || !Number.isFinite(installmentAmount) || installmentAmount <= 0) return setError(t('transactions.requiredFields'));
    if (!form.origin) return setError(t('transactions.originRequired'));
    const usesCard = form.origin === 'card' || form.origin === 'card_refund';
    if (usesCard && !card) return setError(t('transactions.cardRequired'));
    if (!usesCard && !account) return setError(t('transactions.accountRequired'));
    try {
      const created = await transacaoApi.create({ type: form.type, description: form.description.trim(), date: form.date, subcategoryId: Number(subcategory.id), origin: form.origin, accountId: usesCard ? undefined : account?.id, cardId: usesCard ? card?.id : undefined, installments, installmentAmount });
      onCreated(created); setIsOpen(false); toast.success(installments > 1 ? t('transactions.installmentsCreated', { count: installments }) : t('transactions.created', { type: form.type === 'income' ? t('transactions.income') : t('transactions.expense') }));
    } catch (submissionError) { setError(translateApiError(submissionError)); }
  };
  return { form, error, isOpen, setIsOpen, open, update, updateType, updateOrigin, submit };
}
