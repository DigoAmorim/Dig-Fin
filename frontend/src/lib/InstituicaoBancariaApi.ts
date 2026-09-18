import axios from 'axios';
import type { InstituicaoBancaria, InstituicaoBancariaInput } from '../types/InstituicaoBancaria.ts';
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

export class InstituicaoBancariaApiError extends ApiError {}

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
    throw new InstituicaoBancariaApiError(code, statusCode, params);
  }
}

export const instituicaoBancariaApi = {
  list: (): Promise<InstituicaoBancaria[]> => request(() => api.get<InstituicaoBancaria[]>('/instituicao-bancaria')),

  create: (input: InstituicaoBancariaInput): Promise<InstituicaoBancaria> => (
    request(() => api.post<InstituicaoBancaria>('/instituicao-bancaria', input))
  ),

  update: (id: number, input: InstituicaoBancariaInput): Promise<InstituicaoBancaria> => (
    request(() => api.put<InstituicaoBancaria>(`/instituicao-bancaria/${id}`, input))
  ),

  remove: (id: number): Promise<void> => (
    request(() => api.delete<void>(`/instituicao-bancaria/${id}`))
  ),
};
