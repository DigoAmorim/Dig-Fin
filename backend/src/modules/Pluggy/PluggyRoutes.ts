import { Router } from 'express';
import { PluggyController } from './PluggyController';

const pluggyRoutes = Router();
const controller = new PluggyController();

pluggyRoutes.post('/connect-token', controller.createConnectToken);
pluggyRoutes.get('/accounts/:itemId', controller.listAccounts);

export { pluggyRoutes };