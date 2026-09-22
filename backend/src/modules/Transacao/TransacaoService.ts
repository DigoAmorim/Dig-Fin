import { ErroAplicacao } from '../../shared/errors/AppError';
import { TransacaoRepository } from './TransacaoRepository';
import type { Transacao, TransacaoInput, TransacaoUpdateInput } from './TransacaoTypes';
import { isPostgresError } from '../../shared/database/PostgresError';

export class TransacaoService {
    constructor(private readonly repository: TransacaoRepository) {}

    async findAll(): Promise<Transacao[]> {
        return this.repository.findAll();
    }

    async create(input: TransacaoInput): Promise<Transacao[]> {
        const validatedInput = this.validateInput(input);
        try {
            return await this.repository.create(validatedInput);
        } catch (error) {
            this.throwConstraintError(error);
            throw error;
        }
    }

    async update(id: string, input: TransacaoUpdateInput): Promise<Transacao> {
        const validatedInput = this.validateUpdate(input);
        const transaction = await this.repository.update(id, validatedInput);
        if (!transaction) throw new ErroAplicacao(404, 'transactionNotFound');
        return transaction;
    }

    async delete(id: string): Promise<void> {
        if (!await this.repository.delete(id)) throw new ErroAplicacao(404, 'transactionNotFound');
    }

    private validateInput(input: TransacaoInput): TransacaoInput {
        if (input?.type !== 'expense' && input?.type !== 'income' && input?.type !== 'transfer') throw new ErroAplicacao(400, 'transactionTypeUnsupported');
        if (input.type === 'transfer') return this.validateTransferInput(input);
        if (typeof input?.description !== 'string' || !input.description.trim()) throw new ErroAplicacao(400, 'transactionDescriptionRequired');
        if (input.description.trim().length > 50) throw new ErroAplicacao(400, 'transactionDescriptionTooLong');
        if (!this.isDate(input?.date)) throw new ErroAplicacao(400, 'transactionDateInvalid');
        const subcategoryId = input.subcategoryId;
        if (typeof subcategoryId !== 'number' || !Number.isSafeInteger(subcategoryId) || subcategoryId <= 0) throw new ErroAplicacao(400, 'transactionSubcategoryRequired');
        const validOrigins = input.type === 'expense' ? ['card', 'pix', 'withdrawal'] : ['card_refund', 'pix', 'deposit'];
        const origin = input.origin;
        if (typeof origin !== 'string' || !validOrigins.includes(origin)) throw new ErroAplicacao(400, 'transactionOriginInvalid');
        const usesCard = origin === 'card' || origin === 'card_refund';
        if (usesCard && (typeof input.cardId !== 'string' || !input.cardId.trim())) throw new ErroAplicacao(400, 'transactionCardRequired');
        if (!usesCard && (typeof input.accountId !== 'string' || !input.accountId.trim())) throw new ErroAplicacao(400, 'transactionAccountRequired');
        if (!Number.isSafeInteger(input?.installments) || input.installments < 1 || input.installments > 999) throw new ErroAplicacao(400, 'transactionInstallmentsInvalid');
        if (!Number.isFinite(input?.installmentAmount) || input.installmentAmount <= 0) throw new ErroAplicacao(400, 'transactionAmountInvalid');
        const validatedInput: TransacaoInput = {
            ...input,
            description: input.description.trim(),
            ...(usesCard ? { cardId: input.cardId! } : { accountId: input.accountId! }),
        };
        return validatedInput;
    }

    private validateTransferInput(input: TransacaoInput): TransacaoInput {
        if (!this.isDate(input?.date)) throw new ErroAplicacao(400, 'transactionDateInvalid');
        if (typeof input.accountId !== 'string' || !input.accountId.trim()) throw new ErroAplicacao(400, 'transactionAccountRequired');
        if (typeof input.destinationAccountId !== 'string' || !input.destinationAccountId.trim()) throw new ErroAplicacao(400, 'transactionDestinationAccountRequired');
        if (input.accountId === input.destinationAccountId) throw new ErroAplicacao(400, 'transactionAccountsMustDiffer');
        if (!Number.isFinite(input.installmentAmount) || input.installmentAmount <= 0) throw new ErroAplicacao(400, 'transactionAmountInvalid');
        return {
            ...input,
            description: 'Transferência Bancária',
            origin: 'transfer',
            installments: 1,
            accountId: input.accountId,
            destinationAccountId: input.destinationAccountId,
        };
    }

    private validateUpdate(input: TransacaoUpdateInput): TransacaoUpdateInput {
        if (typeof input?.description !== 'string' || !input.description.trim()) throw new ErroAplicacao(400, 'transactionDescriptionRequired');
        if (input.description.trim().length > 50) throw new ErroAplicacao(400, 'transactionDescriptionTooLong');
        if (!this.isDate(input?.date)) throw new ErroAplicacao(400, 'transactionDateInvalid');
        if (!Number.isFinite(input?.amount) || input.amount === 0) throw new ErroAplicacao(400, 'transactionAmountInvalid');
        return { description: input.description.trim(), date: input.date, amount: input.amount };
    }

    private isDate(value: unknown): value is string {
        return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`));
    }

    private throwConstraintError(error: unknown): void {
        if (isPostgresError(error) && error.code === '23503') throw new ErroAplicacao(404, 'transactionReferenceNotFound');
        if (isPostgresError(error) && error.code === '23514') throw new ErroAplicacao(400, 'transactionBusinessRuleViolation');
    }
}
