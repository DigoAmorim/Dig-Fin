import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Building2,
  ChevronDown,
  CreditCard,
  GitBranch,
  PieChart,
  ChevronRight,
  Search,
  Tags,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';

// 1. Definimos o que o Sidebar precisa receber de fora (Props)
interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const [expandedSections, setExpandedSections] = useState({
    accounts: true,
    analysis: true,
    settings: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  return (
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

        {/* Barra de Busca */}
        <button className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-500 transition cursor-pointer">
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            Buscar algo...
          </span>
          <kbd className="bg-slate-200 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-600">Ctrl K</kbd>
        </button>

        {/* Seção 1: ACCOUNTS */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('accounts')}
            aria-expanded={expandedSections.accounts}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 hover:text-slate-600 transition cursor-pointer"
          >
            Accounts
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform ${expandedSections.accounts ? 'rotate-90' : ''}`}
            />
          </button>
          {expandedSections.accounts && <nav className="space-y-0.5 text-sm">
            <button
              onClick={() => setActivePage('dashboard')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                activePage === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              Visão Geral
            </button>

            <button
              onClick={() => setActivePage('transactions')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                activePage === 'transactions'
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Wallet className="w-4 h-4" />
              Transações
            </button>
          </nav>}
        </div>

        {/* Seção 2: ANALYSIS */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('analysis')}
            aria-expanded={expandedSections.analysis}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 hover:text-slate-600 transition cursor-pointer"
          >
            Analysis
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform ${expandedSections.analysis ? 'rotate-90' : ''}`}
            />
          </button>
          {expandedSections.analysis && <nav className="space-y-0.5 text-sm">
            <button 
              onClick={() => setActivePage('reports')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                activePage === 'reports'
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <PieChart className="w-4 h-4" />
              Reports
            </button>
            <button 
              onClick={() => setActivePage('assets')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                activePage === 'assets'
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Assets
            </button>
          </nav>}
        </div>

        {/* Seção 3: SETUP */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('settings')}
            aria-expanded={expandedSections.settings}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 hover:text-slate-600 transition cursor-pointer"
          >
            Configurações
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform ${expandedSections.settings ? 'rotate-90' : ''}`}
            />
          </button>
          {expandedSections.settings && <nav className="space-y-0.5 text-sm">
            <button
              onClick={() => setActivePage('card-brands')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                activePage === 'card-brands'
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Target className="w-4 h-4" />
              Bandeira do Cartão
            </button>
            <button
              onClick={() => setActivePage('credit-cards')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                activePage === 'credit-cards'
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Cartão de Crédito
            </button>
            <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer">
              <Tags className="w-4 h-4" />
              Categories
            </button>
            <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer">
              <Users className="w-4 h-4" />
              Payees
            </button>
            <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer">
              <GitBranch className="w-4 h-4" />
              Rules
            </button>
          </nav>}
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
  );
};