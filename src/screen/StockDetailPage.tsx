import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useStockPrice } from '../hooks/useStockPrice';
import { Header } from '../components/ui/Header';
import { Button } from '../components/ui/Button';
import { PriceChart } from '../components/stock/PriceChart';
import { TradePanel } from '../components/trading';
import stockApi from '../api/stock';
import type { ChartPeriod } from '../types/stock';
import type { TradeResult } from '../types/trading';
import { cn } from '../utils/cn';

export default function StockDetailPage() {
  const { stockCode } = useParams<{ stockCode: string }>();
  const navigate = useNavigate();
  
  const { isAuthenticated } = useAuthStore();
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('DAILY');

  // 주식 기본정보 조회
  const { 
    data: detailData, 
    isLoading: isDetailLoading,
    error: detailError,
  } = useQuery({
    queryKey: ['stockDetail', stockCode],
    queryFn: () => stockApi.getStockDetail(stockCode!),
    enabled: !!stockCode,
  });

  // 차트 데이터 조회
  const {
    data: chartData,
    isLoading: isChartLoading,
  } = useQuery({
    queryKey: ['stockChart', stockCode, chartPeriod],
    queryFn: () => stockApi.getStockChart(stockCode!, chartPeriod),
    enabled: !!stockCode,
  });

  // 실시간 가격 구독
  const { priceData: realtimePrice, isConnected } = useStockPrice(stockCode);

  // 거래 성공 핸들러
  const handleTradeSuccess = useCallback((result: TradeResult) => {
    console.log('Trade success:', result);
    // 필요한 경우 토스트 알림이나 추가 UI 업데이트를 여기서 처리
  }, []);

  // 기본 정보 (REST API)
  const stockInfo = detailData?.data;
  
  // 실시간 가격 또는 REST API 가격 사용
  const displayPrice = useMemo(() => {
    if (realtimePrice) {
      return {
        currentPrice: realtimePrice.currentPrice,
        priceChange: realtimePrice.changePrice,
        priceChangeRate: realtimePrice.changeRate,
        volume: realtimePrice.volume,
      };
    }
    if (stockInfo) {
      return {
        currentPrice: Number(stockInfo.currentPrice),
        priceChange: Number(stockInfo.priceChange),
        priceChangeRate: parseFloat(stockInfo.priceChangeRate),
        volume: Number(stockInfo.volume),
      };
    }
    return null;
  }, [realtimePrice, stockInfo]);

  // 가격 변동이 양수인지 확인
  const isPositiveChange = displayPrice ? displayPrice.priceChange >= 0 : false;

  // 로딩 상태
  if (isDetailLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl animate-bounce block mb-4">🦛</span>
          <p className="text-text-secondary">주식 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (detailError || !stockInfo) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">😢</span>
          <p className="text-text-secondary mb-4">주식 정보를 불러올 수 없습니다.</p>
          <Button variant="outline" onClick={() => navigate('/ranking')}>
            랭킹으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-text-secondary hover:text-lime transition-colors"
          >
            <span>←</span>
            <span className="text-sm font-medium">뒤로가기</span>
          </button>

          {/* Stock Header */}
          <div className="mb-8">
            <div className="flex items-baseline gap-3 mb-2">
              <h2 className="font-display text-4xl sm:text-5xl text-text-primary">
                {stockInfo.stockName}
              </h2>
              <span className="text-text-muted font-mono text-lg">{stockInfo.stockCode}</span>
            </div>
          </div>

          {/* Price Card */}
          <div className="card-brutal rounded-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              {/* Current Price */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-text-secondary text-sm">현재가</p>
                  {isConnected && (
                    <span className="flex items-center gap-1 text-xs text-lime">
                      <span className="w-2 h-2 bg-lime rounded-full animate-pulse" />
                      실시간
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono font-bold text-4xl sm:text-5xl text-text-primary">
                    {displayPrice?.currentPrice.toLocaleString()}
                  </span>
                  <span className="text-text-muted text-lg">원</span>
                </div>
                <div className={cn(
                  'font-mono font-bold text-xl mt-2',
                  isPositiveChange ? 'text-lime' : 'text-magenta'
                )}>
                  {isPositiveChange ? '+' : ''}{displayPrice?.priceChange.toLocaleString()} ({isPositiveChange ? '+' : ''}{displayPrice?.priceChangeRate.toFixed(2)}%)
                </div>
              </div>

              {/* Price Summary */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8">
                <div className="text-center sm:text-right">
                  <p className="text-text-muted text-xs mb-1">시가</p>
                  <p className="font-mono text-text-secondary">{Number(stockInfo.openPrice).toLocaleString()}</p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-text-muted text-xs mb-1">고가</p>
                  <p className="font-mono text-lime">{Number(stockInfo.highPrice).toLocaleString()}</p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-text-muted text-xs mb-1">저가</p>
                  <p className="font-mono text-magenta">{Number(stockInfo.lowPrice).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Additional Price Info */}
            <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-bg-secondary border border-border rounded-lg p-3">
                <p className="text-text-muted text-xs mb-1">거래량</p>
                <p className="font-mono font-semibold text-text-primary">{displayPrice?.volume.toLocaleString()}</p>
              </div>
              <div className="bg-bg-secondary border border-border rounded-lg p-3">
                <p className="text-text-muted text-xs mb-1">시가총액</p>
                <p className="font-mono font-semibold text-text-primary">{Number(stockInfo.marketCap).toLocaleString()}</p>
              </div>
              <div className="bg-bg-secondary border border-border rounded-lg p-3">
                <p className="text-text-muted text-xs mb-1">PER</p>
                <p className="font-mono font-semibold text-lime">{stockInfo.per}</p>
              </div>
              <div className="bg-bg-secondary border border-border rounded-lg p-3">
                <p className="text-text-muted text-xs mb-1">PBR</p>
                <p className="font-mono font-semibold text-lime">{stockInfo.pbr}</p>
              </div>
              <div className="bg-bg-secondary border border-border rounded-lg p-3">
                <p className="text-text-muted text-xs mb-1">EPS</p>
                <p className="font-mono font-semibold text-cyan">{Number(stockInfo.eps).toLocaleString()}원</p>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="card-brutal rounded-lg p-6 mb-8">
            <h3 className="font-display text-xl text-text-primary mb-4">
              📈 가격 차트
            </h3>
            <PriceChart 
              data={chartData?.data?.data ?? []} 
              isPositive={isPositiveChange}
              period={chartPeriod}
              onPeriodChange={setChartPeriod}
              isLoading={isChartLoading}
            />
          </div>

          {/* Trade Panel */}
          <div className="mb-8">
            <TradePanel
              stockCode={stockInfo.stockCode}
              stockName={stockInfo.stockName}
              currentPrice={displayPrice?.currentPrice ?? Number(stockInfo.currentPrice)}
              isAuthenticated={isAuthenticated}
              onTradeSuccess={handleTradeSuccess}
            />
          </div>

        </div>

        {/* Background gradient */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-lime/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-magenta/5 rounded-full blur-3xl" />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-border py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-text-muted text-sm">
            © 2026 떡상하마. 모의 투자 서비스입니다.
          </p>
        </div>
      </footer>
    </div>
  );
}

