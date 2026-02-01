import { useState, useMemo } from 'react';
import { cn } from '../../utils/cn';
import { TradeHistoryCard } from './TradeHistoryCard';
import type { TradeHistory, TradeType } from '../../types/trading';

type FilterType = 'ALL' | TradeType;

interface TradeHistoryListProps {
  trades: TradeHistory[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}

export function TradeHistoryList({
  trades,
  isLoading,
  error,
  onRetry,
}: TradeHistoryListProps) {
  const [filter, setFilter] = useState<FilterType>('ALL');

  // 필터링된 거래 내역
  const filteredTrades = useMemo(() => {
    if (filter === 'ALL') return trades;
    return trades.filter((trade) => trade.tradeType === filter);
  }, [trades, filter]);

  // 필터 탭
  const filters: { key: FilterType; label: string }[] = [
    { key: 'ALL', label: '전체' },
    { key: 'BUY', label: '매수' },
    { key: 'SELL', label: '매도' },
  ];

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="card-brutal rounded-lg p-12 text-center">
        <span className="text-4xl animate-bounce block mb-4">🦛</span>
        <p className="text-text-secondary">거래 내역을 불러오는 중...</p>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="card-brutal rounded-lg p-8 text-center">
        <span className="text-4xl block mb-4">😢</span>
        <p className="text-magenta font-semibold mb-2">오류 발생</p>
        <p className="text-text-secondary mb-4">
          거래 내역을 불러오는데 실패했습니다.
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-lime text-bg-primary font-semibold rounded border-2 border-border hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* 섹션 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-2xl text-text-primary">거래 내역</h3>
          <span className="text-text-muted text-sm">
            ({filteredTrades.length}건)
          </span>
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-2">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'px-4 py-2 text-sm font-semibold rounded border-2 transition-all',
                filter === key
                  ? 'bg-lime text-bg-primary border-lime'
                  : 'bg-transparent text-text-secondary border-border hover:border-lime hover:text-lime'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 거래 내역 리스트 */}
      {filteredTrades.length === 0 ? (
        <div className="card-brutal rounded-lg p-12 text-center">
          <span className="text-4xl block mb-4">📭</span>
          <p className="text-text-secondary">
            {filter === 'ALL'
              ? '거래 내역이 없습니다.'
              : filter === 'BUY'
              ? '매수 내역이 없습니다.'
              : '매도 내역이 없습니다.'}
          </p>
          {filter === 'ALL' && (
            <p className="text-text-muted text-sm mt-2">
              첫 거래를 시작해보세요!
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTrades.map((trade) => (
            <TradeHistoryCard key={trade.id} trade={trade} />
          ))}
        </div>
      )}
    </div>
  );
}

export default TradeHistoryList;
