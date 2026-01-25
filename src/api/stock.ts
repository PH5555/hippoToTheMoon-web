import { publicApiClient } from './client';
import type { RankingFilter, StockRankingResponse } from '../types/stock';

/**
 * 주식 랭킹 조회 (실제 API 호출)
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

const stockApi = {
  getStockRanking,
};

export default stockApi;
