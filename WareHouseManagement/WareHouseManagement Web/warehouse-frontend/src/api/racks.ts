/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from './apiClient'; 
import type { Rack } from '../types/entities';

export const racksApi = {
  getByBlueprintId: async (blueprintId: string): Promise<Rack[]> => {
    const response = await  apiClient.get(`/racks/blueprint/${blueprintId}`);
    return response.data;
  },

  create: async (data: any): Promise<{ id: string }> => {
    const response = await  apiClient.post('/racks', data);
    return response.data;
  },

  update: async (id: string, data: any): Promise<void> => {
    await  apiClient.put(`/racks/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await  apiClient.delete(`/racks/${id}`);
  },
};