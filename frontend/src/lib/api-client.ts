import axios, { type AxiosInstance } from 'axios';
import i18n from '../i18n/config';
import { ApiError, type ApiErrorResponse } from './api-error.ts';

const api: AxiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  config.headers.set('Accept-Language', i18n.language);
  return config;
});

export async function request<T>(requestCallback: () => Promise<{ data: T }>): Promise<T> {
  try {
    return (await requestCallback()).data;
  } catch (error) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw new ApiError(
        error.response?.data?.code ?? 'internal',
        error.response?.status,
        error.response?.data?.params,
      );
    }
    throw new ApiError('internal');
  }
}

export { api };
