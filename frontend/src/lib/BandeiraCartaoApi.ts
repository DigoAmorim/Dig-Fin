import axios from 'axios';
import type { BandeiraCartao, BandeiraCartaoInput } from '../types/BandeiraCartao.ts';
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

export class BandeiraCartaoApiError extends ApiError {}

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
    throw new BandeiraCartaoApiError(code, statusCode, params);
  }
}

export const bandeiraCartaoApi = {
  list: (): Promise<BandeiraCartao[]> => request(() => api.get<BandeiraCartao[]>('/bandeira-cartao')),

  create: (input: BandeiraCartaoInput): Promise<BandeiraCartao> => (
    request(() => api.post<BandeiraCartao>('/bandeira-cartao', input))
  ),

  update: (id: number, input: BandeiraCartaoInput): Promise<BandeiraCartao> => (
    request(() => api.put<BandeiraCartao>(`/bandeira-cartao/${id}`, input))
  ),

  remove: (id: number): Promise<void> => (
    request(() => api.delete<void>(`/bandeira-cartao/${id}`))
  ),
};
