import { type FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { contaBancariaApi } from '../lib/conta-bancaria-api.ts';
import { instituicaoBancariaApi } from '../lib/instituicao-bancaria-api.ts';
import { pluggyApi } from '../lib/pluggy-api.ts';
import type { ContaBancaria, ContaBancariaInput } from '../types/conta-bancaria.ts';
import type { InstituicaoBancaria } from '../types/instituicao-bancaria.ts';
import { toast } from 'sonner';
import { useCrudResource } from '../hooks/use-crud-resource.ts';
import { SimpleCrudPage } from '../components/simple-crud-page.tsx';
import { Button } from '../components/ui/button.tsx';
import { Input } from '../components/ui/input.tsx';
import { Label } from '../components/ui/label.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.tsx';
import { translateApiError } from '../lib/api-error.ts';

const sortItems = (items: ContaBancaria[]) => [...items].sort((a, b) => a.name.localeCompare(b.name));

export function BankAccounts() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [bankInstitutionId, setBankInstitutionId] = useState('');
  const [institutions, setInstitutions] = useState<InstituicaoBancaria[]>([]);
  const [institutionsError, setInstitutionsError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const resource = useCrudResource<ContaBancaria, ContaBancariaInput>({
    api: contaBancariaApi,
    loadErrorMessage: t('bankAccounts.loadError'),
    createdMessage: t('bankAccounts.created'),
    updatedMessage: t('bankAccounts.updated'),
    deletedMessage: t('bankAccounts.deleted'),
    sortItems,
  });

  useEffect(() => {
    instituicaoBancariaApi.list().then(setInstitutions).catch(() => setInstitutionsError(t('bankAccounts.loadError')));
  }, [t]);

  const reset = () => {
    setName('');
    setBankInstitutionId('');
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (await resource.save({ name, bankInstitutionId })) reset();
  };

  const openEdit = (item: ContaBancaria) => {
    setName(item.name);
    setBankInstitutionId(item.bankInstitutionId);
    resource.openEdit(item);
  };

  const syncPluggy = async () => {
    const itemId = localStorage.getItem('digfin.pluggy.itemId');

    if (!itemId) {
      toast.error('Ainda não existe uma conexão Pluggy válida para esta conta. Conecte o banco primeiro.');
      return;
    }

    setSyncing(true);
    try {
      const result = await pluggyApi.syncBankAccounts(itemId);
      toast.success(`${result.matched} de ${result.total} contas sincronizadas.`);
      await resource.refresh();
    } catch (error) {
      toast.error(translateApiError(error));
    } finally {
      setSyncing(false);
    }
  };

  return <SimpleCrudPage
    section={t('bankAccounts.section')}
    title={t('bankAccounts.title')}
    newLabel={t('bankAccounts.new')}
    addLabel={t('bankAccounts.add')}
    listDescription={t('bankAccounts.listTitle')}
    columnHeader={<><span>{t('bankAccounts.column')}</span><span>{t('bankAccounts.institution')}</span><span>Open Finance</span></>}
    columnsClassName="grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_auto]"
    items={resource.items}
    editingItem={resource.editingItem}
    deletingItem={resource.deletingItem}
    isFormOpen={resource.isFormOpen}
    isLoading={resource.isLoading}
    error={resource.error || institutionsError}
    formError={resource.formError}
    emptyLabel={t('bankAccounts.empty')}
    editLabel={t('bankAccounts.edit')}
    deleteLabel={t('bankAccounts.deleteLabel', { name: resource.deletingItem?.name ?? '' })}
    deleteTitle={t('bankAccounts.deleteTitle')}
    deleteConfirmation={t('bankAccounts.deleteConfirmation', { name: resource.deletingItem?.name ?? '' })}
    onOpenCreate={() => { reset(); resource.openCreate(); }}
    onOpenEdit={openEdit}
    onCloseForm={() => { resource.closeForm(); reset(); }}
    onSetDeleting={resource.setDeletingItem}
    onRemove={resource.remove}
    onSubmit={submit}
    extraAction={<Button type="button" variant="outline" size="sm" onClick={syncPluggy} disabled={syncing}>{syncing ? 'Sincronizando...' : 'Sincronizar Pluggy'}</Button>}
    renderForm={() => <><div className="space-y-2"><Label htmlFor="bank-account-name" required>{t('bankAccounts.name')}</Label><Input id="bank-account-name" value={name} onChange={(event) => setName(event.target.value)} placeholder={t('bankAccounts.namePlaceholder')} required autoFocus /></div><div className="space-y-2"><Label htmlFor="bank-account-institution" required>{t('bankAccounts.institution')}</Label><Select required value={bankInstitutionId || undefined} onValueChange={setBankInstitutionId}><SelectTrigger id="bank-account-institution"><SelectValue placeholder={t('bankAccounts.institutionPlaceholder')} /></SelectTrigger><SelectContent>{institutions.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select></div></>}
    renderRow={(item, actions) => {
      const status = item.pluggyStatus === 'sincronizada' ? 'Sincronizada' : 'Não sincronizada';
      const statusClass = item.pluggyStatus === 'sincronizada' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600';
      return <div key={item.id} className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_auto] items-center gap-3 border-b border-slate-100 px-5 py-3 text-sm text-slate-700 last:border-b-0">
        <span className="min-w-0 truncate font-medium">{item.name}</span>
        <span className="min-w-0 truncate">{item.bankInstitutionName}</span>
        <span className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium ${statusClass}`}>{status}</span>
        {actions}
      </div>;
    }}
  />;
}
