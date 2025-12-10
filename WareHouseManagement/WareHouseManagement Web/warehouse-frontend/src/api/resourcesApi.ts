import apiClient from './apiClient';
import type {
  Location,
  LocationFormData,
  Inventory,
  InventoryFormData,
  Order,
  OrderFormData,
  OrderLine,
  OrderLineFormData,
  User,
  UserFormData,
  FilterParams,
  PaginatedResponse,
} from '../types/entities';

export const locationsApi = {
  getAll: async (): Promise<Location[]> => {
    const response = await apiClient.get<Location[]>('/locations');
    return response.data;
  },

  getById: async (id: string): Promise<Location> => {
    const response = await apiClient.get<Location>(`/locations/${id}`);
    return response.data;
  },

  filter: async (params: FilterParams): Promise<PaginatedResponse<Location>> => {
    const response = await apiClient.get<PaginatedResponse<Location>>('/locations/filter', { params });
    return response.data;
  },

  create: async (data: LocationFormData): Promise<Location> => {
    const response = await apiClient.post<Location>('/locations', data);
    return response.data;
  },

  update: async (id: string, data: LocationFormData): Promise<void> => {
    await apiClient.put(`/locations/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/locations/${id}`);
  },
};

export const inventoriesApi = {
  getAll: async (): Promise<Inventory[]> => {
    const response = await apiClient.get<Inventory[]>('/inventories');
    return response.data;
  },

  getById: async (id: string): Promise<Inventory> => {
    const response = await apiClient.get<Inventory>(`/inventories/${id}`);
    return response.data;
  },

  getByProductId: async (productId: string): Promise<Inventory> => {
    const response = await apiClient.get<Inventory>(`/inventories/product/${productId}`);
    return response.data;
  },

  create: async (data: InventoryFormData): Promise<Inventory> => {
    const response = await apiClient.post<Inventory>('/inventories', data);
    return response.data;
  },

  update: async (id: string, data: InventoryFormData): Promise<void> => {
    await apiClient.put(`/inventories/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/inventories/${id}`);
  },
};

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>('/orders');
    return response.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  getBySupplier: async (supplierId: string): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>(`/orders/supplier/${supplierId}`);
    return response.data;
  },

  filter: async (params: FilterParams): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<PaginatedResponse<Order>>('/orders/filter', { params });
    return response.data;
  },

  create: async (data: OrderFormData): Promise<Order> => {
    const response = await apiClient.post<Order>('/orders', data);
    return response.data;
  },

  update: async (id: string, data: OrderFormData): Promise<void> => {
    await apiClient.put(`/orders/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
  },
};

export const orderLinesApi = {
  getAll: async (): Promise<OrderLine[]> => {
    const response = await apiClient.get<OrderLine[]>('/orderlines');
    return response.data;
  },

  getById: async (id: string): Promise<OrderLine> => {
    const response = await apiClient.get<OrderLine>(`/orderlines/${id}`);
    return response.data;
  },

  getByOrderId: async (orderId: string): Promise<OrderLine[]> => {
    const response = await apiClient.get<OrderLine[]>(`/orderlines/order/${orderId}`);
    return response.data;
  },

  filter: async (params: FilterParams): Promise<PaginatedResponse<OrderLine>> => {
    const response = await apiClient.get<PaginatedResponse<OrderLine>>('/orderlines/filter', { params });
    return response.data;
  },

  create: async (data: OrderLineFormData & { orderId: string }): Promise<OrderLine> => {
    const response = await apiClient.post<OrderLine>('/orderlines', data);
    return response.data;
  },

  update: async (id: string, data: OrderLineFormData): Promise<void> => {
    await apiClient.put(`/orderlines/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/orderlines/${id}`);
  },
};

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: UserFormData): Promise<User> => {
    const response = await apiClient.post<User>('/users/register', data);
    return response.data;
  },

  update: async (id: string, data: Partial<UserFormData>): Promise<void> => {
    await apiClient.put(`/users/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};