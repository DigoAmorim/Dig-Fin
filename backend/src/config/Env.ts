const toPositiveInteger = (value: string | undefined, fallback: number): number => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
    port: toPositiveInteger(process.env.PORT, 3000),
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    contaId: process.env.CONTA_ID ?? '00000000-0000-0000-0000-000000000001',
};
