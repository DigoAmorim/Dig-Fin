import { PluggyClient } from 'pluggy-sdk';
import { pool } from '../../../database/Pool';
import { env } from '../../config/Env';
import { ErroAplicacao } from '../../shared/errors/AppError';

const normalizeText = (value: string | null | undefined): string => (value ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const normalizeAccountNumber = (value: string | null | undefined): string => normalizeText((value ?? '').replace(/[^0-9a-z]/gi, ''));

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

    async listAccounts(itemId: string): Promise<{ results: Array<{ id: string; name: string; balance: number; currencyCode: string; marketingName?: string | null; subtype?: string | null; number?: string | null; }> }> {
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
                number: account.number,
            })),
        };
    }

    async syncBankAccounts(accountId: string, itemId: string): Promise<{ matched: number; total: number; updated: Array<{ id: string; pluggyAccountId: string; status: 'sincronizada' | 'nao_sincronizada' }> }> {
        if (!this.client) throw new ErroAplicacao(503, 'pluggyNotConfigured');
        const pluggyAccounts = await this.client.fetchAccounts(itemId);
        const localAccounts = await pool.query<{ id: string; name: string; institutionName: string }>(`
            SELECT cb.id::text AS id,
                   cb.nome AS name,
                   ib.nome AS "institutionName"
            FROM digfin.conta_bancaria cb
            INNER JOIN digfin.instituicao_bancaria ib ON ib.id = cb.instituicao_bancaria_id AND ib.conta_id = cb.conta_id
            WHERE cb.conta_id = $1
            ORDER BY cb.nome
        `, [accountId]);

        const updated: Array<{ id: string; pluggyAccountId: string; status: 'sincronizada' | 'nao_sincronizada' }> = [];

        for (const localAccount of localAccounts.rows) {
            const normalizedInstitution = normalizeText(localAccount.institutionName);
            const normalizedAccountName = normalizeText(localAccount.name);
            const match = pluggyAccounts.results.find((pluggyAccount) => {
                const institutionCandidates = [pluggyAccount.marketingName, pluggyAccount.name, pluggyAccount.subtype]
                    .map((value) => normalizeText(value))
                    .filter(Boolean);
                const accountCandidates = [pluggyAccount.name, pluggyAccount.marketingName, pluggyAccount.number]
                    .map((value) => normalizeText(value))
                    .filter(Boolean);

                const institutionMatches = institutionCandidates.some((candidate) =>
                    candidate === normalizedInstitution
                    || normalizedInstitution.includes(candidate)
                    || candidate.includes(normalizedInstitution),
                );
                const accountNameMatches = accountCandidates.some((candidate) =>
                    candidate === normalizedAccountName
                    || normalizedAccountName.includes(candidate)
                    || candidate.includes(normalizedAccountName),
                );

                return institutionMatches && accountNameMatches;
            });

            const nextStatus: 'nao_sincronizada' | 'sincronizada' = match ? 'sincronizada' : 'nao_sincronizada';
            const nextPluggyAccountId = match ? match.id : null;

            await pool.query(
                `UPDATE digfin.conta_bancaria
                 SET pluggy_account_id = $1,
                     pluggy_status = $2,
                     atualizado_em = NOW()
                 WHERE id = $3 AND conta_id = $4`,
                [nextPluggyAccountId, nextStatus, localAccount.id, accountId],
            );

            if (match) {
                updated.push({ id: localAccount.id, pluggyAccountId: match.id, status: 'sincronizada' });
            }
        }

        return {
            matched: updated.length,
            total: localAccounts.rowCount ?? 0,
            updated,
        };
    }
}