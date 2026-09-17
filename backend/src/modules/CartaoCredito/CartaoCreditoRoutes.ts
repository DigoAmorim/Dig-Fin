import { Router } from 'express';
import { CartaoCreditoController } from './CartaoCreditoController';

const cartaoCreditoRoutes = Router();
const controller = new CartaoCreditoController();

cartaoCreditoRoutes.get('/', controller.findAll);
cartaoCreditoRoutes.post('/', controller.create);
cartaoCreditoRoutes.put('/:id', controller.update);
cartaoCreditoRoutes.delete('/:id', controller.delete);

export { cartaoCreditoRoutes };
