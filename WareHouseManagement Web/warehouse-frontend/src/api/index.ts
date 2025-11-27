export { default as apiClient, handleApiError } from './apiClient';
export { default as authApi } from './authApi';
export { default as categoriesApi } from './categoriesApi';
export { default as productsApi } from './productsApi';
export { default as suppliersApi } from './suppliersApi';
export {
  locationsApi,
  inventoriesApi,
  ordersApi,
  orderLinesApi,
  usersApi,
} from './resourcesApi'; export { dashboardApi } from './dashboardApi';
export type { DashboardStats } from './dashboardApi';
