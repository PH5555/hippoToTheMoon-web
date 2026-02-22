import { useState, useCallback, useMemo } from 'react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import type { TradeType } from '../../types/trading';

interface TradeFormProps {
  tradeType: TradeType;
  currentPrice: number;
  balance: number;
  holdingQuantity: number;
  isLoading?: boolean;
  error?: string | null;
  submitBlocked?: boolean;
  submitBlockedReason?: string | null;
  onSubmit: (quantity: number) => void;
}

const QUICK_PERCENTAGES = [10, 25, 50, 100] as const;

/**
 * 거래 입력 폼
 * - 수량 입력
 * - 빠른 수량 선택 (10%, 25%, 50%, 100%)
 * - 총 주문금액 계산
 * - 주문 가능 수량 표시
 */
export function TradeForm({
  tradeType,
  currentPrice,
  balance,
  holdingQuantity,
  isLoading = false,
  error,
  submitBlocked = false,
  submitBlockedReason = null,
  onSubmit,
}: TradeFormProps) {
  const [quantity, setQuantity] = useState<number>(0);
  const isBuy = tradeType === 'BUY';

  // 주문 가능 최대 수량
  const maxQuantity = useMemo(() => {
    if (isBuy) {
      return currentPrice > 0 ? Math.floor(balance / currentPrice) : 0;
    }
    return holdingQuantity;
  }, [isBuy, balance, currentPrice, holdingQuantity]);

  // 총 주문금액
  const totalAmount = useMemo(() => {
    return currentPrice * quantity;
  }, [currentPrice, quantity]);

  // 수량 변경 핸들러
  const handleQuantityChange = useCallback((value: number) => {
    const newQuantity = Math.max(0, Math.min(value, maxQuantity));
    setQuantity(newQuantity);
  }, [maxQuantity]);

  // 빠른 수량 선택
  const handleQuickSelect = useCallback((percent: number) => {
    const newQuantity = Math.floor(maxQuantity * percent / 100);
    setQuantity(Math.max(1, newQuantity));
  }, [maxQuantity]);

  // 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitBlocked) {
      return;
    }

    if (quantity > 0 && quantity <= maxQuantity) {
      onSubmit(quantity);
    }
  };

  // 유효성 검사
  const isValid = quantity > 0 && quantity <= maxQuantity;
  const displayError = submitBlockedReason || error;
  const showInsufficientBalance = isBuy && totalAmount > balance;
  const showInsufficientHolding = !isBuy && quantity > holdingQuantity;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 수량 입력 */}
      <div>
        <label className="block text-text-secondary text-sm mb-2">
          {isBuy ? '매수' : '매도'} 수량
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              min={0}
              max={maxQuantity}
              value={quantity || ''}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
              placeholder="0"
              className={cn(
                'w-full h-12 px-4 pr-12 bg-bg-primary border-2 rounded-lg font-mono text-lg text-text-primary',
                'placeholder:text-text-muted',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-secondary',
                isBuy 
                  ? 'border-border focus:border-lime focus:ring-lime' 
                  : 'border-border focus:border-magenta focus:ring-magenta',
                (showInsufficientBalance || showInsufficientHolding) && 'border-red-500'
              )}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
              주
            </span>
          </div>
        </div>
      </div>

      {/* 빠른 수량 선택 */}
      <div className="flex gap-2">
        {QUICK_PERCENTAGES.map((percent) => (
          <button
            key={percent}
            type="button"
            onClick={() => handleQuickSelect(percent)}
            disabled={maxQuantity === 0}
            className={cn(
              'flex-1 py-2 px-3 text-sm font-semibold rounded border-2 transition-all',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isBuy
                ? 'border-lime/30 text-lime hover:bg-lime/10 hover:border-lime'
                : 'border-magenta/30 text-magenta hover:bg-magenta/10 hover:border-magenta'
            )}
          >
            {percent}%
          </button>
        ))}
      </div>

      {/* 주문 정보 */}
      <div className="space-y-3 pt-4 border-t border-border">
        {/* 현재가 */}
        <div className="flex justify-between items-center">
          <span className="text-text-muted text-sm">현재가</span>
          <span className="font-mono text-text-secondary">
            {currentPrice.toLocaleString()}원
          </span>
        </div>

        {/* 주문 가능 */}
        <div className="flex justify-between items-center">
          <span className="text-text-muted text-sm">
            {isBuy ? '주문 가능' : '보유 수량'}
          </span>
          <span className={cn(
            'font-mono',
            maxQuantity > 0 ? 'text-text-secondary' : 'text-text-muted'
          )}>
            {maxQuantity.toLocaleString()}주
          </span>
        </div>

        {isBuy && (
          <div className="flex justify-between items-center">
            <span className="text-text-muted text-sm">보유 잔고</span>
            <span className="font-mono text-text-secondary">
              {balance.toLocaleString()}원
            </span>
          </div>
        )}

        {/* 총 주문금액 */}
        <div className="flex justify-between items-center pt-3 border-t border-border">
          <span className="text-text-secondary font-semibold">총 주문금액</span>
          <span className={cn(
            'font-mono font-bold text-xl',
            isBuy ? 'text-lime' : 'text-magenta'
          )}>
            {totalAmount.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 에러 메시지 */}
      {displayError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{displayError}</p>
        </div>
      )}

      {showInsufficientBalance && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">잔고가 부족합니다.</p>
        </div>
      )}

      {showInsufficientHolding && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">보유 수량이 부족합니다.</p>
        </div>
      )}

      {/* 제출 버튼 */}
      <Button
        type="submit"
        variant={isBuy ? 'primary' : 'secondary'}
        size="lg"
        className="w-full"
        disabled={!isValid || isLoading || submitBlocked}
        isLoading={isLoading}
      >
        {isBuy ? '매수하기' : '매도하기'}
      </Button>
    </form>
  );
}

export default TradeForm;
