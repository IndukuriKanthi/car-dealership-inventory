export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: string; // Prisma Decimal serialises as string
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokenPayload {
  userId: string;
  role: Role;
}

// ---- Request / Response shapes ----

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateVehicleRequest {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export interface UpdateVehicleRequest {
  make?: string;
  model?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

export interface RestockRequest {
  quantity: number;
}

export interface VehicleSearchParams {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

// ---- Generic API envelope ----

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
