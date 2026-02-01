/**
 * STOMP 프레임 유틸리티
 * react-use-websocket과 함께 사용하기 위한 STOMP 프레임 생성/파싱
 */

// STOMP 프레임 타입
export type StompCommand = 'CONNECT' | 'CONNECTED' | 'SUBSCRIBE' | 'UNSUBSCRIBE' | 'MESSAGE' | 'SEND' | 'DISCONNECT' | 'ERROR';

export interface StompFrame {
  command: StompCommand;
  headers: Record<string, string>;
  body: string;
}

// NULL 문자 (STOMP 프레임 종료 문자)
const NULL_CHAR = '\x00';

/**
 * STOMP 프레임 생성
 */
export function createStompFrame(
  command: StompCommand,
  headers: Record<string, string> = {},
  body: string = ''
): string {
  let frame = command + '\n';
  
  for (const [key, value] of Object.entries(headers)) {
    frame += `${key}:${value}\n`;
  }
  
  frame += '\n' + body + NULL_CHAR;
  return frame;
}

/**
 * STOMP CONNECT 프레임 생성
 */
export function createConnectFrame(
  acceptVersion: string = '1.1,1.2',
  heartbeat: string = '10000,10000'
): string {
  return createStompFrame('CONNECT', {
    'accept-version': acceptVersion,
    'heart-beat': heartbeat,
  });
}

/**
 * STOMP SUBSCRIBE 프레임 생성
 */
export function createSubscribeFrame(
  destination: string,
  subscriptionId: string
): string {
  return createStompFrame('SUBSCRIBE', {
    id: subscriptionId,
    destination,
  });
}

/**
 * STOMP UNSUBSCRIBE 프레임 생성
 */
export function createUnsubscribeFrame(subscriptionId: string): string {
  return createStompFrame('UNSUBSCRIBE', {
    id: subscriptionId,
  });
}

/**
 * STOMP DISCONNECT 프레임 생성
 */
export function createDisconnectFrame(): string {
  return createStompFrame('DISCONNECT');
}

/**
 * STOMP 프레임 파싱
 */
export function parseStompFrame(data: string): StompFrame | null {
  try {
    // NULL 문자 제거
    const cleanData = data.replace(/\x00/g, '');
    
    // 빈 데이터 처리 (heartbeat)
    if (!cleanData.trim()) {
      return null;
    }
    
    const lines = cleanData.split('\n');
    const command = lines[0] as StompCommand;
    
    const headers: Record<string, string> = {};
    let bodyStartIndex = 1;
    
    // 헤더 파싱
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line === '') {
        bodyStartIndex = i + 1;
        break;
      }
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex);
        const value = line.substring(colonIndex + 1);
        headers[key] = value;
      }
    }
    
    // 바디 파싱
    const body = lines.slice(bodyStartIndex).join('\n').trim();
    
    return { command, headers, body };
  } catch (error) {
    console.error('[STOMP] 프레임 파싱 오류:', error);
    return null;
  }
}

/**
 * 구독 ID 생성
 */
let subscriptionCounter = 0;
export function generateSubscriptionId(): string {
  return `sub-${++subscriptionCounter}`;
}
