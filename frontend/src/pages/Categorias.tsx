import { type FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, CircleHelp, Pencil, Plus, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { categoriaApi } from '../lib/categoria-api.ts';
import { translateApiError } from '../lib/api-error.ts';
import type { Categoria, CategoriaInput, Subcategoria, SubcategoriaInput } from '../types/categoria.ts';
import { Button } from '../components/ui/button.tsx';
import { Input } from '../components/ui/input.tsx';
import { Label } from '../components/ui/label.tsx';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog.tsx';
import { PageHeader } from '../components/page-header.tsx';
import { ICON_MAP } from '../lib/category-icons.ts';
import { IconPicker } from '../components/icon-picker.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select.tsx';

const getIcon = (name: string): LucideIcon => ICON_MAP[name] ?? CircleHelp;

interface CategoryFormState {
  name: string;
  color: string;
  icon: string;
}

interface SubcategoryFormState {
  name: string;
  icon: string;
  categoryId: string;
}

const emptyCategoryForm: CategoryFormState = { name: '', color: '#0f766e', icon: 'circle-help' };
const emptySubcategoryForm: SubcategoryFormState = { name: '', icon: 'circle-help', categoryId: '' };

export function Categories() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [ungroupedSubcategories, setUngroupedSubcategories] = useState<Subcategoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<number>>(new Set());
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategoria | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);
  const [subcategoryForm, setSubcategoryForm] = useState<SubcategoryFormState>(emptySubcategoryForm);
  const [deletingCategory, setDeletingCategory] = useState<Categoria | null>(null);
  const [deletingSubcategory, setDeletingSubcategory] = useState<Subcategoria | null>(null);

  useEffect(() => {
    categoriaApi.list()
      .then((response) => {
        setCategories(response.categories);
        setUngroupedSubcategories(response.ungroupedSubcategories);
      })
      .catch((error) => setLoadError(translateApiError(error)))
      .finally(() => setIsLoading(false));
  }, []);

  const closeDialogs = () => {
    setCategoryDialogOpen(false);
    setSubcategoryDialogOpen(false);
    setEditingCategory(null);
    setEditingSubcategory(null);
    setFormError('');
  };

  const openCategoryDialog = (category: Categoria | null) => {
    setEditingCategory(category);
    setCategoryForm(category
      ? { name: category.name, color: category.color, icon: category.icon }
      : emptyCategoryForm);
    setFormError('');
    setCategoryDialogOpen(true);
  };

  const openSubcategoryDialog = (subcategory: Subcategoria | null, categoryId?: number) => {
    setEditingSubcategory(subcategory);
    setSubcategoryForm(subcategory
      ? { name: subcategory.name, icon: subcategory.icon, categoryId: String(subcategory.categoryId ?? '') }
      : { ...emptySubcategoryForm, categoryId: categoryId ? String(categoryId) : '' });
    setFormError('');
    setSubcategoryDialogOpen(true);
  };

  const handleCategorySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    try {
      const input: CategoriaInput = categoryForm;
      if (editingCategory) {
        const saved = await categoriaApi.update(editingCategory.id, input);
        setCategories((current) => current.map((category) => (
          category.id === saved.id ? { ...saved, subcategories: category.subcategories } : category
        )));
        toast.success(t('categories.updated'));
      } else {
        const saved = await categoriaApi.create(input);
        setCategories((current) => [...current, saved].sort((first, second) => first.name.localeCompare(second.name)));
        toast.success(t('categories.created'));
      }
      closeDialogs();
    } catch (error) {
      setFormError(translateApiError(error));
    }
  };

  const handleSubcategorySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    try {
      const input: SubcategoriaInput = {
        name: subcategoryForm.name,
        icon: subcategoryForm.icon,
        categoryId: subcategoryForm.categoryId ? Number(subcategoryForm.categoryId) : null,
      };
      if (editingSubcategory) {
        const saved = await categoriaApi.updateSubcategory(editingSubcategory.id, input);
        setCategories((current) => current.map((category) => ({
          ...category,
          subcategories: category.subcategories
            .filter((subcategory) => subcategory.id !== saved.id)
            .concat(saved.categoryId === category.id ? [saved] : [])
            .sort((first, second) => first.name.localeCompare(second.name)),
        })));
        setUngroupedSubcategories((current) => current.filter((item) => item.id !== saved.id));
        if (saved.categoryId === null) {
          setUngroupedSubcategories((current) => [...current, saved].sort((first, second) => first.name.localeCompare(second.name)));
        }
        toast.success(t('subcategories.updated'));
      } else {
        const saved = await categoriaApi.createSubcategory(input);
        setCategories((current) => current.map((category) => (
          category.id === saved.categoryId
            ? { ...category, subcategories: [...category.subcategories, saved].sort((first, second) => first.name.localeCompare(second.name)) }
            : category
        )));
        if (saved.categoryId === null) setUngroupedSubcategories((current) => [...current, saved].sort((first, second) => first.name.localeCompare(second.name)));
        toast.success(t('subcategories.created'));
      }
      closeDialogs();
    } catch (error) {
      setFormError(translateApiError(error));
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      await categoriaApi.remove(deletingCategory.id);
      setCategories((current) => current.filter((category) => category.id !== deletingCategory.id));
      setDeletingCategory(null);
      toast.success(t('categories.deleted'));
    } catch (error) {
      toast.error(translateApiError(error));
    }
  };

  const handleDeleteSubcategory = async () => {
    if (!deletingSubcategory) return;
    try {
      await categoriaApi.removeSubcategory(deletingSubcategory.id);
      setCategories((current) => current.map((category) => ({
        ...category,
        subcategories: category.subcategories.filter((subcategory) => subcategory.id !== deletingSubcategory.id),
      })));
      setUngroupedSubcategories((current) => current.filter((item) => item.id !== deletingSubcategory.id));
      setDeletingSubcategory(null);
      toast.success(t('subcategories.deleted'));
    } catch (error) {
      toast.error(translateApiError(error));
    }
  };

  const renderIcon = (name: string, color: string, size = 16) => {
    const Icon = getIcon(name);
    return <Icon size={size} style={{ color }} />;
  };

  return (
    <div className="space-y-4">
      <PageHeader section={t('categories.section')} title={t('categories.title')} />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
               <p className="mt-1 text-xs text-slate-500">{t('categories.description')}</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => openCategoryDialog(null)}>
              <Plus size={13} /> {t('categories.add')}
            </Button>
            <Button type="button" size="sm" className="gap-1.5" onClick={() => openSubcategoryDialog(null)}>
              <Plus size={13} /> {t('subcategories.add')}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="px-5 py-6 text-sm text-slate-500">{t('common.loading')}</p>
        ) : loadError ? (
          <p className="px-5 py-6 text-sm text-rose-600">{loadError}</p>
        ) : categories.length === 0 && ungroupedSubcategories.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">{t('categories.empty')}</p>
        ) : (
          <div>
            {categories.map((category) => {
              const collapsed = collapsedCategories.has(category.id);
              return (
                <div key={category.id} className="border-b border-slate-100 last:border-b-0">
                  <div className="flex items-center gap-2 bg-slate-50 px-5 py-3">
                    <button type="button" onClick={() => setCollapsedCategories((current) => {
                      const next = new Set(current);
                      if (next.has(category.id)) next.delete(category.id); else next.add(category.id);
                      return next;
                    })} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                      {collapsed ? <ChevronRight size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                      {renderIcon(category.icon, category.color, 17)}
                      <span className="truncate text-sm font-semibold" style={{ color: category.color }}>{category.name}</span>
                      <span className="text-xs text-slate-400">({category.subcategories.length})</span>
                    </button>
                    <div className="flex shrink-0 items-center gap-1">
                      <button type="button" onClick={() => openSubcategoryDialog(null, category.id)} title={t('subcategories.add')} className="rounded-md p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600">
                        <Plus size={13} />
                      </button>
                      <button type="button" onClick={() => openCategoryDialog(category)} title={t('common.edit')} className="rounded-md p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600">
                        <Pencil size={13} />
                      </button>
                      <button type="button" onClick={() => setDeletingCategory(category)} title={t('common.delete')} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  {!collapsed && category.subcategories.map((subcategory) => (
                    <div key={subcategory.id} className="flex items-center gap-3 border-t border-slate-100 px-5 py-2.5 pl-12">
                      {renderIcon(subcategory.icon, category.color, 15)}
                      <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{subcategory.name}</span>
                      <button type="button" onClick={() => openSubcategoryDialog(subcategory)} title={t('common.edit')} className="rounded-md p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"><Pencil size={13} /></button>
                      <button type="button" onClick={() => setDeletingSubcategory(subcategory)} title={t('common.delete')} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>
              );
            })}
            {ungroupedSubcategories.length > 0 && (
              <div>
                <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-500">{t('subcategories.noCategory')}</div>
                {ungroupedSubcategories.map((subcategory) => (
                  <div key={subcategory.id} className="flex items-center gap-3 border-b border-slate-100 px-5 py-2.5 pl-12 last:border-b-0">
                    {renderIcon(subcategory.icon, '#64748b', 15)}
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{subcategory.name}</span>
                    <button type="button" onClick={() => openSubcategoryDialog(subcategory)} title={t('common.edit')} className="rounded-md p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"><Pencil size={13} /></button>
                    <button type="button" onClick={() => setDeletingSubcategory(subcategory)} title={t('common.delete')} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={categoryDialogOpen} onOpenChange={(open) => { if (!open) closeDialogs(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCategory ? t('categories.edit') : t('categories.new')}</DialogTitle></DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="category-name" required>{t('categories.name')}</Label><Input id="category-name" value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} required autoFocus /></div>
            <div className="space-y-2"><Label htmlFor="category-color" required>{t('categories.color')}</Label><Input id="category-color" type="color" value={categoryForm.color} onChange={(event) => setCategoryForm({ ...categoryForm, color: event.target.value })} className="h-9 px-2 py-1" required /></div>
            <div className="space-y-2"><Label required>{t('categories.icon')}</Label><IconPicker value={categoryForm.icon} color={categoryForm.color} onChange={(icon) => setCategoryForm({ ...categoryForm, icon })} /></div>
            {formError && <p role="alert" className="text-sm text-rose-600">{formError}</p>}
            <DialogFooter><Button type="button" variant="outline" onClick={closeDialogs}>{t('common.cancel')}</Button><Button type="submit">{t('common.save')}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={subcategoryDialogOpen} onOpenChange={(open) => { if (!open) closeDialogs(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingSubcategory ? t('subcategories.edit') : t('subcategories.new')}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubcategorySubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="subcategory-name" required>{t('subcategories.name')}</Label><Input id="subcategory-name" value={subcategoryForm.name} onChange={(event) => setSubcategoryForm({ ...subcategoryForm, name: event.target.value })} required autoFocus /></div>
            <div className="space-y-2"><Label htmlFor="subcategory-category">{t('subcategories.category')}</Label><Select value={subcategoryForm.categoryId || undefined} onValueChange={(categoryId) => setSubcategoryForm({ ...subcategoryForm, categoryId: categoryId === 'none' ? '' : categoryId })}><SelectTrigger id="subcategory-category"><SelectValue placeholder={t('subcategories.noCategory')} /></SelectTrigger><SelectContent><SelectItem value="none">{t('subcategories.noCategory')}</SelectItem>{categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label required>{t('subcategories.icon')}</Label><IconPicker value={subcategoryForm.icon} color="#64748b" onChange={(icon) => setSubcategoryForm({ ...subcategoryForm, icon })} /></div>
            {formError && <p role="alert" className="text-sm text-rose-600">{formError}</p>}
            <DialogFooter><Button type="button" variant="outline" onClick={closeDialogs}>{t('common.cancel')}</Button><Button type="submit">{t('common.save')}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletingCategory)} onOpenChange={(open) => { if (!open) setDeletingCategory(null); }}>
        <DialogContent><DialogHeader><DialogTitle>{t('categories.deleteTitle')}</DialogTitle></DialogHeader><p className="text-sm text-slate-600">{t('categories.deleteConfirmation', { name: deletingCategory?.name ?? '' })}</p><DialogFooter><Button type="button" variant="outline" onClick={() => setDeletingCategory(null)}>{t('common.cancel')}</Button><Button type="button" variant="destructive" onClick={handleDeleteCategory}>{t('common.delete')}</Button></DialogFooter></DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletingSubcategory)} onOpenChange={(open) => { if (!open) setDeletingSubcategory(null); }}>
        <DialogContent><DialogHeader><DialogTitle>{t('subcategories.deleteTitle')}</DialogTitle></DialogHeader><p className="text-sm text-slate-600">{t('subcategories.deleteConfirmation', { name: deletingSubcategory?.name ?? '' })}</p><DialogFooter><Button type="button" variant="outline" onClick={() => setDeletingSubcategory(null)}>{t('common.cancel')}</Button><Button type="button" variant="destructive" onClick={handleDeleteSubcategory}>{t('common.delete')}</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}
