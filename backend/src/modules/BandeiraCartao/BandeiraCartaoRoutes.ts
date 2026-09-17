import { Router } from 'express';
import { BandeiraCartaoController } from './BandeiraCartaoController';

const bandeiraCartaoRoutes = Router();
const controller = new BandeiraCartaoController();

bandeiraCartaoRoutes.get('/', controller.findAll);
bandeiraCartaoRoutes.post('/', controller.create);
bandeiraCartaoRoutes.put('/:id', controller.update);
bandeiraCartaoRoutes.delete('/:id', controller.delete);

export { bandeiraCartaoRoutes };
