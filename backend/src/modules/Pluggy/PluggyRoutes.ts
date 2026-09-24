import { Router } from 'express';
import { PluggyController } from './PluggyController';

const pluggyRoutes = Router();
const controller = new PluggyController();

pluggyRoutes.post('/connect-token', controller.createConnectToken);
pluggyRoutes.get('/accounts/:itemId', controller.listAccounts);
pluggyRoutes.post('/sync-accounts', controller.syncBankAccounts);
pluggyRoutes.post('/sync-transactions', controller.syncTransactions);

export { pluggyRoutes };