import { useState } from 'react';
import { useUpdateNickname, extractUserError } from '../../hooks/useUser';
import { Button } from '../ui/Button';

interface NicknameEditModalProps {
  currentNickname: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function NicknameEditModal({
  currentNickname,
  onClose,
  onSuccess,
}: NicknameEditModalProps) {
  const [nickname, setNickname] = useState(currentNickname);
  const [error, setError] = useState<string | null>(null);
  const updateNicknameMutation = useUpdateNickname();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 클라이언트 측 유효성 검사
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    if (trimmedNickname.length > 20) {
      setError('닉네임은 20자를 초과할 수 없습니다.');
      return;
    }
    if (trimmedNickname.includes(' ')) {
      setError('닉네임에 공백을 포함할 수 없습니다.');
      return;
    }
    if (trimmedNickname === currentNickname) {
      setError('현재 닉네임과 동일합니다.');
      return;
    }

    try {
      await updateNicknameMutation.mutateAsync(trimmedNickname);
      onSuccess();
    } catch (err) {
      const errorMessage = extractUserError(updateNicknameMutation.error);
      setError(errorMessage || '닉네임 수정 중 오류가 발생했습니다.');
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
        <h2 className="font-display text-2xl text-text-primary mb-6">
          닉네임 수정
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="nickname"
              className="block text-sm font-semibold text-text-secondary mb-2"
            >
              새 닉네임
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              placeholder="닉네임을 입력하세요"
              disabled={updateNicknameMutation.isPending}
              className="w-full px-4 py-3 bg-bg-secondary border-2 border-border rounded text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lime transition-colors font-mono"
              autoFocus
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-text-muted">
                공백 없이 1~20자
              </span>
              <span className="text-xs text-text-muted font-mono">
                {nickname.length}/20
              </span>
            </div>
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
              disabled={updateNicknameMutation.isPending}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={updateNicknameMutation.isPending}
              className="flex-1"
            >
              수정하기
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NicknameEditModal;
