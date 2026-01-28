import { publicApiClient } from './client';
import type { 
  RankingFilter, 
  StockRankingResponse, 
  StockDetailResponse,
  StockChartResponse,
  StockSearchResponse,
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

/**
 * 종목 검색 (자동완성)
 * @param keyword - 검색 키워드 (종목명 또는 종목코드)
 * @param limit - 최대 결과 개수 (기본값: 10)
 * @param signal - AbortSignal (요청 취소용)
 * @returns 검색 결과 목록
 */
export async function searchStocks(
  keyword: string,
  limit: number = 10,
  signal?: AbortSignal
): Promise<StockSearchResponse> {
  const response = await publicApiClient.get<StockSearchResponse>(
    '/api/v1/stocks/search',
    {
      params: { keyword, limit },
      signal,
    }
  );
  return response.data;
}

const stockApi = {
  getStockRanking,
  getStockDetail,
  getStockChart,
  searchStocks,
};

export default stockApi;
