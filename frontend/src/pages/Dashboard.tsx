import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';

// --- Tipos de Dados ---
interface Transaction {
  id: string;
  date: string;
  description: string;
  account: string;
  amount: number;
}

interface CategorySpending {
  category: string;
  spent: number;
  budget: number;
  trend: 'up' | 'down';
  percentage: number;
}

export function Dashboard() {
  const { t, i18n } = useTranslation();
  const formatCurrency = (amount: number) => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'BRL' }).format(amount);
  const transactions: Transaction[] = [
    { id: '1', date: '26/09/2026', description: 'Aluguel (Recorrente)', account: 'Conta Corrente', amount: -950.00 },
    { id: '2', date: '25/09/2026', description: 'Academia', account: 'Cartão de Crédito', amount: -99.90 },
    { id: '3', date: '24/09/2026', description: 'Spotify', account: 'Cartão de Crédito', amount: -21.90 },
    { id: '4', date: '15/09/2026', description: 'Salário Empresa', account: 'Conta Corrente', amount: 8872.10 },
  ];

  const categories: CategorySpending[] = [
    { category: t('dashboard.rent'), spent: 1900.00, budget: 1000.00, trend: 'down', percentage: 50 },
    { category: t('dashboard.travel'), spent: 495.77, budget: 700.00, trend: 'up', percentage: 81 },
    { category: t('dashboard.food'), spent: 166.73, budget: 850.00, trend: 'down', percentage: 67 },
  ];

  return (
    <>
      
      {/* Grid de Cards KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Saldo Total */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500 mb-1">{t('dashboard.totalBalance')}</p>
          <p className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{formatCurrency(381743.83)}</p>
          <p className="text-[11px] text-slate-500 mt-2">{t('dashboard.assets', { amount: formatCurrency(352953.04) })}</p>
        </div>

        {/* Card 2: Receita Mensal */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500 mb-1">{t('dashboard.monthlyIncome')}</p>
          <p className="text-2xl font-bold text-emerald-600 font-mono tracking-tight flex items-center gap-1">
            +{formatCurrency(8872.10)}
          </p>
          <p className="text-[11px] text-emerald-600 mt-2 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> {t('dashboard.positiveFlow')}
          </p>
        </div>

        {/* Card 3: Despesa Mensal */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500 mb-1">{t('dashboard.monthlyExpenses')}</p>
          <p className="text-2xl font-bold text-rose-600 font-mono tracking-tight flex items-center gap-1">
            -{formatCurrency(3332.62)}
          </p>
          <p className="text-[11px] text-slate-500 mt-2">{t('dashboard.estimatedPace', { amount: formatCurrency(6665.24) })}</p>
        </div>

        {/* Card 4: Taxa de Poupança */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500 mb-1">{t('dashboard.savingsRate')}</p>
          <p className="text-2xl font-bold text-blue-600 font-mono tracking-tight">62%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '62%' }} />
          </div>
        </div>
      </div>

      {/* Seção Dupla: Gastos por Categoria & Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gastos por Categoria */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">{t('dashboard.categorySpending')}</h2>
            <span className="text-xs text-slate-400">{t('dashboard.highestFirst')}</span>
          </div>

          <div className="space-y-4">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-700">{cat.category}</span>
                  <span className="font-mono text-slate-800">
                    {formatCurrency(cat.spent)} <span className="text-slate-400">/ {t('dashboard.of')} {formatCurrency(cat.budget)}</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.percentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progresso de Metas */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">{t('dashboard.goalsProgress')}</h2>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">{t('dashboard.emergencyFund')}</span>
              <span className="text-emerald-600 font-mono font-medium">63%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '63%' }} />
            </div>
            <p className="text-[11px] text-slate-500">{formatCurrency(5000)} {t('dashboard.of')} {formatCurrency(8000)}</p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">{t('dashboard.japanTrip')}</span>
              <span className="text-blue-600 font-mono font-medium">42%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '42%' }} />
            </div>
            <p className="text-[11px] text-slate-500">{formatCurrency(2500)} {t('dashboard.of')} {formatCurrency(6000)}</p>
          </div>
        </div>
      </div>

      {/* Tabela de Transações Recentes */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-800">{t('dashboard.periodTransactions')}</h2>
          <button className="text-xs text-emerald-600 hover:underline font-medium">{t('dashboard.viewAll')} →</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">{t('dashboard.date')}</th>
                <th className="px-4 py-2.5">{t('dashboard.description')}</th>
                <th className="px-4 py-2.5">{t('dashboard.account')}</th>
                <th className="px-4 py-2.5 text-right">{t('dashboard.amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-mono text-slate-500">{tx.date}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{tx.description}</td>
                  <td className="px-4 py-3 text-slate-500">{tx.account}</td>
                  <td
                    className={`px-4 py-3 text-right font-mono font-semibold ${
                      tx.amount < 0 ? 'text-slate-800' : 'text-emerald-600'
                    }`}
                  >
                    {tx.amount < 0
                      ? `-${formatCurrency(Math.abs(tx.amount))}`
                      : `+${formatCurrency(tx.amount)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </>
  );
}