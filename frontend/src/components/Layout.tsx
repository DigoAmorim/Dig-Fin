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

      <div className="relative flex-1 flex flex-col overflow-y-auto bg-[linear-gradient(135deg,#e2e8f0_0%,#cbd5e1_44%,#dcfce7_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.22)_0%,transparent_48%,rgba(187,247,208,0.22)_100%)]" aria-hidden="true" />
        <main className="relative p-6 space-y-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}