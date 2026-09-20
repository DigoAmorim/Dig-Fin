import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';

// Aqui definimos quais "variáveis" (props) o Header pode receber
interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const currentMonth = new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        {/* Usamos a prop 'title' aqui para que o título seja dinâmico */}
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        
          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {t('header.categorized')}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs capitalize text-slate-500">{currentMonth}</span>
      </div>
    </header>
  );
}