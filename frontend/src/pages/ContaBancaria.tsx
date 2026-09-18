import { type FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { contaBancariaApi, ContaBancariaApiError } from '../lib/ContaBancariaApi.ts';
import { instituicaoBancariaApi } from '../lib/InstituicaoBancariaApi.ts';
import { translateApiError } from '../lib/ApiError.ts';
import type { ContaBancaria } from '../types/ContaBancaria.ts';
import type { InstituicaoBancaria } from '../types/InstituicaoBancaria.ts';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Label } from '../components/ui/Label.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/Select.tsx';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/Dialog.tsx';
import { PageHeader } from '../components/PageHeader.tsx';

export function BankAccounts() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<ContaBancaria[]>([]);
  const [institutions, setInstitutions] = useState<InstituicaoBancaria[]>([]);
  const [name, setName] = useState('');
  const [bankInstitutionId, setBankInstitutionId] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ContaBancaria | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<ContaBancaria | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([contaBancariaApi.list(), instituicaoBancariaApi.list()])
      .then(([loadedAccounts, loadedInstitutions]) => {
        setAccounts(loadedAccounts);
        setInstitutions(loadedInstitutions);
      })
      .catch(() => setError(t('bankAccounts.loadError')))
      .finally(() => setIsLoading(false));
  }, [t]);

  const resetForm = () => {
    setName('');
    setBankInstitutionId('');
    setFormError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    try {
      const input = {
        name,
        bankInstitutionId,
      };
      const saved = editingAccount
        ? await contaBancariaApi.update(editingAccount.id, input)
        : await contaBancariaApi.create(input);

      setAccounts((current) => {
        const next = editingAccount
          ? current.map((account) => account.id === saved.id ? saved : account)
          : [...current, saved];
        return next.sort((first, second) => first.name.localeCompare(second.name));
      });

      setIsFormOpen(false);
      setEditingAccount(null);
      resetForm();
      toast.success(editingAccount ? t('bankAccounts.updated') : t('bankAccounts.created'));
    } catch (submissionError) {
      if (submissionError instanceof ContaBancariaApiError) {
        setFormError(translateApiError(submissionError));
        return;
      }
      setFormError(translateApiError(submissionError));
    }
  };

  const openCreateDialog = () => {
    setEditingAccount(null);
    resetForm();
    setIsFormOpen(true);
  };

  const openEditDialog = (account: ContaBancaria) => {
    setEditingAccount(account);
    setName(account.name);
    setBankInstitutionId(account.bankInstitutionId);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingAccount) return;

    try {
      await contaBancariaApi.remove(deletingAccount.id);
      setAccounts((current) => current.filter((account) => account.id !== deletingAccount.id));
      setDeletingAccount(null);
      toast.success(t('bankAccounts.deleted'));
    } catch (deletionError) {
      toast.error(translateApiError(deletionError));
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader section={t('bankAccounts.section')} title={t('bankAccounts.title')} />

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) {
          setEditingAccount(null);
          resetForm();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAccount ? t('bankAccounts.edit') : t('bankAccounts.new')}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            onInvalid={(event) => (event.target as HTMLInputElement).setCustomValidity(t('common.required'))}
            onInput={(event) => (event.target as HTMLInputElement).setCustomValidity('')}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="bank-account-name" required>{t('bankAccounts.name')}</Label>
              <Input
                id="bank-account-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t('bankAccounts.namePlaceholder')}
                maxLength={100}
                required
                autoFocus
                hasError={Boolean(formError)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank-account-institution" required>{t('bankAccounts.institution')}</Label>
              <Select
                name="bankInstitutionId"
                value={bankInstitutionId || undefined}
                onValueChange={setBankInstitutionId}
                required
              >
                <SelectTrigger id="bank-account-institution" aria-invalid={Boolean(formError)}>
                  <SelectValue placeholder={t('bankAccounts.institutionPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((institution) => (
                    <SelectItem key={institution.id} value={String(institution.id)}>{institution.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formError && <p role="alert" className="text-sm text-rose-600">{formError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="mt-1 text-xs text-slate-500">{t('bankAccounts.listTitle')}</p>
          </div>
          <Button type="button" onClick={openCreateDialog} size="sm" className="gap-1.5">
            <Plus size={13} /> {t('bankAccounts.add')}
          </Button>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-500">
          <span>{t('bankAccounts.column')}</span>
          <span>{t('bankAccounts.institution')}</span>
          <span className="w-[4.5rem] text-center">{t('common.actions')}</span>
        </div>

        {isLoading ? (
          <p className="px-5 py-6 text-sm text-slate-500">{t('common.loading')}</p>
        ) : accounts.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">{t('bankAccounts.empty')}</p>
        ) : (
          <div>
            {accounts.map((account) => (
              <div key={account.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-100 px-5 py-3 text-sm text-slate-700 last:border-b-0">
                <span className="min-w-0 truncate font-medium">{account.name}</span>
                <span className="min-w-0 truncate">{account.bankInstitutionName}</span>
                <div className="flex w-[4.5rem] shrink-0 items-center justify-center gap-1">
                  <button type="button" onClick={() => openEditDialog(account)} title={t('bankAccounts.edit')} aria-label={t('bankAccounts.editLabel', { name: account.name })} className="rounded-md p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600">
                    <Pencil size={13} />
                  </button>
                  <button type="button" onClick={() => setDeletingAccount(account)} title={t('common.delete')} aria-label={t('bankAccounts.deleteLabel', { name: account.name })} className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!deletingAccount} onOpenChange={(open) => { if (!open) setDeletingAccount(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('bankAccounts.deleteTitle')}</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">{t('bankAccounts.deleteConfirmation', { name: deletingAccount?.name ?? '' })}</p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeletingAccount(null)}>{t('common.cancel')}</Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>{t('common.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
