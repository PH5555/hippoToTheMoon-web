import { Header } from '../components/ui/Header';
import { UserRankingTable } from '../components/ranking/UserRankingTable';
import type { UserRankingEntry } from '../types/userRanking';

function formatSnapshot(value: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const MOCK_RANKINGS: UserRankingEntry[] = [
  { rank: 1, nickname: '떡상고래', totalAsset: 7200000, profitLoss: 2200000, returnRate: 0.44 },
  { rank: 2, nickname: '불꽃개미', totalAsset: 6500000, profitLoss: 1500000, returnRate: 0.3 },
  { rank: 3, nickname: '장기투자자', totalAsset: 6100000, profitLoss: 1100000, returnRate: 0.22 },
  { rank: 4, nickname: '추세추종', totalAsset: 5800000, profitLoss: 800000, returnRate: 0.16 },
  { rank: 5, nickname: '뉴스헌터', totalAsset: 5600000, profitLoss: 600000, returnRate: 0.12 },
  { rank: 6, nickname: '테크러버', totalAsset: 5400000, profitLoss: 400000, returnRate: 0.08 },
  { rank: 7, nickname: '배당덕후', totalAsset: 5250000, profitLoss: 250000, returnRate: 0.05 },
  { rank: 8, nickname: '손절귀신', totalAsset: 5100000, profitLoss: 100000, returnRate: 0.02 },
  { rank: 9, nickname: '중립박스', totalAsset: 5000000, profitLoss: 0, returnRate: 0 },
  { rank: 10, nickname: '리밸런서', totalAsset: 4900000, profitLoss: -100000, returnRate: -0.02 },
];

const MOCK_SNAPSHOT_AT = '2026-02-08T12:00:00';

export default function StockRankingPage() {
  const rankings = MOCK_RANKINGS;
  const snapshotAt = formatSnapshot(MOCK_SNAPSHOT_AT);

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
              유저 <span className="text-lime">랭킹</span>
            </h2>
            <p className="text-text-secondary">
              수익률 Top 50 유저를 확인하세요.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-text-secondary">
              스냅샷: <span className="font-mono text-text-primary">{snapshotAt}</span>
            </div>
          </div>

          {/* Empty State */}
          {rankings.length === 0 && (
            <div className="card-brutal rounded-lg p-10 text-center mb-6">
              <span className="text-5xl block mb-4">-</span>
              <h3 className="font-display text-2xl text-text-primary mb-2">
                랭킹 데이터 없음
              </h3>
              <p className="text-text-secondary">
                아직 집계된 랭킹이 없습니다.
              </p>
            </div>
          )}

          {/* Ranking Table */}
          {rankings.length > 0 && (
            <UserRankingTable items={rankings} />
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
            짤 2026 떡상호마. 모의 투자 서비스입니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
