import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addMonths, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { categoriaApi } from '../lib/categoria-api.ts';
import { cartaoCreditoApi } from '../lib/cartao-credito-api.ts';
import { contaBancariaApi } from '../lib/conta-bancaria-api.ts';
import { transacaoApi } from '../lib/transacao-api.ts';
import { translateApiError } from '../lib/api-error.ts';
import type { CartaoCredito } from '../types/cartao-credito.ts';
import type { ContaBancaria } from '../types/conta-bancaria.ts';
import type { Subcategoria } from '../types/categoria.ts';
import type { Transacao } from '../types/transacao.ts';
import { Button } from '../components/ui/button.tsx';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog.tsx';
import { PageHeader } from '../components/page-header.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover.tsx';
import { MonthPicker } from '../components/ui/month-picker.tsx';
import { TransacoesFilterBar, type TransactionFilters } from '../components/transacoes-filter-bar.tsx';
import { useTransacoesGridState } from '../components/transacoes-grid-columns.tsx';
import { TransactionFormDialog } from '../components/transaction-form-dialog.tsx';
import { TransactionsSummaryCards } from '../components/transactions-summary-cards.tsx';
import { TransactionsTable } from '../components/transactions-table.tsx';
import { useTransactionForm } from '../hooks/use-transaction-form.ts';

const currentMonth = () => format(new Date(), 'yyyy-MM');
const monthLabel = (month: string) => format(parseISO(`${month}-01`), 'LLLL yyyy', { locale: ptBR });
const monthButtonLabel = (month: string) => monthLabel(month).replace(/^[a-z]/, (character) => character.toUpperCase());
const shiftMonth = (month: string, offset: number) => format(addMonths(parseISO(`${month}-01`), offset), 'yyyy-MM');
const formatDate = (date: string) => format(parseISO(date), 'dd/MM/yyyy');
const valueColorClass = (amount: number) => amount > 0 ? 'text-emerald-600' : amount < 0 ? 'text-rose-600' : 'text-slate-500';

const emptyFilters = (): TransactionFilters => ({ search: '', type: '', accountId: '', cardId: '', subcategoryIds: [] });

