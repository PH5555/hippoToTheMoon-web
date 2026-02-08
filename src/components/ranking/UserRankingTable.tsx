import type { UserRankingEntry } from '../../types/userRanking';
import { cn } from '../../utils/cn';

interface UserRankingTableProps {
  items: UserRankingEntry[];
  isLoading?: boolean;
}

function formatNumber(value: number): string {
  return value.toLocaleString('ko-KR');
}

function formatReturnRate(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function valueTone(value: number): 'positive' | 'negative' | 'neutral' {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      <td className="py-4 px-4"><div className="h-6 w-8 bg-bg-secondary rounded animate-pulse" /></td>
      <td className="py-4 px-4"><div className="h-6 w-28 bg-bg-secondary rounded animate-pulse" /></td>
      <td className="py-4 px-4 text-right"><div className="h-6 w-24 bg-bg-secondary rounded animate-pulse ml-auto" /></td>
      <td className="py-4 px-4 text-right"><div className="h-6 w-20 bg-bg-secondary rounded animate-pulse ml-auto" /></td>
      <td className="py-4 px-4 text-right"><div className="h-6 w-16 bg-bg-secondary rounded animate-pulse ml-auto" /></td>
    </tr>
  );
}

export function UserRankingTable({ items, isLoading = false }: UserRankingTableProps) {
  if (isLoading) {
    return (
      <div className="card-brutal rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-border-strong bg-bg-secondary">
              <th className="py-3 px-4 text-left text-text-secondary font-semibold text-sm">순위</th>
              <th className="py-3 px-4 text-left text-text-secondary font-semibold text-sm">닉네임</th>
              <th className="py-3 px-4 text-right text-text-secondary font-semibold text-sm">총 자산</th>
              <th className="py-3 px-4 text-right text-text-secondary font-semibold text-sm">손익</th>
              <th className="py-3 px-4 text-right text-text-secondary font-semibold text-sm">수익률</th>
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
            <th className="py-3 px-4 text-left text-text-secondary font-semibold text-sm">닉네임</th>
            <th className="py-3 px-4 text-right text-text-secondary font-semibold text-sm">총 자산</th>
            <th className="py-3 px-4 text-right text-text-secondary font-semibold text-sm">손익</th>
            <th className="py-3 px-4 text-right text-text-secondary font-semibold text-sm">수익률</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const profitTone = valueTone(item.profitLoss);
            const rateTone = valueTone(item.returnRate);

            return (
              <tr
                key={`${item.rank}-${item.nickname}`}
                className="border-b border-border hover:bg-bg-secondary/50 transition-colors"
              >
                <td className="py-4 px-4">
                  <span
                    className={cn(
                      'font-mono font-bold text-lg',
                      item.rank === 1 && 'text-lime',
                      item.rank === 2 && 'text-text-primary',
                      item.rank === 3 && 'text-text-primary',
                      item.rank > 3 && 'text-text-secondary'
                    )}
                  >
                    {item.rank}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="font-semibold text-text-primary">{item.nickname}</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="font-mono font-semibold text-text-primary">
                    {formatNumber(item.totalAsset)}
                  </span>
                  <span className="text-text-muted text-sm ml-1">원</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span
                    className={cn(
                      'font-mono font-bold',
                      profitTone === 'positive' && 'text-lime',
                      profitTone === 'negative' && 'text-magenta',
                      profitTone === 'neutral' && 'text-text-muted'
                    )}
                  >
                    {item.profitLoss > 0 ? '+' : ''}
                    {formatNumber(item.profitLoss)}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span
                    className={cn(
                      'font-mono font-bold',
                      rateTone === 'positive' && 'text-lime',
                      rateTone === 'negative' && 'text-magenta',
                      rateTone === 'neutral' && 'text-text-muted'
                    )}
                  >
                    {item.returnRate > 0 ? '+' : ''}
                    {formatReturnRate(item.returnRate)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default UserRankingTable;
