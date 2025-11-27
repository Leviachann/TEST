import apiClient from './apiClient'; 
import type { Rack, CreateRackRequest, UpdateRackRequest } from '../types/entities';

export const rackService = {
  getByBlueprintId: async (blueprintId: string): Promise<Rack[]> => {
    const response = await apiClient.get(`/racks/blueprint/${blueprintId}`);
    return response.data;
  },

  create: async (data: CreateRackRequest): Promise<{ id: string }> => {
    const response = await apiClient.post('/racks', data);
    return response.data;
  },

  update: async (id: string, data: UpdateRackRequest): Promise<void> => {
    await apiClient.put(`/racks/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/racks/${id}`);
  },
};