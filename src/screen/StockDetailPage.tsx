import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { PriceChart } from '../components/stock/PriceChart';
import authApi from '../api/auth';
import stockApi from '../api/stock';
import type { StockBasicInfo, StockPriceInfo, StockChartDataPoint } from '../types/stock';
import { cn } from '../utils/cn';

// URL 쿼리 파라미터에서 종목명 가져오기
function useStockNameFromQuery(): string | null {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('name');
}

export default function StockDetailPage() {
  const { stockCode } = useParams<{ stockCode: string }>();
  const navigate = useNavigate();
  const stockNameFromQuery = useStockNameFromQuery();
  
  const { isAuthenticated, logout } = useAuthStore();
  
  const [basicInfo, setBasicInfo] = useState<StockBasicInfo | null>(null);
  const [priceInfo, setPriceInfo] = useState<StockPriceInfo | null>(null);
  const [chartData, setChartData] = useState<StockChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await authApi.signOut();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      logout();
    }
  };

  useEffect(() => {
    if (!stockCode) {
      navigate('/ranking');
      return;
    }

    setIsLoading(true);
    
    // 목 데이터 로드
    const basic = stockApi.getMockStockBasicInfo(stockCode, stockNameFromQuery || undefined);
    const price = stockApi.getMockStockPriceInfo(stockCode);
    const chart = stockApi.getMockChartData(stockCode);
    
    setBasicInfo(basic);
    setPriceInfo(price);
    setChartData(chart);
    setIsLoading(false);
  }, [stockCode, stockNameFromQuery, navigate]);

  // 가격 변동이 양수인지 확인
  const isPositiveChange = priceInfo?.priceChange.startsWith('+') ?? false;

  if (isLoading || !basicInfo || !priceInfo) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl animate-bounce block mb-4">🦛</span>
          <p className="text-text-secondary">주식 정보를 불러오는 중...</p>
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
                {basicInfo.stockName}
              </h2>
              <span className="text-text-muted font-mono text-lg">{basicInfo.stockCode}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-bg-secondary border border-border rounded text-text-secondary text-sm">
                {basicInfo.marketType}
              </span>
              <span className="text-text-muted text-sm">{basicInfo.sector}</span>
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
                    {priceInfo.currentPrice}
                  </span>
                  <span className="text-text-muted text-lg">원</span>
                </div>
                <div className={cn(
                  'font-mono font-bold text-xl mt-2',
                  isPositiveChange ? 'text-lime' : 'text-magenta'
                )}>
                  {priceInfo.priceChange} ({priceInfo.priceChangeRate}%)
                </div>
              </div>

              {/* Price Summary */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8">
                <div className="text-center sm:text-right">
                  <p className="text-text-muted text-xs mb-1">시가</p>
                  <p className="font-mono text-text-secondary">{priceInfo.openPrice}</p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-text-muted text-xs mb-1">고가</p>
                  <p className="font-mono text-lime">{priceInfo.highPrice}</p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-text-muted text-xs mb-1">저가</p>
                  <p className="font-mono text-magenta">{priceInfo.lowPrice}</p>
                </div>
              </div>
            </div>

            {/* Additional Price Info */}
            <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-text-muted text-xs mb-1">전일종가</p>
                <p className="font-mono text-text-secondary">{priceInfo.prevClosePrice}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs mb-1">거래량</p>
                <p className="font-mono text-text-secondary">{priceInfo.volume}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs mb-1">거래대금</p>
                <p className="font-mono text-text-secondary">{priceInfo.tradingValue}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs mb-1">시가총액</p>
                <p className="font-mono text-text-secondary">{basicInfo.marketCap}</p>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="card-brutal rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl text-text-primary">
                📈 당일 가격 추이
              </h3>
              <span className="text-text-muted text-sm">(10분 간격)</span>
            </div>
            <PriceChart data={chartData} isPositive={isPositiveChange} />
          </div>

          {/* Basic Info Section */}
          <div className="card-brutal rounded-lg p-6">
            <h3 className="font-display text-xl text-text-primary mb-6">
              📋 기본 정보
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <InfoCard label="자본금" value={basicInfo.capital} />
              <InfoCard label="액면가" value={basicInfo.parValue} />
              <InfoCard label="상장주식수" value={basicInfo.listedShares} />
              <InfoCard label="시가총액" value={basicInfo.marketCap} />
              <InfoCard label="PER" value={basicInfo.per} highlight />
              <InfoCard label="PBR" value={basicInfo.pbr} highlight />
              <InfoCard label="EPS" value={basicInfo.eps} />
              <InfoCard label="BPS" value={basicInfo.bps} />
            </div>
          </div>

          {/* Info Note */}
          <p className="text-text-muted text-sm text-center mt-8">
            * 현재 목(Mock) 데이터가 표시됩니다. 추후 실시간 데이터로 연동됩니다.
          </p>
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
