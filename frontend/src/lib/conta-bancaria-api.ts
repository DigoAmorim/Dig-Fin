import type { ContaBancaria, ContaBancariaInput } from '../types/conta-bancaria.ts';
import { CrudService } from './api-service.ts';

export const contaBancariaApi = new CrudService<ContaBancaria, ContaBancariaInput, ContaBancariaInput>('/conta-bancaria');
