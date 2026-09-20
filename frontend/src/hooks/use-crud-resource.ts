import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { translateApiError } from '../lib/api-error.ts';

type ResourceId = number | string;

export interface CrudEntity {
  id: ResourceId;
}

export interface CrudApi<TEntity extends CrudEntity, TInput> {
  list: () => Promise<TEntity[]>;
  create: (input: TInput) => Promise<TEntity>;
  update: (id: TEntity['id'], input: TInput) => Promise<TEntity>;
  remove: (id: TEntity['id']) => Promise<void>;
}

interface UseCrudResourceOptions<TEntity extends CrudEntity, TInput> {
  api: CrudApi<TEntity, TInput>;
  loadErrorMessage: string;
  createdMessage: string;
  updatedMessage: string;
  deletedMessage: string;
  sortItems: (items: TEntity[]) => TEntity[];
}

export function useCrudResource<TEntity extends CrudEntity, TInput>({
  api,
  loadErrorMessage,
  createdMessage,
  updatedMessage,
  deletedMessage,
  sortItems,
}: UseCrudResourceOptions<TEntity, TInput>) {
  const [items, setItems] = useState<TEntity[]>([]);
  const [editingItem, setEditingItem] = useState<TEntity | null>(null);
  const [deletingItem, setDeletingItem] = useState<TEntity | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let isMounted = true;

    api.list()
      .then((loadedItems) => {
        if (isMounted) setItems(sortItems(loadedItems));
      })
      .catch(() => {
        if (isMounted) setError(loadErrorMessage);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [api, loadErrorMessage, sortItems]);

  const openCreate = () => {
    setEditingItem(null);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEdit = (item: TEntity) => {
    setEditingItem(item);
    setFormError('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormError('');
  };

  const save = async (input: TInput): Promise<TEntity | null> => {
    setFormError('');
    try {
      const saved = editingItem
        ? await api.update(editingItem.id, input)
        : await api.create(input);

      setItems((current) => sortItems(
        editingItem
          ? current.map((item) => item.id === saved.id ? saved : item)
          : [...current, saved],
      ));
      closeForm();
      toast.success(editingItem ? updatedMessage : createdMessage);
      return saved;
    } catch (submissionError) {
      setFormError(translateApiError(submissionError));
      return null;
    }
  };

  const remove = async () => {
    if (!deletingItem) return;

    try {
      await api.remove(deletingItem.id);
      setItems((current) => current.filter((item) => item.id !== deletingItem.id));
      setDeletingItem(null);
      setError('');
      toast.success(deletedMessage);
    } catch (deletionError) {
      toast.error(translateApiError(deletionError));
    }
  };

  return {
    items,
    editingItem,
    deletingItem,
    isFormOpen,
    isLoading,
    error,
    formError,
    setDeletingItem,
    openCreate,
    openEdit,
    closeForm,
    save,
    remove,
  };
}