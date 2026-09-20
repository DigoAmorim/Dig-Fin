import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Receipt, WalletCards } from 'lucide-react';
import { toast } from 'sonner';
import { categoriaApi } from '../lib/CategoriaApi.ts';
import { cartaoCreditoApi } from '../lib/CartaoCreditoApi.ts';
import { contaBancariaApi } from '../lib/ContaBancariaApi.ts';
import type { CartaoCredito } from '../types/CartaoCredito.ts';
import type { ContaBancaria } from '../types/ContaBancaria.ts';
import type { Subcategoria } from '../types/Categoria.ts';
import { Button } from '../components/ui/Button.tsx';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/Dialog.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Label } from '../components/ui/Label.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table.tsx';
import { PageHeader } from '../components/PageHeader.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/Popover.tsx';
import { MonthPicker } from '../components/ui/MonthPicker.tsx';

type TransactionType = 'expense' | 'income' | 'transfer';
type ExpenseOrigin = 'card' | 'pix' | 'withdrawal';

interface StoredTransaction {
  id: string;
  type: TransactionType;
  description: string;
  date: string;
  subcategoryId: number;
  subcategoryName: string;
  origin: ExpenseOrigin;
  accountId?: string;
  accountName?: string;
  cardId?: string;
  cardName?: string;
  installment: number;
  installments: number;
  amount: number;
}

interface ExpenseFormState {
  type: TransactionType;
  description: string;
  date: string;
  subcategoryId: string;
  origin: ExpenseOrigin;
  accountId: string;
  cardId: string;
  installments: string;
  installmentAmount: string;
}

const STORAGE_KEY = 'digfin.transactions';
const emptyForm = (): ExpenseFormState => ({
  type: 'expense',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  subcategoryId: '',
  origin: 'card',
  accountId: '',
  cardId: '',
  installments: '1',
  installmentAmount: '',
});

const monthLabel = (month: string) => new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(`${month}-01T12:00:00`));
const monthButtonLabel = (month: string) => monthLabel(month).replace(/^[a-z]/, (character) => character.toUpperCase());
const formatDate = (date: string) => new Intl.DateTimeFormat('pt-BR').format(new Date(`${date}T12:00:00`));
const formatCurrency = (amount: number) => amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const currentMonth = () => new Date().toISOString().slice(0, 7);

function shiftMonth(month: string, offset: number) {
  const date = new Date(`${month}-01T12:00:00`);
  date.setMonth(date.getMonth() + offset);
  return date.toISOString().slice(0, 7);
}

function makeInstallmentDate(date: string, offset: number) {
  const original = new Date(`${date}T12:00:00`);
  const day = original.getDate();
  const result = new Date(original.getFullYear(), original.getMonth() + offset, 1, 12);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result.toISOString().slice(0, 10);
}

