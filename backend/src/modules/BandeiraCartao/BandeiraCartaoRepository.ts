import type { QueryResultRow } from 'pg';
import { pool } from '../../database/Pool';
import type { BandeiraCartao, BandeiraCartaoInput } from './BandeiraCartaoTypes';

interface BandeiraCartaoRow extends QueryResultRow {
    id: number;
    description: string;
}

const bandeiraCartaoSelect = `
    SELECT id, descricao AS description
    FROM digfin.bandeira_cartao
`;

export class BandeiraCartaoRepository {
    constructor(private readonly contaId: string) {}

    async findAll(): Promise<BandeiraCartao[]> {
        const result = await pool.query<BandeiraCartaoRow>(
            `${bandeiraCartaoSelect} WHERE conta_id = $1 ORDER BY descricao`,
            [this.contaId],
        );
        return result.rows;
    }

    async create(input: BandeiraCartaoInput): Promise<BandeiraCartao> {
        const result = await pool.query<BandeiraCartaoRow>(
            `
                INSERT INTO digfin.bandeira_cartao (conta_id, descricao)
                VALUES ($1, $2)
                RETURNING id, descricao AS description
            `,
            [this.contaId, input.description],
        );
        const bandeiraCartao = result.rows[0];
        if (!bandeiraCartao) {
            throw new Error('Não foi possível criar a bandeira.');
        }
        return bandeiraCartao;
    }

    async update(id: number, input: BandeiraCartaoInput): Promise<BandeiraCartao | null> {
        const result = await pool.query<BandeiraCartaoRow>(
            `
                UPDATE digfin.bandeira_cartao
                SET descricao = $1
                WHERE id = $2 AND conta_id = $3
                RETURNING id, descricao AS description
            `,
            [input.description, id, this.contaId],
        );
        return result.rows[0] ?? null;
    }

    async delete(id: number): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM digfin.bandeira_cartao WHERE id = $1 AND conta_id = $2',
            [id, this.contaId],
        );
        return result.rowCount === 1;
    }
}
