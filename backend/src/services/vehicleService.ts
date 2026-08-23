import vehicleRepository from '../repositories/vehicleRepository';
import { AppError } from '../utils/AppError';
import {
  CreateVehicleInput,
  UpdateVehicleInput,
  SearchQueryInput,
  RestockInput,
} from '../schemas/vehicleSchemas';

const vehicleService = {
  async createVehicle(input: CreateVehicleInput) {
    const vehicle = await vehicleRepository.create(input);
    return { vehicle };
  },

  async getAllVehicles() {
    const vehicles = await vehicleRepository.findAll();
    return { vehicles };
  },

  async searchVehicles(filters: SearchQueryInput) {
    const vehicles = await vehicleRepository.search(filters);
    return { vehicles };
  },

  async updateVehicle(id: string, input: UpdateVehicleInput) {
    const existing = await vehicleRepository.findById(id);
    if (!existing) throw new AppError(404, 'Vehicle not found');
    const vehicle = await vehicleRepository.update(id, input);
    return { vehicle };
  },

  async deleteVehicle(id: string) {
    const existing = await vehicleRepository.findById(id);
    if (!existing) throw new AppError(404, 'Vehicle not found');
    await vehicleRepository.delete(id);
  },

  async purchaseVehicle(id: string) {
    const existing = await vehicleRepository.findById(id);
    if (!existing) throw new AppError(404, 'Vehicle not found');

    // Atomic decrement — safe under concurrent requests
    const rowsUpdated = await vehicleRepository.decrementStock(id);
    if (rowsUpdated === 0) {
      throw new AppError(409, 'This vehicle is out of stock');
    }

    const updated = await vehicleRepository.findById(id);
    return { vehicle: updated };
  },

  async restockVehicle(id: string, input: RestockInput) {
    const existing = await vehicleRepository.findById(id);
    if (!existing) throw new AppError(404, 'Vehicle not found');
    await vehicleRepository.incrementStock(id, input.quantity);
    const updated = await vehicleRepository.findById(id);
    return { vehicle: updated };
  },
};

export default vehicleService;
