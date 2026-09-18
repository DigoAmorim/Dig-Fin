import axios from 'axios';
import type { Categoria, CategoriaInput, CategoriaResponse, Subcategoria, SubcategoriaInput } from '../types/Categoria.ts';
import i18n from '../i18n/config';
import { ApiError, type ApiErrorResponse } from './ApiError.ts';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  config.headers.set('Accept-Language', i18n.language);
  return config;
});

async function request<T>(requestCallback: () => Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await requestCallback();
    return data;
  } catch (error) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw new ApiError(
        error.response?.data?.code ?? 'internal',
        error.response?.status,
        error.response?.data?.params,
      );
    }
    throw new ApiError('internal');
  }
}

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
