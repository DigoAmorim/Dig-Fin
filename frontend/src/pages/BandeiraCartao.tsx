import { type FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { BandeiraCartaoApiError, bandeiraCartaoApi } from '../lib/BandeiraCartaoApi.ts';
import { translateApiError } from '../lib/ApiError.ts';
import type { BandeiraCartao } from '../types/BandeiraCartao.ts';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Label } from '../components/ui/Label.tsx';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/Dialog.tsx';
import { PageHeader } from '../components/PageHeader.tsx';

export function CardBrands() {
  const { t } = useTranslation();
  const [cardBrands, setCardBrands] = useState<BandeiraCartao[]>([]);
  const [description, setDescription] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BandeiraCartao | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<BandeiraCartao | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    bandeiraCartaoApi.list()
      .then(setCardBrands)
      .catch(() => setError(t('cardBrands.loadError')))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    try {
      const saved = editingBrand
        ? await bandeiraCartaoApi.update(editingBrand.id, { description })
        : await bandeiraCartaoApi.create({ description });
      setCardBrands((current) => {
        const next = editingBrand
          ? current.map((brand) => brand.id === saved.id ? saved : brand)
          : [...current, saved];
        return next.sort((a, b) => a.description.localeCompare(b.description));
      });
      setDescription('');
      setIsFormOpen(false);
      setEditingBrand(null);
      toast.success(editingBrand ? t('cardBrands.updated') : t('cardBrands.created'));
    } catch (submissionError) {
      if (submissionError instanceof BandeiraCartaoApiError) {
        setFormError(translateApiError(submissionError));
        return;
      }
      setFormError(translateApiError(submissionError));
    }
  };

  const openCreateDialog = () => {
    setEditingBrand(null);
    setDescription('');
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditDialog = (brand: BandeiraCartao) => {
    setEditingBrand(brand);
    setDescription(brand.description);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingBrand) return;

    try {
      await bandeiraCartaoApi.remove(deletingBrand.id);
      setCardBrands((current) => current.filter((brand) => brand.id !== deletingBrand.id));
      setDeletingBrand(null);
      setError('');
      toast.success(t('cardBrands.deleted'));
    } catch (deletionError) {
      toast.error(translateApiError(deletionError));
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader section={t('cardBrands.section')} title={t('cardBrands.title')} />

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) {
          setEditingBrand(null);
          setFormError('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBrand ? t('cardBrands.edit') : t('cardBrands.new')}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            onInvalid={(event) => (event.target as HTMLInputElement).setCustomValidity(t('common.required'))}
            onInput={(event) => (event.target as HTMLInputElement).setCustomValidity('')}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="card-brand-description" required>
                {t('cardBrands.description')}
              </Label>
              <Input
                id="card-brand-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t('cardBrands.descriptionPlaceholder')}
                required
                autoFocus
                hasError={Boolean(formError)}
                aria-describedby={formError ? 'card-brand-description-error' : undefined}
              />
            </div>
            {formError && (
              <p id="card-brand-description-error" role="alert" className="text-sm text-rose-600">
                {formError}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditingBrand(null); setFormError(''); }}>
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
            <p className="mt-1 text-xs text-slate-500">{t('cardBrands.listTitle')}</p>
          </div>
          <Button
            type="button"
            onClick={openCreateDialog}
            size="sm"
            className="gap-1.5"
          >
            <Plus size={13} /> {t('cardBrands.add')}
          </Button>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-500">
          <span>{t('cardBrands.column')}</span>
          <span className="w-[4.5rem] text-center">{t('common.actions')}</span>
        </div>
        {isLoading ? (
          <p className="px-5 py-6 text-sm text-slate-500">{t('common.loading')}</p>
        ) : cardBrands.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">{t('cardBrands.empty')}</p>
        ) : (
          <div>{cardBrands.map((brand) => (
            <div key={brand.id} className="flex items-center gap-3 border-b border-slate-100 px-5 py-3 text-sm text-slate-700 last:border-b-0">
              <span className="min-w-0 flex-1 truncate font-medium">{brand.description}</span>
              <div className="flex w-[4.5rem] shrink-0 items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditDialog(brand)}
                  title={t('cardBrands.edit')}
                  aria-label={t('cardBrands.editLabel', { description: brand.description })}
                  className="rounded-md p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingBrand(brand)}
                  title={t('common.delete')}
                  aria-label={t('cardBrands.deleteLabel', { description: brand.description })}
                  className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}</div>
        )}
      </div>

      <Dialog open={!!deletingBrand} onOpenChange={(open) => { if (!open) setDeletingBrand(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cardBrands.deleteTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            {t('cardBrands.deleteConfirmation', { description: deletingBrand?.description ?? '' })}
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeletingBrand(null)}>
              {t('common.cancel')}
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}