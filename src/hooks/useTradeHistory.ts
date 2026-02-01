import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';
import tradingApi from '../api/trading';
import type { TradeHistory } from '../types/trading';
import type { ApiResponse } from '../types/auth';

/**
 * 거래 내역 조회 훅
 * - 로그인 상태일 때만 조회
 * - 1분간 캐시 유지
 */
export function useTradeHistory() {
  const { isAuthenticated } = useAuthStore();

  return useQuery<TradeHistory[], AxiosError<ApiResponse<null>>>({
    queryKey: ['tradeHistory'],
    queryFn: async () => {
      const response = await tradingApi.getTradeHistory();
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60, // 1분
  });
}

export default useTradeHistory;
