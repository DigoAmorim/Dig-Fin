import type { PoolClient, QueryResultRow } from 'pg';
import { randomUUID } from 'node:crypto';
import { pool } from '../../../database/Pool';
import type { Transacao, TransacaoInput, TransacaoUpdateInput } from './TransacaoTypes';

interface TransacaoRow extends QueryResultRow {
    id: string;
    type: Transacao['type'];
    description: string;
    date: string;
    competenceDate: string;
    subcategoryId: number | null;
    subcategoryName: string | null;
    origin: Transacao['origin'];
    accountId: string | null;
    accountName: string | null;
    cardId: string | null;
    cardName: string | null;
    installment: number;
    installments: number;
    amount: string;
    installmentGroupId: string;
    pluggyTransactionId?: string | null;
}

const transactionSelect = `
    SELECT
        t.id::text AS id,
        t.tipo AS type,
        t.descricao AS description,
        t.data_lancamento::text AS date,
        t.data_competencia::text AS "competenceDate",
        t.subcategoria_id AS "subcategoryId",
        s.nome AS "subcategoryName",
        t.origem AS origin,
        t.conta_bancaria_id::text AS "accountId",
        cb.nome AS "accountName",
        t.cartao_credito_id::text AS "cardId",
        cc.nome AS "cardName",
        t.numero_parcela AS installment,
        t.total_parcelas AS installments,
        t.valor::text AS amount,
        t.grupo_parcelamento::text AS "installmentGroupId",
        t.pluggy_transaction_id AS "pluggyTransactionId"
    FROM digfin.transacao t
    LEFT JOIN digfin.subcategoria s ON s.id = t.subcategoria_id AND s.conta_id = t.conta_id
    LEFT JOIN digfin.conta_bancaria cb ON cb.id = t.conta_bancaria_id AND cb.conta_id = t.conta_id
    LEFT JOIN digfin.cartao_credito cc ON cc.id = t.cartao_credito_id AND cc.conta_id = t.conta_id
`;

const mapRow = (row: TransacaoRow): Transacao => ({ ...row, amount: Number(row.amount) });

export class TransacaoRepository {
    constructor(private readonly contaId: string) {}

    async findAll(): Promise<Transacao[]> {
        const result = await pool.query<TransacaoRow>(
            `${transactionSelect} WHERE t.conta_id = $1 ORDER BY t.data_competencia, t.id`,
            [this.contaId],
        );
        return result.rows.map(mapRow);
    }

    async create(input: TransacaoInput): Promise<Transacao[]> {
        const client = await pool.connect();
        const groupId = randomUUID();
        try {
            await client.query('BEGIN');
            const rows: Transacao[] = [];
            if (input.type === 'transfer') {
                for (const [accountId, amount] of [[input.accountId, -Math.abs(input.installmentAmount)], [input.destinationAccountId, Math.abs(input.installmentAmount)]] as const) {
                    const result = await client.query<TransacaoRow>(
                        `
                            INSERT INTO digfin.transacao (
                                conta_id, tipo, descricao, data_lancamento, data_competencia, origem, conta_bancaria_id,
                                grupo_parcelamento, numero_parcela, total_parcelas, valor
                            )
                            VALUES ($1, 'transfer', $2, $3, $3, 'transfer', $4, $5, 1, 1, $6)
                            RETURNING id::text AS id, tipo AS type, descricao AS description,
                                data_lancamento::text AS date, data_competencia::text AS "competenceDate", NULL::bigint AS "subcategoryId",
                                NULL::text AS "subcategoryName", origem AS origin,
                                conta_bancaria_id::text AS "accountId", NULL::text AS "accountName",
                                NULL::text AS "cardId", NULL::text AS "cardName", 1 AS installment,
                                1 AS installments, valor::text AS amount, grupo_parcelamento::text AS "installmentGroupId"
                        `,
                        [this.contaId, input.description, input.date, accountId, groupId, amount],
                    );
                    const created = result.rows[0];
                    if (!created) throw new Error('Could not create transfer.');
                    rows.push(mapRow(created));
                }
            } else for (let index = 0; index < input.installments; index += 1) {
                const result = await client.query<TransacaoRow>(
                    `
                        INSERT INTO digfin.transacao (
                            conta_id, tipo, descricao, data_lancamento, data_competencia, subcategoria_id,
                            origem, conta_bancaria_id, cartao_credito_id, grupo_parcelamento,
                            numero_parcela, total_parcelas, valor
                        )
                        VALUES ($1, $2, $3, $4::date, ($4::date + (($10 - 1) * INTERVAL '1 month'))::date, $5, $6, $7, $8, $9, $10, $11, $12)
                        RETURNING
                            id::text AS id, tipo AS type, descricao AS description,
                            data_lancamento::text AS date, data_competencia::text AS "competenceDate", subcategoria_id AS "subcategoryId",
                            NULL::text AS "subcategoryName", origem AS origin,
                            conta_bancaria_id::text AS "accountId", NULL::text AS "accountName",
                            cartao_credito_id::text AS "cardId", NULL::text AS "cardName",
                            numero_parcela AS installment, total_parcelas AS installments,
                            valor::text AS amount, grupo_parcelamento::text AS "installmentGroupId"
                    `,
                    [this.contaId, input.type, input.description, input.date, input.subcategoryId, input.origin, input.accountId ?? null, input.cardId ?? null, groupId, index + 1, input.installments, input.type === 'income' ? Math.abs(input.installmentAmount) : -Math.abs(input.installmentAmount)],
                );
                const created = result.rows[0];
                if (!created) throw new Error('Could not create transaction.');
                rows.push(mapRow(created));
            }
            await client.query('COMMIT');
            return this.loadCreatedRows(client, rows.map((row) => row.id));
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async update(id: string, input: TransacaoUpdateInput): Promise<Transacao | null> {
        const result = await pool.query<TransacaoRow>(
            `UPDATE digfin.transacao SET descricao = $1, data_lancamento = $2, valor = $3, atualizado_em = NOW()
             WHERE id = $4 AND conta_id = $5 RETURNING id::text AS id, tipo AS type, descricao AS description,
             data_lancamento::text AS date, data_competencia::text AS "competenceDate", subcategoria_id AS "subcategoryId", NULL::text AS "subcategoryName",
             origem AS origin, conta_bancaria_id::text AS "accountId", NULL::text AS "accountName",
             cartao_credito_id::text AS "cardId", NULL::text AS "cardName", numero_parcela AS installment,
             total_parcelas AS installments, valor::text AS amount, grupo_parcelamento::text AS "installmentGroupId"`,
            [input.description, input.date, input.amount, id, this.contaId],
        );
        return result.rows[0] ? mapRow(result.rows[0]) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await pool.query(
            `DELETE FROM digfin.transacao WHERE conta_id = $1 AND grupo_parcelamento = (
                SELECT grupo_parcelamento FROM digfin.transacao WHERE id = $2 AND conta_id = $1
            )`,
            [this.contaId, id],
        );
        return (result.rowCount ?? 0) > 0;
    }

    private async loadCreatedRows(client: PoolClient, ids: string[]): Promise<Transacao[]> {
        const result = await client.query<TransacaoRow>(
            `${transactionSelect} WHERE t.conta_id = $1 AND t.id = ANY($2::bigint[]) ORDER BY t.numero_parcela`,
            [this.contaId, ids],
        );
        return result.rows.map(mapRow);
    }
}
