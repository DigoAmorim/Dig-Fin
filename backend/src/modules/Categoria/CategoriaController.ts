import type { NextFunction, Request, Response } from 'express';
import { ErroAplicacao } from '../../shared/errors/AppError';
import { CategoriaService } from './CategoriaService';
import { CategoriaRepository } from './CategoriaRepository';
import { requireAccountId } from '../../shared/auth/RequireAccount';

export class CategoriaController {
    private getService(request: Request): CategoriaService {
        return new CategoriaService(new CategoriaRepository(requireAccountId(request)));
    }

    findAll = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try { response.json(await this.getService(request).findAll()); } catch (error) { next(error); }
    };

    create = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try { response.status(201).json(await this.getService(request).create(request.body)); } catch (error) { next(error); }
    };

    update = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try { response.json(await this.getService(request).update(this.getId(request), request.body)); } catch (error) { next(error); }
    };

    delete = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try { await this.getService(request).delete(this.getId(request)); response.sendStatus(204); } catch (error) { next(error); }
    };

    createSubcategory = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try { response.status(201).json(await this.getService(request).createSubcategory(request.body)); } catch (error) { next(error); }
    };

    updateSubcategory = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try { response.json(await this.getService(request).updateSubcategory(this.getId(request), request.body)); } catch (error) { next(error); }
    };

    deleteSubcategory = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try { await this.getService(request).deleteSubcategory(this.getId(request)); response.sendStatus(204); } catch (error) { next(error); }
    };

    private getId(request: Request): number {
        const id = Number(request.params.id);
        if (!Number.isSafeInteger(id) || id <= 0) throw new ErroAplicacao(400, 'invalidId');
        return id;
    }
}
