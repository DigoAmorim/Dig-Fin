import express = require('express');
import type { Request, Response } from 'express';
import crypto = require('node:crypto');
import pg = require('pg');

const app = express();
const PORT = 3000;
const pool = process.env.DATABASE_URL ? new pg.Pool({ connectionString: process.env.DATABASE_URL }) : null;

interface CardBrand {
    id: string;
    description: string;
}

const memoryCardBrands: CardBrand[] = [];

app.use(express.json());
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    if (_req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
    }
    next();
});

app.get('/api/bandeiras-cartao', async (_req: Request, res: Response) => {
    if (!pool) {
        res.json(memoryCardBrands);
        return;
    }

    const result = await pool.query<CardBrand>(
        'SELECT id, description FROM card_brands ORDER BY description',
    );
    res.json(result.rows);
});

app.post('/api/bandeiras-cartao', async (req: Request, res: Response) => {
    const description = String(req.body?.description ?? '').trim();
    const cardBrand = { id: crypto.randomUUID(), description };

    if (!pool) {
        memoryCardBrands.push(cardBrand);
        res.status(201).json(cardBrand);
        return;
    }

    const result = await pool.query<CardBrand>(
        'INSERT INTO card_brands (description) VALUES ($1) RETURNING id, description',
        [description],
    );
    res.status(201).json(result.rows[0]);
});

app.put('/api/bandeiras-cartao/:id', async (req: Request, res: Response) => {
    const description = String(req.body?.description ?? '').trim();
    const { id } = req.params;

    if (!description) {
        res.status(400).json({ message: 'A descrição é obrigatória.' });
        return;
    }

    if (!pool) {
        const cardBrand = memoryCardBrands.find((brand) => brand.id === id);
        if (!cardBrand) {
            res.sendStatus(404);
            return;
        }
        cardBrand.description = description;
        res.json(cardBrand);
        return;
    }

    const result = await pool.query<CardBrand>(
        'UPDATE card_brands SET description = $1 WHERE id = $2 RETURNING id, description',
        [description, id],
    );
    if (result.rowCount === 0) {
        res.sendStatus(404);
        return;
    }
    res.json(result.rows[0]);
});

app.delete('/api/bandeiras-cartao/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!pool) {
        const index = memoryCardBrands.findIndex((brand) => brand.id === id);
        if (index === -1) {
            res.sendStatus(404);
            return;
        }
        memoryCardBrands.splice(index, 1);
        res.sendStatus(204);
        return;
    }

    const result = await pool.query('DELETE FROM card_brands WHERE id = $1', [id]);
    if (result.rowCount === 0) {
        res.sendStatus(404);
        return;
    }
    res.sendStatus(204);
});

app.get('/', (_req: Request, res: Response) => {
    res.send('Hello World do Backend em TypeScript!');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando perfeitamente em http://localhost:${PORT}`);
});