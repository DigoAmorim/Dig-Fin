import type { Request } from 'express';
import { ErroAplicacao } from '../errors/AppError';

export function requireAccountId(request: Request): string {
    if (!request.auth?.accountId) throw new ErroAplicacao(401, 'authenticationRequired');
    return request.auth.accountId;
}