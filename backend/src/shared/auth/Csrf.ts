import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../../config/Env';
import { ErroAplicacao } from '../errors/AppError';

export const csrfCookieName = 'digfin_csrf';
export const csrfHeaderName = 'x-csrf-token';

// O cookie CSRF nao e HttpOnly de proposito: o frontend precisa le-lo para
// copia-lo para o header. O atacante nao consegue fazer essa copia a partir de
// outro site por causa da politica de mesma origem.
export function issueCsrfToken(response: Response): string {
    const token = randomBytes(32).toString('base64url');
    response.cookie(csrfCookieName, token, {
        httpOnly: false,
        secure: env.cookieSecure,
        sameSite: 'lax',
        path: '/',
    });
    return token;
}

export function requireCsrf(request: Request, _response: Response, next: NextFunction): void {
    // Leitura nao muda estado no servidor, portanto nao precisa de CSRF.
    // Operacoes mutaveis exigem que cookie e header tenham o mesmo valor.
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        next();
        return;
    }

    const cookieToken = request.cookies?.[csrfCookieName];
    const headerToken = request.header(csrfHeaderName);
    const valid = typeof cookieToken === 'string'
        && typeof headerToken === 'string'
        && cookieToken.length === headerToken.length
        // Alem de comparar o conteudo, a comparacao em tempo constante evita
        // vazar informacao por diferencas mensuraveis no tempo de resposta.
        && timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));

    if (!valid) {
        next(new ErroAplicacao(403, 'csrfTokenInvalid'));
        return;
    }
    next();
}