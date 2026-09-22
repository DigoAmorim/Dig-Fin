import type { Categoria, CategoriaInput, CategoriaResponse, Subcategoria, SubcategoriaInput } from '../types/Categoria.ts';
import { CrudService } from './api-service.ts';
import { api, request } from './api-client.ts';

const categoriaCrud = new CrudService<Categoria, CategoriaInput, CategoriaInput, CategoriaResponse>('/categorias');

export const categoriaApi = {
  list: categoriaCrud.list,
  create: categoriaCrud.create,
  update: categoriaCrud.update,
  remove: categoriaCrud.remove,
  createSubcategory: (input: SubcategoriaInput): Promise<Subcategoria> => (
    request(() => api.post<Subcategoria>('/categorias/subcategorias', input))
  ),
  updateSubcategory: (id: number, input: SubcategoriaInput): Promise<Subcategoria> => (
    request(() => api.put<Subcategoria>(`/categorias/subcategorias/${id}`, input))
  ),
  removeSubcategory: (id: number): Promise<void> => (
    request(() => api.delete<void>(`/categorias/subcategorias/${id}`))
  ),
};
