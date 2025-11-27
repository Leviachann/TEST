import apiClient from './apiClient';
import type { Product, ProductFormData, FilterParams, PaginatedResponse } from '../types/entities';

export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products');
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  getByCategory: async (categoryId: string): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(`/products/category/${categoryId}`);
    return response.data;
  },

  getBySupplier: async (supplierId: string): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(`/products/supplier/${supplierId}`);
    return response.data;
  },

  filter: async (params: FilterParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<PaginatedResponse<Product>>('/products/filter', { params });
    return response.data;
  },

  create: async (data: ProductFormData): Promise<Product> => {
    const response = await apiClient.post<Product>('/products', data);
    return response.data;
  },

  update: async (id: string, data: ProductFormData): Promise<void> => {
    await apiClient.put(`/products/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};

export default productsApi;