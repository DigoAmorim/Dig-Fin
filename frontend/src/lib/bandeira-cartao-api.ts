import type { BandeiraCartao, BandeiraCartaoInput } from '../types/bandeira-cartao.ts';
import { api, request } from './api-client.ts';

export const bandeiraCartaoApi = {
  list: (): Promise<BandeiraCartao[]> => request(() => api.get<BandeiraCartao[]>('/bandeira-cartao')),

  create: (input: BandeiraCartaoInput): Promise<BandeiraCartao> => (
    request(() => api.post<BandeiraCartao>('/bandeira-cartao', input))
  ),

  update: (id: number, input: BandeiraCartaoInput): Promise<BandeiraCartao> => (
    request(() => api.put<BandeiraCartao>(`/bandeira-cartao/${id}`, input))
  ),

  remove: (id: number): Promise<void> => (
    request(() => api.delete<void>(`/bandeira-cartao/${id}`))
  ),
};
