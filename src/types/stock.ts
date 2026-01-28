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

// ============================================
// 주식 상세 정보 API 타입
// ============================================

// 주식 기본정보 API 응답
export interface StockDetailData {
  stockCode: string;
  stockName: string;
  currentPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  priceChange: string;
  priceChangeRate: string;
  marketCap: string;
  per: string;
  pbr: string;
  eps: string;
  volume: string;
}

export type StockDetailResponse = ApiResponse<StockDetailData>;

// 차트 기간 타입
export type ChartPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

// 차트 데이터 포인트 (API 응답)
export interface ChartDataPoint {
  date: string;      // YYYYMMDD
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

// 차트 API 응답 데이터
export interface StockChartData {
  stockCode: string;
  period: ChartPeriod;
  data: ChartDataPoint[];
}

export type StockChartResponse = ApiResponse<StockChartData>;

// ============================================
// 종목 검색 API 타입
// ============================================

export type StockMarket = 'KOSPI' | 'KOSDAQ';

export interface StockSearchItem {
  stockCode: string;
  stockName: string;
  market: StockMarket;
}

export type StockSearchResponse = ApiResponse<StockSearchItem[]>;
