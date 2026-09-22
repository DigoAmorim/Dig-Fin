import { api, ensureCsrfToken } from '../lib/api-client';
import type { SessionResponse } from './types';

export async function login(email: string, password: string): Promise<SessionResponse> {
  await ensureCsrfToken();
  const response = await api.post<SessionResponse>('/auth/login', { email, password });
  return response.data;
}

export async function getSession(): Promise<SessionResponse> {
  const response = await api.get<SessionResponse>('/auth/me');
  return response.data;
}

export async function refreshSession(): Promise<SessionResponse> {
  const response = await api.post<SessionResponse>('/auth/refresh');
  return response.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function register(email: string, password: string): Promise<SessionResponse> {
  await ensureCsrfToken();
  const response = await api.post<SessionResponse>('/auth/register', { email, password });
  return response.data;
}