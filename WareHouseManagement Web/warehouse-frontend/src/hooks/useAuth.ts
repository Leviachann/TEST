import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api';
import type { LoginRequest } from '../types/entities';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { handleApiError } from '../api/apiClient';

export const useLogin = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken);
      navigate('/');
    },
    onError: (error) => {
      throw new Error(handleApiError(error));
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout();
      navigate('/login');
    },
    onError: () => {
      logout();
      navigate('/login');
    },
  });
};