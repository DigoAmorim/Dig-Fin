import type { LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
	required?: boolean;
}

function Label({ className = '', required = false, children, ...props }: LabelProps) {
	return (
		<label
			data-slot="label"
			className={`text-sm font-medium text-slate-700 ${className}`}
			{...props}
		>
			{children}
			{required && <span aria-hidden="true" className="ml-1 text-rose-600">*</span>}
		</label>
	);
}

export { Label };
