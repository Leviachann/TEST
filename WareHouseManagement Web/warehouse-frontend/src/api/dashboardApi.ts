import apiClient from './apiClient';
import type { Product, Location, Blueprint, Inventory } from '../types/entities';

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalBlueprints: number;
  totalLocations: number;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const [productsRes, inventoriesRes, blueprintsRes, locationsRes] = await Promise.all([
        apiClient.get<Product[]>('/products'),
        apiClient.get<Inventory[]>('/inventories'),
        apiClient.get<Blueprint[]>('/blueprints'),
        apiClient.get<Location[]>('/locations'),
      ]);

      const products = productsRes.data;
      const inventories = inventoriesRes.data;

      const inventoryMap = inventories.reduce((acc, inv) => {
        acc[inv.productId] = inv;
        return acc;
      }, {} as Record<string, { currentStock: number; reorderLevel: number }>);

      const lowStockProducts = products.filter(
        (product) => {
          const inv = inventoryMap[product.id];
          return inv && inv.currentStock <= inv.reorderLevel;
        }
      ).length;

      const blueprints = blueprintsRes.data;
      const locations = locationsRes.data;

      const totalProducts = products.length;

      const totalBlueprints = blueprints.length;

      const totalLocations = locations.length;

      return {
        totalProducts,
        lowStockProducts,
        totalBlueprints,
        totalLocations,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  getProductsCount: async (): Promise<number> => {
    const response = await apiClient.get<Product[]>('/products');
    return response.data.length;
  },

  getBlueprintsCount: async (): Promise<number> => {
    const response = await apiClient.get<Blueprint[]>('/blueprints');
    return response.data.length;
  },

  getLocationsCount: async (): Promise<number> => {
    const response = await apiClient.get<Location[]>('/locations');
    return response.data.length;
  },

  getLowStockProductsCount: async (): Promise<number> => {
    const response = await apiClient.get<Product[]>('/products');
    return response.data.filter(
      (product) =>
        product.inventory &&
        product.inventory.currentStock <= product.inventory.reorderLevel
    ).length;
  },
};