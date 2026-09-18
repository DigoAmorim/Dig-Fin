import axios from 'axios';
import type { CartaoCredito, CartaoCreditoInput } from '../types/CartaoCredito.ts';
import i18n from '../i18n/config';
import { ApiError, type ApiErrorResponse } from './ApiError.ts';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  config.headers.set('Accept-Language', i18n.language);
  return config;
});

export class CartaoCreditoApiError extends ApiError {}

async function request<T>(requestCallback: () => Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await requestCallback();
    return data;
  } catch (error) {
    let code = 'internal';
    let statusCode: number | undefined;
    let params: Record<string, unknown> = {};
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      statusCode = error.response?.status;
      code = error.response?.data?.code ?? code;
      params = error.response?.data?.params ?? params;
    }
    throw new CartaoCreditoApiError(code, statusCode, params);
  }
}

export const cartaoCreditoApi = {
  list: (): Promise<CartaoCredito[]> => request(() => api.get<CartaoCredito[]>('/cartao-credito')),

  create: (input: CartaoCreditoInput): Promise<CartaoCredito> => (
    request(() => api.post<CartaoCredito>('/cartao-credito', input))
  ),

  update: (id: string, input: CartaoCreditoInput): Promise<CartaoCredito> => (
    request(() => api.put<CartaoCredito>(`/cartao-credito/${id}`, input))
  ),

  remove: (id: string): Promise<void> => (
    request(() => api.delete<void>(`/cartao-credito/${id}`))
  ),
};