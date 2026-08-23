import { Request, Response, NextFunction } from 'express';
import vehicleService from '../services/vehicleService';

const vehicleController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await vehicleService.createVehicle(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await vehicleService.getAllVehicles();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await vehicleService.searchVehicles(req.query as never);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await vehicleService.updateVehicle(req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await vehicleService.deleteVehicle(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async purchase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await vehicleService.purchaseVehicle(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async restock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await vehicleService.restockVehicle(req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};

export default vehicleController;
