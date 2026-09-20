import type { ContaBancaria, ContaBancariaInput } from '../types/conta-bancaria.ts';
import { api, request } from './api-client.ts';

export const contaBancariaApi = {
  list: (): Promise<ContaBancaria[]> => request(() => api.get<ContaBancaria[]>('/conta-bancaria')),

  create: (input: ContaBancariaInput): Promise<ContaBancaria> => (
    request(() => api.post<ContaBancaria>('/conta-bancaria', input))
  ),

  update: (id: string, input: ContaBancariaInput): Promise<ContaBancaria> => (
    request(() => api.put<ContaBancaria>(`/conta-bancaria/${id}`, input))
  ),

  remove: (id: string): Promise<void> => (
    request(() => api.delete<void>(`/conta-bancaria/${id}`))
  ),
};
