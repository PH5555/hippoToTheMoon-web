import { apiClient } from './client';
import type {
  TradeRequest,
  TradeResultResponse,
  HoldingsResponse,
  TradeHistoryResponse,
  Holding,
} from '../types/trading';

/**
 * 주식 매수
 * @param stockCode - 종목 코드 (예: "005930")
 * @param quantity - 매수 수량 (1 이상)
 * @returns 거래 결과 (체결 정보 및 잔고)
 */
export async function buyStock(stockCode: string, quantity: number): Promise<TradeResultResponse> {
  const request: TradeRequest = { stockCode, quantity };
  const response = await apiClient.post<TradeResultResponse>('/api/v1/trading/buy', request);
  return response.data;
}

/**
 * 주식 매도
 * @param stockCode - 종목 코드 (예: "005930")
 * @param quantity - 매도 수량 (1 이상)
 * @returns 거래 결과 (체결 정보 및 잔고)
 */
export async function sellStock(stockCode: string, quantity: number): Promise<TradeResultResponse> {
  const request: TradeRequest = { stockCode, quantity };
  const response = await apiClient.post<TradeResultResponse>('/api/v1/trading/sell', request);
  return response.data;
}

/**
 * 보유 주식 조회
 * @returns 보유 주식 목록
 */
export async function getHoldings(): Promise<HoldingsResponse> {
  const response = await apiClient.get<HoldingsResponse>('/api/v1/holdings');
  return response.data;
}

/**
 * 특정 종목 보유 수량 조회
 * @param stockCode - 종목 코드
 * @returns 해당 종목의 보유 정보 (없으면 null)
 */
export async function getHoldingByStockCode(stockCode: string): Promise<Holding | null> {
  const response = await getHoldings();
  const holding = response.data.find((h) => h.stockCode === stockCode);
  return holding ?? null;
}

/**
 * 거래 내역 조회
 * @returns 거래 내역 목록
 */
export async function getTradeHistory(): Promise<TradeHistoryResponse> {
  const response = await apiClient.get<TradeHistoryResponse>('/api/v1/trades');
  return response.data;
}

const tradingApi = {
  buyStock,
  sellStock,
  getHoldings,
  getHoldingByStockCode,
  getTradeHistory,
};

export default tradingApi;
