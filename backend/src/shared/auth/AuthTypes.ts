export interface AuthContext {
    userId: string;
    sessionId: string;
    accountId: string;
}

declare global {
    namespace Express {
        interface Request {
            auth?: AuthContext;
        }
    }
}

export type AuthenticatedRequest = Express.Request & { auth: AuthContext };