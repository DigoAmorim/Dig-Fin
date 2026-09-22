import { PluggyClient } from 'pluggy-sdk';
import { env } from '../../config/Env';
import { ErroAplicacao } from '../../shared/errors/AppError';

export class PluggyService {
    private readonly client = env.pluggyClientId && env.pluggyClientSecret
        ? new PluggyClient({
            clientId: env.pluggyClientId,
            clientSecret: env.pluggyClientSecret,
            ...(env.pluggyBaseUrl ? { baseUrl: env.pluggyBaseUrl } : {}),
        })
        : null;

    async createConnectToken(clientUserId: string, itemId?: string): Promise<{ accessToken: string }> {
        if (!this.client) throw new ErroAplicacao(503, 'pluggyNotConfigured');
        return this.client.createConnectToken(itemId, { clientUserId, avoidDuplicates: true });
    }

    async listAccounts(itemId: string): Promise<{ results: Array<{ id: string; name: string; balance: number; currencyCode: string; marketingName?: string | null; subtype?: string | null; }> }> {
        if (!this.client) throw new ErroAplicacao(503, 'pluggyNotConfigured');
        const response = await this.client.fetchAccounts(itemId);
        return {
            results: response.results.map((account) => ({
                id: account.id,
                name: account.name || account.marketingName || 'Conta',
                balance: account.balance,
                currencyCode: account.currencyCode,
                marketingName: account.marketingName,
                subtype: account.subtype,
            })),
        };
    }
}