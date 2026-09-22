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
}

export const pluggyApi = {
  createConnectToken: (itemId?: string): Promise<ConnectTokenResponse> => request(() => api.post<ConnectTokenResponse>('/pluggy/connect-token', itemId ? { itemId } : {})),
  listAccounts: (itemId: string): Promise<{ results: PluggyAccount[] }> => request(() => api.get<{ results: PluggyAccount[] }>(`/pluggy/accounts/${itemId}`)),
};
