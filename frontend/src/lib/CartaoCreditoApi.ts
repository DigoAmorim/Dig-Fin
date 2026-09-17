import axios from 'axios';
import type { CartaoCredito, CartaoCreditoInput } from '../types/CartaoCredito.ts';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ApiErrorResponse {
  message?: string;
}

export class CartaoCreditoApiError extends Error {
  readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'CartaoCreditoApiError';
    this.statusCode = statusCode;
  }
}

async function request<T>(requestCallback: () => Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await requestCallback();
    return data;
  } catch (error) {
    let message = 'Não foi possível concluir a operação.';
    let statusCode: number | undefined;
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      statusCode = error.response?.status;
      message = error.response?.data?.message ?? message;
    }
    throw new CartaoCreditoApiError(message, statusCode);
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