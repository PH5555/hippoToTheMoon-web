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

interface UseStockPriceResult {
  /** 실시간 가격 데이터 */
  priceData: StockPriceUpdate | null;
  /** WebSocket 연결 상태 */
  connectionState: WebSocketConnectionState;
  /** 연결 여부 */
  isConnected: boolean;
  /** 에러 여부 */
  hasError: boolean;
}

/**
 * 단일 종목의 실시간 가격을 구독하는 훅
 * @param stockCode 종목 코드
 * @param enabled 구독 활성화 여부 (기본값: true)
 */
export function useStockPrice(
  stockCode: string | undefined,
  enabled: boolean = true
): UseStockPriceResult {
  const [priceData, setPriceData] = useState<StockPriceUpdate | null>(null);
  const [isStompConnected, setIsStompConnected] = useState(false);
  const subscriptionIdRef = useRef<string | null>(null);
  const hasSubscribedRef = useRef(false);

  const shouldConnect = !!stockCode && enabled;

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
        hasSubscribedRef.current = false;
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

    console.log('[STOMP] 프레임 수신:', frame.command);

    switch (frame.command) {
      case 'CONNECTED':
        console.log('[STOMP] 연결 성공');
        setIsStompConnected(true);
        break;

      case 'MESSAGE':
        try {
          const update: StockPriceUpdate = JSON.parse(frame.body);
          console.log('[STOMP] 가격 업데이트:', update);
          setPriceData(update);
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
    if (isStompConnected && stockCode && !hasSubscribedRef.current) {
      const subId = generateSubscriptionId();
      subscriptionIdRef.current = subId;
      
      const destination = `/topic/price/${stockCode}`;
      console.log('[STOMP] 구독:', destination);
      sendMessage(createSubscribeFrame(destination, subId));
      hasSubscribedRef.current = true;
    }
  }, [isStompConnected, stockCode, sendMessage]);

  // 구독 해제 (종목 변경 또는 언마운트 시)
  useEffect(() => {
    return () => {
      if (subscriptionIdRef.current && isStompConnected) {
        console.log('[STOMP] 구독 해제:', subscriptionIdRef.current);
        sendMessage(createUnsubscribeFrame(subscriptionIdRef.current));
        subscriptionIdRef.current = null;
        hasSubscribedRef.current = false;
      }
    };
  }, [stockCode, isStompConnected, sendMessage]);

  // 종목 코드 변경 시 가격 데이터 초기화
  useEffect(() => {
    setPriceData(null);
    hasSubscribedRef.current = false;
  }, [stockCode]);

  // 연결 상태 매핑
  const getConnectionState = useCallback((): WebSocketConnectionState => {
    if (readyState === ReadyState.CONNECTING) return 'connecting';
    if (readyState === ReadyState.OPEN && isStompConnected) return 'connected';
    if (readyState === ReadyState.CLOSED || readyState === ReadyState.CLOSING) return 'disconnected';
    return 'disconnected';
  }, [readyState, isStompConnected]);

  const connectionState = getConnectionState();

  return {
    priceData,
    connectionState,
    isConnected: connectionState === 'connected',
    hasError: false,
  };
}

export default useStockPrice;
