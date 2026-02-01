import { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { TradeForm } from './TradeForm';
import { OrderConfirmModal } from './OrderConfirmModal';
import { OrderResultModal } from './OrderResultModal';
import { useTrading } from '../../hooks/useTrading';
import { useHoldings } from '../../hooks/useHoldings';
import { cn } from '../../utils/cn';
import type { TradeType, TradeResult } from '../../types/trading';

interface TradePanelProps {
  stockCode: string;
  stockName: string;
  currentPrice: number;
  isAuthenticated: boolean;
  onTradeSuccess?: (result: TradeResult) => void;
}

// 임시 잔고 (실제로는 사용자 API에서 가져와야 함)
const INITIAL_BALANCE = 5_000_000;

/**
 * 거래 패널 컴포넌트
 * - 매수/매도 탭 전환
 * - 로그인 여부에 따른 UI 분기
 * - 주문 확인 모달 통합
 */
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
  const [successResult, setSuccessResult] = useState<TradeResult | null>(null);

  const { buy, sell, isLoading, error } = useTrading();
  const { holdings, getHoldingByStockCode } = useHoldings(isAuthenticated);

  // 해당 종목 보유 정보
  const holding = getHoldingByStockCode(stockCode);
  const holdingQuantity = holding?.quantity ?? 0;

  // 잔고 (마지막 거래 결과가 있으면 그 값 사용, 없으면 초기값)
  const balance = successResult?.remainingBalance ?? INITIAL_BALANCE;

  // 주문 요청 핸들러 (모달 열기)
  const handleOrderRequest = useCallback((quantity: number) => {
    setPendingQuantity(quantity);
    setEstimatedPrice(currentPrice); // 슬리피지 계산용 예상가 저장
    setShowConfirmModal(true);
  }, [currentPrice]);

  // 주문 확인 핸들러
  const handleConfirm = useCallback(async () => {
    const tradeFn = tradeType === 'BUY' ? buy : sell;
    const result = await tradeFn({ stockCode, quantity: pendingQuantity });

    if (result) {
      setSuccessResult(result);
      setShowConfirmModal(false);
      setShowResultModal(true); // 결과 모달 표시
      onTradeSuccess?.(result);
    }
  }, [tradeType, buy, sell, stockCode, pendingQuantity, onTradeSuccess]);

  // 결과 모달 닫기 핸들러
  const handleCloseResultModal = useCallback(() => {
    setShowResultModal(false);
  }, []);

  // 모달 닫기
  const handleCancelModal = useCallback(() => {
    if (!isLoading) {
      setShowConfirmModal(false);
    }
  }, [isLoading]);

  // 비로그인 상태 UI
  if (!isAuthenticated) {
    return (
      <div className="card-brutal rounded-lg p-6">
        <h3 className="font-display text-xl text-text-primary mb-4">
          💰 주식 거래
        </h3>
        <div className="text-center py-8">
          <span className="text-5xl mb-4 block">🔒</span>
          <p className="text-text-secondary mb-2">
            로그인 후 거래할 수 있습니다.
          </p>
          <p className="text-text-muted text-sm mb-6">
            모의 투자로 500만원의 가상 자산을 받아보세요!
          </p>
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
        <h3 className="font-display text-xl text-text-primary mb-4">
          💰 주식 거래
        </h3>

        {/* 매수/매도 탭 */}
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

        {/* 보유 정보 (매도 시) */}
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
              <span className={cn(
                'font-mono font-semibold',
                holding.profitLoss >= 0 ? 'text-lime' : 'text-magenta'
              )}>
                {holding.profitLoss >= 0 ? '+' : ''}{holding.profitLoss.toLocaleString()}원
                ({holding.profitLossRate}%)
              </span>
            </div>
          </div>
        )}

        {/* 거래 폼 */}
        <TradeForm
          tradeType={tradeType}
          stockCode={stockCode}
          stockName={stockName}
          currentPrice={currentPrice}
          balance={balance}
          holdingQuantity={holdingQuantity}
          isLoading={isLoading}
          error={error}
          onSubmit={handleOrderRequest}
        />
      </div>

      {/* 주문 확인 모달 */}
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

      {/* 거래 결과 모달 */}
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
