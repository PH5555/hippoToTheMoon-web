import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';
import userApi from '../api/user';
import type { UserInfo } from '../types/user';
import type { ApiResponse } from '../types/auth';
import { getUserErrorMessage } from '../types/user';

/**
 * 유저 정보 조회 훅
 * - 로그인 상태일 때만 조회
 * - 5분간 캐시 유지
 */
export function useUser() {
  const { isAuthenticated } = useAuthStore();

  return useQuery<UserInfo, AxiosError<ApiResponse<null>>>({
    queryKey: ['user'],
    queryFn: userApi.getMe,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5분
    retry: 1,
  });
}

/**
 * 닉네임 수정 훅
 */
export function useUpdateNickname() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiResponse<null>>, string>({
    mutationFn: (nickname: string) => userApi.updateNickname(nickname),
    onSuccess: () => {
      // 성공 시 유저 정보 새로고침
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

/**
 * 회원 탈퇴 훅
 */
export function useWithdraw() {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation<void, AxiosError<ApiResponse<null>>, void>({
    mutationFn: userApi.withdrawUser,
    onSuccess: () => {
      // 탈퇴 성공 시 캐시 초기화 및 로그아웃 처리
      queryClient.clear();
      logout();
    },
  });
}

/**
 * 에러 메시지 추출 유틸리티
 */
export function extractUserError(error: AxiosError<ApiResponse<null>> | null): string | null {
  if (!error) return null;
  const errorCode = error.response?.data?.errorCode;
  return getUserErrorMessage(errorCode ?? null);
}

export default useUser;
