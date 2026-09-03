import api from './api';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: any;
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
}

export const authService = {
  register: (data: RegisterData) => api.post<any, AuthResponse>('/auth/register', data),
  
  login: (data: LoginData) => api.post<any, AuthResponse>('/auth/login', data),
  
  logout: () => api.post('/auth/logout'),
  
  getCurrentUser: () => api.get('/auth/me'),
  
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
  
  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),
  
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
  
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),
};

export default authService;