export function Transacoes() {
  const { t, i18n } = useTranslation();
  const [transactions, setTransactions] = useState<Transacao[]>([]);
  const [month, setMonth] = useState(currentMonth);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [subcategories, setSubcategories] = useState<Subcategoria[]>([]);
  const [accounts, setAccounts] = useState<ContaBancaria[]>([]);
  const [cards, setCards] = useState<CartaoCredito[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [deletingTransaction, setDeletingTransaction] = useState<Transacao | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>(emptyFilters);
  const grid = useTransacoesGridState();
  const form = useTransactionForm({ subcategories, accounts, cards, onCreated: (created) => setTransactions((current) => [...current, ...created]) });

  useEffect(() => {
    Promise.all([transacaoApi.list(), categoriaApi.list(), contaBancariaApi.list(), cartaoCreditoApi.list()])
      .then(([loadedTransactions, categoryResponse, loadedAccounts, loadedCards]) => {
        setTransactions(loadedTransactions);
        setSubcategories([...categoryResponse.categories.flatMap((category) => category.subcategories), ...categoryResponse.ungroupedSubcategories].sort((first, second) => first.name.localeCompare(second.name)));
        setAccounts(loadedAccounts); setCards(loadedCards);
      })
      .catch(() => setLoadError(t('transactions.loadError')))
      .finally(() => setIsLoading(false));
  }, [t]);

  const monthTransactions = useMemo(() => {
    const query = filters.search.trim().toLocaleLowerCase('pt-BR');
    const filtered = transactions.filter((transaction) => transaction.competenceDate.slice(0, 7) === month
      && (!filters.type || transaction.type === filters.type)
      && (!filters.accountId || transaction.accountId === filters.accountId)
      && (!filters.cardId || transaction.cardId === filters.cardId)
      && (!filters.subcategoryIds.length || filters.subcategoryIds.includes(String(transaction.subcategoryId)))
      && (!query || [transaction.description, transaction.accountName, transaction.cardName, transaction.subcategoryName].filter(Boolean).some((value) => value?.toLocaleLowerCase('pt-BR').includes(query))));
    const direction = grid.sortDir === 'asc' ? 1 : -1;
    return filtered.sort((first, second) => {
      const values: Record<string, string | number> = { description: first.description.localeCompare(second.description, 'pt-BR') - second.description.localeCompare(first.description, 'pt-BR'), account: (first.accountName ?? '').localeCompare(second.accountName ?? '', 'pt-BR'), card: (first.cardName ?? '').localeCompare(second.cardName ?? '', 'pt-BR'), installment: first.installment - second.installment || first.installments - second.installments, subcategory: (first.subcategoryName ?? '').localeCompare(second.subcategoryName ?? '', 'pt-BR'), amount: first.amount - second.amount, date: first.competenceDate.localeCompare(second.competenceDate) };
      const comparison = grid.sortBy ? Number(values[grid.sortBy]) : Number(values.date);
      return comparison * direction || first.id.localeCompare(second.id);
    });
  }, [filters, grid.sortBy, grid.sortDir, month, transactions]);

  const summary = useMemo(() => monthTransactions.reduce((result, transaction) => ({ expenses: result.expenses + (transaction.type === 'expense' ? transaction.amount : 0), income: result.income + (transaction.type === 'income' ? transaction.amount : 0), balance: result.balance + transaction.amount }), { expenses: 0, income: 0, balance: 0 }), [monthTransactions]);
  const formatCurrency = (amount: number) => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'BRL' }).format(amount);
  const removeTransaction = async () => {
    if (!deletingTransaction) return;
    try { await transacaoApi.remove(deletingTransaction.id); setTransactions((current) => current.filter((transaction) => transaction.installmentGroupId !== deletingTransaction.installmentGroupId)); setDeletingTransaction(null); toast.success(t('transactions.deleted')); } catch (error) { toast.error(translateApiError(error)); }
  };

  return <div className="space-y-4"><PageHeader section={t('transactions.section')} title={t('transactions.title')} />
    <TransactionFormDialog open={form.isOpen} form={form.form} error={form.error} onOpenChange={form.setIsOpen} onSubmit={form.submit} onUpdate={form.update} onTypeChange={form.updateType} onOriginChange={form.updateOrigin} subcategories={subcategories} accounts={accounts} cards={cards} />
    <Dialog open={!!deletingTransaction} onOpenChange={(open) => { if (!open) setDeletingTransaction(null); }}><DialogContent><DialogHeader><DialogTitle>{t('transactions.deleteTitle')}</DialogTitle></DialogHeader><p className="text-sm text-slate-600">{deletingTransaction?.type === 'transfer' ? t('transactions.deleteTransferConfirmation') : t('transactions.deleteConfirmation')}</p><DialogFooter><Button type="button" variant="outline" onClick={() => setDeletingTransaction(null)}>{t('common.cancel')}</Button><Button type="button" variant="destructive" onClick={removeTransaction}>{t('common.delete')}</Button></DialogFooter></DialogContent></Dialog>
    {loadError && <p role="alert" className="text-sm text-rose-600">{loadError}</p>}
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('transactions.period')}</p><p className="mt-1 text-lg font-semibold text-slate-900">{monthButtonLabel(month)}</p></div><div className="flex items-center gap-2"><Button type="button" variant="outline" size="icon-sm" onClick={() => setMonth((value) => shiftMonth(value, -1))} aria-label={t('transactions.previousMonth')}><ChevronLeft size={16} /></Button><Popover open={isMonthPickerOpen} onOpenChange={setIsMonthPickerOpen}><PopoverTrigger asChild><button type="button" className="inline-flex h-8 min-w-[150px] items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800">{monthButtonLabel(month)}</button></PopoverTrigger><PopoverContent align="center"><MonthPicker key={month} locale="pt-BR" selectedMonth={new Date(`${month}-01T12:00:00`)} onMonthSelect={(date) => { setMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`); setIsMonthPickerOpen(false); }} /></PopoverContent></Popover><Button type="button" variant="outline" size="icon-sm" onClick={() => setMonth((value) => shiftMonth(value, 1))} aria-label={t('transactions.nextMonth')}><ChevronRight size={16} /></Button><Button type="button" size="sm" className="ml-1 gap-1.5" onClick={form.open}><Plus size={14} /> {t('transactions.new')}</Button></div></div>
    <TransactionsSummaryCards {...summary} formatCurrency={formatCurrency} valueColorClass={valueColorClass} />
    <TransacoesFilterBar filters={filters} onFiltersChange={setFilters} accounts={accounts} cards={cards} subcategories={subcategories} />
    <TransactionsTable transactions={monthTransactions} isLoading={isLoading} sortBy={grid.sortBy} sortDir={grid.sortDir} onSort={grid.toggleSort} onDelete={setDeletingTransaction} formatDate={formatDate} formatCurrency={formatCurrency} valueColorClass={valueColorClass} />
  </div>;
}
