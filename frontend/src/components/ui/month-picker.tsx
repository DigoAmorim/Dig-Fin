import * as React from 'react'
import { addYears, format, isBefore, isAfter, isSameMonth, setMonth, setYear, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

type Month = {
  number: number
  name: string
}

const MONTHS: Month[][] = [
  [
    { number: 0, name: 'Jan' },
    { number: 1, name: 'Feb' },
    { number: 2, name: 'Mar' },
    { number: 3, name: 'Apr' },
  ],
  [
    { number: 4, name: 'May' },
    { number: 5, name: 'Jun' },
    { number: 6, name: 'Jul' },
    { number: 7, name: 'Aug' },
  ],
  [
    { number: 8, name: 'Sep' },
    { number: 9, name: 'Oct' },
    { number: 10, name: 'Nov' },
    { number: 11, name: 'Dec' },
  ],
]

interface MonthPickerProps {
  selectedMonth?: Date
  onMonthSelect?: (date: Date) => void
  locale?: string
  className?: string
  minDate?: Date
  maxDate?: Date
}

function MonthPicker({
  selectedMonth,
  onMonthSelect,
  locale,
  className,
  minDate,
  maxDate,
}: MonthPickerProps) {
  const initialYear = selectedMonth?.getFullYear() ?? new Date().getFullYear()
  const [menuYear, setMenuYear] = React.useState<number>(initialYear)

  const selectedYear = selectedMonth?.getFullYear()
  const selectedMonthIdx = selectedMonth?.getMonth()

  const handlePrevYear = () => {
    setMenuYear((prev) => addYears(new Date(prev, 0, 1), -1).getFullYear())
  }

  const handleNextYear = () => {
    setMenuYear((prev) => addYears(new Date(prev, 0, 1), 1).getFullYear())
  }

  return (
    <div className={cn('w-[280px] p-4', className)}>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevYear}
          disabled={minDate ? menuYear - 1 < minDate.getFullYear() : false}
          aria-label="Ano anterior"
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:pointer-events-none disabled:opacity-50"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="text-center"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Selecionar mês</p><span className="mt-0.5 block text-lg font-semibold text-slate-800">{menuYear}</span></div>
        <button
          type="button"
          onClick={handleNextYear}
          disabled={maxDate ? menuYear + 1 > maxDate.getFullYear() : false}
          aria-label="Próximo ano"
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:pointer-events-none disabled:opacity-50"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
          {MONTHS.flat().map((m) => {
                const monthDate = startOfMonth(setMonth(setYear(new Date(), menuYear), m.number))
                const isSelected = selectedMonth ? isSameMonth(selectedMonth, monthDate) : selectedYear === menuYear && selectedMonthIdx === m.number

                let isDisabled = false
                if (minDate) {
                  isDisabled = isBefore(monthDate, startOfMonth(minDate))
                }
                if (maxDate) {
                  isDisabled = isDisabled || isAfter(monthDate, startOfMonth(maxDate))
                }

                const displayMonthName = locale
                  ? format(monthDate, 'MMM', { locale: ptBR }).replace('.', '')
                  : m.name

                return (
                  <button
                    key={m.number}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => onMonthSelect?.(monthDate)}
                    className={cn(
                      'h-10 cursor-pointer rounded-lg text-sm font-medium capitalize transition-colors disabled:pointer-events-none disabled:opacity-30',
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                    )}
                  >
                    {displayMonthName}
                  </button>
                )
              })}
      </div>
    </div>
  )
}

MonthPicker.displayName = 'MonthPicker'

export { MonthPicker }