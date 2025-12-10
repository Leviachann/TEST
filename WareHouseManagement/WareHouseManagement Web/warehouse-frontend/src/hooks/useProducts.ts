import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api';
import type { ProductFormData, FilterParams } from '../types/entities';
import { handleApiError } from '../api/apiClient';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: FilterParams) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  byCategory: (categoryId: string) => [...productKeys.all, 'category', categoryId] as const,
  bySupplier: (supplierId: string) => [...productKeys.all, 'supplier', supplierId] as const,
};

export const useProducts = () => {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: () => productsApi.getAll(),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });
};

export const useProductsByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: productKeys.byCategory(categoryId),
    queryFn: () => productsApi.getByCategory(categoryId),
    enabled: !!categoryId,
  });
};

export const useProductsBySupplier = (supplierId: string) => {
  return useQuery({
    queryKey: productKeys.bySupplier(supplierId),
    queryFn: () => productsApi.getBySupplier(supplierId),
    enabled: !!supplierId,
  });
};

export const useProductsFilter = (params: FilterParams) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsApi.filter(params),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductFormData) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductFormData }) =>
      productsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};