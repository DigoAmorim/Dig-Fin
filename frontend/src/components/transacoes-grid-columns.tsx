import { useCallback, useEffect, useState } from 'react'

export type TransacoesColumnId =
  | 'date'
  | 'description'
  | 'account'
  | 'card'
  | 'installment'
  | 'subcategory'
  | 'amount'

export type TransacoesSortDir = 'asc' | 'desc'

type StoredSort = {
  by: TransacoesColumnId | null
  dir: TransacoesSortDir
}

const STORAGE_KEY = 'digfin.transacoes.sort'
const DEFAULT_SORT: StoredSort = { by: null, dir: 'asc' }

function isColumnId(value: unknown): value is TransacoesColumnId {
  return value === 'date'
    || value === 'description'
    || value === 'account'
    || value === 'card'
    || value === 'installment'
    || value === 'subcategory'
    || value === 'amount'
}

function loadSort(): StoredSort {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SORT
    const parsed = JSON.parse(raw) as Partial<StoredSort>
    return {
      by: isColumnId(parsed.by) ? parsed.by : null,
      dir: parsed.dir === 'desc' ? 'desc' : 'asc',
    }
  } catch {
    return DEFAULT_SORT
  }
}

export function useTransacoesGridState() {
  const [sort, setSort] = useState<StoredSort>(() => loadSort())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sort))
    } catch {
    }
  }, [sort])

  const toggleSort = useCallback((column: TransacoesColumnId) => {
    setSort((current) => {
      if (current.by !== column) return { by: column, dir: 'desc' }
      return { by: column, dir: current.dir === 'desc' ? 'asc' : 'desc' }
    })
  }, [])

  return {
    sortBy: sort.by,
    sortDir: sort.dir,
    toggleSort,
  }
}
