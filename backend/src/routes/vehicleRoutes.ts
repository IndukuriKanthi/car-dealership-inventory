import { Router } from 'express';
import { authenticateUser } from '../middleware/authenticateUser';
import { requireAdmin } from '../middleware/requireAdmin';

const vehicleRoutes = Router();

// All vehicle routes require authentication
vehicleRoutes.use(authenticateUser);

vehicleRoutes.get('/', (_req, res) => res.json({ success: true, data: { vehicles: [] } }));
vehicleRoutes.get('/search', (_req, res) => res.json({ success: true, data: { vehicles: [] } }));
vehicleRoutes.post('/', (_req, res) => res.status(201).json({ success: true, data: {} }));
vehicleRoutes.put('/:id', (_req, res) => res.json({ success: true, data: {} }));
vehicleRoutes.delete('/:id', requireAdmin, (_req, res) => res.status(404).json({ success: false, message: 'Vehicle not found' }));
vehicleRoutes.post('/:id/purchase', (_req, res) => res.json({ success: true, data: {} }));
vehicleRoutes.post('/:id/restock', requireAdmin, (_req, res) => res.json({ success: true, data: {} }));

export default vehicleRoutes;
