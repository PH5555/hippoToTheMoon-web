import { useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import type { TradeResult } from '../../types/trading';

interface OrderResultModalProps {
  isOpen: boolean;
  result: TradeResult | null;
  estimatedPrice: number;
  onClose: () => void;
}

/**
 * 슬리피지 알림 컴포넌트
 * 예상가와 실제 체결가의 차이가 100원 이상일 때만 표시
 */
function SlippageNotice({
  estimatedPrice,
  actualPrice,
}: {
  estimatedPrice: number;
  actualPrice: number;
}) {
  const diff = actualPrice - estimatedPrice;
  const diffPercent = ((diff / estimatedPrice) * 100).toFixed(2);

  // 100원 미만 차이는 표시 안함
  if (Math.abs(diff) < 100) return null;

  const isHigher = diff > 0;

  return (
    <div
      className={cn(
        'mt-4 p-3 rounded-lg border text-sm',
        isHigher
          ? 'bg-magenta/10 border-magenta/30 text-magenta'
          : 'bg-lime/10 border-lime/30 text-lime'
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{isHigher ? '📈' : '📉'}</span>
        <p>
          예상 가격({estimatedPrice.toLocaleString()}원) 대비{' '}
          <span className="font-bold">
            {isHigher ? '+' : ''}
            {diff.toLocaleString()}원 ({diffPercent}%)
          </span>
          {isHigher ? ' 높게' : ' 낮게'} 체결되었습니다.
        </p>
      </div>
    </div>
  );
}

/**
 * 주문 결과 모달
 * 거래 체결 후 결과를 명확하게 보여줍니다.
 */
export function OrderResultModal({
  isOpen,
  result,
  estimatedPrice,
  onClose,
}: OrderResultModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // 배경 클릭으로 모달 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !result) return null;

  const isBuy = result.tradeType === 'BUY';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={cn(
          'w-full max-w-md bg-bg-secondary border-2 rounded-lg p-6',
          'shadow-[8px_8px_0_0_rgba(0,0,0,0.5)]',
          'animate-in zoom-in-95 duration-200',
          isBuy ? 'border-lime' : 'border-magenta'
        )}
      >
        {/* Header - 축하 이펙트 */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            {/* 파티클 이펙트 */}
            <div className="absolute -inset-4 animate-ping opacity-20">
              <span className="text-5xl">{isBuy ? '🎉' : '💸'}</span>
            </div>
            <span className="text-5xl relative z-10 animate-bounce inline-block">
              {isBuy ? '🎉' : '💸'}
            </span>
          </div>
          <h2
            className={cn(
              'font-display text-2xl mt-4',
              isBuy ? 'text-lime' : 'text-magenta'
            )}
          >
            {isBuy ? '매수' : '매도'} 체결 완료!
          </h2>
          <p className="text-text-muted text-sm mt-1">
            주문이 성공적으로 처리되었습니다
          </p>
        </div>

        {/* 체결 결과 상세 */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-text-secondary">종목</span>
            <div className="text-right">
              <span className="font-semibold text-text-primary">
                {result.stockName}
              </span>
              <span className="ml-2 text-text-muted font-mono text-sm">
                {result.stockCode}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-text-secondary">체결가</span>
            <span className="font-mono font-bold text-text-primary text-lg">
              {result.price.toLocaleString()}원
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-text-secondary">체결 수량</span>
            <span className="font-mono font-bold text-text-primary text-lg">
              {result.quantity.toLocaleString()}주
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-text-secondary font-semibold">체결 금액</span>
            <span
              className={cn(
                'font-mono font-bold text-xl',
                isBuy ? 'text-lime' : 'text-magenta'
              )}
            >
              {result.amount.toLocaleString()}원
            </span>
          </div>

          <div className="flex justify-between items-center py-3">
            <span className="text-text-muted">남은 잔고</span>
            <span className="font-mono text-text-secondary">
              {result.remainingBalance.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 슬리피지 알림 */}
        <SlippageNotice
          estimatedPrice={estimatedPrice}
          actualPrice={result.price}
        />

        {/* 확인 버튼 */}
        <div className="mt-6">
          <Button
            variant={isBuy ? 'primary' : 'secondary'}
            className="w-full"
            onClick={onClose}
          >
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OrderResultModal;
