import type { NextFunction, Request, Response } from 'express';
import { pool } from '../../../database/Pool';
import { accessCookieName } from '../auth/AuthCookies';
import { verifyAccessToken } from '../auth/AuthTokens';
import { ErroAplicacao } from '../errors/AppError';

export async function requireAuth(request: Request, _response: Response, next: NextFunction): Promise<void> {
    try {
        // O access token vive em cookie HttpOnly, por isso somente o servidor
        // consegue le-lo e validar sua assinatura.
        const token = request.cookies?.[accessCookieName];
        if (!token) throw new ErroAplicacao(401, 'authenticationRequired');

        const { userId, sessionId } = await verifyAccessToken(token);
        // A assinatura do JWT prova a origem do token. A consulta abaixo prova
        // que a sessao ainda existe, nao foi revogada e pertence ao usuario.
        const session = await pool.query<{ accountId: string }>(
            `SELECT cu.conta_id AS "accountId"
             FROM digfin.refresh_token rt
             JOIN digfin.conta_usuario cu ON cu.usuario_id = rt.usuario_id
             WHERE rt.id = $1 AND rt.usuario_id = $2 AND rt.revogado_em IS NULL AND rt.expira_em > NOW()
             LIMIT 1`,
            [sessionId, userId],
        );
        const account = session.rows[0];
        if (!account) throw new ErroAplicacao(401, 'sessionExpired');

        // O restante da aplicacao recebe apenas este contexto confiavel; nunca
        // deve aceitar accountId vindo do body ou de query string.
        request.auth = { userId, sessionId, accountId: account.accountId };
        next();
    } catch (error) {
        next(error instanceof ErroAplicacao ? error : new ErroAplicacao(401, 'authenticationRequired'));
    }
}