import { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Toaster } from './components/ui/Sonner';

const CardBrands = lazy(() => import('./pages/BandeiraCartao').then(({ CardBrands }) => ({ default: CardBrands })));
const BankInstitutions = lazy(() => import('./pages/InstituicaoBancaria').then(({ BankInstitutions }) => ({ default: BankInstitutions })));
const BankAccounts = lazy(() => import('./pages/ContaBancaria').then(({ BankAccounts }) => ({ default: BankAccounts })));
const CreditCards = lazy(() => import('./pages/CartaoCredito').then(({ CreditCards }) => ({ default: CreditCards })));
const Categories = lazy(() => import('./pages/Categorias').then(({ Categories }) => ({ default: Categories })));

function App() {
  const { t } = useTranslation();
  // Estado que controla qual tela está ativa
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <>
      <Layout
        title={activePage === 'dashboard' ? t('navigation.overview') : activePage === 'card-brands' ? t('navigation.cardBrands') : activePage === 'bank-institutions' ? t('navigation.bankInstitutions') : activePage === 'bank-accounts' ? t('navigation.bankAccounts') : activePage === 'credit-cards' ? t('navigation.creditCards') : activePage === 'categories' ? t('navigation.categories') : activePage}
        activePage={activePage}
        setActivePage={setActivePage}
      >
        <Suspense fallback={<p className="text-sm text-slate-500">{t('common.loading')}</p>}>
          {activePage === 'dashboard' && <Dashboard />}
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