import type { NextFunction, Request, Response } from 'express';
import { ErroAplicacao } from '../../shared/errors/AppError';
import { PluggyService } from '../Pluggy/PluggyService';
import { ContaBancariaRepository } from './ContaBancariaRepository';
import { requireAccountId } from '../../shared/auth/RequireAccount';

export class ContaBancariaSyncController {
    constructor(private readonly service = new PluggyService()) {}

    syncAll = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const accountId = requireAccountId(request);
            const itemId = typeof request.body?.itemId === 'string' ? request.body.itemId : undefined;
            if (!itemId) throw new ErroAplicacao(400, 'invalidId');
            const result = await this.service.syncBankAccounts(accountId, itemId);
            response.json(result);
        } catch (error) {
            next(error);
        }
    };

    syncOne = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        try {
            const accountId = requireAccountId(request);
            const itemId = typeof request.body?.itemId === 'string' ? request.body.itemId : undefined;
            const bankAccountId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
            if (!itemId || !bankAccountId) throw new ErroAplicacao(400, 'invalidId');
            const repository = new ContaBancariaRepository(accountId);
            const rows = await repository.findAll();
            const selected = rows.find((item) => item.id === bankAccountId);
            if (!selected) throw new ErroAplicacao(404, 'bankAccountNotFound');
            const pluggyAccounts = await this.service.listAccounts(itemId);
            const match = pluggyAccounts.results.find((pluggyAccount) => {
                const institutionMatches = (pluggyAccount.name || pluggyAccount.marketingName || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === selected.bankInstitutionName.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const numberMatches = (String(pluggyAccount.id ?? '')).replace(/[^0-9]/g, '') === (selected.name ?? '').replace(/[^0-9]/g, '');
                return institutionMatches && numberMatches;
            });
            if (!match) {
                response.json({ matched: false, status: 'nao_sincronizada' });
                return;
            }
            const updated = await repository.updatePluggyStatus(selected.id, match.id, 'sincronizada');
            response.json({ matched: true, status: 'sincronizada', account: updated });
        } catch (error) {
            next(error);
        }
    };
}
