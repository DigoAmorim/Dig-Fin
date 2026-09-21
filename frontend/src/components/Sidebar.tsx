import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowRightLeft,
  Building2,
  ChevronDown,
  CreditCard,
  ChevronRight,
  Tags,
  Target,
  Receipt,
  Wallet,
} from 'lucide-react';
import type { PageKey } from '../config/navigation';

// 1. Definimos o que o Sidebar precisa receber de fora (Props)
interface SidebarProps {
  activePage: PageKey;
  setActivePage: (page: PageKey) => void;
}

export function Sidebar({ activePage, setActivePage }: SidebarProps) {
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState({
    accounts: true,
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
              $
            </div>
            <span className="font-semibold text-lg tracking-tight text-slate-900">DigFin</span>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
            v1.00
          </span>
        </div>

        {/* Seção 1: ACCOUNTS */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('accounts')}
            aria-expanded={expandedSections.accounts}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 hover:text-slate-600 transition cursor-pointer"
          >
            {t('navigation.accounts')}
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
              {t('navigation.overview')}
            </button>
            <button
              onClick={() => setActivePage('transactions')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                activePage === 'transactions'
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Receipt className="w-4 h-4" />
              {t('navigation.transactions')}
            </button>

          </nav>}
        </div>

        {/* Seção 2: SETUP */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('settings')}
            aria-expanded={expandedSections.settings}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 hover:text-slate-600 transition cursor-pointer"
          >
            {t('navigation.settings')}
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
              {t('navigation.cardBrands')}
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
              {t('navigation.creditCards')}
            </button>            
            <button
              onClick={() => setActivePage('bank-institutions')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                activePage === 'bank-institutions'
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              {t('navigation.bankInstitutions')}
            </button>
            <button
              onClick={() => setActivePage('bank-accounts')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                activePage === 'bank-accounts'
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Wallet className="w-4 h-4" />
              {t('navigation.bankAccounts')}
            </button>
            <button
              onClick={() => setActivePage('categories')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                activePage === 'categories'
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Tags className="w-4 h-4" />
              {t('navigation.categories')}
            </button>
          </nav>}
        </div>
      </div>

      {/* Perfil do Usuário */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-medium text-xs text-slate-700">
            P
          </div>
          <div className="truncate">
            <p className="text-xs font-medium text-slate-800 truncate">{t('common.personal')}</p>
            <p className="text-[10px] text-slate-500 truncate">demo@digfin.app</p>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 cursor-pointer" />
      </div>
    </aside>
  );
}