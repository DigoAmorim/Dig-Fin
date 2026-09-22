import type { NextFunction, Request, Response } from 'express';
import { ErroAplicacao } from '../../shared/errors/AppError';
import { CartaoCreditoService } from './CartaoCreditoService';
import { CartaoCreditoRepository } from './CartaoCreditoRepository';
import { requireAccountId } from '../../shared/auth/RequireAccount';

export class CartaoCreditoController {
    private getService(request: Request): CartaoCreditoService {
        return new CartaoCreditoService(new CartaoCreditoRepository(requireAccountId(request)));
    }

    findAll = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            response.json(await this.getService(request).findAll());
        } catch (error) {
            next(error);
        }
    };

    create = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            response.status(201).json(await this.getService(request).create(request.body));
        } catch (error) {
            next(error);
        }
    };

    update = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            response.json(await this.getService(request).update(this.getId(request), request.body));
        } catch (error) {
            next(error);
        }
    };

    delete = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            await this.getService(request).delete(this.getId(request));
            response.sendStatus(204);
        } catch (error) {
            next(error);
        }
    };

    private getId(request: Request): string {
        const id = request.params.id;
        if (typeof id !== 'string' || !/^\d+$/.test(id)) {
            throw new ErroAplicacao(400, 'invalidId');
        }
        return id;
    }
}
