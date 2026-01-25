import { useNavigate } from 'react-router-dom';
import type { StockRankingItem } from '../../types/stock';
import { cn } from '../../utils/cn';

interface RankingTableProps {
  items: StockRankingItem[];
  isLoading?: boolean;
}

function formatNumber(value: string): string {
  const num = parseInt(value.replace(/[^0-9-]/g, ''), 10);
  return num.toLocaleString('ko-KR');
}

function formatPrice(value: string): string {
  const num = parseInt(value.replace(/[^0-9]/g, ''), 10);
  return num.toLocaleString('ko-KR');
}

function isPositive(value: string): boolean {
  // API에서 양수는 + 기호 없이 숫자만 반환 (예: "2000")
  // 음수가 아니고 0이 아닌 경우 양수로 판단
  const num = parseInt(value.replace(/[^0-9-]/g, ''), 10);
  return !isNaN(num) && num > 0 && !value.startsWith('-');
}

function isNegative(value: string): boolean {
  return value.startsWith('-');
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      <td className="py-4 px-4"><div className="h-6 w-8 bg-bg-secondary rounded animate-pulse" /></td>
      <td className="py-4 px-4"><div className="h-6 w-24 bg-bg-secondary rounded animate-pulse" /></td>
      <td className="py-4 px-4 text-right"><div className="h-6 w-20 bg-bg-secondary rounded animate-pulse ml-auto" /></td>
      <td className="py-4 px-4 text-right"><div className="h-6 w-16 bg-bg-secondary rounded animate-pulse ml-auto" /></td>
      <td className="py-4 px-4 text-right"><div className="h-6 w-24 bg-bg-secondary rounded animate-pulse ml-auto" /></td>
    </tr>
  );
}

export function RankingTable({ items, isLoading = false }: RankingTableProps) {
  const navigate = useNavigate();

  const handleRowClick = (stockCode: string, stockName: string) => {
    navigate(`/stock/${stockCode}?name=${encodeURIComponent(stockName)}`);
  };

  if (isLoading) {
    return (
      <div className="card-brutal rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-border-strong bg-bg-secondary">
              <th className="py-3 px-4 text-left text-text-secondary font-semibold text-sm">순위</th>
              <th className="py-3 px-4 text-left text-text-secondary font-semibold text-sm">종목명</th>
              <th className="py-3 px-4 text-right text-text-secondary font-semibold text-sm">현재가</th>
              <th className="py-3 px-4 text-right text-text-secondary font-semibold text-sm">등락률</th>
              <th className="py-3 px-4 text-right text-text-secondary font-semibold text-sm">거래량</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="card-brutal rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-border-strong bg-bg-secondary">
            <th className="py-3 px-4 text-left text-text-secondary font-semibold text-sm">순위</th>
            <th className="py-3 px-4 text-left text-text-secondary font-semibold text-sm">종목명</th>
            <th className="py-3 px-4 text-right text-text-secondary font-semibold text-sm">현재가</th>
            <th className="py-3 px-4 text-right text-text-secondary font-semibold text-sm">등락률</th>
            <th className="py-3 px-4 text-right text-text-secondary font-semibold text-sm">거래량</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const positive = isPositive(item.priceChange);
            const negative = isNegative(item.priceChange);

            return (
              <tr
                key={item.stockCode}
                className="border-b border-border hover:bg-bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => handleRowClick(item.stockCode, item.stockName)}
              >
                {/* 순위 */}
                <td className="py-4 px-4">
                  <span
                    className={cn(
                      'font-mono font-bold text-lg',
                      item.rank === '1' && 'text-lime',
                      item.rank === '2' && 'text-text-primary',
                      item.rank === '3' && 'text-text-primary',
                      parseInt(item.rank) > 3 && 'text-text-secondary'
                    )}
                  >
                    {item.rank}
                  </span>
                </td>

                {/* 종목명 */}
                <td className="py-4 px-4">
                  <div>
                    <p className="font-semibold text-text-primary">{item.stockName}</p>
                    <p className="text-xs text-text-muted font-mono">{item.stockCode}</p>
                  </div>
                </td>

                {/* 현재가 */}
                <td className="py-4 px-4 text-right">
                  <span className="font-mono font-semibold text-text-primary">
                    {formatPrice(item.currentPrice)}
                  </span>
                  <span className="text-text-muted text-sm ml-1">원</span>
                </td>

                {/* 등락률 */}
                <td className="py-4 px-4 text-right">
                  <div className={cn('font-mono font-bold', positive && 'text-lime', negative && 'text-magenta')}>
                    <span className="text-sm">{positive ? '+' : ''}{item.priceChange}</span>
                    <span className="ml-2 text-base">({item.priceChangeRate}%)</span>
                  </div>
                </td>

                {/* 거래량 */}
                <td className="py-4 px-4 text-right">
                  <span className="font-mono text-text-secondary">{formatNumber(item.volume)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default RankingTable;
