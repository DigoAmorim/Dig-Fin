import { api, request } from './api-client.ts';

interface ConnectTokenResponse {
  accessToken: string;
}

export interface PluggyAccount {
  id: string;
  name: string;
  balance: number;
  currencyCode: string;
  marketingName?: string | null;
  subtype?: string | null;
  number?: string | null;
}

export interface PluggySyncResponse {
  matched: number;
  total: number;
  updated: Array<{ id: string; pluggyAccountId: string; status: 'sincronizada' | 'nao_sincronizada' }>;
}

export interface PluggyTransactionSyncResponse {
  totalAccounts: number;
  imported: number;
  removed: number;
  skipped: number;
}

export const pluggyApi = {
  createConnectToken: (itemId?: string): Promise<ConnectTokenResponse> => request(() => api.post<ConnectTokenResponse>('/pluggy/connect-token', itemId ? { itemId } : {})),
  listAccounts: (itemId: string): Promise<{ results: PluggyAccount[] }> => request(() => api.get<{ results: PluggyAccount[] }>(`/pluggy/accounts/${itemId}`)),
  syncBankAccounts: (itemId: string): Promise<PluggySyncResponse> => request(() => api.post<PluggySyncResponse>('/pluggy/sync-accounts', { itemId })),
  syncTransactions: (from: string, to: string): Promise<PluggyTransactionSyncResponse> => request(() => api.post<PluggyTransactionSyncResponse>('/pluggy/sync-transactions', { from, to })),
};
