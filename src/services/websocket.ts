import SockJS from 'sockjs-client';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import type { StockPriceUpdate, PriceUpdateCallback, WebSocketConnectionState } from '../types/websocket';

// WebSocket 서버 URL
const WS_URL = `ws://localhost:8080/ws`;

// 구독자 정보
interface SubscriberInfo {
  callback: PriceUpdateCallback;
  id: string;
}

// 종목별 구독 관리
interface StockSubscription {
  stompSubscription: StompSubscription | null;
  subscribers: Map<string, SubscriberInfo>;
}

/**
 * WebSocket 서비스 싱글톤 클래스
 * STOMP 프로토콜을 사용하여 실시간 주식 시세를 구독합니다.
 */
class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StockSubscription> = new Map();
  private connectionState: WebSocketConnectionState = 'disconnected';
  private connectionStateListeners: Set<(state: WebSocketConnectionState) => void> = new Set();
  private subscriberId = 0;
  private pendingSubscriptions: Map<string, Set<SubscriberInfo>> = new Map();

  /**
   * STOMP 클라이언트 생성 및 초기화
   */
  private createClient(): Client {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('[WebSocket]', str);
        }
      },
    });

    client.onConnect = () => {
      this.setConnectionState('connected');
      console.log('[WebSocket] 연결 성공');
      
      // 대기 중인 구독 처리
      this.processPendingSubscriptions();
    };

    client.onStompError = (frame) => {
      console.error('[WebSocket] STOMP 에러:', frame.headers['message']);
      this.setConnectionState('error');
    };

    client.onWebSocketError = (event) => {
      console.error('[WebSocket] 연결 에러:', event);
      this.setConnectionState('error');
    };

    client.onDisconnect = () => {
      console.log('[WebSocket] 연결 종료');
      this.setConnectionState('disconnected');
    };

    return client;
  }

  /**
   * 연결 상태 설정 및 리스너 알림
   */
  private setConnectionState(state: WebSocketConnectionState): void {
    this.connectionState = state;
    this.connectionStateListeners.forEach((listener) => listener(state));
  }

  /**
   * 대기 중인 구독 처리
   */
  private processPendingSubscriptions(): void {
    this.pendingSubscriptions.forEach((subscribers, stockCode) => {
      subscribers.forEach((subscriber) => {
        this.subscribeToStock(stockCode, subscriber);
      });
    });
    this.pendingSubscriptions.clear();
  }

  /**
   * 실제 STOMP 구독 생성
   */
  private subscribeToStock(stockCode: string, subscriberInfo: SubscriberInfo): void {
    if (!this.client || !this.client.connected) {
      // 연결 대기 중이면 대기 목록에 추가
      if (!this.pendingSubscriptions.has(stockCode)) {
        this.pendingSubscriptions.set(stockCode, new Set());
      }
      this.pendingSubscriptions.get(stockCode)!.add(subscriberInfo);
      return;
    }

    let subscription = this.subscriptions.get(stockCode);

    // 해당 종목의 첫 구독이면 STOMP 구독 생성
    if (!subscription) {
      const stompSubscription = this.client.subscribe(
        `/topic/price/${stockCode}`,
        (message: IMessage) => {
          const update: StockPriceUpdate = JSON.parse(message.body);
          // 모든 구독자에게 알림
          const sub = this.subscriptions.get(stockCode);
          if (sub) {
            sub.subscribers.forEach((s) => s.callback(update));
          }
        }
      );

      subscription = {
        stompSubscription,
        subscribers: new Map(),
      };
      this.subscriptions.set(stockCode, subscription);
    }

    // 구독자 추가
    subscription.subscribers.set(subscriberInfo.id, subscriberInfo);
  }

  /**
   * WebSocket 연결 시작
   */
  connect(): void {
    console.log('[WebSocket] 연결 시도...', { url: WS_URL, state: this.connectionState });
    
    if (this.connectionState !== 'disconnected') {
      console.log('[WebSocket] 연결 시도 무시 - 이미 연결 중', { state: this.connectionState });
      return;
    }

    // 새 클라이언트 생성 (매번 새로 생성하여 inactive 문제 방지)
    this.client = this.createClient();
    this.setConnectionState('connecting');
    this.client.activate();
  }

  /**
   * WebSocket 연결 종료
   */
  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.subscriptions.clear();
      this.pendingSubscriptions.clear();
      this.setConnectionState('disconnected');
    }
  }

  /**
   * 종목 시세 구독
   * @param stockCode 종목 코드
   * @param callback 가격 업데이트 콜백
   * @returns 구독 해제 함수
   */
  subscribe(stockCode: string, callback: PriceUpdateCallback): () => void {
    const id = `sub_${++this.subscriberId}`;
    const subscriberInfo: SubscriberInfo = { callback, id };

    // 연결이 안되어 있으면 연결 시작
    if (this.connectionState === 'disconnected') {
      this.connect();
    }

    this.subscribeToStock(stockCode, subscriberInfo);

    // 구독 해제 함수 반환
    return () => {
      this.unsubscribe(stockCode, id);
    };
  }

  /**
   * 종목 시세 구독 해제
   */
  private unsubscribe(stockCode: string, subscriberId: string): void {
    // 대기 중인 구독에서 제거
    const pending = this.pendingSubscriptions.get(stockCode);
    if (pending) {
      pending.forEach((s) => {
        if (s.id === subscriberId) {
          pending.delete(s);
        }
      });
      if (pending.size === 0) {
        this.pendingSubscriptions.delete(stockCode);
      }
    }

    // 활성 구독에서 제거
    const subscription = this.subscriptions.get(stockCode);
    if (subscription) {
      subscription.subscribers.delete(subscriberId);

      // 해당 종목의 마지막 구독자면 STOMP 구독도 해제
      if (subscription.subscribers.size === 0) {
        subscription.stompSubscription?.unsubscribe();
        this.subscriptions.delete(stockCode);
      }
    }

    // 모든 구독이 해제되면 연결 종료
    if (this.subscriptions.size === 0 && this.pendingSubscriptions.size === 0) {
      this.disconnect();
    }
  }

  /**
   * 현재 연결 상태 반환
   */
  getConnectionState(): WebSocketConnectionState {
    return this.connectionState;
  }

  /**
   * 연결 상태 변경 리스너 등록
   */
  onConnectionStateChange(listener: (state: WebSocketConnectionState) => void): () => void {
    this.connectionStateListeners.add(listener);
    return () => {
      this.connectionStateListeners.delete(listener);
    };
  }

  /**
   * 연결 여부 확인
   */
  isConnected(): boolean {
    return this.connectionState === 'connected';
  }
}

// 싱글톤 인스턴스 export
export const webSocketService = new WebSocketService();

export default webSocketService;
