import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { TradeForm } from './TradeForm';
import { OrderConfirmModal } from './OrderConfirmModal';
import { OrderResultModal } from './OrderResultModal';
import { useTrading } from '../../hooks/useTrading';
import { useHoldings } from '../../hooks/useHoldings';
import { cn } from '../../utils/cn';
import { getKoreanMarketScheduleLabel, isKoreanMarketOpen } from '../../utils/marketSession';
import type { TradeType, TradeResult } from '../../types/trading';

interface TradePanelProps {
  stockCode: string;
  stockName: string;
  currentPrice: number;
  isAuthenticated: boolean;
  onTradeSuccess?: (result: TradeResult) => void;
}

const INITIAL_BALANCE = 5_000_000;

export function TradePanel({
  stockCode,
  stockName,
  currentPrice,
  isAuthenticated,
  onTradeSuccess,
}: TradePanelProps) {
  const location = useLocation();
  const [tradeType, setTradeType] = useState<TradeType>('BUY');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [pendingQuantity, setPendingQuantity] = useState(0);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [currentTimestamp, setCurrentTimestamp] = useState(() => Date.now());
  const [successResult, setSuccessResult] = useState<TradeResult | null>(null);

  const { buy, sell, isLoading, error } = useTrading();
  const { getHoldingByStockCode } = useHoldings(isAuthenticated);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 30_000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  const holding = getHoldingByStockCode(stockCode);
  const holdingQuantity = holding?.quantity ?? 0;
  const balance = successResult?.remainingBalance ?? INITIAL_BALANCE;
  const isBuyBlocked = !isKoreanMarketOpen(new Date(currentTimestamp));
  const buyBlockedMessage = `\uB9E4\uC218\uB294 ${getKoreanMarketScheduleLabel()}\uC5D0\uB9CC \uAC00\uB2A5\uD569\uB2C8\uB2E4.`;

  const handleOrderRequest = useCallback((quantity: number) => {
    if (tradeType === 'BUY' && !isKoreanMarketOpen()) {
      return;
    }

    setPendingQuantity(quantity);
    setEstimatedPrice(currentPrice);
    setShowConfirmModal(true);
  }, [tradeType, currentPrice]);

  const handleConfirm = useCallback(async () => {
    if (tradeType === 'BUY' && !isKoreanMarketOpen()) {
      setShowConfirmModal(false);
      return;
    }

    const tradeFn = tradeType === 'BUY' ? buy : sell;
    const result = await tradeFn({ stockCode, quantity: pendingQuantity });

    if (result) {
      setSuccessResult(result);
      setShowConfirmModal(false);
      setShowResultModal(true);
      onTradeSuccess?.(result);
    }
  }, [tradeType, buy, sell, stockCode, pendingQuantity, onTradeSuccess]);

  const handleCloseResultModal = useCallback(() => {
    setShowResultModal(false);
  }, []);

  const handleCancelModal = useCallback(() => {
    if (!isLoading) {
      setShowConfirmModal(false);
    }
  }, [isLoading]);

  if (!isAuthenticated) {
    return (
      <div className="card-brutal rounded-lg p-6">
        <h3 className="font-display text-xl text-text-primary mb-4">💰 주식 거래</h3>
        <div className="text-center py-8">
          <span className="text-5xl mb-4 block">🔒</span>
          <p className="text-text-secondary mb-2">로그인 후 거래할 수 있습니다.</p>
          <p className="text-text-muted text-sm mb-6">모의 투자로 500만원의 가상 자산을 받아보세요!</p>
          <Link to={`/login?redirect=${encodeURIComponent(location.pathname)}`}>
            <Button variant="primary">로그인하기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card-brutal rounded-lg p-6">
        <h3 className="font-display text-xl text-text-primary mb-4">💰 주식 거래</h3>

        <div className="flex mb-6 border-2 border-border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setTradeType('BUY')}
            className={cn(
              'flex-1 py-3 font-semibold text-base transition-all',
              tradeType === 'BUY'
                ? 'bg-lime text-bg-primary'
                : 'bg-bg-secondary text-text-muted hover:text-lime'
            )}
          >
            매수
          </button>
          <button
            type="button"
            onClick={() => setTradeType('SELL')}
            className={cn(
              'flex-1 py-3 font-semibold text-base transition-all',
              tradeType === 'SELL'
                ? 'bg-magenta text-white'
                : 'bg-bg-secondary text-text-muted hover:text-magenta'
            )}
          >
            매도
          </button>
        </div>

        {tradeType === 'SELL' && holding && (
          <div className="mb-4 p-3 bg-bg-primary border border-border rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-text-muted text-sm">보유 수량</span>
              <span className="font-mono text-text-primary font-semibold">
                {holdingQuantity.toLocaleString()}주
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted text-sm">평균 매수가</span>
              <span className="font-mono text-text-secondary">
                {holding.averagePrice.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-text-muted text-sm">평가 손익</span>
              <span
                className={cn(
                  'font-mono font-semibold',
                  holding.profitLoss >= 0 ? 'text-lime' : 'text-magenta'
                )}
              >
                {holding.profitLoss >= 0 ? '+' : ''}
                {holding.profitLoss.toLocaleString()}
                원 ({holding.profitLossRate}%)
              </span>
            </div>
          </div>
        )}

        <TradeForm
          tradeType={tradeType}
          currentPrice={currentPrice}
          balance={balance}
          holdingQuantity={holdingQuantity}
          isLoading={isLoading}
          error={error}
          submitBlocked={tradeType === 'BUY' && isBuyBlocked}
          submitBlockedReason={tradeType === 'BUY' && isBuyBlocked ? buyBlockedMessage : null}
          onSubmit={handleOrderRequest}
        />
      </div>

      <OrderConfirmModal
        isOpen={showConfirmModal}
        tradeType={tradeType}
        stockName={stockName}
        stockCode={stockCode}
        quantity={pendingQuantity}
        price={currentPrice}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onCancel={handleCancelModal}
      />

      <OrderResultModal
        isOpen={showResultModal}
        result={successResult}
        estimatedPrice={estimatedPrice}
        onClose={handleCloseResultModal}
      />
    </>
  );
}

export default TradePanel;
