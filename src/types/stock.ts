import type { ApiResponse } from './auth';

export type RankingFilter = 'VOLUME' | 'RISING' | 'FALLING';

export interface StockRankingItem {
  rank: string;
  stockCode: string;
  stockName: string;
  currentPrice: string;
  priceChange: string;
  priceChangeRate: string;
  volume: string;
}

export interface StockRankingData {
  items: StockRankingItem[];
}

export type StockRankingResponse = ApiResponse<StockRankingData>;
