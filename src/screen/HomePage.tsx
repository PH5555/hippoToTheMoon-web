import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Header } from '../components/ui/Header';
import { Button } from '../components/ui/Button';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Header */}
      <Header />

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
