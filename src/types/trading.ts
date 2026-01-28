import type { ApiResponse } from './auth';

// 거래 유형
export type TradeType = 'BUY' | 'SELL';

// 거래 요청
export interface TradeRequest {
  stockCode: string;
  quantity: number;
}

// 거래 결과
export interface TradeResult {
  stockCode: string;
  stockName: string;
  tradeType: TradeType;
  price: number;
  quantity: number;
  amount: number;
  remainingBalance: number;
}

// 보유 주식
export interface Holding {
  stockCode: string;
  stockName: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossRate: string;
}

// 거래 내역
export interface TradeHistory {
  id: number;
  stockCode: string;
  stockName: string;
  tradeType: TradeType;
  price: number;
  quantity: number;
  amount: number;
  createdAt: string;
}

// API 응답 타입들
export type TradeResultResponse = ApiResponse<TradeResult>;
export type HoldingsResponse = ApiResponse<Holding[]>;
export type TradeHistoryResponse = ApiResponse<TradeHistory[]>;

// 에러 코드 타입
export type TradingErrorCode = 
  | 'HIP001-401'  // 인증 실패
  | 'HIP002-400'  // 유효하지 않은 수량
  | 'HIP003-400'  // 잔고 부족
  | 'HIP004-400'  // 보유 수량 부족
  | 'HIP002-404'; // 사용자를 찾을 수 없음

// 에러 메시지 매핑
export const TRADING_ERROR_MESSAGES: Record<TradingErrorCode, string> = {
  'HIP001-401': '로그인이 필요합니다. 다시 로그인해주세요.',
  'HIP002-400': '올바른 수량을 입력해주세요.',
  'HIP003-400': '잔고가 부족합니다. 수량을 줄이거나 먼저 주식을 매도해주세요.',
  'HIP004-400': '보유 수량이 부족합니다. 보유 수량을 확인해주세요.',
  'HIP002-404': '사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.',
};

// 에러 메시지 조회 유틸리티
export function getTradingErrorMessage(errorCode: string | null): string {
  if (!errorCode) return '알 수 없는 오류가 발생했습니다.';
  return TRADING_ERROR_MESSAGES[errorCode as TradingErrorCode] || '거래 중 오류가 발생했습니다.';
}
