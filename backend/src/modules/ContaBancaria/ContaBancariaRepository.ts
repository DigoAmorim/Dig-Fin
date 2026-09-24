import type { QueryResultRow } from 'pg';
import { pool } from '../../../database/Pool';
import type { ContaBancaria, ContaBancariaInput } from './ContaBancariaTypes';

interface ContaBancariaRow extends QueryResultRow {
    id: string;
    name: string;
    bankInstitutionId: string;
    bankInstitutionName: string;
    pluggyAccountId: string | null;
    pluggyStatus: 'nao_sincronizada' | 'sincronizada';
}

const contaBancariaSelect = `
    SELECT
        cb.id::text AS id,
        cb.nome AS name,
        cb.instituicao_bancaria_id::text AS "bankInstitutionId",
        ib.nome AS "bankInstitutionName",
        cb.pluggy_account_id AS "pluggyAccountId",
        cb.pluggy_status AS "pluggyStatus"
    FROM digfin.conta_bancaria cb
    INNER JOIN digfin.instituicao_bancaria ib ON ib.id = cb.instituicao_bancaria_id AND ib.conta_id = cb.conta_id
`;

export class ContaBancariaRepository {
    constructor(private readonly contaId: string) {}

    async findAll(): Promise<ContaBancaria[]> {
        const result = await pool.query<ContaBancariaRow>(
            `${contaBancariaSelect} WHERE cb.conta_id = $1 ORDER BY cb.nome`,
            [this.contaId],
        );
        return result.rows;
    }

    async create(input: ContaBancariaInput): Promise<ContaBancaria | null> {
        const result = await pool.query<ContaBancariaRow>(
            `
                INSERT INTO digfin.conta_bancaria (
                    conta_id, nome, instituicao_bancaria_id, pluggy_status
                )
                SELECT $1, $2, ib.id, 'nao_sincronizada'
                FROM digfin.instituicao_bancaria ib
                WHERE ib.id = $3 AND ib.conta_id = $1
                RETURNING
                    id::text AS id,
                    nome AS name,
                    instituicao_bancaria_id::text AS "bankInstitutionId",
                    (SELECT nome FROM digfin.instituicao_bancaria WHERE id = instituicao_bancaria_id AND conta_id = $1) AS "bankInstitutionName",
                    pluggy_account_id AS "pluggyAccountId",
                    pluggy_status AS "pluggyStatus"
            `,
            [this.contaId, input.name, input.bankInstitutionId],
        );
        return result.rows[0] ?? null;
    }

    async update(id: string, input: ContaBancariaInput): Promise<ContaBancaria | null> {
        const result = await pool.query<ContaBancariaRow>(
            `
                UPDATE digfin.conta_bancaria cb
                SET nome = $1,
                    instituicao_bancaria_id = $2,
                    pluggy_account_id = NULL,
                    pluggy_status = 'nao_sincronizada',
                    atualizado_em = NOW()
                WHERE cb.id = $3
                  AND cb.conta_id = $4
                  AND EXISTS (
                      SELECT 1
                      FROM digfin.instituicao_bancaria ib
                      WHERE ib.id = $2 AND ib.conta_id = $4
                  )
                RETURNING
                    cb.id::text AS id,
                    cb.nome AS name,
                    cb.instituicao_bancaria_id::text AS "bankInstitutionId",
                    (SELECT nome FROM digfin.instituicao_bancaria WHERE id = cb.instituicao_bancaria_id AND conta_id = $4) AS "bankInstitutionName",
                    cb.pluggy_account_id AS "pluggyAccountId",
                    cb.pluggy_status AS "pluggyStatus"
            `,
            [input.name, input.bankInstitutionId, id, this.contaId],
        );
        return result.rows[0] ?? null;
    }

    async updatePluggyStatus(id: string, pluggyAccountId: string, status: 'nao_sincronizada' | 'sincronizada'): Promise<ContaBancaria | null> {
        const result = await pool.query<ContaBancariaRow>(
            `
                UPDATE digfin.conta_bancaria cb
                SET pluggy_account_id = $1,
                    pluggy_status = $2,
                    atualizado_em = NOW()
                WHERE cb.id = $3 AND cb.conta_id = $4
                RETURNING
                    cb.id::text AS id,
                    cb.nome AS name,
                    cb.instituicao_bancaria_id::text AS "bankInstitutionId",
                    (SELECT nome FROM digfin.instituicao_bancaria WHERE id = cb.instituicao_bancaria_id AND conta_id = $4) AS "bankInstitutionName",
                    cb.pluggy_account_id AS "pluggyAccountId",
                    cb.pluggy_status AS "pluggyStatus"
            `,
            [pluggyAccountId, status, id, this.contaId],
        );
        return result.rows[0] ?? null;
    }

    async clearPluggySync(id: string): Promise<void> {
        await pool.query(
            `UPDATE digfin.conta_bancaria SET pluggy_account_id = NULL, pluggy_status = 'nao_sincronizada', atualizado_em = NOW() WHERE id = $1 AND conta_id = $2`,
            [id, this.contaId],
        );
    }

    async delete(id: string): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM digfin.conta_bancaria WHERE id = $1 AND conta_id = $2',
            [id, this.contaId],
        );
        return result.rowCount === 1;
    }
}
