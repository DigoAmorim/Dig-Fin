import pg = require('pg');

export const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    host: process.env.PGHOST,
    port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
});

pool.on('error', (error) => {
    console.error('Erro inesperado no pool do PostgreSQL:', error);
});
