import { publicApiClient } from './client';
import type { 
  RankingFilter, 
  StockRankingResponse, 
  StockBasicInfo, 
  StockPriceInfo, 
  StockChartDataPoint 
} from '../types/stock';

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

// ============================================
// 목 데이터 함수 (추후 실제 API로 교체 예정)
// ============================================

// 종목 코드 기반 시드 생성 (일관된 목 데이터용)
function getCodeSeed(stockCode: string): number {
  let seed = 0;
  for (let i = 0; i < stockCode.length; i++) {
    seed += stockCode.charCodeAt(i);
  }
  return seed;
}

// 간단한 시드 기반 난수 생성기
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// 목 종목명 매핑
const mockStockNames: Record<string, string> = {
  '005930': '삼성전자',
  '000660': 'SK하이닉스',
  '035420': 'NAVER',
  '035720': '카카오',
  '051910': 'LG화학',
  '006400': '삼성SDI',
  '005380': '현대차',
  '000270': '기아',
  '068270': '셀트리온',
  '207940': '삼성바이오로직스',
};

/**
 * 주식 기본 정보 조회 (목 데이터)
 */
export function getMockStockBasicInfo(stockCode: string, stockName?: string): StockBasicInfo {
  const seed = getCodeSeed(stockCode);
  const rand = seededRandom(seed);
  
  const name = stockName || mockStockNames[stockCode] || `종목_${stockCode}`;
  const marketType = rand() > 0.3 ? 'KOSPI' : 'KOSDAQ';
  
  const sectors = ['전기전자', '반도체', '인터넷', '제약', '자동차', '화학', '금융', '건설', '통신'];
  const sector = sectors[Math.floor(rand() * sectors.length)];
  
  const capitalBase = Math.floor(rand() * 10000 + 1000);
  const parValue = [100, 500, 1000, 5000][Math.floor(rand() * 4)];
  const listedShares = Math.floor(rand() * 1000000000 + 10000000);
  const marketCapBase = Math.floor(rand() * 500 + 10);
  
  const per = (rand() * 30 + 5).toFixed(2);
  const pbr = (rand() * 3 + 0.5).toFixed(2);
  const eps = Math.floor(rand() * 10000 + 1000);
  const bps = Math.floor(rand() * 100000 + 10000);

  return {
    stockCode,
    stockName: name,
    marketType,
    sector,
    capital: `${capitalBase.toLocaleString()}억원`,
    parValue: `${parValue.toLocaleString()}원`,
    listedShares: `${listedShares.toLocaleString()}주`,
    marketCap: `${marketCapBase.toLocaleString()}조원`,
    per,
    pbr,
    eps: eps.toLocaleString(),
    bps: bps.toLocaleString(),
  };
}

/**
 * 실시간 가격 정보 조회 (목 데이터)
 */
export function getMockStockPriceInfo(stockCode: string): StockPriceInfo {
  const seed = getCodeSeed(stockCode);
  const rand = seededRandom(seed);
  
  // 기본 가격 범위 설정 (1,000원 ~ 500,000원)
  const basePrice = Math.floor(rand() * 499000 + 1000);
  const priceUnit = basePrice > 50000 ? 100 : basePrice > 10000 ? 50 : 10;
  
  const currentPrice = Math.round(basePrice / priceUnit) * priceUnit;
  const prevClosePrice = Math.round((currentPrice * (1 - (rand() - 0.5) * 0.1)) / priceUnit) * priceUnit;
  const priceChange = currentPrice - prevClosePrice;
  const priceChangeRate = ((priceChange / prevClosePrice) * 100).toFixed(2);
  
  const openPrice = Math.round((prevClosePrice * (1 + (rand() - 0.5) * 0.02)) / priceUnit) * priceUnit;
  const highPrice = Math.round((Math.max(currentPrice, openPrice) * (1 + rand() * 0.03)) / priceUnit) * priceUnit;
  const lowPrice = Math.round((Math.min(currentPrice, openPrice) * (1 - rand() * 0.03)) / priceUnit) * priceUnit;
  
  const volume = Math.floor(rand() * 50000000 + 100000);
  const tradingValue = Math.floor((volume * currentPrice) / 100000000);

  return {
    currentPrice: currentPrice.toLocaleString(),
    priceChange: priceChange >= 0 ? `+${priceChange.toLocaleString()}` : priceChange.toLocaleString(),
    priceChangeRate: priceChange >= 0 ? `+${priceChangeRate}` : priceChangeRate,
    openPrice: openPrice.toLocaleString(),
    highPrice: highPrice.toLocaleString(),
    lowPrice: lowPrice.toLocaleString(),
    volume: volume.toLocaleString(),
    tradingValue: `${tradingValue.toLocaleString()}억`,
    prevClosePrice: prevClosePrice.toLocaleString(),
  };
}

/**
 * 차트 데이터 조회 (목 데이터 - 당일 분봉 OHLC)
 */
export function getMockChartData(stockCode: string): StockChartDataPoint[] {
  const seed = getCodeSeed(stockCode);
  const rand = seededRandom(seed);
  
  const data: StockChartDataPoint[] = [];
  
  // 기본 가격 (getMockStockPriceInfo와 동일한 시드 사용)
  const basePrice = Math.floor(rand() * 499000 + 1000);
  const priceUnit = basePrice > 50000 ? 100 : basePrice > 10000 ? 50 : 10;
  let prevClose = Math.round(basePrice / priceUnit) * priceUnit;
  
  // 09:00 ~ 15:30 까지 10분 간격 데이터 (39개 포인트)
  const startHour = 9;
  const endHour = 15;
  const endMinute = 30;
  
  for (let hour = startHour; hour <= endHour; hour++) {
    const maxMinute = hour === endHour ? endMinute : 50;
    for (let minute = 0; minute <= maxMinute; minute += 10) {
      // 시가 = 이전 종가 기준 약간의 갭
      const openGap = (rand() - 0.5) * 0.01;
      const open = Math.round((prevClose * (1 + openGap)) / priceUnit) * priceUnit;
      
      // 종가 = 시가 대비 변동 (-2% ~ +2%)
      const closeChange = (rand() - 0.5) * 0.04;
      const close = Math.round((open * (1 + closeChange)) / priceUnit) * priceUnit;
      
      // 고가 = 시가와 종가 중 큰 값 + 추가 상승폭
      const highExtra = rand() * 0.015;
      const high = Math.round((Math.max(open, close) * (1 + highExtra)) / priceUnit) * priceUnit;
      
      // 저가 = 시가와 종가 중 작은 값 - 추가 하락폭
      const lowExtra = rand() * 0.015;
      const low = Math.round((Math.min(open, close) * (1 - lowExtra)) / priceUnit) * priceUnit;
      
      // 거래량 (랜덤)
      const volume = Math.floor(rand() * 1000000 + 10000);
      
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      data.push({
        time: timeStr,
        open,
        high,
        low,
        close,
        volume,
      });
      
      // 다음 봉의 시가 기준으로 현재 종가 저장
      prevClose = close;
    }
  }
  
  return data;
}

const stockApi = {
  getStockRanking,
  getMockStockBasicInfo,
  getMockStockPriceInfo,
  getMockChartData,
};

export default stockApi;
