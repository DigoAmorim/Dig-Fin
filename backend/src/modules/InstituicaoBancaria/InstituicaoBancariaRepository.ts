import type { QueryResultRow } from 'pg';
import { pool } from '../../../database/Pool';
import type { InstituicaoBancaria, InstituicaoBancariaInput } from './InstituicaoBancariaTypes';

interface InstituicaoBancariaRow extends QueryResultRow {
    id: number;
    name: string;
}

const instituicaoBancariaSelect = `
    SELECT id, nome AS name
    FROM digfin.instituicao_bancaria
`;

export class InstituicaoBancariaRepository {
    constructor(private readonly contaId: string) {}

    async findAll(): Promise<InstituicaoBancaria[]> {
        const result = await pool.query<InstituicaoBancariaRow>(
            `${instituicaoBancariaSelect} WHERE conta_id = $1 ORDER BY nome`,
            [this.contaId],
        );
        return result.rows;
    }

    async create(input: InstituicaoBancariaInput): Promise<InstituicaoBancaria> {
        const result = await pool.query<InstituicaoBancariaRow>(
            `
                INSERT INTO digfin.instituicao_bancaria (conta_id, nome)
                VALUES ($1, $2)
                RETURNING id, nome AS name
            `,
            [this.contaId, input.name],
        );
        const instituicao = result.rows[0];
        if (!instituicao) {
            throw new Error('Não foi possível criar a instituição bancária.');
        }
        return instituicao;
    }

    async update(id: number, input: InstituicaoBancariaInput): Promise<InstituicaoBancaria | null> {
        const result = await pool.query<InstituicaoBancariaRow>(
            `
                UPDATE digfin.instituicao_bancaria
                SET nome = $1
                WHERE id = $2 AND conta_id = $3
                RETURNING id, nome AS name
            `,
            [input.name, id, this.contaId],
        );
        return result.rows[0] ?? null;
    }

    async delete(id: number): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM digfin.instituicao_bancaria WHERE id = $1 AND conta_id = $2',
            [id, this.contaId],
        );
        return result.rowCount === 1;
    }
}
