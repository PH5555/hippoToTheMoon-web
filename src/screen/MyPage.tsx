import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUser } from '../hooks/useUser';
import { useTradeHistory } from '../hooks/useTradeHistory';
import { Header } from '../components/ui/Header';
import { Button } from '../components/ui/Button';
import { ProfileCard, TradeHistoryList, WithdrawModal } from '../components/mypage';

export default function MyPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // 유저 정보 조회
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useUser();

  // 거래 내역 조회
  const {
    data: trades,
    isLoading: tradesLoading,
    error: tradesError,
    refetch: refetchTrades,
  } = useTradeHistory();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/mypage', { replace: true });
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
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="font-display text-4xl sm:text-5xl text-text-primary mb-2">
              마이 <span className="text-lime">페이지</span>
            </h2>
            <p className="text-text-secondary">
              내 정보와 거래 내역을 확인하세요
            </p>
          </div>

          {/* 유저 정보 로딩 */}
          {userLoading && (
            <div className="card-brutal rounded-lg p-12 text-center mb-8">
              <span className="text-5xl animate-bounce block mb-4">🦛</span>
              <p className="text-text-secondary">정보를 불러오는 중...</p>
            </div>
          )}

          {/* 유저 정보 에러 */}
          {userError && !userLoading && (
            <div className="card-brutal rounded-lg p-8 text-center mb-8">
              <span className="text-4xl block mb-4">😢</span>
              <p className="text-magenta font-semibold mb-2">오류 발생</p>
              <p className="text-text-secondary mb-4">
                사용자 정보를 불러오는데 실패했습니다.
              </p>
              <button
                onClick={() => refetchUser()}
                className="px-6 py-2 bg-lime text-bg-primary font-semibold rounded border-2 border-border hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* 유저 정보 표시 */}
          {user && !userLoading && (
            <>
              {/* 프로필 카드 */}
              <div className="mb-8">
                <ProfileCard user={user} onNicknameUpdated={refetchUser} />
              </div>

              {/* 거래 내역 */}
              <div className="mb-8">
                <TradeHistoryList
                  trades={trades ?? []}
                  isLoading={tradesLoading}
                  error={tradesError}
                  onRetry={refetchTrades}
                />
              </div>

              {/* 계정 관리 */}
              <div className="card-brutal rounded-lg p-6">
                <h3 className="font-display text-xl text-text-primary mb-4">
                  계정 관리
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">
                      회원 탈퇴 시 모든 데이터가 삭제됩니다.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowWithdrawModal(true)}
                  >
                    회원 탈퇴
                  </Button>
                </div>
              </div>
            </>
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
            © 2026 떡상하마. 모의 투자 서비스입니다.
          </p>
        </div>
      </footer>

      {/* 회원 탈퇴 모달 */}
      {showWithdrawModal && (
        <WithdrawModal onClose={() => setShowWithdrawModal(false)} />
      )}
    </div>
  );
}