export function Transacoes() {
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [transactions, setTransactions] = useState<StoredTransaction[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as StoredTransaction[]; } catch { return []; }
  });
  const [month, setMonth] = useState(currentMonth);
  const [form, setForm] = useState<ExpenseFormState>(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [subcategories, setSubcategories] = useState<Subcategoria[]>([]);
  const [accounts, setAccounts] = useState<ContaBancaria[]>([]);
  const [cards, setCards] = useState<CartaoCredito[]>([]);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    Promise.all([categoriaApi.list(), contaBancariaApi.list(), cartaoCreditoApi.list()])
      .then(([categoryResponse, loadedAccounts, loadedCards]) => {
        setSubcategories([
          ...categoryResponse.categories.flatMap((category) => category.subcategories),
          ...categoryResponse.ungroupedSubcategories,
        ].sort((first, second) => first.name.localeCompare(second.name)));
        setAccounts(loadedAccounts);
        setCards(loadedCards);
      })
      .catch(() => setLoadError('Não foi possível carregar as opções da transação.'));
  }, []);

  const monthTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.date.slice(0, 7) === month).sort((a, b) => a.date.localeCompare(b.date)),
    [month, transactions],
  );

  const updateForm = <K extends keyof ExpenseFormState>(key: K, value: ExpenseFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFormError('');
  };

  const openForm = () => {
    setForm(emptyForm());
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const installments = Number(form.installments);
    const installmentAmount = Number(form.installmentAmount.replace(',', '.'));
    const subcategory = subcategories.find((item) => String(item.id) === form.subcategoryId);
    const account = accounts.find((item) => item.id === form.accountId);
    const card = cards.find((item) => item.id === form.cardId);

    if (form.type !== 'expense') return setFormError('Receitas e transferências serão habilitadas na próxima etapa.');
    if (!form.description.trim() || !subcategory || !form.date || !Number.isInteger(installments) || installments < 1 || !Number.isFinite(installmentAmount) || installmentAmount <= 0) {
      return setFormError('Preencha todos os campos obrigatórios com valores válidos.');
    }
    if (form.origin === 'card' && !card) return setFormError('Selecione o cartão utilizado.');
    if (form.origin !== 'card' && !account) return setFormError('Selecione a conta utilizada.');

    const created = Array.from({ length: installments }, (_, index): StoredTransaction => ({
      id: crypto.randomUUID(),
      type: 'expense',
      description: form.description.trim(),
      date: makeInstallmentDate(form.date, index),
      subcategoryId: subcategory.id,
      subcategoryName: subcategory.name,
      origin: form.origin,
      accountId: form.origin === 'card' ? undefined : account?.id,
      accountName: form.origin === 'card' ? undefined : account?.name,
      cardId: form.origin === 'card' ? card?.id : undefined,
      cardName: form.origin === 'card' ? card?.name : undefined,
      installment: index + 1,
      installments,
      amount: -Math.abs(installmentAmount),
    }));
    const next = [...transactions, ...created];
    setTransactions(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setIsFormOpen(false);
    toast.success(installments > 1 ? `${installments} parcelas lançadas com sucesso.` : 'Despesa lançada com sucesso.');
  };

  return (
    <div className="space-y-4">
      <PageHeader section="Movimentações" title="Transações" />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova transação</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-4 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="transaction-type" required>Tipo</Label><Select value={form.type} onValueChange={(value) => updateForm('type', value as TransactionType)}><SelectTrigger id="transaction-type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="expense">Despesa</SelectItem><SelectItem value="income">Receita</SelectItem><SelectItem value="transfer">Transferência</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="transaction-date" required>Data de lançamento</Label><Input id="transaction-date" type="date" value={form.date} onChange={(event) => updateForm('date', event.target.value)} required /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="transaction-description" required>Descrição</Label><Input id="transaction-description" value={form.description} onChange={(event) => updateForm('description', event.target.value)} maxLength={50} placeholder="Ex.: Supermercado" required /><p className="text-right text-xs text-slate-400">{form.description.length}/50</p></div>
            {form.type === 'expense' && <>
              <div className="space-y-2"><Label htmlFor="transaction-subcategory" required>Subcategoria</Label><Select value={form.subcategoryId} onValueChange={(value) => updateForm('subcategoryId', value)}><SelectTrigger id="transaction-subcategory"><SelectValue placeholder="Selecione uma subcategoria" /></SelectTrigger><SelectContent>{subcategories.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="transaction-origin" required>Origem</Label><Select value={form.origin} onValueChange={(value) => updateForm('origin', value as ExpenseOrigin)}><SelectTrigger id="transaction-origin"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="card">Cartão</SelectItem><SelectItem value="pix">PIX</SelectItem><SelectItem value="withdrawal">Saque</SelectItem></SelectContent></Select></div>
              {form.origin === 'card' ? <>
                <div className="space-y-2"><Label htmlFor="transaction-card" required>Cartão</Label><Select value={form.cardId} onValueChange={(value) => updateForm('cardId', value)}><SelectTrigger id="transaction-card"><SelectValue placeholder="Selecione um cartão" /></SelectTrigger><SelectContent>{cards.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="transaction-installments" required>Quantidade de parcelas</Label><Input id="transaction-installments" type="number" min="1" step="1" value={form.installments} onChange={(event) => updateForm('installments', event.target.value)} required /></div><div className="space-y-2"><Label htmlFor="transaction-installment-amount" required>Valor da parcela</Label><Input id="transaction-installment-amount" type="number" min="0.01" step="0.01" value={form.installmentAmount} onChange={(event) => updateForm('installmentAmount', event.target.value)} placeholder="0,00" required /></div></div>
              </> : <div className="space-y-2"><Label htmlFor="transaction-account" required>Conta de origem</Label><Select value={form.accountId} onValueChange={(value) => updateForm('accountId', value)}><SelectTrigger id="transaction-account"><SelectValue placeholder="Selecione uma conta" /></SelectTrigger><SelectContent>{accounts.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>}
            </>}
            {formError && <p role="alert" className="text-sm text-rose-600">{formError}</p>}
            <DialogFooter><Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button><Button type="submit">Salvar transação</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {loadError && <p role="alert" className="text-sm text-rose-600">{loadError}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Período</p><p className="mt-1 text-lg font-semibold text-slate-900">{monthButtonLabel(month)}</p></div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon-sm" onClick={() => setMonth((value) => shiftMonth(value, -1))} aria-label="Mês anterior"><ChevronLeft size={16} /></Button>
          <Popover open={isMonthPickerOpen} onOpenChange={setIsMonthPickerOpen}>
            <PopoverTrigger asChild>
              <button type="button" aria-label="Selecionar mês" className="inline-flex h-8 min-w-[150px] items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">{monthButtonLabel(month)}</button>
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
          <Button type="button" variant="outline" size="icon-sm" onClick={() => setMonth((value) => shiftMonth(value, 1))} aria-label="Próximo mês"><ChevronRight size={16} /></Button>
          <Button type="button" size="sm" className="ml-1 gap-1.5" onClick={openForm}><Plus size={14} /> Nova transação</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="text-sm font-semibold text-slate-800">Lançamentos do mês</h2><p className="mt-1 text-xs text-slate-500">{monthTransactions.length} transação(ões) encontrada(s)</p></div><Receipt size={20} className="text-slate-300" /></div>
        {monthTransactions.length === 0 ? <div className="flex flex-col items-center gap-2 px-5 py-12 text-center"><WalletCards size={30} className="text-slate-300" /><p className="text-sm text-slate-500">Nenhuma transação neste mês.</p></div> : <Table><TableHeader><TableRow className="bg-slate-50"><TableHead>Data de lançamento</TableHead><TableHead>Descrição</TableHead><TableHead>Conta</TableHead><TableHead>Cartão</TableHead><TableHead>Parcela</TableHead><TableHead>Subcategoria</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader><TableBody>{monthTransactions.map((transaction) => <TableRow key={transaction.id}><TableCell className="text-slate-500">{formatDate(transaction.date)}</TableCell><TableCell className="font-medium text-slate-800">{transaction.description}</TableCell><TableCell className="text-slate-500">{transaction.accountName ?? '-'}</TableCell><TableCell className="text-slate-500">{transaction.cardName ?? '-'}</TableCell><TableCell className="text-slate-500">{transaction.installment}/{transaction.installments}</TableCell><TableCell className="text-slate-600">{transaction.subcategoryName}</TableCell><TableCell className="text-right font-mono font-semibold text-rose-600">{formatCurrency(transaction.amount)}</TableCell></TableRow>)}</TableBody></Table>}
      </div>
    </div>
  );
}