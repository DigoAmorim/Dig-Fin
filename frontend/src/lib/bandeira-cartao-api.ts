import type { BandeiraCartao, BandeiraCartaoInput } from '../types/bandeira-cartao.ts';
import { CrudService } from './api-service.ts';

export const bandeiraCartaoApi = new CrudService<BandeiraCartao, BandeiraCartaoInput, BandeiraCartaoInput>('/bandeira-cartao');
