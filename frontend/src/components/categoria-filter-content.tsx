import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DropdownMenuCheckboxItem, DropdownMenuItem } from './ui/dropdown-menu';
import type { Subcategoria } from '../types/categoria.ts';

interface CategoriaFilterContentProps {
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  subcategories: Subcategoria[];
}

const toggleId = (ids: string[], id: string) => ids.includes(id)
  ? ids.filter((currentId) => currentId !== id)
  : [...ids, id];

export function CategoriaFilterContent({ selectedIds, onSelectedIdsChange, subcategories }: CategoriaFilterContentProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const visibleSubcategories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR');
    return [...subcategories]
      .filter((subcategory) => !query || subcategory.name.toLocaleLowerCase('pt-BR').includes(query))
      .sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'));
  }, [search, subcategories]);

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()} placeholder={t('transactions.filterCategorySearch')} className="h-8 w-full rounded-md border border-slate-200 bg-white pl-7 pr-2 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
        </div>
      </div>
      {visibleSubcategories.length === 0 ? (
        <p className="px-2 py-3 text-center text-xs text-slate-500">{t('transactions.filterNoResults')}</p>
      ) : visibleSubcategories.map((subcategory) => (
        <DropdownMenuCheckboxItem key={subcategory.id} checked={selectedIds.includes(String(subcategory.id))} onSelect={(event) => { event.preventDefault(); onSelectedIdsChange(toggleId(selectedIds, String(subcategory.id))); }} className="gap-2 py-1.5 text-[13px]">
          <span className="min-w-0 flex-1 truncate">{subcategory.name}</span>
        </DropdownMenuCheckboxItem>
      ))}
      {selectedIds.length > 0 && <DropdownMenuItem onSelect={(event) => { event.preventDefault(); onSelectedIdsChange([]); }} className="gap-2 text-xs text-slate-500"><X size={12} /> {t('transactions.filterClearCategory')}</DropdownMenuItem>}
    </>
  );
}