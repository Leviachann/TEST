import apiClient from './apiClient'; 
import type { Blueprint, CreateBlueprintRequest, UpdateBlueprintRequest } from '../types/entities';

export const blueprintService = {
  getAll: async (): Promise<Blueprint[]> => {
    const response = await apiClient.get('/blueprints');
    return response.data;
  },

  getById: async (id: string): Promise<Blueprint> => {
    const response = await apiClient.get(`/blueprints/${id}`);
    return response.data;
  },

  create: async (data: CreateBlueprintRequest): Promise<{ id: string }> => {
    const response = await apiClient.post('/blueprints', data);
    return response.data;
  },

  update: async (id: string, data: UpdateBlueprintRequest): Promise<void> => {
    await apiClient.put(`/blueprints/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/blueprints/${id}`);
  },
};