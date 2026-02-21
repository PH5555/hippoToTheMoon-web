import { Header } from '../components/ui/Header';
import { UserRankingTable } from '../components/ranking/UserRankingTable';
import { useUserRanking } from '../hooks/useUserRanking';

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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return '랭킹 데이터를 불러오지 못했습니다.';
}

export default function StockRankingPage() {
  const { data, isLoading, error, refetch, isFetching } = useUserRanking();
  const rankings = data?.items ?? [];
  const snapshotAt = formatSnapshot(data?.snapshotAt ?? null);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="noise-overlay" />

      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="font-display text-4xl sm:text-5xl text-text-primary mb-2">
              유저 <span className="text-lime">랭킹</span>
            </h2>
            <p className="text-text-secondary">수익률 기준 상위 유저를 확인하세요.</p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-text-secondary">
              기준 시각 <span className="font-mono text-text-primary">{snapshotAt}</span>
            </div>
            {isFetching && !isLoading && (
              <span className="text-xs text-text-muted">업데이트 중...</span>
            )}
          </div>

          {error && (
            <div className="card-brutal rounded-lg p-8 text-center mb-6">
              <p className="text-magenta font-semibold mb-2">데이터 조회 실패</p>
              <p className="text-text-secondary">{getErrorMessage(error)}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-lime text-bg-primary font-semibold rounded border-2 border-border hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
              >
                다시 시도
              </button>
            </div>
          )}

          {!error && rankings.length === 0 && !isLoading && (
            <div className="card-brutal rounded-lg p-10 text-center mb-6">
              <span className="text-5xl block mb-4">-</span>
              <h3 className="font-display text-2xl text-text-primary mb-2">랭킹 데이터 없음</h3>
              <p className="text-text-secondary">아직 랭킹 데이터가 없습니다.</p>
            </div>
          )}

          {!error && (isLoading || rankings.length > 0) && (
            <UserRankingTable items={rankings} isLoading={isLoading} />
          )}
        </div>

        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-lime/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-magenta/5 rounded-full blur-3xl" />
        </div>
      </main>

      <footer className="border-t-2 border-border py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-text-muted text-sm">© 2026 떡상하마. 모의 투자 서비스입니다.</p>
        </div>
      </footer>
    </div>
  );
}
