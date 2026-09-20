import type { InstituicaoBancaria, InstituicaoBancariaInput } from '../types/instituicao-bancaria.ts';
import { api, request } from './api-client.ts';

export const instituicaoBancariaApi = {
  list: (): Promise<InstituicaoBancaria[]> => request(() => api.get<InstituicaoBancaria[]>('/instituicao-bancaria')),

  create: (input: InstituicaoBancariaInput): Promise<InstituicaoBancaria> => (
    request(() => api.post<InstituicaoBancaria>('/instituicao-bancaria', input))
  ),

  update: (id: number, input: InstituicaoBancariaInput): Promise<InstituicaoBancaria> => (
    request(() => api.put<InstituicaoBancaria>(`/instituicao-bancaria/${id}`, input))
  ),

  remove: (id: number): Promise<void> => (
    request(() => api.delete<void>(`/instituicao-bancaria/${id}`))
  ),
};
