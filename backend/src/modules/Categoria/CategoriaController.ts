import type { NextFunction, Request, Response } from 'express';
import { ErroAplicacao } from '../../shared/errors/AppError';
import { CategoriaService } from './CategoriaService';

export class CategoriaController {
    constructor(private readonly service = new CategoriaService()) {}

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

    createSubcategory = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try { response.status(201).json(await this.service.createSubcategory(request.body)); } catch (error) { next(error); }
    };

    updateSubcategory = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try { response.json(await this.service.updateSubcategory(this.getId(request), request.body)); } catch (error) { next(error); }
    };

    deleteSubcategory = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try { await this.service.deleteSubcategory(this.getId(request)); response.sendStatus(204); } catch (error) { next(error); }
    };

    private getId(request: Request): number {
        const id = Number(request.params.id);
        if (!Number.isSafeInteger(id) || id <= 0) throw new ErroAplicacao(400, 'invalidId');
        return id;
    }
}
