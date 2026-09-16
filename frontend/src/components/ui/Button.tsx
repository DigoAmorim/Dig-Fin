import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-emerald-600 text-white hover:bg-emerald-700',
  destructive: 'bg-rose-600 text-white hover:bg-rose-700',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
  ghost: 'text-slate-700 hover:bg-slate-100',
  link: 'text-emerald-700 underline-offset-4 hover:underline',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-9 px-5 py-2',
  xs: 'h-6 rounded-md px-2 text-xs',
  sm: 'h-8 rounded-lg px-4',
  lg: 'h-11 rounded-lg px-7',
  icon: 'size-10',
  'icon-xs': 'size-6 rounded-md',
  'icon-sm': 'size-8',
  'icon-lg': 'size-10',
};

function Button({ className = '', variant = 'default', size = 'default', ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium cursor-pointer transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}

export { Button };
