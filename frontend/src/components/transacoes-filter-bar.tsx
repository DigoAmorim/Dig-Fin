import { useMemo, useState } from 'react';
import { ListFilter, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { CategoriaFilterContent } from './categoria-filter-content';
import type { CartaoCredito } from '../types/cartao-credito.ts';
import type { ContaBancaria } from '../types/conta-bancaria.ts';
import type { Subcategoria } from '../types/Categoria.ts';
import type { TransactionType } from '../types/transacao.ts';

export interface TransactionFilters {
  search: string;
  type: TransactionType | '';
  accountId: string;
  cardId: string;
  subcategoryIds: string[];
}

interface TransacoesFilterBarProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  accounts: ContaBancaria[];
  cards: CartaoCredito[];
  subcategories: Subcategoria[];
}

export function TransacoesFilterBar({ filters, onFiltersChange, accounts, cards, subcategories }: TransacoesFilterBarProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const update = (change: Partial<TransactionFilters>) => onFiltersChange({ ...filters, ...change });
  const activeCount = useMemo(() => [filters.type, filters.accountId, filters.cardId].filter(Boolean).length + filters.subcategoryIds.length, [filters]);
  const hasFilters = activeCount > 0 || filters.search.trim().length > 0;
  const typeLabels: Record<TransactionType, string> = {
    expense: t('transactions.expense'),
    income: t('transactions.income'),
    transfer: t('transactions.transfer'),
  };
  const selectedSubcategories = subcategories.filter((subcategory) => filters.subcategoryIds.includes(String(subcategory.id)));
  const removeChip = (change: Partial<TransactionFilters>) => update(change);

  const FilterChip = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
      <span className="truncate">{label}</span>
      <button type="button" onClick={onRemove} aria-label={`${t('transactions.filterRemove')} ${label}`} className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-emerald-700 transition hover:bg-emerald-200 hover:text-emerald-950">
        <X size={11} />
      </button>
    </span>
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input value={filters.search} onChange={(event) => update({ search: event.target.value })} placeholder={t('transactions.filterSearch')} className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
        </div>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild><Button type="button" variant="outline" size="sm" className="gap-1.5"><ListFilter size={14} /> {t('transactions.filters')} {activeCount > 0 && <span className="rounded-full bg-emerald-100 px-1.5 text-[11px] text-emerald-700">{activeCount}</span>}</Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>{t('transactions.filterType')}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={filters.type} onValueChange={(value) => update({ type: value as TransactionType | '' })}>
            <DropdownMenuRadioItem value="expense">{t('transactions.expense')}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="income">{t('transactions.income')}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="transfer">{t('transactions.transfer')}</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{t('transactions.filterAccount')}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={filters.accountId} onValueChange={(value) => update({ accountId: value })}>
            {accounts.map((account) => <DropdownMenuRadioItem key={account.id} value={account.id}>{account.name}</DropdownMenuRadioItem>)}
          </DropdownMenuRadioGroup>
          <DropdownMenuLabel>{t('transactions.card')}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={filters.cardId} onValueChange={(value) => update({ cardId: value })}>
            {cards.map((card) => <DropdownMenuRadioItem key={card.id} value={card.id}>{card.name}</DropdownMenuRadioItem>)}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{t('transactions.filterSubcategory')}</DropdownMenuLabel>
          <CategoriaFilterContent selectedIds={filters.subcategoryIds} onSelectedIdsChange={(subcategoryIds) => update({ subcategoryIds })} subcategories={subcategories} />
          </DropdownMenuContent>
        </DropdownMenu>
        {hasFilters && <Button type="button" variant="ghost" size="sm" onClick={() => { onFiltersChange({ search: '', type: '', accountId: '', cardId: '', subcategoryIds: [] }); setOpen(false); }} className="gap-1.5 text-slate-500"><X size={14} /> {t('transactions.filterClear')}</Button>}
      </div>
      {hasFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3" aria-label={t('transactions.activeFilters')}>
          {filters.search.trim() && <FilterChip label={`${t('common.search')}: ${filters.search.trim()}`} onRemove={() => removeChip({ search: '' })} />}
          {filters.type && <FilterChip label={`${t('transactions.filterType')}: ${typeLabels[filters.type]}`} onRemove={() => removeChip({ type: '' })} />}
          {filters.accountId && <FilterChip label={`${t('transactions.filterAccount')}: ${accounts.find((account) => account.id === filters.accountId)?.name ?? filters.accountId}`} onRemove={() => removeChip({ accountId: '' })} />}
          {filters.cardId && <FilterChip label={`${t('transactions.card')}: ${cards.find((card) => card.id === filters.cardId)?.name ?? filters.cardId}`} onRemove={() => removeChip({ cardId: '' })} />}
          {selectedSubcategories.map((subcategory) => <FilterChip key={subcategory.id} label={`${t('transactions.subcategory')}: ${subcategory.name}`} onRemove={() => removeChip({ subcategoryIds: filters.subcategoryIds.filter((id) => id !== String(subcategory.id)) })} />)}
        </div>
      )}
    </div>
  );
}