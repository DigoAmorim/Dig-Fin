import { Router } from 'express';
import { CategoriaController } from './CategoriaController';

const categoriaRoutes = Router();
const controller = new CategoriaController();

categoriaRoutes.get('/', controller.findAll);
categoriaRoutes.post('/', controller.create);
categoriaRoutes.put('/:id', controller.update);
categoriaRoutes.delete('/:id', controller.delete);
categoriaRoutes.post('/subcategorias', controller.createSubcategory);
categoriaRoutes.put('/subcategorias/:id', controller.updateSubcategory);
categoriaRoutes.delete('/subcategorias/:id', controller.deleteSubcategory);

export { categoriaRoutes };
