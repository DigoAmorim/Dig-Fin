import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addMonths, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Plus, Receipt, WalletCards } from 'lucide-react';
import { toast } from 'sonner';
import { categoriaApi } from '../lib/categoria-api.ts';
import { cartaoCreditoApi } from '../lib/cartao-credito-api.ts';
import { contaBancariaApi } from '../lib/conta-bancaria-api.ts';
import { transacaoApi } from '../lib/transacao-api.ts';
import { translateApiError } from '../lib/api-error.ts';
import type { CartaoCredito } from '../types/cartao-credito.ts';
import type { ContaBancaria } from '../types/conta-bancaria.ts';
import type { Subcategoria } from '../types/categoria.ts';
import type { TransactionOrigin, Transacao } from '../types/transacao.ts';
import { Button } from '../components/ui/button.tsx';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog.tsx';
import { Input } from '../components/ui/input.tsx';
import { DatePickerInput } from '../components/ui/date-picker-input.tsx';
import { Label } from '../components/ui/label.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.tsx';
import { PageHeader } from '../components/page-header.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover.tsx';
import { MonthPicker } from '../components/ui/month-picker.tsx';
import { type TransacoesColumnId, useTransacoesGridState } from '../components/transacoes-grid-columns.tsx';

type TransactionType = 'expense' | 'income' | 'transfer';
interface ExpenseFormState {
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

const emptyForm = (): ExpenseFormState => ({
  type: 'expense',
  description: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  subcategoryId: '',
  origin: '',
  accountId: '',
  cardId: '',
  installments: '',
  installmentAmount: '',
  destinationAccountId: '',
});

const monthLabel = (month: string) => format(parseISO(`${month}-01`), 'LLLL yyyy', { locale: ptBR });
const monthButtonLabel = (month: string) => monthLabel(month).replace(/^[a-z]/, (character) => character.toUpperCase());
const formatDate = (date: string) => format(parseISO(date), 'dd/MM/yyyy');
const formatCurrency = (amount: number) => amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const valueColorClass = (amount: number) => amount > 0 ? 'text-emerald-600' : amount < 0 ? 'text-rose-600' : 'text-slate-500';
const currentMonth = () => format(new Date(), 'yyyy-MM');

function shiftMonth(month: string, offset: number) {
  return format(addMonths(parseISO(`${month}-01`), offset), 'yyyy-MM');
}

export function Transacoes() {
  const { t } = useTranslation();
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transacao[]>([]);
  const [month, setMonth] = useState(currentMonth);
  const [form, setForm] = useState<ExpenseFormState>(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [subcategories, setSubcategories] = useState<Subcategoria[]>([]);
  const [accounts, setAccounts] = useState<ContaBancaria[]>([]);
  const [cards, setCards] = useState<CartaoCredito[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const grid = useTransacoesGridState();

  useEffect(() => {
    Promise.all([transacaoApi.list(), categoriaApi.list(), contaBancariaApi.list(), cartaoCreditoApi.list()])
      .then(([loadedTransactions, categoryResponse, loadedAccounts, loadedCards]) => {
        setTransactions(loadedTransactions);
        setSubcategories([
          ...categoryResponse.categories.flatMap((category) => category.subcategories),
          ...categoryResponse.ungroupedSubcategories,
        ].sort((first, second) => first.name.localeCompare(second.name)));
        setAccounts(loadedAccounts);
        setCards(loadedCards);
      })
      .catch(() => setLoadError(t('transactions.loadError')))
      .finally(() => setIsLoading(false));
  }, [t]);

  const monthTransactions = useMemo(() => {
    const filtered = transactions.filter((transaction) => transaction.competenceDate.slice(0, 7) === month);
    const direction = grid.sortDir === 'asc' ? 1 : -1;

    return filtered.sort((first, second) => {
      let comparison = 0;
      switch (grid.sortBy) {
        case 'description':
          comparison = first.description.localeCompare(second.description, 'pt-BR');
          break;
        case 'account':
          comparison = (first.accountName ?? '').localeCompare(second.accountName ?? '', 'pt-BR');
          break;
        case 'card':
          comparison = (first.cardName ?? '').localeCompare(second.cardName ?? '', 'pt-BR');
          break;
        case 'installment':
          comparison = first.installment - second.installment || first.installments - second.installments;
          break;
        case 'subcategory':
          comparison = (first.subcategoryName ?? '').localeCompare(second.subcategoryName ?? '', 'pt-BR');
          break;
        case 'amount':
          comparison = first.amount - second.amount;
          break;
        case 'date':
        case null:
          comparison = first.competenceDate.localeCompare(second.competenceDate);
          break;
      }
      return comparison * direction || first.id.localeCompare(second.id);
    });
  }, [grid.sortBy, grid.sortDir, month, transactions]);

  const renderSortIcon = (column: TransacoesColumnId) => {
    if (grid.sortBy !== column) return null;
    return grid.sortDir === 'asc'
      ? <ArrowUp size={13} aria-hidden="true" />
      : <ArrowDown size={13} aria-hidden="true" />;
  };

  const sortableHeaderClass = 'inline-flex cursor-pointer items-center gap-1 hover:text-slate-900';

  const monthSummary = useMemo(() => monthTransactions.reduce(
    (summary, transaction) => {
      if (transaction.type === 'expense') summary.expenses += transaction.amount;
      if (transaction.type === 'income') summary.income += transaction.amount;
      summary.balance += transaction.amount;
      return summary;
    },
    { expenses: 0, income: 0, balance: 0 },
  ), [monthTransactions]);

  const updateForm = <K extends keyof ExpenseFormState>(key: K, value: ExpenseFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFormError('');
  };

  const updateType = (type: TransactionType) => {
    setForm((current) => ({
      ...current,
      type,
      origin: '',
      accountId: '',
      cardId: '',
      destinationAccountId: '',
      installments: '',
      installmentAmount: '',
    }));
    setFormError('');
  };

  const updateOrigin = (origin: TransactionOrigin) => {
    setForm((current) => ({
      ...current,
      origin,
      accountId: '',
      cardId: '',
      installments: origin === 'card_refund' ? '1' : '',
      installmentAmount: '',
    }));
    setFormError('');
  };

  const openForm = () => {
    setForm(emptyForm());
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const installments = form.type === 'transfer'
      ? 1
      : form.origin === 'card' || form.origin === 'card_refund' ? Number(form.installments) : 1;
    const installmentAmount = Number(form.installmentAmount.replace(',', '.'));
    const subcategory = subcategories.find((item) => String(item.id) === form.subcategoryId);
    const account = accounts.find((item) => item.id === form.accountId);
    const card = cards.find((item) => item.id === form.cardId);

    if (form.type === 'transfer') {
      if (!form.date || !form.accountId || !form.destinationAccountId || form.accountId === form.destinationAccountId || !Number.isFinite(installmentAmount) || installmentAmount <= 0) {
        return setFormError(t('transactions.transferValidation'));
      }
      try {
        const created = await transacaoApi.create({
          type: 'transfer',
          description: 'Transferência Bancária',
          date: form.date,
          origin: 'transfer',
          accountId: form.accountId,
          destinationAccountId: form.destinationAccountId,
          installments: 1,
          installmentAmount,
        });
        setTransactions((current) => [...current, ...created]);
        setIsFormOpen(false);
        toast.success(t('transactions.transferCreated'));
      } catch (error) {
        setFormError(translateApiError(error));
      }
      return;
    }
    if (!form.description.trim() || !subcategory || !form.date || !Number.isInteger(installments) || installments < 1 || !Number.isFinite(installmentAmount) || installmentAmount <= 0) {
      return setFormError(t('transactions.requiredFields'));
    }
    if (!form.origin) return setFormError(t('transactions.originRequired'));
    const usesCard = form.origin === 'card' || form.origin === 'card_refund';
    if (usesCard && !card) return setFormError(t('transactions.cardRequired'));
    if (!usesCard && !account) return setFormError(t('transactions.accountRequired'));
    const subcategoryId = Number(subcategory.id);
    if (!Number.isSafeInteger(subcategoryId) || subcategoryId <= 0) {
      return setFormError(t('transactions.subcategoryInvalid'));
    }

    try {
      const created = await transacaoApi.create({
        type: form.type,
        description: form.description.trim(),
        date: form.date,
        subcategoryId,
        origin: form.origin,
        accountId: usesCard ? undefined : account?.id,
        cardId: usesCard ? card?.id : undefined,
        installments,
        installmentAmount,
      });
      setTransactions((current) => [...current, ...created]);
      setIsFormOpen(false);
      toast.success(installments > 1
        ? t('transactions.installmentsCreated', { count: installments })
        : t('transactions.created', { type: form.type === 'income' ? t('transactions.income') : t('transactions.expense') }));
    } catch (error) {
      setFormError(translateApiError(error));
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader section={t('transactions.section')} title={t('transactions.title')} />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('transactions.new')}</DialogTitle></DialogHeader>
          <form
            onSubmit={handleSubmit}
            onInvalid={(event) => (event.target as HTMLInputElement).setCustomValidity(t('common.required'))}
            onInput={(event) => (event.target as HTMLInputElement).setCustomValidity('')}
            className="max-h-[75vh] space-y-4 overflow-y-auto pr-1"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="transaction-type" required>{t('transactions.type')}</Label><Select name="transactionType" required value={form.type || undefined} onValueChange={(value) => updateType(value as TransactionType)}><SelectTrigger id="transaction-type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="expense">{t('transactions.expense')}</SelectItem><SelectItem value="income">{t('transactions.income')}</SelectItem><SelectItem value="transfer">{t('transactions.transfer')}</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="transaction-date" required>{t('transactions.date')}</Label><DatePickerInput id="transaction-date" aria-label={t('transactions.date')} value={form.date} onChange={(value) => updateForm('date', value)} className="w-full justify-start" /></div>
            </div>
            {form.type !== 'transfer' && <div className="space-y-2"><Label htmlFor="transaction-description" required>{t('transactions.description')}</Label><Input id="transaction-description" value={form.description} onChange={(event) => updateForm('description', event.target.value)} maxLength={50} placeholder={t('transactions.descriptionPlaceholder')} required /><p className="text-right text-xs text-slate-400">{form.description.length}/50</p></div>}
            {form.type === 'transfer' && <div className="space-y-4">
              <div className="space-y-2"><Label htmlFor="transaction-source-account" required>{t('transactions.sourceAccount')}</Label><Select name="sourceAccountId" required value={form.accountId || undefined} onValueChange={(value) => updateForm('accountId', value)}><SelectTrigger id="transaction-source-account"><SelectValue placeholder={t('transactions.sourceAccountPlaceholder')} /></SelectTrigger><SelectContent>{accounts.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="transaction-destination-account" required>{t('transactions.destinationAccount')}</Label><Select name="destinationAccountId" required value={form.destinationAccountId || undefined} onValueChange={(value) => updateForm('destinationAccountId', value)}><SelectTrigger id="transaction-destination-account"><SelectValue placeholder={t('transactions.destinationAccountPlaceholder')} /></SelectTrigger><SelectContent>{accounts.filter((item) => item.id !== form.accountId).map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="transaction-transfer-amount" required>{t('transactions.transferAmount')}</Label><Input id="transaction-transfer-amount" type="number" min="0.01" step="0.01" value={form.installmentAmount} onChange={(event) => updateForm('installmentAmount', event.target.value)} placeholder="0,00" required /></div>
            </div>}
            {form.type !== 'transfer' && <>
              <div className="space-y-2"><Label htmlFor="transaction-subcategory" required>{t('transactions.subcategory')}</Label><Select name="subcategoryId" required value={form.subcategoryId || undefined} onValueChange={(value) => updateForm('subcategoryId', value)}><SelectTrigger id="transaction-subcategory"><SelectValue placeholder={t('transactions.subcategoryPlaceholder')} /></SelectTrigger><SelectContent>{subcategories.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="transaction-origin" required>{t('transactions.origin')}</Label><Select name="transactionOrigin" required value={form.origin || undefined} onValueChange={(value) => updateOrigin(value as TransactionOrigin)}><SelectTrigger id="transaction-origin"><SelectValue placeholder={t('transactions.originPlaceholder')} /></SelectTrigger><SelectContent>{form.type === 'expense' ? <><SelectItem value="card">{t('transactions.card')}</SelectItem><SelectItem value="pix">{t('transactions.pix')}</SelectItem><SelectItem value="withdrawal">{t('transactions.withdrawal')}</SelectItem></> : <><SelectItem value="card_refund">{t('transactions.cardRefund')}</SelectItem><SelectItem value="pix">{t('transactions.pix')}</SelectItem><SelectItem value="deposit">{t('transactions.deposit')}</SelectItem></>}</SelectContent></Select></div>
              {form.origin === 'card' || form.origin === 'card_refund' ? <>
                <div className="space-y-2"><Label htmlFor="transaction-card" required>{t('transactions.card')}</Label><Select name="creditCardId" required value={form.cardId || undefined} onValueChange={(value) => updateForm('cardId', value)}><SelectTrigger id="transaction-card"><SelectValue placeholder={t('creditCards.brandPlaceholder')} /></SelectTrigger><SelectContent>{cards.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="transaction-installments" required>{t('transactions.installments')}</Label><Input id="transaction-installments" type="number" min="1" step="1" value={form.installments} onChange={(event) => updateForm('installments', event.target.value)} required /></div><div className="space-y-2"><Label htmlFor="transaction-installment-amount" required>{form.type === 'income' ? t('transactions.refundAmount') : t('transactions.installmentAmount')}</Label><Input id="transaction-installment-amount" type="number" min="0.01" step="0.01" value={form.installmentAmount} onChange={(event) => updateForm('installmentAmount', event.target.value)} placeholder="0,00" required /></div></div>
              </> : form.origin ? <>
                <div className="space-y-2"><Label htmlFor="transaction-account" required>{t('transactions.account')}</Label><Select name="accountId" required value={form.accountId || undefined} onValueChange={(value) => updateForm('accountId', value)}><SelectTrigger id="transaction-account"><SelectValue placeholder={t('transactions.accountPlaceholder')} /></SelectTrigger><SelectContent>{accounts.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="transaction-amount" required>{form.type === 'income' ? t('transactions.incomeAmount') : t('transactions.expenseAmount')}</Label><Input id="transaction-amount" type="number" min="0.01" step="0.01" value={form.installmentAmount} onChange={(event) => updateForm('installmentAmount', event.target.value)} placeholder="0,00" required /></div>
              </> : null}
            </>}
            {formError && <p role="alert" className="text-sm text-rose-600">{formError}</p>}
            <DialogFooter><Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button><Button type="submit">Salvar transação</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {loadError && <p role="alert" className="text-sm text-rose-600">{loadError}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('transactions.period')}</p><p className="mt-1 text-lg font-semibold text-slate-900">{monthButtonLabel(month)}</p></div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon-sm" onClick={() => setMonth((value) => shiftMonth(value, -1))} aria-label={t('transactions.previousMonth')}><ChevronLeft size={16} /></Button>
          <Popover open={isMonthPickerOpen} onOpenChange={setIsMonthPickerOpen}>
            <PopoverTrigger asChild>
              <button type="button" aria-label={t('transactions.selectMonth')} className="inline-flex h-8 min-w-[150px] items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">{monthButtonLabel(month)}</button>
            </PopoverTrigger>
            <PopoverContent align="center">
              <MonthPicker
                key={month}
                locale="pt-BR"
                selectedMonth={new Date(`${month}-01T12:00:00`)}
                onMonthSelect={(date) => {
                  setMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
                  setIsMonthPickerOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          <Button type="button" variant="outline" size="icon-sm" onClick={() => setMonth((value) => shiftMonth(value, 1))} aria-label={t('transactions.nextMonth')}><ChevronRight size={16} /></Button>
          <Button type="button" size="sm" className="ml-1 gap-1.5" onClick={openForm}><Plus size={14} /> {t('transactions.new')}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
        <div className="space-y-1 border-b border-slate-100 pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('transactions.expenses')}</p>
          <p className={`font-mono text-lg font-semibold ${valueColorClass(monthSummary.expenses)}`}>{formatCurrency(monthSummary.expenses)}</p>
        </div>
        <div className="space-y-1 border-b border-slate-100 pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('transactions.incomeSummary')}</p>
          <p className={`font-mono text-lg font-semibold ${valueColorClass(monthSummary.income)}`}>{formatCurrency(monthSummary.income)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('transactions.balance')}</p>
          <p className={`font-mono text-lg font-semibold ${valueColorClass(monthSummary.balance)}`}>{formatCurrency(monthSummary.balance)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="text-sm font-semibold text-slate-800">{t('transactions.launches')}</h2><p className="mt-1 text-xs text-slate-500">{isLoading ? t('common.loading') : `${monthTransactions.length} ${t('transactions.found')}`}</p></div><Receipt size={20} className="text-slate-300" /></div>
        {isLoading && <p className="px-5 py-6 text-sm text-slate-500">{t('common.loading')}</p>}
        {monthTransactions.length === 0 ? <div className="flex flex-col items-center gap-2 px-5 py-12 text-center"><WalletCards size={30} className="text-slate-300" /><p className="text-sm text-slate-500">{t('transactions.empty')}</p></div> : <Table><TableHeader><TableRow className="bg-slate-50">
          <TableHead><button type="button" className={sortableHeaderClass} onClick={() => grid.toggleSort('date')}>{t('transactions.launchDateColumn')}{renderSortIcon('date')}</button></TableHead>
          <TableHead><button type="button" className={sortableHeaderClass} onClick={() => grid.toggleSort('description')}>{t('transactions.descriptionColumn')}{renderSortIcon('description')}</button></TableHead>
          <TableHead><button type="button" className={sortableHeaderClass} onClick={() => grid.toggleSort('account')}>{t('transactions.accountColumn')}{renderSortIcon('account')}</button></TableHead>
          <TableHead><button type="button" className={sortableHeaderClass} onClick={() => grid.toggleSort('card')}>{t('transactions.cardColumn')}{renderSortIcon('card')}</button></TableHead>
          <TableHead><button type="button" className={sortableHeaderClass} onClick={() => grid.toggleSort('installment')}>{t('transactions.installmentColumn')}{renderSortIcon('installment')}</button></TableHead>
          <TableHead><button type="button" className={sortableHeaderClass} onClick={() => grid.toggleSort('subcategory')}>{t('transactions.subcategoryColumn')}{renderSortIcon('subcategory')}</button></TableHead>
          <TableHead className="text-right"><button type="button" className={`ml-auto ${sortableHeaderClass}`} onClick={() => grid.toggleSort('amount')}>{t('transactions.amountColumn')}{renderSortIcon('amount')}</button></TableHead>
        </TableRow></TableHeader><TableBody>{monthTransactions.map((transaction) => <TableRow key={transaction.id} className="border-slate-100"><TableCell className="text-slate-500">{formatDate(transaction.date)}</TableCell><TableCell className="font-medium text-slate-800">{transaction.description}</TableCell><TableCell className="text-slate-500">{transaction.accountName ?? '-'}</TableCell><TableCell className="text-slate-500">{transaction.cardName ?? '-'}</TableCell><TableCell className="text-slate-500">{transaction.installment}/{transaction.installments}</TableCell><TableCell className="text-slate-600">{transaction.subcategoryName}</TableCell><TableCell className={`text-right font-mono font-semibold ${valueColorClass(transaction.amount)}`}>{formatCurrency(transaction.amount)}</TableCell></TableRow>)}</TableBody></Table>}
      </div>
    </div>
  );
}