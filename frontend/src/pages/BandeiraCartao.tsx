import { type FormEvent, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/Dialog.tsx';
import { PageHeader } from '../components/PageHeader.tsx';

interface CardBrand {
  id: string;
  description: string;
}

const API_URL = 'http://localhost:3000/api/bandeiras-cartao';

export function CardBrands() {
  const [cardBrands, setCardBrands] = useState<CardBrand[]>([]);
  const [description, setDescription] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<CardBrand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<CardBrand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) throw new Error('Não foi possível carregar as bandeiras.');
        return response.json() as Promise<CardBrand[]>;
      })
      .then(setCardBrands)
      .catch(() => setError('Não foi possível carregar as bandeiras.'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch(editingBrand ? `${API_URL}/${editingBrand.id}` : API_URL, {
        method: editingBrand ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        setError(editingBrand ? 'Não foi possível atualizar a bandeira.' : 'Não foi possível salvar a bandeira.');
        return;
      }

      const saved = await response.json() as CardBrand;
      setCardBrands((current) => {
        const next = editingBrand
          ? current.map((brand) => brand.id === saved.id ? saved : brand)
          : [...current, saved];
        return next.sort((a, b) => a.description.localeCompare(b.description));
      });
      setDescription('');
      setIsFormOpen(false);
      setEditingBrand(null);
      setError('');
    } catch {
      setError(editingBrand ? 'Não foi possível atualizar a bandeira.' : 'Não foi possível salvar a bandeira.');
    }
  };

  const openCreateDialog = () => {
    setEditingBrand(null);
    setDescription('');
    setIsFormOpen(true);
  };

  const openEditDialog = (brand: CardBrand) => {
    setEditingBrand(brand);
    setDescription(brand.description);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingBrand) return;

    try {
      const response = await fetch(`${API_URL}/${deletingBrand.id}`, { method: 'DELETE' });
      if (!response.ok) {
        setError('Não foi possível excluir a bandeira.');
        return;
      }

      setCardBrands((current) => current.filter((brand) => brand.id !== deletingBrand.id));
      setDeletingBrand(null);
      setError('');
    } catch {
      setError('Não foi possível excluir a bandeira.');
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader section="Bandeiras do Cartão" title="Bandeiras do Cartão" />

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) setEditingBrand(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBrand ? 'Editar bandeira' : 'Nova bandeira'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="card-brand-description" className="text-sm font-medium text-slate-700">
                Descrição
              </label>
              <input
                id="card-brand-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ex.: Visa"
                required
                autoFocus
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditingBrand(null); }}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-800">Bandeiras</h3>
          <Button
            type="button"
            onClick={openCreateDialog}
            size="sm"
            className="gap-1.5"
          >
            <Plus size={13} /> Adicionar Bandeira
          </Button>
        </div>
        {isLoading ? (
          <p className="px-5 py-6 text-sm text-slate-500">Carregando...</p>
        ) : cardBrands.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">Nenhuma bandeira cadastrada.</p>
        ) : (
          <div>{cardBrands.map((brand) => (
            <div key={brand.id} className="flex items-center gap-3 border-b border-slate-100 px-5 py-3 text-sm text-slate-700 last:border-b-0">
              <span className="min-w-0 flex-1 truncate">{brand.description}</span>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditDialog(brand)}
                  title="Editar bandeira"
                  aria-label={`Editar ${brand.description}`}
                  className="rounded-md p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingBrand(brand)}
                  title="Excluir bandeira"
                  aria-label={`Excluir ${brand.description}`}
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
            <DialogTitle>Excluir bandeira?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Tem certeza que deseja excluir a bandeira <strong>{deletingBrand?.description}</strong>?
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeletingBrand(null)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}