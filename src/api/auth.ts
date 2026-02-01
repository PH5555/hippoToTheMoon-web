import apiClient, { publicApiClient } from './client';
import type { ApiResponse, SignInRequest } from '../types/auth';

export const authApi = {
  /**
   * 소셜 로그인 (Public API - 인증 불필요)
   * POST /api/v1/auth/sign-in
   * 토큰은 Set-Cookie 헤더로 자동 설정됨
   */
  signIn: async (request: SignInRequest): Promise<void> => {
    await publicApiClient.post<ApiResponse<null>>(
      '/api/v1/auth/sign-in',
      request
    );
    // 토큰은 Set-Cookie 헤더로 자동 설정됨
  },

  /**
   * 로그아웃 (인증 필요)
   * POST /api/v1/auth/sign-out
   * 서버에서 쿠키를 삭제(만료)함
   */
  signOut: async (): Promise<void> => {
    await apiClient.post<ApiResponse<null>>('/api/v1/auth/sign-out');
  },

  /**
   * 토큰 재발급 (쿠키의 refreshToken 사용)
   * POST /api/v1/auth/refresh
   * 새 토큰은 Set-Cookie 헤더로 자동 설정됨
   */
  refresh: async (): Promise<void> => {
    await publicApiClient.post<ApiResponse<null>>('/api/v1/auth/refresh');
    // 토큰은 Set-Cookie 헤더로 자동 갱신됨
  },
};

export default authApi;
