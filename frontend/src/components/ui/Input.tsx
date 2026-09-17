import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

function Input({ className = '', hasError = false, ...props }: InputProps) {
  return (
    <input
      data-slot="input"
      aria-invalid={hasError || undefined}
      className={`h-9 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70 ${hasError ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/15' : 'border-slate-300'} ${className}`}
      {...props}
    />
  );
}

export { Input };