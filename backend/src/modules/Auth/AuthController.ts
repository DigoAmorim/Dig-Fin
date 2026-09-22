import type { NextFunction, Request, Response } from 'express';
import { AuthService } from './AuthService';
import { accessCookieName, clearAuthCookies, refreshCookieName, setAuthCookies } from '../../shared/auth/AuthCookies';

export class AuthController {
    constructor(private readonly service = new AuthService()) {}

    private sessionResponse(session: { user: { id: string; email: string; accountId: string; accountName: string; role: string } }) {
        return {
            user: { id: session.user.id, email: session.user.email },
            account: { id: session.user.accountId, name: session.user.accountName, role: session.user.role },
        };
    }

    register = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const session = await this.service.register(request.body);
            setAuthCookies(response, session.accessToken, session.refreshToken);
            response.status(201).json(this.sessionResponse(session));
        } catch (error) { next(error); }
    };

    login = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const session = await this.service.login(request.body);
            setAuthCookies(response, session.accessToken, session.refreshToken);
            response.json(this.sessionResponse(session));
        } catch (error) { next(error); }
    };

    refresh = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const refreshToken = request.cookies?.[refreshCookieName];
            if (!refreshToken) {
                clearAuthCookies(response);
                response.sendStatus(401);
                return;
            }
            const session = await this.service.refresh(refreshToken);
            setAuthCookies(response, session.accessToken, session.refreshToken);
            response.json(this.sessionResponse(session));
        } catch (error) { next(error); }
    };

    me = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const accessToken = request.cookies?.[accessCookieName];
            if (!accessToken || !request.auth) {
                response.sendStatus(401);
                return;
            }
            const user = await this.service.findUserById(request.auth.userId);
            response.json({
                user: { id: user.id, email: user.email },
                account: { id: user.accountId, name: user.accountName, role: user.role },
            });
        } catch (error) { next(error); }
    };

    logout = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const refreshToken = request.cookies?.[refreshCookieName];
            if (refreshToken) await this.service.revoke(refreshToken);
            clearAuthCookies(response);
            response.sendStatus(204);
        } catch (error) { next(error); }
    };
}