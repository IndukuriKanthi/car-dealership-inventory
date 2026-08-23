import { Router } from 'express';
import vehicleController from '../controllers/vehicleController';
import { authenticateUser } from '../middleware/authenticateUser';
import { requireAdmin } from '../middleware/requireAdmin';
import { validateBody, validateQuery } from '../middleware/validateRequest';
import {
  createVehicleSchema,
  updateVehicleSchema,
  restockSchema,
  searchQuerySchema,
} from '../schemas/vehicleSchemas';

const vehicleRoutes = Router();

vehicleRoutes.use(authenticateUser);

// /search must be registered before /:id so Express does not treat "search" as an id
vehicleRoutes.get('/search', validateQuery(searchQuerySchema), vehicleController.search);
vehicleRoutes.get('/', vehicleController.getAll);
vehicleRoutes.post('/', validateBody(createVehicleSchema), vehicleController.create);
vehicleRoutes.put('/:id', validateBody(updateVehicleSchema), vehicleController.update);
vehicleRoutes.delete('/:id', requireAdmin, vehicleController.remove);
vehicleRoutes.post('/:id/purchase', vehicleController.purchase);
vehicleRoutes.post(
  '/:id/restock',
  requireAdmin,
  validateBody(restockSchema),
  vehicleController.restock,
);

export default vehicleRoutes;
