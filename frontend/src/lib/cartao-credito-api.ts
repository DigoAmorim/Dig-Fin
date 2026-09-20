import type { CartaoCredito, CartaoCreditoInput } from '../types/cartao-credito.ts';
import { api, request } from './api-client.ts';

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