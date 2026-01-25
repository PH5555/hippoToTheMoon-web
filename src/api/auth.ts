import apiClient from './client';
import type { ApiResponse, SignInRequest, SignInResponse } from '../types/auth';

export const authApi = {
  /**
   * 소셜 로그인
   * POST /api/v1/auth/sign-in
   */
  signIn: async (request: SignInRequest): Promise<SignInResponse> => {
    const response = await apiClient.post<ApiResponse<SignInResponse>>(
      '/api/v1/auth/sign-in',
      request
    );
    return response.data.data;
  },

  /**
   * 로그아웃
   * POST /api/v1/auth/sign-out
   */
  signOut: async (): Promise<void> => {
    await apiClient.post<ApiResponse<null>>('/api/v1/auth/sign-out');
  },
};

export default authApi;
