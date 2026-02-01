import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import type { TradeHistory } from '../../types/trading';

interface TradeHistoryCardProps {
  trade: TradeHistory;
}

export function TradeHistoryCard({ trade }: TradeHistoryCardProps) {
  const isBuy = trade.tradeType === 'BUY';

  // 날짜 포맷팅
  const formattedDate = new Date(trade.createdAt).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link
      to={`/stock/${trade.stockCode}`}
      className="card-brutal rounded-lg p-4 block hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* 왼쪽: 거래 유형 + 종목 정보 */}
        <div className="flex items-center gap-4">
          {/* 거래 유형 배지 */}
          <div
            className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center font-display text-lg border-2',
              isBuy
                ? 'bg-lime/10 text-lime border-lime/30'
                : 'bg-magenta/10 text-magenta border-magenta/30'
            )}
          >
            {isBuy ? '매수' : '매도'}
          </div>

          {/* 종목 정보 */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display text-lg text-text-primary">
                {trade.stockName}
              </span>
              <span className="text-xs text-text-muted font-mono">
                {trade.stockCode}
              </span>
            </div>
            <p className="text-xs text-text-muted">{formattedDate}</p>
          </div>
        </div>

        {/* 오른쪽: 거래 상세 */}
        <div className="flex items-center gap-6 sm:text-right">
          <div>
            <p className="text-xs text-text-muted mb-1">체결가</p>
            <p className="font-mono text-sm text-text-secondary">
              {trade.price.toLocaleString()}원
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">수량</p>
            <p className="font-mono text-sm text-text-secondary">
              {trade.quantity.toLocaleString()}주
            </p>
          </div>
          <div className="min-w-[100px]">
            <p className="text-xs text-text-muted mb-1">거래금액</p>
            <p
              className={cn(
                'font-mono font-bold',
                isBuy ? 'text-lime' : 'text-magenta'
              )}
            >
              {isBuy ? '-' : '+'}
              {trade.amount.toLocaleString()}원
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default TradeHistoryCard;
