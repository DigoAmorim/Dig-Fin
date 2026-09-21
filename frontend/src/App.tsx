import { lazy, Suspense, useState } from 'react';
import { Layout } from './components/layout';
import { Dashboard } from './pages/dashboard';
import { Toaster } from './components/ui/sonner';
import type { PageKey } from './config/navigation';

const CardBrands = lazy(() => import('./pages/bandeira-cartao').then(({ CardBrands }) => ({ default: CardBrands })));
const BankInstitutions = lazy(() => import('./pages/instituicao-bancaria').then(({ BankInstitutions }) => ({ default: BankInstitutions })));
const BankAccounts = lazy(() => import('./pages/conta-bancaria').then(({ BankAccounts }) => ({ default: BankAccounts })));
const CreditCards = lazy(() => import('./pages/cartao-credito').then(({ CreditCards }) => ({ default: CreditCards })));
const Categories = lazy(() => import('./pages/categorias').then(({ Categories }) => ({ default: Categories })));
const Transacoes = lazy(() => import('./pages/transacoes').then(({ Transacoes }) => ({ default: Transacoes })));

function PageSkeleton() {
  return (
    <div className="min-h-[32rem] space-y-4" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="h-16 animate-pulse rounded-xl border border-slate-200 bg-white" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />)}
      </div>
      <div className="min-h-[18rem] animate-pulse rounded-xl border border-slate-200 bg-white" />
    </div>
  );
}

function App() {
  const [activePage, setActivePage] = useState<PageKey>('dashboard');

  return (
    <>
      <Layout
        activePage={activePage}
        setActivePage={setActivePage}
      >
        <Suspense fallback={<PageSkeleton />}>
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