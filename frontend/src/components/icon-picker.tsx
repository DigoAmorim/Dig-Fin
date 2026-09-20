import { CATEGORY_ICONS } from '@/lib/category-icons'
import { cn } from '@/lib/utils'

interface IconPickerProps {
  value: string
  color: string
  onChange: (iconName: string) => void
}

export function IconPicker({ value, color, onChange }: IconPickerProps) {
  return (
    <div className="grid max-h-48 grid-cols-8 gap-1.5 overflow-y-auto p-1">
        {CATEGORY_ICONS.map((entry) => {
          const isSelected = value === entry.name
          const Icon = entry.icon
          return (
            <button
              key={entry.name}
              type="button"
              title={entry.label}
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center transition-all',
                isSelected
                  ? 'bg-slate-100 ring-2 ring-offset-1 ring-primary'
                  : 'hover:bg-muted'
              )}
              onClick={() => onChange(entry.name)}
            >
              <Icon
                size={18}
                className="text-slate-500"
                style={isSelected ? { color: color || '#6B7280' } : undefined}
                strokeWidth={2}
              />
            </button>
          )
        })}
    </div>
  )
}