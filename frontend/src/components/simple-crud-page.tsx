import type { FormEvent, ReactNode } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button.tsx';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog.tsx';
import { PageHeader } from './page-header.tsx';
import type { CrudEntity } from '../hooks/use-crud-resource.ts';

export interface SimpleCrudPageProps<TEntity extends CrudEntity> {
  section: string;
  title: string;
  newLabel: string;
  addLabel: string;
  listDescription: string;
  columnHeader: ReactNode;
  columnsClassName?: string;
  items: TEntity[];
  editingItem: TEntity | null;
  deletingItem: TEntity | null;
  isFormOpen: boolean;
  isLoading: boolean;
  error: string;
  formError: string;
  emptyLabel: string;
  editLabel: string;
  deleteLabel: string;
  deleteTitle: string;
  deleteConfirmation: string;
  onOpenCreate: () => void;
  onOpenEdit: (item: TEntity) => void;
  onCloseForm: () => void;
  onSetDeleting: (item: TEntity | null) => void;
  onRemove: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  renderForm: () => ReactNode;
  renderRow: (item: TEntity, actions: ReactNode) => ReactNode;
}

export function SimpleCrudPage<TEntity extends CrudEntity>(props: SimpleCrudPageProps<TEntity>) {
  const { t } = useTranslation();
  const { columnsClassName = 'grid-cols-[minmax(0,1fr)_auto]', ...page } = props;
  const actions = (item: TEntity) => <div className="flex w-[4.5rem] shrink-0 items-center justify-center gap-1"><button type="button" onClick={() => page.onOpenEdit(item)} title={page.editLabel} aria-label={page.editLabel} className="rounded-md p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"><Pencil size={13} /></button><button type="button" onClick={() => page.onSetDeleting(item)} title={t('common.delete')} aria-label={page.deleteLabel} className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 size={13} /></button></div>;
  return <div className="space-y-4"><PageHeader section={page.section} title={page.title} />
    <Dialog open={page.isFormOpen} onOpenChange={(open) => { if (!open) page.onCloseForm(); }}><DialogContent><DialogHeader><DialogTitle>{page.editingItem ? page.editLabel : page.newLabel}</DialogTitle></DialogHeader><form onSubmit={page.onSubmit} onInvalid={(event) => (event.target as HTMLInputElement).setCustomValidity(t('common.required'))} onInput={(event) => (event.target as HTMLInputElement).setCustomValidity('')} className="space-y-4">{page.renderForm()}{page.formError && <p role="alert" className="text-sm text-rose-600">{page.formError}</p>}<DialogFooter><Button type="button" variant="outline" onClick={page.onCloseForm}>{t('common.cancel')}</Button><Button type="submit">{t('common.save')}</Button></DialogFooter></form></DialogContent></Dialog>
    {page.error && <p className="text-sm text-rose-600">{page.error}</p>}
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4"><p className="text-xs text-slate-500">{page.listDescription}</p><Button type="button" onClick={page.onOpenCreate} size="sm" className="gap-1.5"><Plus size={13} /> {page.addLabel}</Button></div><div className={`${columnsClassName} items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-500`}><span>{page.columnHeader}</span><span className="w-[4.5rem] text-center">{t('common.actions')}</span></div>{page.isLoading ? <p className="px-5 py-6 text-sm text-slate-500">{t('common.loading')}</p> : page.items.length === 0 ? <p className="px-5 py-6 text-sm text-slate-500">{page.emptyLabel}</p> : <div>{page.items.map((item) => page.renderRow(item, actions(item)))}</div>}</div>
    <Dialog open={!!page.deletingItem} onOpenChange={(open) => { if (!open) page.onSetDeleting(null); }}><DialogContent><DialogHeader><DialogTitle>{page.deleteTitle}</DialogTitle></DialogHeader><p className="text-sm text-slate-600">{page.deleteConfirmation}</p><DialogFooter><Button type="button" variant="outline" onClick={() => page.onSetDeleting(null)}>{t('common.cancel')}</Button><Button type="button" variant="destructive" onClick={page.onRemove}>{t('common.delete')}</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}
