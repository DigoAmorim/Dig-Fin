import type { InstituicaoBancaria, InstituicaoBancariaInput } from '../types/instituicao-bancaria.ts';
import { CrudService } from './api-service.ts';

export const instituicaoBancariaApi = new CrudService<InstituicaoBancaria, InstituicaoBancariaInput, InstituicaoBancariaInput>('/instituicao-bancaria');
