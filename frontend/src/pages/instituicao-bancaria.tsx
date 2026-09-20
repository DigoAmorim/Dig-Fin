import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { instituicaoBancariaApi } from '../lib/instituicao-bancaria-api.ts';
import type { InstituicaoBancaria, InstituicaoBancariaInput } from '../types/instituicao-bancaria.ts';
import { useCrudResource } from '../hooks/use-crud-resource.ts';
import { Button } from '../components/ui/button.tsx';
import { Input } from '../components/ui/input.tsx';
import { Label } from '../components/ui/label.tsx';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog.tsx';
import { PageHeader } from '../components/page-header.tsx';

const sortInstitutions = (items: InstituicaoBancaria[]) => [...items].sort((a, b) => a.name.localeCompare(b.name));

export function BankInstitutions() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const {
    items: institutions,
    editingItem: editingInstitution,
    deletingItem: deletingInstitution,
    isFormOpen,
    isLoading,
    error,
    formError,
    setDeletingItem: setDeletingInstitution,
    openCreate,
    openEdit,
    closeForm,
    save,
    remove,
  } = useCrudResource<InstituicaoBancaria, InstituicaoBancariaInput>({
    api: instituicaoBancariaApi,
    loadErrorMessage: t('bankInstitutions.loadError'),
    createdMessage: t('bankInstitutions.created'),
    updatedMessage: t('bankInstitutions.updated'),
    deletedMessage: t('bankInstitutions.deleted'),
    sortItems: sortInstitutions,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const saved = await save({ name });
    if (saved) setName('');
  };

  const openCreateDialog = () => {
    setName('');
    openCreate();
  };

  const openEditDialog = (institution: InstituicaoBancaria) => {
    setName(institution.name);
    openEdit(institution);
  };

  return (
    <div className="space-y-4">
      <PageHeader section={t('bankInstitutions.section')} title={t('bankInstitutions.title')} />

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        if (!open) closeForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingInstitution ? t('bankInstitutions.edit') : t('bankInstitutions.new')}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            onInvalid={(event) => (event.target as HTMLInputElement).setCustomValidity(t('common.required'))}
            onInput={(event) => (event.target as HTMLInputElement).setCustomValidity('')}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="bank-institution-name" required>
                {t('bankInstitutions.name')}
              </Label>
              <Input
                id="bank-institution-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t('bankInstitutions.namePlaceholder')}
                required
                autoFocus
                hasError={Boolean(formError)}
                aria-describedby={formError ? 'bank-institution-name-error' : undefined}
              />
            </div>
            {formError && (
              <p id="bank-institution-name-error" role="alert" className="text-sm text-rose-600">
                {formError}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">{t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="mt-1 text-xs text-slate-500">{t('bankInstitutions.listTitle')}</p>
          </div>
          <Button
            type="button"
            onClick={openCreateDialog}
            size="sm"
            className="gap-1.5"
          >
            <Plus size={13} /> {t('bankInstitutions.add')}
          </Button>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-500">
          <span>{t('bankInstitutions.column')}</span>
          <span className="w-[4.5rem] text-center">{t('common.actions')}</span>
        </div>

        {isLoading ? (
          <p className="px-5 py-6 text-sm text-slate-500">{t('common.loading')}</p>
        ) : institutions.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">{t('bankInstitutions.empty')}</p>
        ) : (
          <div>{institutions.map((institution) => (
            <div key={institution.id} className="flex items-center gap-3 border-b border-slate-100 px-5 py-3 text-sm text-slate-700 last:border-b-0">
              <span className="min-w-0 flex-1 truncate font-medium">{institution.name}</span>
              <div className="flex w-[4.5rem] shrink-0 items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditDialog(institution)}
                  title={t('bankInstitutions.edit')}
                  aria-label={t('bankInstitutions.editLabel', { name: institution.name })}
                  className="rounded-md p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingInstitution(institution)}
                  title={t('common.delete')}
                  aria-label={t('bankInstitutions.deleteLabel', { name: institution.name })}
                  className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}</div>
        )}
      </div>

      <Dialog open={!!deletingInstitution} onOpenChange={(open) => { if (!open) setDeletingInstitution(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('bankInstitutions.deleteTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            {t('bankInstitutions.deleteConfirmation', { name: deletingInstitution?.name ?? '' })}
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeletingInstitution(null)}>
              {t('common.cancel')}
            </Button>
              <Button type="button" variant="destructive" onClick={remove}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
