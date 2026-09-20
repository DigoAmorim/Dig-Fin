import axios from 'axios';
import i18n from '../i18n/config';

export interface ApiErrorResponse {
  code?: string;
  params?: Record<string, unknown>;
  message?: string;
}

export class ApiError extends Error {
  readonly statusCode?: number;
  readonly code: string;
  readonly params: Record<string, unknown>;

  constructor(code: string, statusCode?: number, params: Record<string, unknown> = {}) {
    super(code);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.params = params;
  }
}

export const getApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return new ApiError(
      error.response?.data?.code ?? 'internal',
      error.response?.status,
      error.response?.data?.params,
    );
  }

  return new ApiError('internal');
};

export const translateApiError = (error: unknown): string => {
  const apiError = getApiError(error);
  return i18n.t(`errors.${apiError.code}`, {
    ...apiError.params,
    defaultValue: i18n.t('errors.internal'),
  });
};