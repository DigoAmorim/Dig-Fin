import type { Transacao, TransacaoInput } from '../types/transacao.ts';
import { api, request } from './api-client.ts';

export const transacaoApi = {
  list: (): Promise<Transacao[]> => request(() => api.get<Transacao[]>('/transacoes')),
  create: (input: TransacaoInput): Promise<Transacao[]> => request(() => api.post<Transacao[]>('/transacoes', input)),
};
