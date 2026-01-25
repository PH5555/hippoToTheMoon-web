import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from './Button';
import authApi from '../../api/auth';
import { cn } from '../../utils/cn';

export function Header() {
  const location = useLocation();
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

  const isActive = (path: string) => location.pathname === path;

  return (
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
          <nav className="flex items-center gap-6">
            <Link
              to="/explore"
              className={cn(
                'text-sm font-semibold transition-colors hover:text-lime',
                isActive('/explore') ? 'text-lime' : 'text-text-secondary'
              )}
            >
              주식 탐색
            </Link>
            <Link
              to="/portfolio"
              className={cn(
                'text-sm font-semibold transition-colors hover:text-lime',
                isActive('/portfolio') ? 'text-lime' : 'text-text-secondary'
              )}
            >
              포트폴리오
            </Link>
            <Link
              to="/mypage"
              className={cn(
                'text-sm font-semibold transition-colors hover:text-lime',
                isActive('/mypage') ? 'text-lime' : 'text-text-secondary'
              )}
            >
              마이 페이지
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
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
          </div>
        </div>
      </div>
    </header>
  );
}
