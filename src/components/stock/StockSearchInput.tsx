import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStockSearch } from '../../hooks/useStockSearch';
import type { StockSearchItem } from '../../types/stock';

export function StockSearchInput() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const { results, isLoading, search, clearResults } = useStockSearch();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 결과가 업데이트되면 드롭다운 열기
  useEffect(() => {
    if (results.length > 0 && inputValue.length > 0) {
      setIsOpen(true);
    }
  }, [results, inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSelectedIndex(-1);
    
    if (value.length > 0) {
      search(value);
    } else {
      clearResults();
      setIsOpen(false);
    }
  };

  const handleSelect = useCallback((stock: StockSearchItem) => {
    setInputValue('');
    setIsOpen(false);
    setSelectedIndex(-1);
    clearResults();
    navigate(`/stock/${stock.stockCode}?name=${encodeURIComponent(stock.stockName)}`);
  }, [navigate, clearResults]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    if (results.length > 0 && inputValue.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* 검색 입력 필드 */}
      <div className="card-brutal rounded-lg overflow-hidden">
        <div className="flex items-center px-4 py-3 gap-3">
          {/* 검색 아이콘 */}
          <svg
            className="w-5 h-5 text-text-secondary flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          
          {/* 입력 필드 */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder="종목명 또는 종목코드 검색"
            className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted outline-none text-base"
            autoComplete="off"
          />
          
          {/* 로딩 스피너 */}
          {isLoading && (
            <div className="w-5 h-5 border-2 border-lime border-t-transparent rounded-full animate-spin" />
          )}
          
          {/* 입력 지우기 버튼 */}
          {inputValue && !isLoading && (
            <button
              onClick={() => {
                setInputValue('');
                clearResults();
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="text-text-muted hover:text-text-secondary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 자동완성 드롭다운 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <div className="card-brutal rounded-lg overflow-hidden max-h-80 overflow-y-auto">
            {results.length > 0 ? (
              <ul className="py-1">
                {results.map((stock, index) => (
                  <li key={stock.stockCode}>
                    <button
                      onClick={() => handleSelect(stock)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
                        selectedIndex === index
                          ? 'bg-lime/10'
                          : 'hover:bg-bg-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* 종목명 */}
                        <span className="text-text-primary font-medium truncate">
                          {stock.stockName}
                        </span>
                        {/* 종목코드 */}
                        <span className="font-mono text-sm text-text-secondary">
                          {stock.stockCode}
                        </span>
                      </div>
                      
                      {/* 시장 배지 */}
                      <span
                        className={`flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded ${
                          stock.market === 'KOSPI'
                            ? 'bg-lime/20 text-lime'
                            : 'bg-magenta/20 text-magenta'
                        }`}
                      >
                        {stock.market}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : inputValue.length > 0 && !isLoading ? (
              <div className="px-4 py-6 text-center text-text-secondary">
                검색 결과가 없습니다
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
