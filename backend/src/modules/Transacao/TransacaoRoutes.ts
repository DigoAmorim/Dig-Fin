import { Router } from 'express';
import { TransacaoController } from './TransacaoController';

const transacaoRoutes = Router();
const controller = new TransacaoController();

transacaoRoutes.get('/', controller.findAll);
transacaoRoutes.post('/', controller.create);
transacaoRoutes.put('/:id', controller.update);
transacaoRoutes.delete('/:id', controller.delete);

export { transacaoRoutes };
