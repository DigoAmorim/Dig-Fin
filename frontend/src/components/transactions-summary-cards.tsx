import { useTranslation } from 'react-i18next';

interface TransactionsSummaryCardsProps {
  expenses: number;
  income: number;
  balance: number;
  formatCurrency: (amount: number) => string;
  valueColorClass: (amount: number) => string;
}

export function TransactionsSummaryCards({ expenses, income, balance, formatCurrency, valueColorClass }: TransactionsSummaryCardsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
      <div className="space-y-1 border-b border-slate-100 pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('transactions.expenses')}</p><p className={`font-mono text-lg font-semibold ${valueColorClass(expenses)}`}>{formatCurrency(expenses)}</p></div>
      <div className="space-y-1 border-b border-slate-100 pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('transactions.incomeSummary')}</p><p className={`font-mono text-lg font-semibold ${valueColorClass(income)}`}>{formatCurrency(income)}</p></div>
      <div className="space-y-1"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('transactions.balance')}</p><p className={`font-mono text-lg font-semibold ${valueColorClass(balance)}`}>{formatCurrency(balance)}</p></div>
    </div>
  );
}
