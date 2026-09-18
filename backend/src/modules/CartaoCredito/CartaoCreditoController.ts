import type { NextFunction, Request, Response } from 'express';
import { ErroAplicacao } from '../../shared/errors/AppError';
import { CartaoCreditoService } from './CartaoCreditoService';

export class CartaoCreditoController {
    constructor(private readonly service = new CartaoCreditoService()) {}

    findAll = async (_request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            response.json(await this.service.findAll());
        } catch (error) {
            next(error);
        }
    };

    create = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            response.status(201).json(await this.service.create(request.body));
        } catch (error) {
            next(error);
        }
    };

    update = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            response.json(await this.service.update(this.getId(request), request.body));
        } catch (error) {
            next(error);
        }
    };

    delete = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            await this.service.delete(this.getId(request));
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
