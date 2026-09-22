import { ErroAplicacao } from '../../shared/errors/AppError';
import { BandeiraCartaoRepository } from './BandeiraCartaoRepository';
import { isPostgresError } from '../../shared/database/PostgresError';
import type { BandeiraCartao, BandeiraCartaoInput } from './BandeiraCartaoTypes';

export class BandeiraCartaoService {
    constructor(private readonly repository: BandeiraCartaoRepository) {}

    async findAll(): Promise<BandeiraCartao[]> {
        return this.repository.findAll();
    }

    async create(input: BandeiraCartaoInput): Promise<BandeiraCartao> {
        const description = this.validateDescription(input?.description);
        try {
            return await this.repository.create({ description });
        } catch (error) {
            this.throwConstraintError(error);
            throw error;
        }
    }

    async update(id: number, input: BandeiraCartaoInput): Promise<BandeiraCartao> {
        const description = this.validateDescription(input?.description);
        try {
            const bandeiraCartao = await this.repository.update(id, { description });
            if (!bandeiraCartao) {
                throw new ErroAplicacao(404, 'cardBrandNotFound');
            }
            return bandeiraCartao;
        } catch (error) {
            this.throwConstraintError(error);
            throw error;
        }
    }

    async delete(id: number): Promise<void> {
        try {
            const deleted = await this.repository.delete(id);
            if (!deleted) {
                throw new ErroAplicacao(404, 'cardBrandNotFound');
            }
        } catch (error) {
            if (isPostgresError(error) && error.code === '23503') {
                throw new ErroAplicacao(409, 'cardBrandInUse');
            }
            throw error;
        }
    }

    private validateDescription(description: unknown): string {
        if (typeof description !== 'string' || !description.trim()) {
            throw new ErroAplicacao(400, 'cardBrandDescriptionRequired');
        }
        if (description.trim().length > 50) {
            throw new ErroAplicacao(400, 'cardBrandDescriptionTooLong');
        }
        return description.trim();
    }

    private throwConstraintError(error: unknown): void {
        if (isPostgresError(error) && error.code === '23505') {
            throw new ErroAplicacao(409, 'cardBrandDescriptionDuplicate');
        }
    }
}
