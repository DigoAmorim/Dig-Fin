import { useState } from 'react';
import { addDays, addMonths, format, isSameDay, isSameMonth, isToday, setMonth, setYear, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CalendarProps {
  mode?: 'single';
  selected?: Date;
  defaultMonth?: Date;
  locale?: string;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
}

type View = 'days' | 'months' | 'years';
const YEAR_PAGE_SIZE = 12;
const WEEKDAY_COUNT = 7;

function Calendar({ selected, defaultMonth, onSelect, className }: CalendarProps) {
  const [viewMonth, setViewMonth] = useState(defaultMonth ?? selected ?? new Date());
  const [view, setView] = useState<View>('days');
  const currentYear = viewMonth.getFullYear();
  const yearPageStart = Math.floor(currentYear / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE;

  const shiftMonth = (offset: number) => {
    setViewMonth((current) => offset < 0 ? subMonths(current, Math.abs(offset)) : addMonths(current, offset));
  };
  const headerLabel = view === 'days'
    ? format(viewMonth, 'LLLL yyyy', { locale: ptBR })
    : view === 'months' ? String(currentYear) : `${yearPageStart} - ${yearPageStart + YEAR_PAGE_SIZE - 1}`;
  const monthStart = startOfMonth(viewMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const days = Array.from({ length: 42 }, (_, index) => {
    return addDays(calendarStart, index);
  });
  const weekdayLabels = Array.from({ length: WEEKDAY_COUNT }, (_, index) => {
    const date = new Date(2024, 0, 1 + index);
    return format(date, 'EEEEEE', { locale: ptBR });
  });

  return (
    <div className={cn('w-[252px] p-3', className)}>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => shiftMonth(view === 'days' ? -1 : view === 'months' ? -12 : -YEAR_PAGE_SIZE)} aria-label="Período anterior" className="inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"><ChevronLeft className="size-4" /></button>
        <button type="button" onClick={() => setView(view === 'days' ? 'months' : 'years')} disabled={view === 'years'} className={cn('rounded-md px-2 py-1 text-sm font-medium capitalize', view !== 'years' && 'hover:bg-slate-100')}>{headerLabel}</button>
        <button type="button" onClick={() => shiftMonth(view === 'days' ? 1 : view === 'months' ? 12 : YEAR_PAGE_SIZE)} aria-label="Próximo período" className="inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"><ChevronRight className="size-4" /></button>
      </div>
      {view === 'days' && <>
        <div className="mb-1 grid grid-cols-7">{weekdayLabels.map((label, index) => <div key={`${label}-${index}`} className="py-1 text-center text-[11px] font-medium text-slate-500">{label}</div>)}</div>
        <div className="grid grid-cols-7">{days.map((date) => {
          const inMonth = isSameMonth(date, viewMonth);
          const selectedDay = selected ? isSameDay(selected, date) : false;
          return <button key={date.toISOString()} type="button" onClick={() => onSelect?.(date)} className={cn('inline-flex size-8 items-center justify-center rounded-lg text-sm', !inMonth && 'text-slate-300', inMonth && !selectedDay && 'text-slate-800 hover:bg-slate-100', isToday(date) && !selectedDay && 'bg-emerald-50 font-medium text-emerald-700', selectedDay && 'bg-emerald-600 font-semibold text-white')}>{date.getDate()}</button>;
        })}</div>
      </>}
      {view === 'months' && <div className="grid grid-cols-3 gap-1">{Array.from({ length: 12 }, (_, month) => {
        const date = setMonth(viewMonth, month);
        const selectedMonth = selected ? isSameMonth(selected, date) : false;
        return <button key={month} type="button" onClick={() => { setViewMonth(date); setView('days'); }} className={cn('h-10 rounded-lg text-sm capitalize', selectedMonth ? 'bg-emerald-600 font-semibold text-white' : 'text-slate-700 hover:bg-slate-100')}>{format(date, 'MMM', { locale: ptBR }).replace('.', '')}</button>;
      })}</div>}
      {view === 'years' && <div className="grid grid-cols-3 gap-1">{Array.from({ length: YEAR_PAGE_SIZE }, (_, index) => {
        const year = yearPageStart + index;
        const selectedYear = selected?.getFullYear() === year;
        return <button key={year} type="button" onClick={() => { setViewMonth(setYear(viewMonth, year)); setView('months'); }} className={cn('h-10 rounded-lg text-sm', selectedYear ? 'bg-emerald-600 font-semibold text-white' : 'text-slate-700 hover:bg-slate-100')}>{year}</button>;
      })}</div>}
    </div>
  );
}

export { Calendar };
export type { CalendarProps };
