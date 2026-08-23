import { apiClient } from './apiClient';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ApiSuccess,
} from '../types';

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<ApiSuccess<{ user: AuthResponse['user'] }>>('/auth/register', data),

  login: (data: LoginRequest) =>
    apiClient.post<ApiSuccess<AuthResponse>>('/auth/login', data),
};
