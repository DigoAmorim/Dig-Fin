import { createContext, useContext, useEffect, type HTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './button.tsx';

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function Dialog({ open = false, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: ReactNode }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange: onOpenChange ?? (() => undefined) }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({ children }: { children: ReactNode }) {
  const context = useContext(DialogContext);
  return <span onClick={() => context?.onOpenChange(true)}>{children}</span>;
}

function DialogClose({ children }: { children: ReactNode }) {
  const context = useContext(DialogContext);
  return <span onClick={() => context?.onOpenChange(false)}>{children}</span>;
}

function DialogPortal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}

function DialogOverlay({ className = '', onClick }: { className?: string; onClick?: () => void }) {
  return <div data-slot="dialog-overlay" className={`fixed inset-0 z-50 bg-slate-950/40 ${className}`} onClick={onClick} />;
}

function DialogContent({ className = '', children, showCloseButton = true, ...props }: HTMLAttributes<HTMLDivElement> & { showCloseButton?: boolean }) {
  const context = useContext(DialogContext);

  useEffect(() => {
    if (!context?.open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') context.onOpenChange(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [context]);

  if (!context?.open) return null;

  return (
    <DialogPortal>
      <DialogOverlay onClick={() => context.onOpenChange(false)} />
      <div
        role="dialog"
        aria-modal="true"
        data-slot="dialog-content"
        className={`fixed left-1/2 top-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-xl outline-none sm:max-w-lg ${className}`}
        {...props}
      >
        {children}
        {showCloseButton && (
          <button type="button" onClick={() => context.onOpenChange(false)} aria-label="Fechar" className="absolute right-4 top-4 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={16} />
          </button>
        )}
      </div>
    </DialogPortal>
  );
}

function DialogHeader({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex flex-col gap-2 text-left ${className}`} {...props} />;
}

function DialogFooter({ className = '', showCloseButton = false, children, ...props }: HTMLAttributes<HTMLDivElement> & { showCloseButton?: boolean }) {
  const context = useContext(DialogContext);
  return (
    <div className={`flex flex-col-reverse gap-2 sm:flex-row sm:justify-end ${className}`} {...props}>
      {children}
      {showCloseButton && <Button variant="outline" onClick={() => context?.onOpenChange(false)}>Fechar</Button>}
    </div>
  );
}

function DialogTitle({ className = '', ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={`text-lg font-semibold leading-none text-slate-900 ${className}`} {...props} />;
}

function DialogDescription({ className = '', ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-sm text-slate-500 ${className}`} {...props} />;
}

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger };
