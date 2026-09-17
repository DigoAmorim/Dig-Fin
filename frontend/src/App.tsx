import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CardBrands } from './pages/BandeiraCartao';
import { CreditCards } from './pages/CartaoCredito';
import { Toaster } from './components/ui/Sonner';
// import { Transactions } from './pages/Transactions'; // Uma tela futura

function App() {
  const { t } = useTranslation();
  // Estado que controla qual tela está ativa
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <>
      <Layout
        title={activePage === 'dashboard' ? t('navigation.overview') : activePage === 'card-brands' ? t('navigation.cardBrands') : activePage === 'credit-cards' ? t('navigation.creditCards') : activePage}
        activePage={activePage}
        setActivePage={setActivePage}
      >
        {/* Se activePage for 'dashboard', mostra o componente Dashboard */}
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'card-brands' && <CardBrands />}
        {activePage === 'credit-cards' && <CreditCards />}

        {/* Exemplo de como seria para mostrar outra tela: */}
        {/* {activePage === 'transactions' && <Transactions />} */}
      </Layout>
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;