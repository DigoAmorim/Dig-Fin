export interface PostgresError {
    code?: string;
    constraint?: string;
}

export const isPostgresError = (error: unknown): error is PostgresError => (
    typeof error === 'object' && error !== null && 'code' in error
);
