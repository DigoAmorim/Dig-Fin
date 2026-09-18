import axios from 'axios';
import type { ContaBancaria, ContaBancariaInput } from '../types/ContaBancaria.ts';
import i18n from '../i18n/config';
import { ApiError, type ApiErrorResponse } from './ApiError.ts';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  config.headers.set('Accept-Language', i18n.language);
  return config;
});

export class ContaBancariaApiError extends ApiError {}

async function request<T>(requestCallback: () => Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await requestCallback();
    return data;
  } catch (error) {
    let code = 'internal';
    let statusCode: number | undefined;
    let params: Record<string, unknown> = {};
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      statusCode = error.response?.status;
      code = error.response?.data?.code ?? code;
      params = error.response?.data?.params ?? params;
    }
    throw new ContaBancariaApiError(code, statusCode, params);
  }
}

export const contaBancariaApi = {
  list: (): Promise<ContaBancaria[]> => request(() => api.get<ContaBancaria[]>('/conta-bancaria')),

  create: (input: ContaBancariaInput): Promise<ContaBancaria> => (
    request(() => api.post<ContaBancaria>('/conta-bancaria', input))
  ),

  update: (id: string, input: ContaBancariaInput): Promise<ContaBancaria> => (
    request(() => api.put<ContaBancaria>(`/conta-bancaria/${id}`, input))
  ),

  remove: (id: string): Promise<void> => (
    request(() => api.delete<void>(`/conta-bancaria/${id}`))
  ),
};
