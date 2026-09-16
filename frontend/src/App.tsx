import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
// import { Transactions } from './pages/Transactions'; // Uma tela futura

function App() {
  // Estado que controla qual tela está ativa
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <Layout
      title={activePage === 'dashboard' ? 'Visão Geral' : activePage}
      activePage={activePage}
      setActivePage={setActivePage}
    >
      {/* Se activePage for 'dashboard', mostra o componente Dashboard */}
      {activePage === 'dashboard' && <Dashboard />}

      {/* Exemplo de como seria para mostrar outra tela: */}
      {/* {activePage === 'transactions' && <Transactions />} */}
    </Layout>
  );
}

export default App;