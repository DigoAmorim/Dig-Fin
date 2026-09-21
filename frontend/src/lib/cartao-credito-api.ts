import type { CartaoCredito, CartaoCreditoInput } from '../types/cartao-credito.ts';
import { CrudService } from './api-service.ts';

export const cartaoCreditoApi = new CrudService<CartaoCredito, CartaoCreditoInput, CartaoCreditoInput>('/cartao-credito');