import { useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import type { TradeType } from '../../types/trading';

interface OrderConfirmModalProps {
  isOpen: boolean;
  tradeType: TradeType;
  stockName: string;
  stockCode: string;
  quantity: number;
  price: number;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 주문 확인 모달
 * 실수 방지를 위해 주문 전 확인을 받습니다.
 */
export function OrderConfirmModal({
  isOpen,
  tradeType,
  stockName,
  stockCode,
  quantity,
  price,
  isLoading = false,
  onConfirm,
  onCancel,
}: OrderConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const isBuy = tradeType === 'BUY';
  const totalAmount = price * quantity;

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
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
  }, [isOpen, isLoading, onCancel]);

  // 배경 클릭으로 모달 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onCancel();
    }
  };

  if (!isOpen) return null;

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
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{isBuy ? '📈' : '📉'}</span>
          <h2 className={cn(
            'font-display text-2xl',
            isBuy ? 'text-lime' : 'text-magenta'
          )}>
            {isBuy ? '매수' : '매도'} 주문 확인
          </h2>
        </div>

        {/* Order Details */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-text-secondary">종목</span>
            <div className="text-right">
              <span className="font-semibold text-text-primary">{stockName}</span>
              <span className="ml-2 text-text-muted font-mono text-sm">{stockCode}</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-text-secondary">주문 수량</span>
            <span className="font-mono font-bold text-text-primary text-lg">
              {quantity.toLocaleString()}주
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-text-secondary">예상 체결가</span>
            <span className="font-mono text-text-primary">
              {price.toLocaleString()}원
            </span>
          </div>

          <div className="flex justify-between items-center py-3">
            <span className="text-text-secondary font-semibold">총 주문금액</span>
            <span className={cn(
              'font-mono font-bold text-xl',
              isBuy ? 'text-lime' : 'text-magenta'
            )}>
              {totalAmount.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* Confirmation Message */}
        <p className="text-center text-text-secondary mb-6">
          위 내용으로 <span className={cn('font-bold', isBuy ? 'text-lime' : 'text-magenta')}>
            {isBuy ? '매수' : '매도'}
          </span> 주문하시겠습니까?
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            variant={isBuy ? 'primary' : 'secondary'}
            className="flex-1"
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isBuy ? '매수' : '매도'} 확인
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmModal;
