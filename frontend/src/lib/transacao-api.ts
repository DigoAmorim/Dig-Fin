import type { Transacao, TransacaoInput } from '../types/transacao.ts';
import { CrudService } from './api-service.ts';
import { api, request } from './api-client.ts';

const transacaoCrud = new CrudService<Transacao, TransacaoInput, TransacaoInput, Transacao[], Transacao[]>('/transacoes');

export const transacaoApi = {
  list: transacaoCrud.list,
  create: transacaoCrud.create,
  remove: (id: string): Promise<void> => request(() => api.delete<void>(`/transacoes/${id}`)),
};
