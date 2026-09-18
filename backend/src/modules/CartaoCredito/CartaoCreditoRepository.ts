import type { QueryResultRow } from 'pg';
import { pool } from '../../../database/Pool';
import type { CartaoCredito, CartaoCreditoInput } from './CartaoCreditoTypes';

interface CartaoCreditoRow extends QueryResultRow {
    id: string;
    name: string;
    cardBrandId: string;
    cardBrandDescription: string;
    dueDay: number;
}

const cartaoCreditoSelect = `
    SELECT
        cc.id::text AS id,
        cc.nome AS name,
        cc.bandeira_cartao_id::text AS "cardBrandId",
        bc.descricao AS "cardBrandDescription",
        cc.dia_vencimento AS "dueDay"
    FROM digfin.cartao_credito cc
    INNER JOIN digfin.bandeira_cartao bc ON bc.id = cc.bandeira_cartao_id
`;

export class CartaoCreditoRepository {
    constructor(private readonly contaId: string) {}

    async findAll(): Promise<CartaoCredito[]> {
        const result = await pool.query<CartaoCreditoRow>(
            `${cartaoCreditoSelect} WHERE cc.conta_id = $1 ORDER BY cc.nome`,
            [this.contaId],
        );
        return result.rows;
    }

    async create(input: CartaoCreditoInput): Promise<CartaoCredito | null> {
        const result = await pool.query<CartaoCreditoRow>(
            `
                INSERT INTO digfin.cartao_credito (
                    conta_id, nome, bandeira_cartao_id, dia_vencimento
                )
                SELECT $1, $3, bc.id, $4
                FROM digfin.bandeira_cartao bc
                WHERE bc.id = $2 AND bc.conta_id = $1
                RETURNING
                    id::text AS id,
                    nome AS name,
                    bandeira_cartao_id::text AS "cardBrandId",
                    (SELECT descricao FROM digfin.bandeira_cartao WHERE id = bandeira_cartao_id) AS "cardBrandDescription",
                    dia_vencimento AS "dueDay"
            `,
            [this.contaId, input.cardBrandId, input.name, input.dueDay],
        );
        return result.rows[0] ?? null;
    }

    async update(id: string, input: CartaoCreditoInput): Promise<CartaoCredito | null> {
        const result = await pool.query<CartaoCreditoRow>(
            `
                UPDATE digfin.cartao_credito cc
                SET nome = $1,
                    bandeira_cartao_id = $2,
                    dia_vencimento = $3,
                    atualizado_em = NOW()
                WHERE cc.id = $4
                  AND cc.conta_id = $5
                  AND EXISTS (
                      SELECT 1
                      FROM digfin.bandeira_cartao bc
                      WHERE bc.id = $2 AND bc.conta_id = $5
                  )
                RETURNING
                    cc.id::text AS id,
                    cc.nome AS name,
                    cc.bandeira_cartao_id::text AS "cardBrandId",
                    (SELECT descricao FROM digfin.bandeira_cartao WHERE id = cc.bandeira_cartao_id) AS "cardBrandDescription",
                    cc.dia_vencimento AS "dueDay"
            `,
            [input.name, input.cardBrandId, input.dueDay, id, this.contaId],
        );
        return result.rows[0] ?? null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM digfin.cartao_credito WHERE id = $1 AND conta_id = $2',
            [id, this.contaId],
        );
        return result.rowCount === 1;
    }
}
