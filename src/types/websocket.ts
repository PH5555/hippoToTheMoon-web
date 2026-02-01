/**
 * WebSocket 실시간 시세 관련 타입 정의
 */

// 실시간 가격 업데이트 메시지 (서버 → 클라이언트)
export interface StockPriceUpdate {
  stockCode: string;
  stockName: string;
  currentPrice: number;
  changePrice: number;
  changeRate: number;
  volume: number;
  timestamp: number;
}

// WebSocket 연결 상태
export type WebSocketConnectionState = 
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

// 구독 콜백 타입
export type PriceUpdateCallback = (update: StockPriceUpdate) => void;

// 구독 정보
export interface Subscription {
  stockCode: string;
  callback: PriceUpdateCallback;
  unsubscribe: () => void;
}
