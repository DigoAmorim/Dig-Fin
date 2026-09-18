import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pool } from './Pool';

const migrationsDirectory = path.resolve(__dirname, 'migrations');

const run = async (): Promise<void> => {
    await pool.query('CREATE SCHEMA IF NOT EXISTS digfin');
    await pool.query(`
        CREATE TABLE IF NOT EXISTS digfin.schema_migrations (
            version VARCHAR(255) PRIMARY KEY,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    const migrationFiles = (await fs.readdir(migrationsDirectory))
        .filter((file) => /^\d+_.+\.sql$/.test(file))
        .sort();
    const appliedResult = await pool.query<{ version: string }>(
        'SELECT version FROM digfin.schema_migrations',
    );
    const appliedVersions = new Set(appliedResult.rows.map(({ version }) => version));

    for (const file of migrationFiles) {
        if (appliedVersions.has(file)) continue;

        const sql = await fs.readFile(path.join(migrationsDirectory, file), 'utf8');
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(sql);
            await client.query(
                'INSERT INTO digfin.schema_migrations (version) VALUES ($1)',
                [file],
            );
            await client.query('COMMIT');
            console.log(`Migration aplicada: ${file}`);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
};

run()
    .catch((error) => {
        console.error('Falha ao executar migrations:', error);
        process.exitCode = 1;
    })
    .finally(() => pool.end());
