import { type FormEvent, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

interface CardBrand {
  id: string;
  description: string;
}

const API_URL = 'http://localhost:3000/api/bandeiras-cartao';

export function CardBrands() {
  const [cardBrands, setCardBrands] = useState<CardBrand[]>([]);
  const [description, setDescription] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
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
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
      setError('Não foi possível salvar a bandeira.');
      return;
    }

    const created = await response.json() as CardBrand;
    setCardBrands((current) => [...current, created].sort((a, b) => a.description.localeCompare(b.description)));
    setDescription('');
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Bandeiras do Cartão</h2>
          <p className="text-sm text-slate-500 mt-1">Cadastre as bandeiras aceitas pelos seus cartões.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsFormOpen((current) => !current)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition cursor-pointer"
        >
          <Plus size={16} /> Adicionar bandeira
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-end gap-3">
          <label className="flex-1 text-sm font-medium text-slate-700">
            Descrição
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ex.: Visa"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-emerald-500"
            />
          </label>
          <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 transition cursor-pointer">
            Salvar
          </button>
        </form>
      )}

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800">Bandeiras cadastradas</h3>
        </div>
        {isLoading ? (
          <p className="px-5 py-6 text-sm text-slate-500">Carregando...</p>
        ) : cardBrands.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">Nenhuma bandeira cadastrada.</p>
        ) : (
          <div>{cardBrands.map((brand) => <div key={brand.id} className="px-5 py-3 border-b last:border-b-0 border-slate-100 text-sm text-slate-700">{brand.description}</div>)}</div>
        )}
      </div>
    </div>
  );
}