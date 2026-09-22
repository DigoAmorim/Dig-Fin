import type { CookieOptions, Response } from 'express';
import { env } from '../../config/Env';

export const accessCookieName = 'digfin_access';
export const refreshCookieName = 'digfin_refresh';

const baseCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: 'lax',
    path: '/',
};

export function setAuthCookies(response: Response, accessToken: string, refreshToken: string): void {
    response.cookie(accessCookieName, accessToken, {
        ...baseCookieOptions,
        maxAge: env.accessTokenMinutes * 60 * 1000,
    });
    response.cookie(refreshCookieName, refreshToken, {
        ...baseCookieOptions,
        maxAge: env.refreshTokenDays * 24 * 60 * 60 * 1000,
    });
}

export function clearAuthCookies(response: Response): void {
    response.clearCookie(accessCookieName, baseCookieOptions);
    response.clearCookie(refreshCookieName, baseCookieOptions);
}