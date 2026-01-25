import type { RankingFilter, StockRankingItem, StockRankingResponse } from '../types/stock';

// 거래량 순위 목 데이터
const mockVolumeRanking: StockRankingItem[] = [
  { rank: '1', stockCode: '005930', stockName: '삼성전자', currentPrice: '75000', priceChange: '+1500', priceChangeRate: '+2.04', volume: '25678432' },
  { rank: '2', stockCode: '000660', stockName: 'SK하이닉스', currentPrice: '178000', priceChange: '+3500', priceChangeRate: '+2.01', volume: '18234567' },
  { rank: '3', stockCode: '373220', stockName: 'LG에너지솔루션', currentPrice: '420000', priceChange: '-8000', priceChangeRate: '-1.87', volume: '12456789' },
  { rank: '4', stockCode: '207940', stockName: '삼성바이오로직스', currentPrice: '780000', priceChange: '+15000', priceChangeRate: '+1.96', volume: '9876543' },
  { rank: '5', stockCode: '005380', stockName: '현대차', currentPrice: '245000', priceChange: '+4500', priceChangeRate: '+1.87', volume: '8765432' },
  { rank: '6', stockCode: '006400', stockName: '삼성SDI', currentPrice: '485000', priceChange: '-7500', priceChangeRate: '-1.52', volume: '7654321' },
  { rank: '7', stockCode: '035420', stockName: 'NAVER', currentPrice: '215000', priceChange: '+2800', priceChangeRate: '+1.32', volume: '6543210' },
  { rank: '8', stockCode: '000270', stockName: '기아', currentPrice: '118000', priceChange: '+1200', priceChangeRate: '+1.03', volume: '5432109' },
  { rank: '9', stockCode: '035720', stockName: '카카오', currentPrice: '52000', priceChange: '-800', priceChangeRate: '-1.51', volume: '4321098' },
  { rank: '10', stockCode: '051910', stockName: 'LG화학', currentPrice: '385000', priceChange: '+5500', priceChangeRate: '+1.45', volume: '3210987' },
];

// 급상승 순위 목 데이터
const mockRisingRanking: StockRankingItem[] = [
  { rank: '1', stockCode: '950140', stockName: '잇츠한불', currentPrice: '12500', priceChange: '+2890', priceChangeRate: '+30.05', volume: '15678432' },
  { rank: '2', stockCode: '078340', stockName: '컴투스', currentPrice: '45600', priceChange: '+9870', priceChangeRate: '+27.62', volume: '8234567' },
  { rank: '3', stockCode: '293490', stockName: '카카오게임즈', currentPrice: '23400', priceChange: '+4560', priceChangeRate: '+24.20', volume: '6456789' },
  { rank: '4', stockCode: '263750', stockName: '펄어비스', currentPrice: '38900', priceChange: '+6780', priceChangeRate: '+21.11', volume: '5876543' },
  { rank: '5', stockCode: '112040', stockName: '위메이드', currentPrice: '56700', priceChange: '+8900', priceChangeRate: '+18.63', volume: '4765432' },
  { rank: '6', stockCode: '036570', stockName: '엔씨소프트', currentPrice: '198000', priceChange: '+28500', priceChangeRate: '+16.81', volume: '3654321' },
  { rank: '7', stockCode: '251270', stockName: '넷마블', currentPrice: '48900', priceChange: '+6230', priceChangeRate: '+14.59', volume: '2543210' },
  { rank: '8', stockCode: '259960', stockName: '크래프톤', currentPrice: '245000', priceChange: '+28700', priceChangeRate: '+13.26', volume: '2432109' },
  { rank: '9', stockCode: '041510', stockName: '에스엠', currentPrice: '89500', priceChange: '+9870', priceChangeRate: '+12.39', volume: '1321098' },
  { rank: '10', stockCode: '352820', stockName: '하이브', currentPrice: '267000', priceChange: '+27500', priceChangeRate: '+11.49', volume: '1210987' },
];

// 급하락 순위 목 데이터
const mockFallingRanking: StockRankingItem[] = [
  { rank: '1', stockCode: '095570', stockName: 'AJ네트웍스', currentPrice: '4560', priceChange: '-1230', priceChangeRate: '-21.24', volume: '12678432' },
  { rank: '2', stockCode: '900140', stockName: '엘브이엠씨홀딩스', currentPrice: '2340', priceChange: '-580', priceChangeRate: '-19.86', volume: '9234567' },
  { rank: '3', stockCode: '950130', stockName: '엑세스바이오', currentPrice: '8900', priceChange: '-1980', priceChangeRate: '-18.20', volume: '7456789' },
  { rank: '4', stockCode: '039030', stockName: '이오테크닉스', currentPrice: '123000', priceChange: '-24500', priceChangeRate: '-16.61', volume: '4876543' },
  { rank: '5', stockCode: '086520', stockName: '에코프로', currentPrice: '89000', priceChange: '-15600', priceChangeRate: '-14.91', volume: '3765432' },
  { rank: '6', stockCode: '247540', stockName: '에코프로비엠', currentPrice: '178000', priceChange: '-28900', priceChangeRate: '-13.97', volume: '2654321' },
  { rank: '7', stockCode: '006280', stockName: '녹십자', currentPrice: '112000', priceChange: '-16800', priceChangeRate: '-13.04', volume: '1543210' },
  { rank: '8', stockCode: '068270', stockName: '셀트리온', currentPrice: '165000', priceChange: '-23400', priceChangeRate: '-12.42', volume: '1432109' },
  { rank: '9', stockCode: '326030', stockName: 'SK바이오팜', currentPrice: '78900', priceChange: '-9870', priceChangeRate: '-11.12', volume: '1321098' },
  { rank: '10', stockCode: '003670', stockName: '포스코퓨처엠', currentPrice: '298000', priceChange: '-34500', priceChangeRate: '-10.38', volume: '1210987' },
];

const mockDataMap: Record<RankingFilter, StockRankingItem[]> = {
  VOLUME: mockVolumeRanking,
  RISING: mockRisingRanking,
  FALLING: mockFallingRanking,
};

/**
 * 주식 랭킹 조회 (목 데이터 사용)
 * 추후 실제 API 연동 시 apiClient를 사용하여 호출
 */
export async function getStockRanking(filter: RankingFilter): Promise<StockRankingResponse> {
  // 실제 API 호출 시뮬레이션을 위한 딜레이
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    timestamp: Date.now(),
    data: {
      items: mockDataMap[filter],
    },
    errorCode: null,
    message: 'Success',
  };
}

const stockApi = {
  getStockRanking,
};

export default stockApi;
