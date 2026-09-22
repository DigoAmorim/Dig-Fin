import express = require('express');
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import type { Request, Response } from 'express';
import { env } from './config/Env';
import { errorHandler } from './shared/middleware/ErrorHandler';
import { requireAuth } from './shared/middleware/RequireAuth';
import { requireCsrf } from './shared/auth/Csrf';
import { authRoutes } from './modules/Auth/AuthRoutes';
import { bandeiraCartaoRoutes } from './modules/BandeiraCartao/BandeiraCartaoRoutes';
import { instituicaoBancariaRoutes } from './modules/InstituicaoBancaria/InstituicaoBancariaRoutes';
import { contaBancariaRoutes } from './modules/ContaBancaria/ContaBancariaRoutes';
import { cartaoCreditoRoutes } from './modules/CartaoCredito/CartaoCreditoRoutes';
import { categoriaRoutes } from './modules/Categoria/CategoriaRoutes';
import { transacaoRoutes } from './modules/Transacao/TransacaoRoutes';

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use((_request, response, next) => {
    response.header('Access-Control-Allow-Origin', env.corsOrigin);
    response.header('Access-Control-Allow-Credentials', 'true');
    response.header('Access-Control-Allow-Headers', 'Content-Type, Accept-Language, X-CSRF-Token');
    response.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    if (_request.method === 'OPTIONS') {
        response.sendStatus(204);
        return;
    }
    next();
});

app.get('/health', (_request: Request, response: Response) => {
    response.json({ status: 'ok' });
});

app.use('/api', requireCsrf);
app.use('/api/auth', authRoutes);
app.use('/api', requireAuth);
app.use('/api/bandeira-cartao', bandeiraCartaoRoutes);
app.use('/api/instituicao-bancaria', instituicaoBancariaRoutes);
app.use('/api/conta-bancaria', contaBancariaRoutes);
app.use('/api/cartao-credito', cartaoCreditoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/transacoes', transacaoRoutes);
app.use(errorHandler);
