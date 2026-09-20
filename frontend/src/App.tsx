import { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from './components/layout';
import { Dashboard } from './pages/dashboard';
import { Toaster } from './components/ui/sonner';
import { pageTitleKeys, type PageKey } from './config/navigation';

const CardBrands = lazy(() => import('./pages/bandeira-cartao').then(({ CardBrands }) => ({ default: CardBrands })));
const BankInstitutions = lazy(() => import('./pages/instituicao-bancaria').then(({ BankInstitutions }) => ({ default: BankInstitutions })));
const BankAccounts = lazy(() => import('./pages/conta-bancaria').then(({ BankAccounts }) => ({ default: BankAccounts })));
const CreditCards = lazy(() => import('./pages/cartao-credito').then(({ CreditCards }) => ({ default: CreditCards })));
const Categories = lazy(() => import('./pages/categorias').then(({ Categories }) => ({ default: Categories })));
const Transacoes = lazy(() => import('./pages/transacoes').then(({ Transacoes }) => ({ default: Transacoes })));

function App() {
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState<PageKey>('dashboard');

  return (
    <>
      <Layout
        title={t(pageTitleKeys[activePage])}
        activePage={activePage}
        setActivePage={setActivePage}
      >
        <Suspense fallback={<p className="text-sm text-slate-500">{t('common.loading')}</p>}>
          {activePage === 'dashboard' && <Dashboard />}
          {activePage === 'transactions' && <Transacoes />}
          {activePage === 'card-brands' && <CardBrands />}
          {activePage === 'bank-institutions' && <BankInstitutions />}
          {activePage === 'bank-accounts' && <BankAccounts />}
          {activePage === 'credit-cards' && <CreditCards />}
          {activePage === 'categories' && <Categories />}
        </Suspense>
      </Layout>
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;