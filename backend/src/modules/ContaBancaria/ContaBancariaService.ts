import { ErroAplicacao } from '../../shared/errors/AppError';
import { env } from '../../config/Env';
import { ContaBancariaRepository } from './ContaBancariaRepository';
import type { ContaBancaria, ContaBancariaInput } from './ContaBancariaTypes';

export class ContaBancariaService {
    constructor(private readonly repository = new ContaBancariaRepository(env.contaId)) {}

    async findAll(): Promise<ContaBancaria[]> {
        return this.repository.findAll();
    }

    async create(input: ContaBancariaInput): Promise<ContaBancaria> {
        const validatedInput = this.validateInput(input);
        const account = await this.repository.create(validatedInput);
        if (!account) {
            throw new ErroAplicacao(404, 'selectedBankInstitutionNotFound');
        }
        return account;
    }

    async update(id: string, input: ContaBancariaInput): Promise<ContaBancaria> {
        const validatedInput = this.validateInput(input);
        const account = await this.repository.update(id, validatedInput);
        if (!account) {
            throw new ErroAplicacao(404, 'bankAccountOrInstitutionNotFound');
        }
        return account;
    }

    async delete(id: string): Promise<void> {
        const deleted = await this.repository.delete(id);
        if (!deleted) {
            throw new ErroAplicacao(404, 'bankAccountNotFound');
        }
    }

    private validateInput(input: ContaBancariaInput): ContaBancariaInput {
        if (typeof input?.name !== 'string' || !input.name.trim()) {
            throw new ErroAplicacao(400, 'bankAccountNameRequired');
        }
        if (input.name.trim().length > 100) {
            throw new ErroAplicacao(400, 'bankAccountNameTooLong');
        }
        if (typeof input?.bankInstitutionId !== 'string' || !input.bankInstitutionId.trim()) {
            throw new ErroAplicacao(400, 'bankAccountInstitutionRequired');
        }
        return {
            name: input.name.trim(),
            bankInstitutionId: input.bankInstitutionId,
        };
    }
}
