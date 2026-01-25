import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import authApi from '../api/auth';

export default function HomePage() {
  const { isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.signOut();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      logout();
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
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center px-4">
            <h2 className="font-display text-5xl sm:text-7xl text-text-primary mb-4">
              <span className="text-lime">떡상</span>의 시작
            </h2>
            <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-8">
              하마처럼 묵직하게, 달까지 우직하게.
              <br />
              가상 자산으로 모의 투자를 경험해보세요.
            </p>

            {!isAuthenticated && (
              <Link to="/login">
                <Button variant="primary" size="lg">
                  지금 시작하기
                </Button>
              </Link>
            )}
          </div>

          {/* Background gradient */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-magenta/10 rounded-full blur-3xl" />
          </div>
        </section>

        {/* Stock Data Section - Placeholder */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h3 className="font-display text-3xl text-text-primary mb-8 text-center">
              실시간 시세
            </h3>

            {/* Placeholder cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="card-brutal p-6 rounded-lg animate-pulse"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="h-6 w-24 bg-bg-secondary rounded mb-2" />
                      <div className="h-4 w-16 bg-bg-secondary rounded" />
                    </div>
                    <div className="h-8 w-20 bg-bg-secondary rounded" />
                  </div>
                  <div className="h-24 bg-bg-secondary rounded" />
                </div>
              ))}
            </div>

            <p className="text-text-muted text-center mt-8">
              실시간 주식 데이터가 이곳에 표시됩니다.
            </p>
          </div>
        </section>
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
