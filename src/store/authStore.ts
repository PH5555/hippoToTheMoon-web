import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: () => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,

  login: () => {
    // 쿠키 기반 인증이므로 토큰 저장 불필요
    // Set-Cookie 헤더로 브라우저가 자동 관리함
    set({
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    // 쿠키 기반 인증이므로 클라이언트 상태만 초기화
    // 실제 쿠키 삭제는 서버의 sign-out API가 처리함
    set({
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  initialize: async () => {
    try {
      // 쿠키 기반 인증이므로 API 호출로 인증 상태 확인
      // 쿠키가 유효하면 200, 아니면 401
      const userApi = await import('../api/user');
      await userApi.getMe();
      
      set({
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      // 401 또는 기타 에러 - 미인증 상태
      set({
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

export default useAuthStore;
