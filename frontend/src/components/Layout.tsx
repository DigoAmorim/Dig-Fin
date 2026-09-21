import { type ReactNode } from 'react';
import { Sidebar } from './sidebar';
import type { PageKey } from '../config/navigation';

interface LayoutProps {
  activePage: PageKey;
  setActivePage: (page: PageKey) => void;
  children: ReactNode;
}

export function Layout({ activePage, setActivePage, children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 font-sans antialiased overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}