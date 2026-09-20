import type { QueryResultRow } from 'pg';
import { pool } from '../../../database/Pool';
import type { ContaBancaria, ContaBancariaInput } from './ContaBancariaTypes';

interface ContaBancariaRow extends QueryResultRow {
    id: string;
    name: string;
    bankInstitutionId: string;
    bankInstitutionName: string;
}

const contaBancariaSelect = `
    SELECT
        cb.id::text AS id,
        cb.nome AS name,
        cb.instituicao_bancaria_id::text AS "bankInstitutionId",
        ib.nome AS "bankInstitutionName"
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
                    conta_id, nome, instituicao_bancaria_id
                )
                SELECT $1, $3, ib.id
                FROM digfin.instituicao_bancaria ib
                WHERE ib.id = $2 AND ib.conta_id = $1
                RETURNING
                    id::text AS id,
                    nome AS name,
                    instituicao_bancaria_id::text AS "bankInstitutionId",
                    (SELECT nome FROM digfin.instituicao_bancaria WHERE id = instituicao_bancaria_id AND conta_id = $1) AS "bankInstitutionName"
            `,
            [this.contaId, input.bankInstitutionId, input.name],
        );
        return result.rows[0] ?? null;
    }

    async update(id: string, input: ContaBancariaInput): Promise<ContaBancaria | null> {
        const result = await pool.query<ContaBancariaRow>(
            `
                UPDATE digfin.conta_bancaria cb
                SET nome = $1,
                    instituicao_bancaria_id = $2,
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
                    (SELECT nome FROM digfin.instituicao_bancaria WHERE id = cb.instituicao_bancaria_id AND conta_id = $4) AS "bankInstitutionName"
            `,
            [input.name, input.bankInstitutionId, id, this.contaId],
        );
        return result.rows[0] ?? null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM digfin.conta_bancaria WHERE id = $1 AND conta_id = $2',
            [id, this.contaId],
        );
        return result.rowCount === 1;
    }
}
