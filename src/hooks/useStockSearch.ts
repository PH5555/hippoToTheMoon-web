import { useState, useCallback, useRef, useEffect } from 'react';
import { searchStocks } from '../api/stock';
import type { StockSearchItem } from '../types/stock';

const DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 1;

interface UseStockSearchReturn {
  results: StockSearchItem[];
  isLoading: boolean;
  error: string | null;
  search: (keyword: string) => void;
  clearResults: () => void;
}

/**
 * 종목 검색 커스텀 훅
 * - 300ms debounce 적용
 * - AbortController로 이전 요청 취소
 * - loading, error 상태 관리
 */
export function useStockSearch(): UseStockSearchReturn {
  const [results, setResults] = useState<StockSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const search = useCallback((keyword: string) => {
    // 이전 debounce 타이머 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 최소 입력 길이 미충족 시 결과 초기화
    if (keyword.length < MIN_SEARCH_LENGTH) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // debounce 적용
    debounceTimerRef.current = setTimeout(async () => {
      // 이전 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 새 AbortController 생성
      abortControllerRef.current = new AbortController();

      try {
        const response = await searchStocks(
          keyword,
          10,
          abortControllerRef.current.signal
        );
        setResults(response.data ?? []);
        setError(null);
      } catch (err) {
        // AbortError는 무시 (의도적인 취소)
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        // CanceledError (axios)도 무시
        if (err instanceof Error && err.name === 'CanceledError') {
          return;
        }
        console.error('검색 실패:', err);
        setError('검색 중 오류가 발생했습니다.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    clearResults,
  };
}
