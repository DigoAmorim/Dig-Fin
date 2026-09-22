import { pool } from '../../../database/Pool';
import type { AuthUser } from './AuthTypes';

interface StoredUser extends AuthUser {
    passwordHash: string;
}

export class AuthRepository {
    private readonly userSelect = `
        SELECT u.id, u.email, u.senha_hash AS "passwordHash",
               c.id AS "accountId", c.nome AS "accountName", cu.papel AS role
        FROM digfin.usuario u
        JOIN digfin.conta_usuario cu ON cu.usuario_id = u.id
        JOIN digfin.conta c ON c.id = cu.conta_id`;

    async findUserByEmail(email: string): Promise<StoredUser | null> {
        const result = await pool.query<StoredUser>(
            `${this.userSelect} WHERE LOWER(u.email) = LOWER($1) LIMIT 1`,
            [email],
        );
        return result.rows[0] ?? null;
    }

    async findUserById(userId: string): Promise<StoredUser | null> {
        const result = await pool.query<StoredUser>(
            `${this.userSelect} WHERE u.id = $1 LIMIT 1`,
            [userId],
        );
        return result.rows[0] ?? null;
    }

    async createUser(email: string, passwordHash: string): Promise<AuthUser> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const userResult = await client.query<{ id: string; email: string }>(
                `INSERT INTO digfin.usuario (email, senha_hash) VALUES ($1, $2) RETURNING id, email`,
                [email, passwordHash],
            );
            const user = userResult.rows[0];
            if (!user) throw new Error('User was not created');
            const accountResult = await client.query<{ id: string; name: string }>(
                `INSERT INTO digfin.conta (nome) VALUES ($1) RETURNING id, nome AS name`,
                [`Conta de ${email}`],
            );
            const account = accountResult.rows[0];
            if (!account) throw new Error('Account was not found');
            await client.query(
                `INSERT INTO digfin.conta_usuario (conta_id, usuario_id, papel) VALUES ($1, $2, 'owner')`,
                [account.id, user.id],
            );
            await client.query('COMMIT');
            return { id: user.id, email: user.email, accountId: account.id, accountName: account.name, role: 'owner' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async createRefreshSession(input: { userId: string; tokenHash: string; expiresAt: Date; userAgent?: string; ip?: string }): Promise<string> {
        const result = await pool.query<{ id: string }>(
            `INSERT INTO digfin.refresh_token (usuario_id, token_hash, expira_em, user_agent, ip)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [input.userId, input.tokenHash, input.expiresAt, input.userAgent ?? null, input.ip ?? null],
        );
        const session = result.rows[0];
        if (!session) throw new Error('Refresh session was not created');
        return session.id;
    }

    async findRefreshSession(tokenHash: string): Promise<{ id: string; userId: string; expiresAt: Date } | null> {
        const result = await pool.query<{ id: string; userId: string; expiresAt: Date }>(
            `SELECT id, usuario_id AS "userId", expira_em AS "expiresAt"
             FROM digfin.refresh_token WHERE token_hash = $1 AND revogado_em IS NULL`,
            [tokenHash],
        );
        return result.rows[0] ?? null;
    }

    async revokeRefreshSession(sessionId: string, replacedBy?: string): Promise<void> {
        await pool.query(
            `UPDATE digfin.refresh_token SET revogado_em = NOW(), substituido_por = $2
             WHERE id = $1 AND revogado_em IS NULL`,
            [sessionId, replacedBy ?? null],
        );
    }
}