import type { ReactNode } from 'react';

interface PageHeaderProps {
  section: string;
  title: string;
  action?: ReactNode;
}

export function PageHeader({ section, title, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-0.5 text-xs font-medium text-slate-500">
          {section}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      </div>
      {action}
    </div>
  )
}
