import type { Categoria, CategoriaInput, CategoriaResponse, Subcategoria, SubcategoriaInput } from '../types/categoria.ts';
import { api, request } from './api-client.ts';

export const categoriaApi = {
  list: (): Promise<CategoriaResponse> => request(() => api.get<CategoriaResponse>('/categorias')),
  create: (input: CategoriaInput): Promise<Categoria> => request(() => api.post<Categoria>('/categorias', input)),
  update: (id: number, input: CategoriaInput): Promise<Categoria> => request(() => api.put<Categoria>(`/categorias/${id}`, input)),
  remove: (id: number): Promise<void> => request(() => api.delete<void>(`/categorias/${id}`)),
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
