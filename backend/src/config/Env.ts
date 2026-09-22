const toPositiveInteger = (value: string | undefined, fallback: number): number => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
    port: toPositiveInteger(process.env.PORT, 3000),
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'development-only-change-this-secret',
    jwtIssuer: process.env.JWT_ISSUER ?? 'dig-fin-api',
    jwtAudience: process.env.JWT_AUDIENCE ?? 'dig-fin-web',
    accessTokenMinutes: toPositiveInteger(process.env.ACCESS_TOKEN_MINUTES, 15),
    refreshTokenDays: toPositiveInteger(process.env.REFRESH_TOKEN_DAYS, 7),
    cookieSecure: process.env.COOKIE_SECURE === 'true',
    pluggyClientId: process.env.PLUGGY_CLIENT_ID,
    pluggyClientSecret: process.env.PLUGGY_CLIENT_SECRET,
    pluggyBaseUrl: process.env.PLUGGY_BASE_URL,
};
