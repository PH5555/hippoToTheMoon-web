import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import authApi from '../../api/auth';
import { Button } from '../ui/Button';
import { NicknameEditModal } from './NicknameEditModal';
import type { UserInfo } from '../../types/user';

interface ProfileCardProps {
  user: UserInfo;
  onNicknameUpdated: () => void;
}

export function ProfileCard({ user, onNicknameUpdated }: ProfileCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    // 마이페이지에서 로그아웃 시 먼저 홈으로 이동
    navigate('/', { replace: true });
    
    try {
      await authApi.signOut();
      // 서버에서 쿠키가 삭제됨
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      queryClient.clear(); // React Query 캐시 초기화
      logout();
      toast.success('로그아웃 되었습니다.');
      setIsLoggingOut(false);
    }
  };

  const getSocialIcon = () => {
    if (user.authType === 'KAKAO') {
      return (
        <div className="w-16 h-16 rounded-full bg-[#FEE500] flex items-center justify-center border-2 border-border shadow-[4px_4px_0_0_rgba(254,229,0,0.3)]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#191919">
            <path d="M12 3C6.477 3 2 6.463 2 10.69c0 2.648 1.758 4.976 4.41 6.31-.136.457-.877 2.94-.903 3.127-.033.24.089.237.187.172.077-.05 2.53-1.72 3.552-2.415.883.128 1.799.196 2.754.196 5.523 0 10-3.463 10-7.69S17.523 3 12 3z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-2 border-border shadow-[4px_4px_0_0_rgba(255,255,255,0.3)]">
        <svg width="28" height="28" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      </div>
    );
  };

  return (
    <>
      <div className="card-brutal rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* 소셜 로그인 아이콘 */}
          {getSocialIcon()}

          {/* 유저 정보 */}
          <div className="flex-1">
            {/* 닉네임 */}
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-display text-2xl text-text-primary">
                {user.nickname}
              </h3>
              <button
                onClick={() => setIsEditingNickname(true)}
                className="px-3 py-1 text-xs font-semibold text-text-secondary border border-border rounded hover:border-lime hover:text-lime transition-colors"
              >
                수정
              </button>
            </div>

            {/* 소셜 타입 배지 */}
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`px-2 py-0.5 text-xs font-semibold rounded ${
                  user.authType === 'KAKAO'
                    ? 'bg-[#FEE500]/20 text-[#FEE500] border border-[#FEE500]/30'
                    : 'bg-white/10 text-white border border-white/30'
                }`}
              >
                {user.authType === 'KAKAO' ? '카카오 로그인' : '구글 로그인'}
              </span>
            </div>

            {/* 잔고 */}
            <div className="flex items-baseline gap-2">
              <span className="text-text-muted text-sm">보유 잔고</span>
              <span className="font-mono text-2xl font-bold text-lime">
                {user.balance.toLocaleString()}
              </span>
              <span className="text-text-muted text-sm">원</span>
            </div>
          </div>

          {/* 로그아웃 버튼 */}
          <div className="sm:self-start">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              isLoading={isLoggingOut}
            >
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      {/* 닉네임 수정 모달 */}
      {isEditingNickname && (
        <NicknameEditModal
          currentNickname={user.nickname}
          onClose={() => setIsEditingNickname(false)}
          onSuccess={() => {
            setIsEditingNickname(false);
            onNicknameUpdated();
          }}
        />
      )}
    </>
  );
}

export default ProfileCard;
