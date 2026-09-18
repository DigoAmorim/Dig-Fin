import { Router } from 'express';
import { InstituicaoBancariaController } from './InstituicaoBancariaController';

const instituicaoBancariaRoutes = Router();
const controller = new InstituicaoBancariaController();

instituicaoBancariaRoutes.get('/', controller.findAll);
instituicaoBancariaRoutes.post('/', controller.create);
instituicaoBancariaRoutes.put('/:id', controller.update);
instituicaoBancariaRoutes.delete('/:id', controller.delete);

export { instituicaoBancariaRoutes };
