import { type FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cartaoCreditoApi, CartaoCreditoApiError } from '../lib/CartaoCreditoApi.ts';
import { translateApiError } from '../lib/ApiError.ts';
import { bandeiraCartaoApi } from '../lib/BandeiraCartaoApi.ts';
import type { CartaoCredito } from '../types/CartaoCredito.ts';
import type { BandeiraCartao } from '../types/BandeiraCartao.ts';
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

const dueDays = Array.from({ length: 31 }, (_, index) => index + 1);

export function CreditCards() {
  const { t } = useTranslation();
  const [cards, setCards] = useState<CartaoCredito[]>([]);
  const [brands, setBrands] = useState<BandeiraCartao[]>([]);
  const [name, setName] = useState('');
  const [cardBrandId, setCardBrandId] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CartaoCredito | null>(null);
  const [deletingCard, setDeletingCard] = useState<CartaoCredito | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([cartaoCreditoApi.list(), bandeiraCartaoApi.list()])
      .then(([loadedCards, loadedBrands]) => {
        setCards(loadedCards);
        setBrands(loadedBrands);
      })
      .catch(() => setError(t('creditCards.loadError')))
      .finally(() => setIsLoading(false));
  }, [t]);

  const resetForm = () => {
    setName('');
    setCardBrandId('');
    setDueDay('');
    setFormError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    try {
      const input = {
        name,
        cardBrandId,
        dueDay: Number(dueDay),
      };
      const saved = editingCard
        ? await cartaoCreditoApi.update(editingCard.id, input)
        : await cartaoCreditoApi.create(input);
      setCards((current) => {
        const next = editingCard
          ? current.map((card) => card.id === saved.id ? saved : card)
          : [...current, saved];
        return next.sort((first, second) => first.name.localeCompare(second.name));
      });
      setIsFormOpen(false);
      setEditingCard(null);
      resetForm();
      toast.success(editingCard ? t('creditCards.updated') : t('creditCards.created'));
    } catch (submissionError) {
      if (submissionError instanceof CartaoCreditoApiError) {
        setFormError(translateApiError(submissionError));
        return;
      }
      setFormError(translateApiError(submissionError));
    }
  };

  const openCreateDialog = () => {
    setEditingCard(null);
    resetForm();
    setIsFormOpen(true);
  };

  const openEditDialog = (card: CartaoCredito) => {
    setEditingCard(card);
    setName(card.name);
    setCardBrandId(card.cardBrandId);
    setDueDay(String(card.dueDay));
    setFormError('');
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingCard) return;
    try {
      await cartaoCreditoApi.remove(deletingCard.id);
      setCards((current) => current.filter((card) => card.id !== deletingCard.id));
      setDeletingCard(null);
      toast.success(t('creditCards.deleted'));
    } catch (deletionError) {
      toast.error(translateApiError(deletionError));
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader section={t('creditCards.section')} title={t('creditCards.title')} />

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) {
          setEditingCard(null);
          resetForm();
        }
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
            <Button type="button" variant="destructive" onClick={handleDelete}>{t('common.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}