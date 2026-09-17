import { env } from '../../config/Env';
import { ErroAplicacao } from '../../shared/errors/AppError';
import { CartaoCreditoRepository } from './CartaoCreditoRepository';
import type { CartaoCredito, CartaoCreditoInput } from './CartaoCreditoTypes';

export class CartaoCreditoService {
    constructor(private readonly repository = new CartaoCreditoRepository(env.contaId)) {}

    async findAll(): Promise<CartaoCredito[]> {
        return this.repository.findAll();
    }

    async create(input: CartaoCreditoInput): Promise<CartaoCredito> {
        const validatedInput = this.validateInput(input);
        const card = await this.repository.create(validatedInput);
        if (!card) {
            throw new ErroAplicacao(404, 'A bandeira selecionada não foi encontrada.');
        }
        return card;
    }

    async update(id: string, input: CartaoCreditoInput): Promise<CartaoCredito> {
        const validatedInput = this.validateInput(input);
        const card = await this.repository.update(id, validatedInput);
        if (!card) {
            throw new ErroAplicacao(404, 'Cartão de crédito ou bandeira não encontrada.');
        }
        return card;
    }

    async delete(id: string): Promise<void> {
        const deleted = await this.repository.delete(id);
        if (!deleted) {
            throw new ErroAplicacao(404, 'Cartão de crédito não encontrado.');
        }
    }

    private validateInput(input: CartaoCreditoInput): CartaoCreditoInput {
        if (typeof input?.name !== 'string' || !input.name.trim()) {
            throw new ErroAplicacao(400, 'O nome do cartão é obrigatório.');
        }
        if (input.name.trim().length > 50) {
            throw new ErroAplicacao(400, 'O nome do cartão deve ter no máximo 50 caracteres.');
        }
        if (typeof input?.cardBrandId !== 'string' || !input.cardBrandId.trim()) {
            throw new ErroAplicacao(400, 'A bandeira do cartão é obrigatória.');
        }
        if (!Number.isInteger(input.dueDay) || input.dueDay < 1 || input.dueDay > 31) {
            throw new ErroAplicacao(400, 'O dia de vencimento deve estar entre 1 e 31.');
        }
        return {
            name: input.name.trim(),
            cardBrandId: input.cardBrandId,
            dueDay: input.dueDay,
        };
    }
}
