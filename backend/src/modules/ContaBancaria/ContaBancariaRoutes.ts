import { Router } from 'express';
import { ContaBancariaController } from './ContaBancariaController';

const contaBancariaRoutes = Router();
const controller = new ContaBancariaController();

contaBancariaRoutes.get('/', controller.findAll);
contaBancariaRoutes.post('/', controller.create);
contaBancariaRoutes.put('/:id', controller.update);
contaBancariaRoutes.delete('/:id', controller.delete);

export { contaBancariaRoutes };
