import type { NextFunction, Request, Response } from 'express';
import { ErroAplicacao } from '../../shared/errors/AppError';
import { TransacaoService } from './TransacaoService';

export class TransacaoController {
    constructor(private readonly service = new TransacaoService()) {}

    findAll = async (_request: Request, response: Response, next: NextFunction): Promise<void> => {
        try { response.json(await this.service.findAll()); } catch (error) { next(error); }
    };

    create = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try { response.status(201).json(await this.service.create(request.body)); } catch (error) { next(error); }
    };

    update = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try { response.json(await this.service.update(this.getId(request), request.body)); } catch (error) { next(error); }
    };

    delete = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try { await this.service.delete(this.getId(request)); response.sendStatus(204); } catch (error) { next(error); }
    };

    private getId(request: Request): string {
        const id = request.params.id;
        const normalizedId = Array.isArray(id) ? id[0] : id;
        if (!normalizedId || !/^[0-9]+$/.test(normalizedId)) throw new ErroAplicacao(400, 'invalidId');
        return normalizedId;
    }
}
