import apiClient from './apiClient';
import type { Supplier, SupplierFormData, FilterParams, PaginatedResponse } from '../types/entities';

export const suppliersApi = {
  getAll: async (): Promise<Supplier[]> => {
    const response = await apiClient.get<Supplier[]>('/suppliers');
    return response.data;
  },

  getById: async (id: string): Promise<Supplier> => {
    const response = await apiClient.get<Supplier>(`/suppliers/${id}`);
    return response.data;
  },

  filter: async (params: FilterParams): Promise<PaginatedResponse<Supplier>> => {
    const response = await apiClient.get<PaginatedResponse<Supplier>>('/suppliers/filter', { params });
    return response.data;
  },

  create: async (data: SupplierFormData): Promise<Supplier> => {
    const response = await apiClient.post<Supplier>('/suppliers', data);
    return response.data;
  },

  update: async (id: string, data: SupplierFormData): Promise<void> => {
    await apiClient.put(`/suppliers/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}`);
  },
};

export default suppliersApi;