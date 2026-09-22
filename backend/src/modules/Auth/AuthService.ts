import argon2 from 'argon2';
import { ErroAplicacao } from '../../shared/errors/AppError';
import { env } from '../../config/Env';
import { createAccessToken, createRefreshToken, hashRefreshToken } from '../../shared/auth/AuthTokens';
import { isPostgresError } from '../../shared/database/PostgresError';
import { AuthRepository } from './AuthRepository';
import type { AuthUser, LoginInput, RegisterInput } from './AuthTypes';

export class AuthService {
    constructor(private readonly repository = new AuthRepository()) {}

    async register(input: RegisterInput) {
        const { email, password } = this.validateCredentials(input);
        const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
        try {
            const user = await this.repository.createUser(email, passwordHash);
            return this.createSession(user);
        } catch (error) {
            if (isPostgresError(error) && error.code === '23505') throw new ErroAplicacao(409, 'emailAlreadyRegistered');
            throw error;
        }
    }

    async login(input: LoginInput) {
        const { email, password } = this.validateCredentials(input);
        const user = await this.repository.findUserByEmail(email);
        const validPassword = user ? await argon2.verify(user.passwordHash, password) : false;
        if (!user || !validPassword) throw new ErroAplicacao(401, 'invalidCredentials');
        return this.createSession(user);
    }

    async refresh(refreshToken: string) {
        const session = await this.repository.findRefreshSession(hashRefreshToken(refreshToken));
        if (!session || session.expiresAt.getTime() <= Date.now()) throw new ErroAplicacao(401, 'invalidRefreshToken');
        const user = await this.repository.findUserById(session.userId);
        if (!user) throw new ErroAplicacao(401, 'invalidRefreshToken');
        const nextSession = await this.createSession(user);
        await this.repository.revokeRefreshSession(session.id, nextSession.sessionId);
        return nextSession;
    }

    async revoke(refreshToken: string): Promise<void> {
        const session = await this.repository.findRefreshSession(hashRefreshToken(refreshToken));
        if (session) await this.repository.revokeRefreshSession(session.id);
    }

    async findUserById(userId: string): Promise<AuthUser> {
        const user = await this.repository.findUserById(userId);
        if (!user) throw new ErroAplicacao(404, 'userNotFound');
        return user;
    }

    private async createSession(user: AuthUser) {
        const refresh = createRefreshToken();
        const sessionId = await this.repository.createRefreshSession({
            userId: user.id,
            tokenHash: refresh.hash,
            expiresAt: new Date(Date.now() + env.refreshTokenDays * 24 * 60 * 60 * 1000),
        });
        return {
            user,
            accessToken: await createAccessToken({ userId: user.id, sessionId }),
            refreshToken: refresh.token,
            sessionId,
        };
    }

    private validateCredentials(input: RegisterInput | LoginInput): { email: string; password: string } {
        const email = typeof input?.email === 'string' ? input.email.trim().toLowerCase() : '';
        const password = typeof input?.password === 'string' ? input.password : '';
        if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) throw new ErroAplicacao(400, 'invalidCredentialsFormat');
        return { email, password };
    }
}