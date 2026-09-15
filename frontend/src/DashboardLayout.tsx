import React, { useState } from 'react';
type IconProps = { className?: string };

const Icon: React.FC<IconProps> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

const Wallet = Icon;
const ArrowRightLeft = Icon;
const PieChart = Icon;
const TrendingUp = Icon;
const Target = Icon;
const Repeat = Icon;
const Tags = Icon;
const Users = Icon;
const GitBranch = Icon;
const Search = Icon;
const ChevronDown = Icon;
const ArrowUpRight = Icon;
const CheckCircle2 = Icon;
const CreditCard = Icon;
const Building2 = Icon;

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

export const SecuroFinanceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('transactions');

  const transactions: Transaction[] = [
    { id: '1', date: '26/09/2026', description: 'Aluguel (Recorrente)', account: 'Conta Corrente', amount: -950.00 },
    { id: '2', date: '25/09/2026', description: 'Academia', account: 'Cartão de Crédito', amount: -99.90 },
    { id: '3', date: '24/09/2026', description: 'Spotify', account: 'Cartão de Crédito', amount: -21.90 },
    { id: '4', date: '15/09/2026', description: 'Salário Empresa', account: 'Conta Corrente', amount: 8872.10 },
  ];

  const categories: CategorySpending[] = [
    { category: 'Aluguel', spent: 1900.00, budget: 1000.00, trend: 'down', percentage: 50 },
    { category: 'Viagem', spent: 495.77, budget: 700.00, trend: 'up', percentage: 81 },
    { category: 'Alimentação', spent: 166.73, budget: 850.00, trend: 'down', percentage: 67 },
  ];

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 font-sans antialiased overflow-hidden">
      {/* ========================================================= */}
      {/* MENU LATERAL (SIDEBAR ESQUERDA) - TEMA CLARO              */}
      {/* ========================================================= */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0">
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Header do App / Workspace */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white">
                S
              </div>
              <span className="font-semibold text-lg tracking-tight text-slate-900">Securo</span>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
              v0.15
            </span>
          </div>

          {/* Barra de Busca (Ctrl + K) */}
          <button className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-500 transition">
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              Buscar algo...
            </span>
            <kbd className="bg-slate-200 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-600">Ctrl K</kbd>
          </button>

          {/* Seção 1: ACCOUNTS */}
          <div>
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
              Accounts
            </h3>
            <nav className="space-y-0.5 text-sm">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition ${
                  activeTab === 'transactions'
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ArrowRightLeft className="w-4 h-4" />
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('accounts')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition ${
                  activeTab === 'accounts'
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Wallet className="w-4 h-4" />
                Accounts
              </button>
            </nav>
          </div>

          {/* Seção 2: ANALYSIS */}
          <div>
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
              Analysis
            </h3>
            <nav className="space-y-0.5 text-sm">
              <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition">
                <PieChart className="w-4 h-4" />
                Reports
              </button>
              <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition">
                <TrendingUp className="w-4 h-4" />
                Assets
              </button>
            </nav>
          </div>

          {/* Seção 3: SETUP */}
          <div>
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
              Setup
            </h3>
            <nav className="space-y-0.5 text-sm">
              <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition">
                <PieChart className="w-4 h-4" />
                Budgets
              </button>
              <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition">
                <Target className="w-4 h-4" />
                Goals
              </button>
              <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition">
                <Repeat className="w-4 h-4" />
                Recurring
              </button>
              <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition">
                <Tags className="w-4 h-4" />
                Categories
              </button>
              <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition">
                <Users className="w-4 h-4" />
                Payees
              </button>
              <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition">
                <GitBranch className="w-4 h-4" />
                Rules
              </button>
            </nav>
          </div>

          {/* Resumo de Contas Rápidas */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
              Contas Ativas
            </h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center px-2 py-1 text-slate-700">
                <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-blue-500"/> Nubank</span>
                <span className="font-mono text-emerald-600 font-medium">R$ 28.003,87</span>
              </div>
              <div className="flex justify-between items-center px-2 py-1 text-slate-700">
                <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-purple-500"/> Cartão Crédito</span>
                <span className="font-mono text-rose-600 font-medium">-R$ 5.579,07</span>
              </div>
            </div>
          </div>
        </div>

        {/* Perfil do Usuário */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-medium text-xs text-slate-700">
              P
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-800 truncate">Pessoal</p>
              <p className="text-[10px] text-slate-500 truncate">demo@securo.app</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 cursor-pointer" />
        </div>
      </aside>

      {/* ========================================================= */}
      {/* TELA PRINCIPAL (DASHBOARD DIREITA) - TEMA CLARO           */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-slate-900">Visão Geral</h1>
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Todas as transações categorizadas
            </span>
          </div>

          <div className="flex items-center gap-3">
            <select className="bg-white border border-slate-200 text-xs text-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-slate-300 shadow-sm">
              <option>Setembro 2026</option>
              <option>Agosto 2026</option>
            </select>
          </div>
        </header>

        {/* Conteúdo do Dashboard */}
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Grid de Cards KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Card 1: Saldo Total */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">Saldo Total</p>
              <p className="text-2xl font-bold text-slate-900 font-mono tracking-tight">R$ 381.743,83</p>
              <p className="text-[11px] text-slate-500 mt-2">Ativos: R$ 352.953,04</p>
            </div>

            {/* Card 2: Receita Mensal */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">Receita Mensal</p>
              <p className="text-2xl font-bold text-emerald-600 font-mono tracking-tight flex items-center gap-1">
                +R$ 8.872,10
              </p>
              <p className="text-[11px] text-emerald-600 mt-2 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> Fluxo positivo no mês
              </p>
            </div>

            {/* Card 3: Despesa Mensal */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">Despesas Mensais</p>
              <p className="text-2xl font-bold text-rose-600 font-mono tracking-tight flex items-center gap-1">
                -R$ 3.332,62
              </p>
              <p className="text-[11px] text-slate-500 mt-2">Ritmo estimado: R$ 6.665,24</p>
            </div>

            {/* Card 4: Taxa de Poupança */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">Taxa de Poupança</p>
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
                <h2 className="text-sm font-semibold text-slate-800">Gastos por Categoria</h2>
                <span className="text-xs text-slate-400">Maior valor primeiro</span>
              </div>

              <div className="space-y-4">
                {categories.map((cat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-700">{cat.category}</span>
                      <span className="font-mono text-slate-800">
                        R$ {cat.spent.toFixed(2)} <span className="text-slate-400">/ de R$ {cat.budget.toFixed(2)}</span>
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
              <h2 className="text-sm font-semibold text-slate-800">Progresso de Metas</h2>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">Reserva de Emergência</span>
                  <span className="text-emerald-600 font-mono font-medium">63%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '63%' }} />
                </div>
                <p className="text-[11px] text-slate-500">R$ 5.000,00 de R$ 8.000,00</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">Viagem ao Japão</span>
                  <span className="text-blue-600 font-mono font-medium">42%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '42%' }} />
                </div>
                <p className="text-[11px] text-slate-500">R$ 2.500,00 de R$ 6.000,00</p>
              </div>
            </div>
          </div>

          {/* Tabela de Transações Recentes */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800">Transações do Período</h2>
              <button className="text-xs text-emerald-600 hover:underline font-medium">Ver todas →</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Data</th>
                    <th className="px-4 py-2.5">Descrição</th>
                    <th className="px-4 py-2.5">Conta</th>
                    <th className="px-4 py-2.5 text-right">Valor</th>
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
                          ? `-R$ ${Math.abs(tx.amount).toFixed(2)}`
                          : `+R$ ${tx.amount.toFixed(2)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};