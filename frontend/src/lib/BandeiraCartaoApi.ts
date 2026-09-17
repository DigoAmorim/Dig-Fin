import axios from 'axios';
import type { BandeiraCartao, BandeiraCartaoInput } from '../types/BandeiraCartao.ts';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ApiErrorResponse {
  message?: string;
}

export class BandeiraCartaoApiError extends Error {
  readonly statusCode?: number;

  constructor(
    message: string,
    statusCode?: number,
  ) {
    super(message);
    this.name = 'BandeiraCartaoApiError';
    this.statusCode = statusCode;
  }
}

async function request<T>(requestCallback: () => Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await requestCallback();
    return data;
  } catch (error) {
    let message = 'Não foi possível concluir a operação.';
    let statusCode: number | undefined;
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      statusCode = error.response?.status;
      message = error.response?.data?.message ?? message;
    }
    throw new BandeiraCartaoApiError(message, statusCode);
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
