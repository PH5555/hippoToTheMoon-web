import { publicApiClient } from './client';
import type { 
  RankingFilter, 
  StockRankingResponse, 
  StockDetailResponse,
  StockChartResponse,
  ChartPeriod,
} from '../types/stock';

/**
 * 주식 랭킹 조회
 * @param filter - 랭킹 필터 타입 (VOLUME, RISING, FALLING)
 * @returns 주식 랭킹 데이터
 */
export async function getStockRanking(filter: RankingFilter): Promise<StockRankingResponse> {
  const response = await publicApiClient.get<StockRankingResponse>('/api/v1/stocks/ranking', {
    params: {
      filter: filter,
    },
  });

  return response.data;
}

/**
 * 주식 기본정보 조회
 * @param stockCode - 종목코드 (예: 005930)
 * @returns 주식 기본정보 (현재가, 시가총액, PER, PBR 등)
 */
export async function getStockDetail(stockCode: string): Promise<StockDetailResponse> {
  const response = await publicApiClient.get<StockDetailResponse>(`/api/v1/stocks/${stockCode}`);
  return response.data;
}

/**
 * 주식 차트 데이터 조회
 * @param stockCode - 종목코드 (예: 005930)
 * @param period - 조회 기간 (DAILY, WEEKLY, MONTHLY, YEARLY)
 * @returns OHLC 차트 데이터
 */
export async function getStockChart(
  stockCode: string,
  period: ChartPeriod = 'DAILY'
): Promise<StockChartResponse> {
  const response = await publicApiClient.get<StockChartResponse>(
    `/api/v1/stocks/${stockCode}/chart`,
    {
      params: { period },
    }
  );
  return response.data;
}

const stockApi = {
  getStockRanking,
  getStockDetail,
  getStockChart,
};

export default stockApi;
