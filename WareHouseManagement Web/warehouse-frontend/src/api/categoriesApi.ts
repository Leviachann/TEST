import apiClient from './apiClient';
import type { Category, CategoryFormData } from '../types/entities';

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<Category>(`/categories/${id}`);
    return response.data;
  },

  create: async (data: CategoryFormData): Promise<Category> => {
    const response = await apiClient.post<Category>('/categories', data);
    return response.data;
  },

  update: async (id: string, data: CategoryFormData): Promise<Category> => {
    const response = await apiClient.put<Category>(`/categories/${id}`, {
      id, 
      ...data
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};

export default categoriesApi;