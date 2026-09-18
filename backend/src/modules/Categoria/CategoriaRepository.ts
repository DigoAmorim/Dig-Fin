import type { QueryResultRow } from 'pg';
import { pool } from '../../database/Pool';
import type { Categoria, CategoriaInput, CategoriaResponse, Subcategoria, SubcategoriaInput } from './CategoriaTypes';

interface CategoriaRow extends QueryResultRow {
    id: number;
    name: string;
    color: string;
    icon: string;
}

interface SubcategoriaRow extends QueryResultRow {
    id: number;
    categoryId: number | null;
    name: string;
    color: string;
    icon: string;
}

const categorySelect = `
    SELECT id, nome AS name, cor AS color, icone AS icon
    FROM digfin.categoria
`;

const subcategorySelect = `
    SELECT id, categoria_id AS "categoryId", nome AS name, cor AS color, icone AS icon
    FROM digfin.subcategoria
`;

export class CategoriaRepository {
    constructor(private readonly contaId: string) {}

    async findAll(): Promise<CategoriaResponse> {
        const [categories, subcategories] = await Promise.all([
            pool.query<CategoriaRow>(
                `${categorySelect} WHERE conta_id = $1 ORDER BY nome`,
                [this.contaId],
            ),
            pool.query<SubcategoriaRow>(
                `${subcategorySelect} WHERE conta_id = $1 ORDER BY nome`,
                [this.contaId],
            ),
        ]);

        return {
            categories: categories.rows.map((category) => ({
                ...category,
                subcategories: subcategories.rows.filter((subcategory) => subcategory.categoryId === category.id),
            })),
            ungroupedSubcategories: subcategories.rows.filter((subcategory) => subcategory.categoryId === null),
        };
    }

    async create(input: CategoriaInput): Promise<Categoria> {
        const result = await pool.query<CategoriaRow>(
            `
                INSERT INTO digfin.categoria (conta_id, nome, cor, icone)
                VALUES ($1, $2, $3, $4)
                RETURNING id, nome AS name, cor AS color, icone AS icon
            `,
            [this.contaId, input.name, input.color, input.icon],
        );
        const category = result.rows[0];
        if (!category) throw new Error('Could not create category.');
        return { ...category, subcategories: [] };
    }

    async update(id: number, input: CategoriaInput): Promise<Categoria | null> {
        const result = await pool.query<CategoriaRow>(
            `
                UPDATE digfin.categoria
                SET nome = $1, cor = $2, icone = $3, atualizado_em = NOW()
                WHERE id = $4 AND conta_id = $5
                RETURNING id, nome AS name, cor AS color, icone AS icon
            `,
            [input.name, input.color, input.icon, id, this.contaId],
        );
        const category = result.rows[0];
        return category ? { ...category, subcategories: [] } : null;
    }

    async exists(id: number): Promise<boolean> {
        const result = await pool.query(
            'SELECT 1 FROM digfin.categoria WHERE id = $1 AND conta_id = $2',
            [id, this.contaId],
        );
        return result.rowCount === 1;
    }

    async hasSubcategories(id: number): Promise<boolean> {
        const result = await pool.query(
            'SELECT 1 FROM digfin.subcategoria WHERE categoria_id = $1 AND conta_id = $2 LIMIT 1',
            [id, this.contaId],
        );
        return result.rowCount === 1;
    }

    async delete(id: number): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM digfin.categoria WHERE id = $1 AND conta_id = $2',
            [id, this.contaId],
        );
        return result.rowCount === 1;
    }

    async createSubcategory(input: SubcategoriaInput): Promise<Subcategoria> {
        const result = await pool.query<SubcategoriaRow>(
            `
                INSERT INTO digfin.subcategoria (conta_id, categoria_id, nome, cor, icone)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, categoria_id AS "categoryId", nome AS name, cor AS color, icone AS icon
            `,
            [this.contaId, input.categoryId, input.name, input.color, input.icon],
        );
        const subcategory = result.rows[0];
        if (!subcategory) throw new Error('Could not create subcategory.');
        return subcategory;
    }

    async updateSubcategory(id: number, input: SubcategoriaInput): Promise<Subcategoria | null> {
        const result = await pool.query<SubcategoriaRow>(
            `
                UPDATE digfin.subcategoria
                SET categoria_id = $1, nome = $2, cor = $3, icone = $4, atualizado_em = NOW()
                WHERE id = $5 AND conta_id = $6
                RETURNING id, categoria_id AS "categoryId", nome AS name, cor AS color, icone AS icon
            `,
            [input.categoryId, input.name, input.color, input.icon, id, this.contaId],
        );
        return result.rows[0] ?? null;
    }

    async deleteSubcategory(id: number): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM digfin.subcategoria WHERE id = $1 AND conta_id = $2',
            [id, this.contaId],
        );
        return result.rowCount === 1;
    }
}
