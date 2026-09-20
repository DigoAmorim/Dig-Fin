import { type FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { cartaoCreditoApi } from '../lib/cartao-credito-api.ts';
import { bandeiraCartaoApi } from '../lib/bandeira-cartao-api.ts';
import type { CartaoCredito, CartaoCreditoInput } from '../types/cartao-credito.ts';
import type { BandeiraCartao } from '../types/bandeira-cartao.ts';
import { useCrudResource } from '../hooks/use-crud-resource.ts';
import { Button } from '../components/ui/button.tsx';
import { Input } from '../components/ui/input.tsx';
import { Label } from '../components/ui/label.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select.tsx';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog.tsx';
import { PageHeader } from '../components/page-header.tsx';

const sortCreditCards = (items: CartaoCredito[]) => [...items].sort((a, b) => a.name.localeCompare(b.name));

const dueDays = Array.from({ length: 31 }, (_, index) => index + 1);

export function CreditCards() {
  const { t } = useTranslation();
  const [brands, setBrands] = useState<BandeiraCartao[]>([]);
  const [brandsError, setBrandsError] = useState('');
  const [name, setName] = useState('');
  const [cardBrandId, setCardBrandId] = useState('');
  const [dueDay, setDueDay] = useState('');
  const {
    items: cards,
    editingItem: editingCard,
    deletingItem: deletingCard,
    isFormOpen,
    isLoading,
    error,
    formError,
    setDeletingItem: setDeletingCard,
    openCreate,
    openEdit,
    closeForm,
    save,
    remove,
  } = useCrudResource<CartaoCredito, CartaoCreditoInput>({
    api: cartaoCreditoApi,
    loadErrorMessage: t('creditCards.loadError'),
    createdMessage: t('creditCards.created'),
    updatedMessage: t('creditCards.updated'),
    deletedMessage: t('creditCards.deleted'),
    sortItems: sortCreditCards,
  });

  useEffect(() => {
    bandeiraCartaoApi.list()
      .then(setBrands)
      .catch(() => setBrandsError(t('creditCards.loadError')));
  }, [t]);

  const resetForm = () => {
    setName('');
    setCardBrandId('');
    setDueDay('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const saved = await save({ name, cardBrandId, dueDay: Number(dueDay) });
    if (saved) resetForm();
  };

  const openCreateDialog = () => {
    resetForm();
    openCreate();
  };

  const openEditDialog = (card: CartaoCredito) => {
    setName(card.name);
    setCardBrandId(card.cardBrandId);
    setDueDay(String(card.dueDay));
    openEdit(card);
  };

  return (
    <div className="space-y-4">
      <PageHeader section={t('creditCards.section')} title={t('creditCards.title')} />

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        if (!open) { closeForm(); resetForm(); }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCard ? t('creditCards.edit') : t('creditCards.new')}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            onInvalid={(event) => (event.target as HTMLInputElement).setCustomValidity(t('common.required'))}
            onInput={(event) => (event.target as HTMLInputElement).setCustomValidity('')}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="credit-card-name" required>{t('creditCards.name')}</Label>
              <Input
                id="credit-card-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t('creditCards.namePlaceholder')}
                maxLength={50}
                required
                autoFocus
                hasError={Boolean(formError)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit-card-brand" required>{t('creditCards.brand')}</Label>
              <Select
                name="cardBrandId"
                value={cardBrandId || undefined}
                onValueChange={setCardBrandId}
                required
              >
                <SelectTrigger id="credit-card-brand" aria-invalid={Boolean(formError)}>
                  <SelectValue placeholder={t('creditCards.brandPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={String(brand.id)}>{brand.description}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit-card-due-day" required>{t('creditCards.dueDay')}</Label>
              <Select
                name="dueDay"
                value={dueDay || undefined}
                onValueChange={setDueDay}
                required
              >
                <SelectTrigger id="credit-card-due-day" aria-invalid={Boolean(formError)}>
                  <SelectValue placeholder={t('creditCards.dueDayPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {dueDays.map((day) => <SelectItem key={day} value={String(day)}>{day}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {formError && <p role="alert" className="text-sm text-rose-600">{formError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { closeForm(); resetForm(); }}>{t('common.cancel')}</Button>
              <Button type="submit">{t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {(error || brandsError) && <p className="text-sm text-rose-600">{error || brandsError}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="mt-1 text-xs text-slate-500">{t('creditCards.listTitle')}</p>
          </div>
          <Button type="button" onClick={openCreateDialog} size="sm" className="gap-1.5">
            <Plus size={13} /> {t('creditCards.add')}
          </Button>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-500">
          <span>{t('creditCards.columns.card')}</span>
          <span>{t('creditCards.columns.brand')}</span>
          <span>{t('creditCards.columns.dueDay')}</span>
          <span className="w-[4.5rem] text-center">{t('common.actions')}</span>
        </div>
        {isLoading ? (
          <p className="px-5 py-6 text-sm text-slate-500">{t('common.loading')}</p>
        ) : cards.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">{t('creditCards.empty')}</p>
        ) : (
          <div>
            {cards.map((card) => (
              <div key={card.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-slate-100 px-5 py-3 text-sm text-slate-700 last:border-b-0">
                <span className="min-w-0 truncate font-medium">{card.name}</span>
                <span className="min-w-0 truncate">{card.cardBrandDescription}</span>
                <span className="whitespace-nowrap">{t('creditCards.dueDayValue', { day: card.dueDay })}</span>
                <div className="flex w-[4.5rem] shrink-0 items-center justify-center gap-1">
                  <button type="button" onClick={() => openEditDialog(card)} title={t('creditCards.edit')} aria-label={t('creditCards.editLabel', { name: card.name })} className="rounded-md p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600">
                    <Pencil size={13} />
                  </button>
                  <button type="button" onClick={() => setDeletingCard(card)} title={t('common.delete')} aria-label={t('creditCards.deleteLabel', { name: card.name })} className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!deletingCard} onOpenChange={(open) => { if (!open) setDeletingCard(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('creditCards.deleteTitle')}</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">{t('creditCards.deleteConfirmation', { name: deletingCard?.name ?? '' })}</p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeletingCard(null)}>{t('common.cancel')}</Button>
            <Button type="button" variant="destructive" onClick={remove}>{t('common.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}