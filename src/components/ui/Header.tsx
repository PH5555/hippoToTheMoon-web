import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { useUser } from '../../hooks/useUser';
import { Button } from './Button';
import authApi from '../../api/auth';
import { cn } from '../../utils/cn';

// 로그인이 필요한 페이지 목록
const AUTH_REQUIRED_PATHS = ['/mypage', '/portfolio'];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, logout } = useAuthStore();
  const { data: user } = useUser();

  const handleLogout = async () => {
    // 현재 페이지가 인증 필요 페이지인지 확인
    const isAuthRequiredPage = AUTH_REQUIRED_PATHS.includes(location.pathname);
    
    // 인증 필요 페이지에서 로그아웃 시 먼저 홈으로 이동 (useEffect 충돌 방지)
    if (isAuthRequiredPage) {
      navigate('/', { replace: true });
    }
    
    try {
      await authApi.signOut();
      // 서버에서 쿠키가 삭제됨
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      queryClient.clear(); // React Query 캐시 초기화
      logout();
      toast.success('로그아웃 되었습니다.');
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
              to="/ranking"
              className={cn(
                'text-sm font-semibold transition-colors hover:text-lime',
                isActive('/ranking') ? 'text-lime' : 'text-text-secondary'
              )}
            >
              랭킹
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

          {/* Balance & Auth Buttons */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-secondary rounded border border-border">
                <span className="text-lime text-sm">💰</span>
                <span className="font-mono text-sm text-text-primary font-semibold">
                  {user.balance.toLocaleString()}
                </span>
                <span className="text-text-muted text-xs">원</span>
              </div>
            )}
            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                로그아웃
              </Button>
            ) : (
              <Link to={`/login?redirect=${encodeURIComponent(location.pathname)}`}>
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
