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

// 주식 기본 정보
export interface StockBasicInfo {
  stockCode: string;
  stockName: string;
  marketType: string;        // KOSPI, KOSDAQ
  sector: string;            // 업종
  capital: string;           // 자본금
  parValue: string;          // 액면가
  listedShares: string;      // 상장주식수
  marketCap: string;         // 시가총액
  per: string;               // PER
  pbr: string;               // PBR
  eps: string;               // EPS
  bps: string;               // BPS
}

// 실시간 가격 정보
export interface StockPriceInfo {
  currentPrice: string;
  priceChange: string;
  priceChangeRate: string;
  openPrice: string;         // 시가
  highPrice: string;         // 고가
  lowPrice: string;          // 저가
  volume: string;            // 거래량
  tradingValue: string;      // 거래대금
  prevClosePrice: string;    // 전일종가
}

// 차트 데이터 (시간별 OHLC)
export interface StockChartDataPoint {
  time: string;
  open: number;    // 시가
  high: number;    // 고가
  low: number;     // 저가
  close: number;   // 종가
  volume: number;
}
