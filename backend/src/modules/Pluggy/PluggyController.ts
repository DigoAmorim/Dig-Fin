import type { NextFunction, Request, Response } from 'express';
import { ErroAplicacao } from '../../shared/errors/AppError';
import { PluggyService } from './PluggyService';

export class PluggyController {
    constructor(private readonly service = new PluggyService()) {}

    createConnectToken = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            if (!request.auth) throw new ErroAplicacao(401, 'authenticationRequired');
            const itemId = typeof request.body?.itemId === 'string' ? request.body.itemId : undefined;
            response.json(await this.service.createConnectToken(request.auth.userId, itemId));
        } catch (error) {
            next(error);
        }
    };

    listAccounts = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            if (!request.auth) throw new ErroAplicacao(401, 'authenticationRequired');
            const itemId = Array.isArray(request.params.itemId) ? request.params.itemId[0] : request.params.itemId;
            if (!itemId) throw new ErroAplicacao(400, 'invalidId');
            response.json(await this.service.listAccounts(itemId));
        } catch (error) {
            next(error);
        }
    };

    syncBankAccounts = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            if (!request.auth) throw new ErroAplicacao(401, 'authenticationRequired');
            const itemId = typeof request.body?.itemId === 'string' ? request.body.itemId : undefined;
            if (!itemId) throw new ErroAplicacao(400, 'invalidId');
            response.json(await this.service.syncBankAccounts(request.auth.accountId, itemId));
        } catch (error) {
            next(error);
        }
    };
}