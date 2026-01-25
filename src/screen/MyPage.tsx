import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Header } from '../components/ui/Header';

export default function MyPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

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
          <div className="mb-8 text-center">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="font-display text-4xl sm:text-5xl text-text-primary mb-4">
              <span className="text-lime">마이 페이지</span>
            </h2>
            <p className="text-text-secondary text-lg">
              마이 페이지를 준비 중입니다
            </p>
          </div>

          {/* Placeholder Card */}
          <div className="card-brutal rounded-lg p-12 text-center max-w-2xl mx-auto">
            <p className="text-text-muted mb-4">
              사용자 정보, 거래 내역, 설정 등을 관리할 수 있습니다.
            </p>
            <p className="text-text-muted text-sm">
              곧 멋진 기능으로 찾아뵙겠습니다.
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
