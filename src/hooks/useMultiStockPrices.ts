import { useEffect, useState, useCallback, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import type { StockPriceUpdate, WebSocketConnectionState } from '../types/websocket';
import {
  createConnectFrame,
  createSubscribeFrame,
  createUnsubscribeFrame,
  parseStompFrame,
  generateSubscriptionId,
} from '../utils/stomp';

// WebSocket URL (ws:// 프로토콜 사용)
const WS_URL = `${import.meta.env.VITE_API_BASE_URL?.replace('http', 'ws')}/ws/websocket`;

interface UseMultiStockPricesResult {
  /** 종목별 가격 데이터 Map (stockCode -> priceData) */
  pricesMap: Map<string, StockPriceUpdate>;
  /** 특정 종목의 가격 데이터 조회 */
  getPrice: (stockCode: string) => StockPriceUpdate | undefined;
  /** WebSocket 연결 상태 */
  connectionState: WebSocketConnectionState;
  /** 연결 여부 */
  isConnected: boolean;
  /** 에러 여부 */
  hasError: boolean;
}

/**
 * 여러 종목의 실시간 가격을 동시에 구독하는 훅
 * @param stockCodes 종목 코드 배열
 * @param enabled 구독 활성화 여부 (기본값: true)
 */
export function useMultiStockPrices(
  stockCodes: string[],
  enabled: boolean = true
): UseMultiStockPricesResult {
  const [pricesMap, setPricesMap] = useState<Map<string, StockPriceUpdate>>(new Map());
  const [isStompConnected, setIsStompConnected] = useState(false);
  const subscriptionsRef = useRef<Map<string, string>>(new Map()); // stockCode -> subscriptionId
  const pendingStockCodesRef = useRef<string[]>([]);

  const shouldConnect = stockCodes.length > 0 && enabled;

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    shouldConnect ? WS_URL : null,
    {
      onOpen: () => {
        console.log('[WebSocket] 연결됨, STOMP CONNECT 전송');
        sendMessage(createConnectFrame());
      },
      onClose: () => {
        console.log('[WebSocket] 연결 종료');
        setIsStompConnected(false);
        subscriptionsRef.current.clear();
      },
      onError: (event) => {
        console.error('[WebSocket] 에러:', event);
      },
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: 3000,
    }
  );

  // STOMP 메시지 처리
  useEffect(() => {
    if (!lastMessage?.data) return;

    const frame = parseStompFrame(lastMessage.data);
    if (!frame) return;

    switch (frame.command) {
      case 'CONNECTED':
        console.log('[STOMP] 연결 성공');
        setIsStompConnected(true);
        break;

      case 'MESSAGE':
        try {
          const update: StockPriceUpdate = JSON.parse(frame.body);
          setPricesMap((prev) => {
            const newMap = new Map(prev);
            newMap.set(update.stockCode, update);
            return newMap;
          });
        } catch (e) {
          console.error('[STOMP] 메시지 파싱 오류:', e);
        }
        break;

      case 'ERROR':
        console.error('[STOMP] 에러:', frame.body);
        break;
    }
  }, [lastMessage]);

  // STOMP 연결 후 구독
  useEffect(() => {
    if (!isStompConnected) {
      pendingStockCodesRef.current = stockCodes;
      return;
    }

    const currentSubscriptions = subscriptionsRef.current;
    const currentCodes = new Set(currentSubscriptions.keys());
    const newCodes = new Set(stockCodes);

    // 새로 추가된 종목 구독
    stockCodes.forEach((stockCode) => {
      if (!currentCodes.has(stockCode)) {
        const subId = generateSubscriptionId();
        const destination = `/topic/price/${stockCode}`;
        console.log('[STOMP] 구독:', destination);
        sendMessage(createSubscribeFrame(destination, subId));
        currentSubscriptions.set(stockCode, subId);
      }
    });

    // 제거된 종목 구독 해제
    currentCodes.forEach((stockCode) => {
      if (!newCodes.has(stockCode)) {
        const subId = currentSubscriptions.get(stockCode);
        if (subId) {
          console.log('[STOMP] 구독 해제:', stockCode);
          sendMessage(createUnsubscribeFrame(subId));
          currentSubscriptions.delete(stockCode);
          
          // 가격 데이터도 제거
          setPricesMap((prev) => {
            const newMap = new Map(prev);
            newMap.delete(stockCode);
            return newMap;
          });
        }
      }
    });
  }, [isStompConnected, stockCodes.join(','), sendMessage]);

  // 컴포넌트 언마운트 시 모든 구독 해제
  useEffect(() => {
    return () => {
      if (isStompConnected) {
        subscriptionsRef.current.forEach((subId) => {
          sendMessage(createUnsubscribeFrame(subId));
        });
        subscriptionsRef.current.clear();
      }
    };
  }, [isStompConnected, sendMessage]);

  // 특정 종목의 가격 조회
  const getPrice = useCallback(
    (stockCode: string) => pricesMap.get(stockCode),
    [pricesMap]
  );

  // 연결 상태 매핑
  const getConnectionState = useCallback((): WebSocketConnectionState => {
    if (readyState === ReadyState.CONNECTING) return 'connecting';
    if (readyState === ReadyState.OPEN && isStompConnected) return 'connected';
    if (readyState === ReadyState.CLOSED || readyState === ReadyState.CLOSING) return 'disconnected';
    return 'disconnected';
  }, [readyState, isStompConnected]);

  const connectionState = getConnectionState();

  return {
    pricesMap,
    getPrice,
    connectionState,
    isConnected: connectionState === 'connected',
    hasError: false,
  };
}

export default useMultiStockPrices;
