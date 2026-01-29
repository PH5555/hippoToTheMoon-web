import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { Header } from '../components/ui/Header';
import tradingApi from '../api/trading';
import { cn } from '../utils/cn';
import type { Holding } from '../types/trading';

export default function PortfolioPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // 보유 주식 조회
  const {
    data: holdingsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['holdings'],
    queryFn: () => tradingApi.getHoldings(),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const holdings = holdingsData?.data ?? [];

  // 요약 계산
  const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
  const totalProfitLoss = holdings.reduce((sum, h) => sum + h.profitLoss, 0);
  const totalInvested = holdings.reduce((sum, h) => sum + (h.averagePrice * h.quantity), 0);
  const totalProfitLossRate = totalInvested > 0 
    ? ((totalProfitLoss / totalInvested) * 100).toFixed(2) 
    : '0.00';
  const isPositiveTotal = totalProfitLoss >= 0;

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="font-display text-4xl sm:text-5xl text-text-primary mb-2">
              내 <span className="text-lime">포트폴리오</span>
            </h2>
            <p className="text-text-secondary">
              보유 주식 현황과 수익률을 확인하세요
            </p>
          </div>

          {/* 로딩 상태 */}
          {isLoading && (
            <div className="card-brutal rounded-lg p-16 text-center">
              <span className="text-6xl animate-bounce block mb-4">🦛</span>
              <p className="text-text-secondary">포트폴리오를 불러오는 중...</p>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="card-brutal rounded-lg p-8 text-center">
              <span className="text-4xl block mb-4">😢</span>
              <p className="text-magenta font-semibold mb-2">오류 발생</p>
              <p className="text-text-secondary mb-4">
                포트폴리오 정보를 불러오는데 실패했습니다.
              </p>
              <button
                onClick={() => refetch()}
                className="px-6 py-2 bg-lime text-bg-primary font-semibold rounded border-2 border-border hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* 보유 주식이 없는 경우 */}
          {!isLoading && !error && holdings.length === 0 && (
            <div className="card-brutal rounded-lg p-16 text-center">
              <span className="text-6xl block mb-6">📭</span>
              <h3 className="font-display text-2xl text-text-primary mb-4">
                보유 중인 주식이 없습니다
              </h3>
              <p className="text-text-secondary mb-8">
                주식을 매수하고 포트폴리오를 시작해보세요!
              </p>
              <Link
                to="/explore"
                className="inline-block px-8 py-3 bg-lime text-bg-primary font-bold rounded border-2 border-border hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
              >
                주식 탐색하기
              </Link>
            </div>
          )}

          {/* 보유 주식이 있는 경우 */}
          {!isLoading && !error && holdings.length > 0 && (
            <>
              {/* 요약 카드 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {/* 총 평가금액 */}
                <div className="card-brutal rounded-lg p-6">
                  <p className="text-text-muted text-sm mb-2">총 평가금액</p>
                  <p className="font-mono font-bold text-3xl text-text-primary">
                    {totalValue.toLocaleString()}
                    <span className="text-lg text-text-muted ml-1">원</span>
                  </p>
                </div>

                {/* 총 손익 */}
                <div className="card-brutal rounded-lg p-6">
                  <p className="text-text-muted text-sm mb-2">총 손익</p>
                  <p className={cn(
                    'font-mono font-bold text-3xl',
                    isPositiveTotal ? 'text-lime' : 'text-magenta'
                  )}>
                    {isPositiveTotal ? '+' : ''}{totalProfitLoss.toLocaleString()}
                    <span className="text-lg ml-1">원</span>
                  </p>
                </div>

                {/* 총 수익률 */}
                <div className="card-brutal rounded-lg p-6">
                  <p className="text-text-muted text-sm mb-2">총 수익률</p>
                  <p className={cn(
                    'font-mono font-bold text-3xl',
                    isPositiveTotal ? 'text-lime' : 'text-magenta'
                  )}>
                    {isPositiveTotal ? '+' : ''}{totalProfitLossRate}
                    <span className="text-lg ml-1">%</span>
                  </p>
                </div>
              </div>

              {/* 보유 종목 섹션 */}
              <div className="mb-4 flex items-center gap-3">
                <h3 className="font-display text-2xl text-text-primary">
                  보유 종목
                </h3>
                <span className="text-text-muted text-sm">
                  ({holdings.length}개)
                </span>
              </div>

              {/* 보유 주식 리스트 */}
              <div className="space-y-4">
                {holdings.map((holding) => (
                  <HoldingCard key={holding.stockCode} holding={holding} />
                ))}
              </div>
            </>
          )}
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

// 보유 주식 카드 컴포넌트
function HoldingCard({ holding }: { holding: Holding }) {
  const profitLossRate = parseFloat(holding.profitLossRate);
  const isPositive = holding.profitLoss >= 0;

  return (
    <Link
      to={`/stock/${holding.stockCode}`}
      className="card-brutal rounded-lg p-6 block hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* 종목 정보 */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-2">
            <h4 className="font-display text-xl text-text-primary">
              {holding.stockName}
            </h4>
            <span className="text-text-muted font-mono text-sm">
              {holding.stockCode}
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-text-muted mb-1">보유 수량</p>
              <p className="font-mono text-text-secondary">
                {holding.quantity.toLocaleString()}주
              </p>
            </div>
            <div>
              <p className="text-text-muted mb-1">평균 매수가</p>
              <p className="font-mono text-text-secondary">
                {Math.floor(holding.averagePrice).toLocaleString()}원
              </p>
            </div>
            <div>
              <p className="text-text-muted mb-1">현재가</p>
              <p className="font-mono text-text-secondary">
                {holding.currentPrice.toLocaleString()}원
              </p>
            </div>
            <div>
              <p className="text-text-muted mb-1">평가금액</p>
              <p className="font-mono text-text-secondary">
                {holding.totalValue.toLocaleString()}원
              </p>
            </div>
          </div>
        </div>

        {/* 손익 정보 */}
        <div className="sm:text-right sm:min-w-[140px]">
          <p className="text-text-muted text-sm mb-1">손익</p>
          <p className={cn(
            'font-mono font-bold text-xl',
            isPositive ? 'text-lime' : 'text-magenta'
          )}>
            {isPositive ? '+' : ''}{holding.profitLoss.toLocaleString()}원
          </p>
          <p className={cn(
            'font-mono font-semibold text-lg',
            isPositive ? 'text-lime' : 'text-magenta'
          )}>
            ({isPositive ? '+' : ''}{profitLossRate.toFixed(2)}%)
          </p>
        </div>
      </div>
    </Link>
  );
}
