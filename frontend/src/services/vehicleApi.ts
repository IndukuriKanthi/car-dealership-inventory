import { apiClient } from './apiClient';
import type {
  Vehicle,
  CreateVehicleRequest,
  UpdateVehicleRequest,
  RestockRequest,
  VehicleSearchParams,
  ApiSuccess,
} from '../types';

type VehicleListResponse = ApiSuccess<{ vehicles: Vehicle[] }>;
type VehicleResponse = ApiSuccess<{ vehicle: Vehicle }>;

export const vehicleApi = {
  getAll: () => apiClient.get<VehicleListResponse>('/vehicles'),

  search: (params: VehicleSearchParams) => {
    const query = new URLSearchParams();
    if (params.make) query.set('make', params.make);
    if (params.model) query.set('model', params.model);
    if (params.category) query.set('category', params.category);
    if (params.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
    const qs = query.toString();
    return apiClient.get<VehicleListResponse>(`/vehicles/search${qs ? `?${qs}` : ''}`);
  },

  create: (data: CreateVehicleRequest) =>
    apiClient.post<VehicleResponse>('/vehicles', data),

  update: (id: string, data: UpdateVehicleRequest) =>
    apiClient.put<VehicleResponse>(`/vehicles/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/vehicles/${id}`),

  purchase: (id: string) =>
    apiClient.post<VehicleResponse>(`/vehicles/${id}/purchase`),

  restock: (id: string, data: RestockRequest) =>
    apiClient.post<VehicleResponse>(`/vehicles/${id}/restock`, data),
};
