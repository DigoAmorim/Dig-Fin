import { ErroAplicacao } from '../../shared/errors/AppError';
import { env } from '../../config/Env';
import { BandeiraCartaoRepository } from './BandeiraCartaoRepository';
import type { BandeiraCartao, BandeiraCartaoInput } from './BandeiraCartaoTypes';

export class BandeiraCartaoService {
    constructor(private readonly repository = new BandeiraCartaoRepository(env.contaId)) {}

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
                throw new ErroAplicacao(404, 'Bandeira não encontrada.');
            }
            return bandeiraCartao;
        } catch (error) {
            this.throwConstraintError(error);
            throw error;
        }
    }

    async delete(id: number): Promise<void> {
        const deleted = await this.repository.delete(id);
        if (!deleted) {
            throw new ErroAplicacao(404, 'Bandeira não encontrada.');
        }
    }

    private validateDescription(description: unknown): string {
        if (typeof description !== 'string' || !description.trim()) {
            throw new ErroAplicacao(400, 'A descrição é obrigatória.');
        }
        if (description.trim().length > 50) {
            throw new ErroAplicacao(400, 'A descrição deve ter no máximo 50 caracteres.');
        }
        return description.trim();
    }

    private throwConstraintError(error: unknown): void {
        if (isPostgresError(error) && error.code === '23505') {
            throw new ErroAplicacao(409, 'Já existe uma bandeira com essa descrição.');
        }
    }
}

interface PostgresError {
    code?: string;
}

const isPostgresError = (error: unknown): error is PostgresError => (
    typeof error === 'object' && error !== null && 'code' in error
);
