import type { ErrorRequestHandler } from 'express';
import { ErroAplicacao } from '../errors/AppError';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    console.error(error);

    if (error instanceof ErroAplicacao) {
        response.status(error.statusCode).json({ message: error.message });
        return;
    }

    response.status(500).json({ message: 'Erro interno do servidor.' });
};
