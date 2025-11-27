import apiClient from './apiClient';
import type { LoginRequest, LoginResponse, RefreshTokenRequest, User } from '../types/entities';

interface BackendLoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  userName: string;
  email: string;
  role: string;
  expiresAt: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<BackendLoginResponse>('/auth/login', credentials);
    const data = response.data;
    
    console.log('🔄 Converting backend response to frontend format...');
    
    const user: User = {
      id: data.userId,
      username: data.userName,
      email: data.email,
      role: data.role,
      firstName: data.userName,
      lastName: '',              
      createdDate: data.expiresAt, 
      updatedDate: data.expiresAt,
      isDeleted: false,
    };
    
    console.log('Constructed user object:', user);
    
    return {
      user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refreshToken: async (request: RefreshTokenRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<BackendLoginResponse>('/auth/refresh', request);
    const data = response.data;
    
    const user: User = {
      id: data.userId,
      username: data.userName,
      email: data.email,
      role: data.role,
      firstName: data.userName,
      lastName: '',
      createdDate: data.expiresAt,
      updatedDate: data.expiresAt,
      isDeleted: false,
    };
    
    return {
      user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },
};

export default authApi;