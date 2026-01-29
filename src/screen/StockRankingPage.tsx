import { Header } from '../components/ui/Header';

export default function StockRankingPage() {
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
              투자자 <span className="text-lime">랭킹</span>
            </h2>
            <p className="text-text-secondary">
              수익률 TOP 투자자들을 확인하세요
            </p>
          </div>

          {/* Coming Soon Placeholder */}
          <div className="card-brutal rounded-lg p-16 text-center">
            <span className="text-6xl block mb-6">🏆</span>
            <h3 className="font-display text-2xl text-text-primary mb-4">
              Coming Soon
            </h3>
            <p className="text-text-secondary">
              투자자 랭킹 기능이 곧 출시됩니다!
            </p>
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
