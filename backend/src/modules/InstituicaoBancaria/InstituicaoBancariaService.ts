import { ErroAplicacao } from '../../shared/errors/AppError';
import { env } from '../../config/Env';
import { InstituicaoBancariaRepository } from './InstituicaoBancariaRepository';
import type { InstituicaoBancaria, InstituicaoBancariaInput } from './InstituicaoBancariaTypes';

export class InstituicaoBancariaService {
    constructor(private readonly repository = new InstituicaoBancariaRepository(env.contaId)) {}

    async findAll(): Promise<InstituicaoBancaria[]> {
        return this.repository.findAll();
    }

    async create(input: InstituicaoBancariaInput): Promise<InstituicaoBancaria> {
        const name = this.validateName(input?.name);
        try {
            return await this.repository.create({ name });
        } catch (error) {
            this.throwConstraintError(error);
            throw error;
        }
    }

    async update(id: number, input: InstituicaoBancariaInput): Promise<InstituicaoBancaria> {
        const name = this.validateName(input?.name);
        try {
            const instituicao = await this.repository.update(id, { name });
            if (!instituicao) {
                throw new ErroAplicacao(404, 'bankInstitutionNotFound');
            }
            return instituicao;
        } catch (error) {
            this.throwConstraintError(error);
            throw error;
        }
    }

    async delete(id: number): Promise<void> {
        try {
            const deleted = await this.repository.delete(id);
            if (!deleted) {
                throw new ErroAplicacao(404, 'bankInstitutionNotFound');
            }
        } catch (error) {
            if (isPostgresError(error) && (error.code === '23503')) {
                throw new ErroAplicacao(409, 'bankInstitutionInUse');
            }
            throw error;
        }
    }

    private validateName(name: unknown): string {
        if (typeof name !== 'string' || !name.trim()) {
            throw new ErroAplicacao(400, 'bankInstitutionNameRequired');
        }
        if (name.trim().length > 100) {
            throw new ErroAplicacao(400, 'bankInstitutionNameTooLong');
        }
        return name.trim();
    }

    private throwConstraintError(error: unknown): void {
        if (isPostgresError(error) && error.code === '23505') {
            throw new ErroAplicacao(409, 'bankInstitutionNameDuplicate');
        }
    }
}

interface PostgresError {
    code?: string;
}

const isPostgresError = (error: unknown): error is PostgresError => (
    typeof error === 'object' && error !== null && 'code' in error
);
