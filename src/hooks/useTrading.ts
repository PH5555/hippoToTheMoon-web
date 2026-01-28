import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { buyStock, sellStock } from '../api/trading';
import type { TradeResult, TradeType, TradeResultResponse } from '../types/trading';
import type { ApiResponse } from '../types/auth';
import { getTradingErrorMessage } from '../types/trading';

interface TradingParams {
  stockCode: string;
  quantity: number;
}

interface UseTradingReturn {
  buy: (params: TradingParams) => Promise<TradeResult | null>;
  sell: (params: TradingParams) => Promise<TradeResult | null>;
  buyMutation: ReturnType<typeof useMutation<TradeResultResponse, AxiosError<ApiResponse<null>>, TradingParams>>;
  sellMutation: ReturnType<typeof useMutation<TradeResultResponse, AxiosError<ApiResponse<null>>, TradingParams>>;
  isLoading: boolean;
  error: string | null;
  lastTradeResult: TradeResult | null;
}

/**
 * 주식 매수/매도 커스텀 훅
 * - React Query useMutation 사용
 * - 성공 시 holdings 쿼리 무효화
 * - 에러 메시지 자동 변환
 */
export function useTrading(): UseTradingReturn {
  const queryClient = useQueryClient();

  // 매수 mutation
  const buyMutation = useMutation<
    TradeResultResponse,
    AxiosError<ApiResponse<null>>,
    TradingParams
  >({
    mutationFn: ({ stockCode, quantity }) => buyStock(stockCode, quantity),
    onSuccess: () => {
      // 성공 시 보유 주식 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['holdings'] });
    },
  });

  // 매도 mutation
  const sellMutation = useMutation<
    TradeResultResponse,
    AxiosError<ApiResponse<null>>,
    TradingParams
  >({
    mutationFn: ({ stockCode, quantity }) => sellStock(stockCode, quantity),
    onSuccess: () => {
      // 성공 시 보유 주식 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['holdings'] });
    },
  });

  // 매수 실행
  const buy = async (params: TradingParams): Promise<TradeResult | null> => {
    try {
      const response = await buyMutation.mutateAsync(params);
      return response.data;
    } catch {
      return null;
    }
  };

  // 매도 실행
  const sell = async (params: TradingParams): Promise<TradeResult | null> => {
    try {
      const response = await sellMutation.mutateAsync(params);
      return response.data;
    } catch {
      return null;
    }
  };

  // 현재 로딩 상태
  const isLoading = buyMutation.isPending || sellMutation.isPending;

  // 에러 메시지 처리
  const getError = (): string | null => {
    const error = buyMutation.error || sellMutation.error;
    if (!error) return null;

    const errorResponse = error.response?.data;
    if (errorResponse?.errorCode) {
      return getTradingErrorMessage(errorResponse.errorCode);
    }
    return '거래 중 오류가 발생했습니다.';
  };

  // 마지막 거래 결과
  const lastTradeResult = buyMutation.data?.data || sellMutation.data?.data || null;

  return {
    buy,
    sell,
    buyMutation,
    sellMutation,
    isLoading,
    error: getError(),
    lastTradeResult,
  };
}

export default useTrading;
