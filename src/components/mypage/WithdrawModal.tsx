import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWithdraw, extractUserError } from '../../hooks/useUser';
import { Button } from '../ui/Button';
import { toast } from 'sonner';

interface WithdrawModalProps {
  onClose: () => void;
}

export function WithdrawModal({ onClose }: WithdrawModalProps) {
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const withdrawMutation = useWithdraw();

  const isConfirmed = confirmText === '탈퇴';

  const handleWithdraw = async () => {
    if (!isConfirmed) return;
    setError(null);

    try {
      await withdrawMutation.mutateAsync();
      toast.success('회원 탈퇴가 완료되었습니다.');
      navigate('/');
    } catch (err) {
      const errorMessage = extractUserError(withdrawMutation.error);
      setError(errorMessage || '회원 탈퇴 중 오류가 발생했습니다.');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="card-brutal rounded-lg p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <span className="text-5xl block mb-4">⚠️</span>
          <h2 className="font-display text-2xl text-text-primary mb-2">
            회원 탈퇴
          </h2>
          <p className="text-text-secondary">
            정말로 탈퇴하시겠습니까?
          </p>
        </div>

        {/* 경고 메시지 */}
        <div className="mb-6 p-4 bg-magenta/10 border border-magenta/30 rounded">
          <p className="text-sm text-magenta font-semibold mb-2">
            탈퇴 시 다음 데이터가 삭제됩니다:
          </p>
          <ul className="text-sm text-magenta/80 list-disc list-inside space-y-1">
            <li>보유 주식 및 잔고</li>
            <li>모든 거래 내역</li>
            <li>포트폴리오 기록</li>
          </ul>
          <p className="text-xs text-magenta/60 mt-3">
            * 삭제된 데이터는 복구할 수 없습니다.
          </p>
        </div>

        {/* 확인 입력 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-text-secondary mb-2">
            탈퇴를 확인하려면 <span className="text-magenta">'탈퇴'</span>를 입력하세요
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="탈퇴"
            disabled={withdrawMutation.isPending}
            className="w-full px-4 py-3 bg-bg-secondary border-2 border-border rounded text-text-primary placeholder:text-text-muted focus:outline-none focus:border-magenta transition-colors font-mono"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-magenta/10 border border-magenta/30 rounded">
            <p className="text-sm text-magenta">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={withdrawMutation.isPending}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleWithdraw}
            disabled={!isConfirmed || withdrawMutation.isPending}
            isLoading={withdrawMutation.isPending}
            className="flex-1"
          >
            탈퇴하기
          </Button>
        </div>
      </div>
    </div>
  );
}

export default WithdrawModal;
