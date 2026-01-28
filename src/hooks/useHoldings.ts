import { useQuery } from '@tanstack/react-query';
import { getHoldings } from '../api/trading';
import type { Holding } from '../types/trading';

interface UseHoldingsReturn {
  holdings: Holding[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  getHoldingByStockCode: (stockCode: string) => Holding | null;
}

/**
 * 보유 주식 조회 커스텀 훅
 * - React Query useQuery 사용
 * - 5분마다 자동 새로고침
 * - 특정 종목 보유 정보 조회 유틸리티 제공
 */
export function useHoldings(enabled: boolean = true): UseHoldingsReturn {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['holdings'],
    queryFn: getHoldings,
    enabled,
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnWindowFocus: true,
  });

  const holdings = data?.data ?? [];

  // 특정 종목 보유 정보 조회
  const getHoldingByStockCode = (stockCode: string): Holding | null => {
    return holdings.find((h) => h.stockCode === stockCode) ?? null;
  };

  return {
    holdings,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    getHoldingByStockCode,
  };
}

export default useHoldings;
