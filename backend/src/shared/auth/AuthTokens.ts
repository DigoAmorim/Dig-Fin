import { createHash, randomBytes } from 'node:crypto';
import { env } from '../../config/Env';

const accessTokenSecret = new TextEncoder().encode(env.jwtAccessSecret);

export interface AccessTokenPayload {
    userId: string;
    sessionId: string;
}

// O access token expira rapidamente. Assim, mesmo que um cookie seja roubado,
// a janela de uso indevido fica limitada e o refresh continua revogavel no banco.
export async function createAccessToken(payload: AccessTokenPayload): Promise<string> {
    const { SignJWT } = await import('jose');
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setSubject(payload.userId)
        .setIssuer(env.jwtIssuer)
        .setAudience(env.jwtAudience)
        .setIssuedAt()
        .setExpirationTime(`${env.accessTokenMinutes}m`)
        .sign(accessTokenSecret);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const { jwtVerify } = await import('jose');
    const { payload } = await jwtVerify(token, accessTokenSecret, {
        issuer: env.jwtIssuer,
        audience: env.jwtAudience,
    });
    if (typeof payload.userId !== 'string' || typeof payload.sessionId !== 'string') {
        throw new Error('Invalid access token payload');
    }
    return { userId: payload.userId, sessionId: payload.sessionId };
}

// Refresh tokens sao opacos: o cliente recebe um valor aleatorio, mas o banco
// armazena somente SHA-256. Um vazamento do banco nao entrega sessoes validas.
export function createRefreshToken(): { token: string; hash: string } {
    const token = randomBytes(48).toString('base64url');
    return { token, hash: hashRefreshToken(token) };
}

export function hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}