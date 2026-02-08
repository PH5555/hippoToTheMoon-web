import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import type { ApiResponse } from '../types/auth';
import type { UserRankingData } from '../types/userRanking';
import { getUserRanking } from '../api/userRanking';

/**
 * User ranking list
 * - auto refresh every 60s
 */
export function useUserRanking(limit = 50) {
  return useQuery<UserRankingData, AxiosError<ApiResponse<null>>>({
    queryKey: ['user-ranking', limit],
    queryFn: () => getUserRanking(limit),
    staleTime: 1000 * 60, // 60s
    refetchInterval: 1000 * 60,
    retry: 1,
  });
}

export default useUserRanking;
