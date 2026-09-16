import React, { type ReactNode } from 'react';
import { Sidebar } from './Sidebar'; // Assumindo que este arquivo existe
import { Header } from './Header';

// O Layout precisa saber o título da página atual e qual conteúdo renderizar no meio
interface LayoutProps {
  title: string;
  activePage: string;
  setActivePage: (page: string) => void;
  children: ReactNode; // 'ReactNode' é o tipo para qualquer coisa que o React possa renderizar na tela
}

export const Layout: React.FC<LayoutProps> = ({ title, activePage, setActivePage, children }) => {
  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 font-sans antialiased overflow-hidden">
      
      {/* O menu lateral fica fixo na esquerda */}
        <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* A área da direita que contém o cabeçalho e o conteúdo dinâmico */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
        
        {/* O cabeçalho repassando o título que o Layout recebeu */}
        <Header title={title} />
        
        {/* Aqui é onde a "mágica" acontece. O {children} será substituído 
            pelo conteúdo específico de cada tela (Dashboard, Configurações, etc) */}
        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
        
      </div>
    </div>
  );
};