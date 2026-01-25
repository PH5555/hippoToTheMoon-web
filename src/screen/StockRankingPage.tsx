import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { FilterTabs } from '../components/stock/FilterTabs';
import { RankingTable } from '../components/stock/RankingTable';
import authApi from '../api/auth';
import stockApi from '../api/stock';
import type { RankingFilter, StockRankingItem } from '../types/stock';

export default function StockRankingPage() {
  const { isAuthenticated, logout } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState<RankingFilter>('VOLUME');
  const [items, setItems] = useState<StockRankingItem[]>([]);
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

  const fetchRanking = async (filter: RankingFilter) => {
    setIsLoading(true);
    try {
      const response = await stockApi.getStockRanking(filter);
      setItems(response.data.items);
    } catch (error) {
      console.error('Failed to fetch ranking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking(activeFilter);
  }, [activeFilter]);

  const handleFilterChange = (filter: RankingFilter) => {
    setActiveFilter(filter);
  };

  const getFilterTitle = (filter: RankingFilter): string => {
    switch (filter) {
      case 'VOLUME':
        return '거래량 TOP 10';
      case 'RISING':
        return '급상승 TOP 10';
      case 'FALLING':
        return '급하락 TOP 10';
    }
  };

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
              <Link to="/ranking" className="text-lime font-semibold text-sm">
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
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="font-display text-4xl sm:text-5xl text-text-primary mb-2">
              주식 <span className="text-lime">랭킹</span>
            </h2>
            <p className="text-text-secondary">
              실시간 주식 시장의 트렌드를 확인하세요
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <FilterTabs activeFilter={activeFilter} onFilterChange={handleFilterChange} />
          </div>

          {/* Current Filter Title */}
          <div className="mb-4 flex items-center gap-3">
            <h3 className="font-display text-2xl text-text-primary">
              {getFilterTitle(activeFilter)}
            </h3>
            {activeFilter === 'RISING' && (
              <span className="text-lime text-xl">📈</span>
            )}
            {activeFilter === 'FALLING' && (
              <span className="text-magenta text-xl">📉</span>
            )}
            {activeFilter === 'VOLUME' && (
              <span className="text-xl">🔥</span>
            )}
          </div>

          {/* Ranking Table */}
          <RankingTable items={items} isLoading={isLoading} />

          {/* Info Note */}
          <p className="text-text-muted text-sm text-center mt-6">
            * 현재 목 데이터가 표시됩니다. 실제 API 연동 시 실시간 데이터로 대체됩니다.
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
