import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Calendar } from './calendar';
import { cn } from '../../lib/utils';

interface DatePickerInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
  align?: 'start' | 'center' | 'end';
}

const parseDate = (value: string) => value ? parseISO(value) : undefined;

function DatePickerInput({ value, onChange, placeholder, className, disabled, id, 'aria-label': ariaLabel, align = 'start' }: DatePickerInputProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseDate(value);
  const displayText = selectedDate ? format(selectedDate, 'dd/MM/yyyy') : placeholder ?? 'dd/mm/aaaa';

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <button type="button" id={id} aria-label={ariaLabel} disabled={disabled} className={cn('inline-flex min-w-[120px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50', !value && 'text-slate-400', className)}>
          <CalendarDays className="size-4 shrink-0 text-slate-400" />
          {displayText}
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto p-0">
        <Calendar key={value || 'empty'} selected={selectedDate} defaultMonth={selectedDate} onSelect={(date) => { if (!date) return; onChange(format(date, 'yyyy-MM-dd')); setOpen(false); }} />
      </PopoverContent>
    </Popover>
  );
}

export { DatePickerInput };
