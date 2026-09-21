import { ArrowDown, ArrowUp, Trash2, WalletCards } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table.tsx';
import type { Transacao } from '../types/transacao.ts';
import type { TransacoesColumnId, TransacoesSortDir } from './transacoes-grid-columns.tsx';

interface TransactionsTableProps {
  transactions: Transacao[];
  isLoading: boolean;
  sortBy: TransacoesColumnId | null;
  sortDir: TransacoesSortDir;
  onSort: (column: TransacoesColumnId) => void;
  onDelete: (transaction: Transacao) => void;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
  valueColorClass: (amount: number) => string;
}

export function TransactionsTable({ transactions, isLoading, sortBy, sortDir, onSort, onDelete, formatDate, formatCurrency, valueColorClass }: TransactionsTableProps) {
  const { t } = useTranslation();
  const sortIcon = (column: TransacoesColumnId) => sortBy !== column ? null : sortDir === 'asc' ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" />;
  const headerClass = 'inline-flex cursor-pointer items-center gap-1 hover:text-slate-900';
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="text-sm font-semibold text-slate-800">{t('transactions.launches')}</h2><p className="mt-1 text-xs text-slate-500">{isLoading ? t('common.loading') : `${transactions.length} ${t('transactions.found')}`}</p></div></div>
      {isLoading && <p className="px-5 py-6 text-sm text-slate-500">{t('common.loading')}</p>}
      {!isLoading && transactions.length === 0 ? <div className="flex flex-col items-center gap-2 px-5 py-12 text-center"><WalletCards size={30} className="text-slate-300" /><p className="text-sm text-slate-500">{t('transactions.empty')}</p></div> : <Table><TableHeader><TableRow className="border-slate-200 bg-slate-50">
        {(['date', 'description', 'account', 'card', 'installment', 'subcategory'] as TransacoesColumnId[]).map((column) => <TableHead key={column}><button type="button" className={headerClass} onClick={() => onSort(column)}>{t(`transactions.${column === 'date' ? 'launchDateColumn' : `${column}Column`}`)}{sortIcon(column)}</button></TableHead>)}
        <TableHead className="text-right"><button type="button" className={`ml-auto ${headerClass}`} onClick={() => onSort('amount')}>{t('transactions.amountColumn')}{sortIcon('amount')}</button></TableHead><TableHead className="text-center">{t('common.actions')}</TableHead>
      </TableRow></TableHeader><TableBody className="divide-y divide-slate-100">{transactions.map((transaction) => <TableRow key={transaction.id} className="border-0 transition hover:bg-slate-50"><TableCell className="text-slate-500">{formatDate(transaction.date)}</TableCell><TableCell className="font-medium text-slate-800">{transaction.description}</TableCell><TableCell className="text-slate-500">{transaction.accountName ?? '-'}</TableCell><TableCell className="text-slate-500">{transaction.cardName ?? '-'}</TableCell><TableCell className="text-slate-500">{transaction.installment}/{transaction.installments}</TableCell><TableCell className="text-slate-600">{transaction.subcategoryName ?? '-'}</TableCell><TableCell className={`text-right font-mono font-semibold ${valueColorClass(transaction.amount)}`}>{formatCurrency(transaction.amount)}</TableCell><TableCell><div className="flex items-center justify-center"><button type="button" onClick={() => onDelete(transaction)} title={t('common.delete')} aria-label={t('transactions.deleteLabel')} className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 size={13} /></button></div></TableCell></TableRow>)}</TableBody></Table>}
    </div>
  );
}
