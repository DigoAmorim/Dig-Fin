import { env } from '../../config/Env';
import { ErroAplicacao } from '../../shared/errors/AppError';
import { CategoriaRepository } from './CategoriaRepository';
import type { Categoria, CategoriaInput, CategoriaResponse, Subcategoria, SubcategoriaInput } from './CategoriaTypes';
import { isPostgresError } from '../../shared/database/PostgresError';

export class CategoriaService {
    constructor(private readonly repository = new CategoriaRepository(env.contaId)) {}

    async findAll(): Promise<CategoriaResponse> {
        return this.repository.findAll();
    }

    async create(input: CategoriaInput): Promise<Categoria> {
        try {
            return await this.repository.create(this.validateCategory(input));
        } catch (error) {
            this.throwConstraintError(error, 'categoryNameDuplicate');
            throw error;
        }
    }

    async update(id: number, input: CategoriaInput): Promise<Categoria> {
        try {
            const category = await this.repository.update(id, this.validateCategory(input));
            if (!category) throw new ErroAplicacao(404, 'categoryNotFound');
            return category;
        } catch (error) {
            this.throwConstraintError(error, 'categoryNameDuplicate');
            throw error;
        }
    }

    async delete(id: number): Promise<void> {
        if (!await this.repository.exists(id)) throw new ErroAplicacao(404, 'categoryNotFound');
        if (await this.repository.hasSubcategories(id)) throw new ErroAplicacao(409, 'categoryInUse');
        await this.repository.delete(id);
    }

    async createSubcategory(input: SubcategoriaInput): Promise<Subcategoria> {
        const validatedInput = this.validateSubcategory(input);
        if (validatedInput.categoryId !== null && !await this.repository.exists(validatedInput.categoryId)) {
            throw new ErroAplicacao(404, 'categoryNotFound');
        }
        try {
            return await this.repository.createSubcategory(validatedInput);
        } catch (error) {
            this.throwConstraintError(error, 'subcategoryNameDuplicate');
            throw error;
        }
    }

    async updateSubcategory(id: number, input: SubcategoriaInput): Promise<Subcategoria> {
        const validatedInput = this.validateSubcategory(input);
        if (validatedInput.categoryId !== null && !await this.repository.exists(validatedInput.categoryId)) {
            throw new ErroAplicacao(404, 'categoryNotFound');
        }
        try {
            const subcategory = await this.repository.updateSubcategory(id, validatedInput);
            if (!subcategory) throw new ErroAplicacao(404, 'subcategoryNotFound');
            return subcategory;
        } catch (error) {
            this.throwConstraintError(error, 'subcategoryNameDuplicate');
            throw error;
        }
    }

    async deleteSubcategory(id: number): Promise<void> {
        if (!await this.repository.deleteSubcategory(id)) throw new ErroAplicacao(404, 'subcategoryNotFound');
    }

    private validateCategory(input: CategoriaInput): CategoriaInput {
        return {
            name: this.validateName(input?.name, 'categoryNameRequired', 'categoryNameTooLong'),
            color: this.validateColor(input?.color),
            icon: this.validateIcon(input?.icon),
        };
    }

    private validateSubcategory(input: SubcategoriaInput): SubcategoriaInput {
        const categoryId = input?.categoryId;
        if (categoryId !== null && (!Number.isSafeInteger(categoryId) || categoryId <= 0)) {
            throw new ErroAplicacao(400, 'categoryIdInvalid');
        }
        return {
            categoryId: categoryId ?? null,
            name: this.validateName(input?.name, 'subcategoryNameRequired', 'subcategoryNameTooLong'),
            icon: this.validateIcon(input?.icon),
        };
    }

    private validateName(name: unknown, requiredCode: string, tooLongCode: string): string {
        if (typeof name !== 'string' || !name.trim()) throw new ErroAplicacao(400, requiredCode);
        if (name.trim().length > 100) throw new ErroAplicacao(400, tooLongCode);
        return name.trim();
    }

    private validateColor(color: unknown): string {
        if (typeof color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
            throw new ErroAplicacao(400, 'categoryColorInvalid');
        }
        return color.toUpperCase();
    }

    private validateIcon(icon: unknown): string {
        if (typeof icon !== 'string' || !/^[a-z0-9-]{1,50}$/.test(icon)) {
            throw new ErroAplicacao(400, 'categoryIconInvalid');
        }
        return icon;
    }

    private throwConstraintError(error: unknown, code: string): void {
        if (isPostgresError(error) && error.code === '23505') throw new ErroAplicacao(409, code);
    }
}
