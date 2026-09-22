import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import i18n from '../i18n/config';
import { ApiError, type ApiErrorResponse } from './api-error.ts';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
  }
}

const api: AxiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let refreshPromise: Promise<void> | null = null;

// Cookies HttpOnly nao podem ser lidos pelo JavaScript. O cookie CSRF e a
// excecao intencional: ele nao autentica ninguem, apenas permite a verificacao
// de que a requisicao mutavel partiu do frontend esperado.
function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  const value = document.cookie.split('; ').find((cookie) => cookie.startsWith(prefix));
  return value ? decodeURIComponent(value.slice(prefix.length)) : null;
}

export async function ensureCsrfToken(): Promise<void> {
  if (readCookie('digfin_csrf')) return;
  await api.get('/auth/csrf-token', { skipAuthRefresh: true });
}

function isMutatingRequest(config: InternalAxiosRequestConfig): boolean {
  return ['post', 'put', 'patch', 'delete'].includes((config.method ?? 'get').toLowerCase());
}

api.interceptors.request.use((config) => {
  config.headers.set('Accept-Language', i18n.language);
  const csrfToken = readCookie('digfin_csrf');
  if (csrfToken && isMutatingRequest(config)) config.headers.set('X-CSRF-Token', csrfToken);
  return config;
});

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as (InternalAxiosRequestConfig & { _retry?: boolean; skipAuthRefresh?: boolean }) | undefined;
  if (error.response?.status !== 401 || !config || config._retry || config.skipAuthRefresh || config.url?.includes('/auth/refresh')) {
    return Promise.reject(error);
  }

  // Marcamos a requisicao para impedir um loop infinito caso o refresh tambem
  // falhe ou o novo access token seja rejeitado pelo backend.
  config._retry = true;
  // Varias requisicoes podem expirar ao mesmo tempo. Todas aguardam a mesma
  // promessa, evitando varias rotacoes concorrentes do refresh token.
  refreshPromise ??= (async () => {
    await ensureCsrfToken();
    await api.post('/auth/refresh', undefined, { skipAuthRefresh: true });
  })().finally(() => { refreshPromise = null; });

  try {
    await refreshPromise;
    return api(config);
  } catch (refreshError) {
    return Promise.reject(refreshError);
  }
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
