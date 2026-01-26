import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { PriceChart } from '../components/stock/PriceChart';
import authApi from '../api/auth';
import stockApi from '../api/stock';
import type { ChartPeriod } from '../types/stock';
import { cn } from '../utils/cn';

export default function StockDetailPage() {
  const { stockCode } = useParams<{ stockCode: string }>();
  const navigate = useNavigate();
  
  const { isAuthenticated, logout } = useAuthStore();
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

  const handleLogout = async () => {
    try {
      await authApi.signOut();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      logout();
    }
  };

  // 가격 변동이 양수인지 확인
  const stockInfo = detailData?.data;
  const isPositiveChange = stockInfo?.priceChange ? !stockInfo.priceChange.startsWith('-') : false;

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
      <header className="fixed top-0 left-0 right-0 z-50 border-b-2 border-border bg-bg-primary/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🦛</span>
              <h1 className="font-display text-xl text-lime tracking-tight">
                떡상하마
              </h1>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-4">
              <Link to="/ranking" className="text-text-secondary hover:text-lime font-semibold text-sm transition-colors">
                랭킹
              </Link>
              {isAuthenticated ? (
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  로그아웃
                </Button>
              ) : (
                <Link to="/login">
                  <Button variant="primary" size="sm">
                    로그인
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

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
                <p className="text-text-secondary text-sm mb-1">현재가</p>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono font-bold text-4xl sm:text-5xl text-text-primary">
                    {Number(stockInfo.currentPrice).toLocaleString()}
                  </span>
                  <span className="text-text-muted text-lg">원</span>
                </div>
                <div className={cn(
                  'font-mono font-bold text-xl mt-2',
                  isPositiveChange ? 'text-lime' : 'text-magenta'
                )}>
                  {isPositiveChange ? '+' : ''}{Number(stockInfo.priceChange).toLocaleString()} ({isPositiveChange ? '+' : ''}{stockInfo.priceChangeRate}%)
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
            <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-text-muted text-xs mb-1">거래량</p>
                <p className="font-mono text-text-secondary">{Number(stockInfo.volume).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs mb-1">시가총액</p>
                <p className="font-mono text-text-secondary">{Number(stockInfo.marketCap).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs mb-1">PER</p>
                <p className="font-mono text-text-secondary">{stockInfo.per}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs mb-1">PBR</p>
                <p className="font-mono text-text-secondary">{stockInfo.pbr}</p>
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

          {/* Basic Info Section */}
          <div className="card-brutal rounded-lg p-6">
            <h3 className="font-display text-xl text-text-primary mb-6">
              📋 기본 정보
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <InfoCard label="시가총액" value={`${Number(stockInfo.marketCap).toLocaleString()}원`} />
              <InfoCard label="PER" value={stockInfo.per} highlight />
              <InfoCard label="PBR" value={stockInfo.pbr} highlight />
              <InfoCard label="EPS" value={`${Number(stockInfo.eps).toLocaleString()}원`} />
            </div>
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

// Info Card Component
function InfoCard({ 
  label, 
  value, 
  highlight = false 
}: { 
  label: string; 
  value: string; 
  highlight?: boolean;
}) {
  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-4">
      <p className="text-text-muted text-xs mb-2">{label}</p>
      <p className={cn(
        'font-mono font-semibold text-lg',
        highlight ? 'text-lime' : 'text-text-primary'
      )}>
        {value}
      </p>
    </div>
  );
}
