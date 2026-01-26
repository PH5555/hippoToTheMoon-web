import { useState } from 'react';
import {
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ChartDataPoint, ChartPeriod } from '../../types/stock';
import { cn } from '../../utils/cn';

type ChartType = 'area' | 'candlestick';

// 차트 표시용 데이터 (숫자 변환된)
interface ChartDisplayData {
  date: string;       // 표시용 날짜 (포맷팅됨)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PriceChartProps {
  data: ChartDataPoint[];
  isPositive: boolean;
  period: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
  isLoading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartDisplayData & { isUp?: boolean };
  }>;
  label?: string;
}

// 선 차트용 툴팁
function LineChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="card-brutal rounded-lg p-3 border-2 border-border-strong">
        <p className="text-text-secondary text-sm mb-2">{label}</p>
        <p className="font-mono font-bold text-text-primary">
          {data.close.toLocaleString()}원
        </p>
        <p className="text-text-muted text-xs mt-1">
          거래량: {data.volume.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

// 캔들스틱 차트용 툴팁
function CandlestickTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isUp = data.close >= data.open;
    return (
      <div className="card-brutal rounded-lg p-3 border-2 border-border-strong">
        <p className="text-text-secondary text-sm mb-2">{label}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span className="text-text-muted">시가</span>
          <span className="font-mono text-text-primary text-right">{data.open.toLocaleString()}</span>
          <span className="text-text-muted">고가</span>
          <span className="font-mono text-lime text-right">{data.high.toLocaleString()}</span>
          <span className="text-text-muted">저가</span>
          <span className="font-mono text-magenta text-right">{data.low.toLocaleString()}</span>
          <span className="text-text-muted">종가</span>
          <span className={cn('font-mono font-bold text-right', isUp ? 'text-lime' : 'text-magenta')}>
            {data.close.toLocaleString()}
          </span>
        </div>
        <p className="text-text-muted text-xs mt-2 pt-2 border-t border-border">
          거래량: {data.volume.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

// 기간 선택 탭
const PERIOD_OPTIONS: { value: ChartPeriod; label: string }[] = [
  { value: 'DAILY', label: '일' },
  { value: 'WEEKLY', label: '주' },
  { value: 'MONTHLY', label: '월' },
  { value: 'YEARLY', label: '년' },
];

function PeriodTabs({
  period,
  onChange,
}: {
  period: ChartPeriod;
  onChange: (period: ChartPeriod) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-bg-secondary border border-border rounded-lg p-1">
      {PERIOD_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'px-3 py-1.5 rounded text-sm font-medium transition-all',
            period === option.value
              ? 'bg-lime text-bg-primary'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// 차트 타입 토글 버튼
function ChartTypeToggle({ 
  chartType, 
  onChange 
}: { 
  chartType: ChartType; 
  onChange: (type: ChartType) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-bg-secondary border border-border rounded-lg p-1">
      <button
        onClick={() => onChange('area')}
        className={cn(
          'px-3 py-1.5 rounded text-sm font-medium transition-all',
          chartType === 'area'
            ? 'bg-lime text-bg-primary'
            : 'text-text-secondary hover:text-text-primary'
        )}
      >
        선
      </button>
      <button
        onClick={() => onChange('candlestick')}
        className={cn(
          'px-3 py-1.5 rounded text-sm font-medium transition-all',
          chartType === 'candlestick'
            ? 'bg-lime text-bg-primary'
            : 'text-text-secondary hover:text-text-primary'
        )}
      >
        봉
      </button>
    </div>
  );
}

// 캔들스틱 커스텀 Shape
interface CandlestickShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ChartDisplayData & { isUp?: boolean };
  low?: number;
  high?: number;
  openY?: number;
  closeY?: number;
  lowY?: number;
  highY?: number;
}

function CandlestickShape(props: CandlestickShapeProps) {
  const { x, width, payload, openY, closeY, lowY, highY } = props;
  
  if (x === undefined || width === undefined || !payload || 
      openY === undefined || closeY === undefined || 
      lowY === undefined || highY === undefined) {
    return null;
  }

  const isUp = payload.close >= payload.open;
  const color = isUp ? '#c8ff00' : '#ff0080';
  
  // 몸통의 상단과 하단
  const bodyTop = Math.min(openY, closeY);
  const bodyBottom = Math.max(openY, closeY);
  const bodyHeight = Math.max(bodyBottom - bodyTop, 1); // 최소 1px
  
  // 캔들 너비 (막대 너비의 80%)
  const candleWidth = Math.max(width * 0.8, 4);
  const candleX = x + (width - candleWidth) / 2;
  
  // 심지 위치 (캔들 중앙)
  const wickX = x + width / 2;

  return (
    <g>
      {/* 상단 심지 (고가 ~ 몸통 상단) */}
      <line
        x1={wickX}
        y1={highY}
        x2={wickX}
        y2={bodyTop}
        stroke={color}
        strokeWidth={1.5}
      />
      {/* 하단 심지 (몸통 하단 ~ 저가) */}
      <line
        x1={wickX}
        y1={bodyBottom}
        x2={wickX}
        y2={lowY}
        stroke={color}
        strokeWidth={1.5}
      />
      {/* 몸통 */}
      <rect
        x={candleX}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        fill={isUp ? color : color}
        fillOpacity={isUp ? 0.9 : 0.9}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
}

// 날짜 포맷 함수 (YYYYMMDD -> 표시용)
function formatDate(dateStr: string, period: ChartPeriod): string {
  if (dateStr.length !== 8) return dateStr;
  
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  
  switch (period) {
    case 'DAILY':
      return `${month}/${day}`;
    case 'WEEKLY':
      return `${month}/${day}`;
    case 'MONTHLY':
      return `${dateStr.substring(0, 4)}/${month}`;
    case 'YEARLY':
      return dateStr.substring(0, 4);
    default:
      return `${month}/${day}`;
  }
}

// API 응답 데이터를 차트 표시용 데이터로 변환 (최신 날짜가 오른쪽에 오도록 역순 정렬)
function transformChartData(data: ChartDataPoint[], period: ChartPeriod): ChartDisplayData[] {
  return [...data].reverse().map((item) => ({
    date: formatDate(item.date, period),
    open: Number(item.open),
    high: Number(item.high),
    low: Number(item.low),
    close: Number(item.close),
    volume: Number(item.volume),
  }));
}

export function PriceChart({ data, isPositive, period, onPeriodChange, isLoading }: PriceChartProps) {
  const [chartType, setChartType] = useState<ChartType>('area');
  
  const gradientColor = isPositive ? '#c8ff00' : '#ff0080';
  const strokeColor = isPositive ? '#c8ff00' : '#ff0080';

  // 데이터 변환
  const displayData = transformChartData(data, period);

  // 가격 범위 계산 (OHLC 전체 고려)
  const allPrices = displayData.flatMap((d) => [d.open, d.high, d.low, d.close]);
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;
  const priceRange = maxPrice - minPrice || 1;
  const yDomain = [
    Math.floor(minPrice - priceRange * 0.1),
    Math.ceil(maxPrice + priceRange * 0.1),
  ];

  // 캔들스틱용 데이터 가공
  const candleData = displayData.map((item) => ({
    ...item,
    isUp: item.close >= item.open,
    // Bar 컴포넌트용 범위값 (low ~ high)
    range: [item.low, item.high] as [number, number],
  }));

  return (
    <div className="w-full">
      {/* 컨트롤 영역 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <PeriodTabs period={period} onChange={onPeriodChange} />
        <ChartTypeToggle chartType={chartType} onChange={setChartType} />
      </div>

      {/* 차트 영역 */}
      <div className="w-full h-[300px] sm:h-[400px] relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/50 z-10">
            <span className="text-4xl animate-bounce">🦛</span>
          </div>
        )}
        
        {displayData.length === 0 && !isLoading ? (
          <div className="flex items-center justify-center h-full text-text-muted">
            차트 데이터가 없습니다.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={1}>
            {chartType === 'area' ? (
              <AreaChart
                data={displayData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333333"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#666666"
                  tick={{ fill: '#a0a0a0', fontSize: 12 }}
                  tickLine={{ stroke: '#444444' }}
                  axisLine={{ stroke: '#444444' }}
                  interval="preserveStartEnd"
                  minTickGap={50}
                />
                <YAxis
                  domain={yDomain}
                  stroke="#666666"
                  tick={{ fill: '#a0a0a0', fontSize: 12 }}
                  tickLine={{ stroke: '#444444' }}
                  axisLine={{ stroke: '#444444' }}
                  tickFormatter={(value) => value.toLocaleString()}
                  width={70}
                />
                <Tooltip content={<LineChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={strokeColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                  animationDuration={1000}
                />
              </AreaChart>
            ) : (
              <ComposedChart
                data={candleData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333333"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#666666"
                  tick={{ fill: '#a0a0a0', fontSize: 12 }}
                  tickLine={{ stroke: '#444444' }}
                  axisLine={{ stroke: '#444444' }}
                  interval="preserveStartEnd"
                  minTickGap={50}
                />
                <YAxis
                  domain={yDomain}
                  stroke="#666666"
                  tick={{ fill: '#a0a0a0', fontSize: 12 }}
                  tickLine={{ stroke: '#444444' }}
                  axisLine={{ stroke: '#444444' }}
                  tickFormatter={(value) => value.toLocaleString()}
                  width={70}
                />
                <Tooltip content={<CandlestickTooltip />} />
                <Bar
                  dataKey="range"
                  shape={(props: unknown) => {
                    const barProps = props as {
                      x?: number;
                      y?: number;
                      width?: number;
                      height?: number;
                      payload?: ChartDisplayData & { isUp?: boolean };
                      background?: { height: number };
                    };
                    const { x, width, payload, y, height, background } = barProps;
                    
                    if (!payload || x === undefined || width === undefined || 
                        y === undefined || height === undefined || !background) {
                      return null;
                    }

                    // Y축 스케일 계산
                    const chartHeight = background.height;
                    const [yMin, yMax] = yDomain;
                    const yScale = chartHeight / (yMax - yMin);
                    
                    const openY = chartHeight - (payload.open - yMin) * yScale;
                    const closeY = chartHeight - (payload.close - yMin) * yScale;
                    const highY = chartHeight - (payload.high - yMin) * yScale;
                    const lowY = chartHeight - (payload.low - yMin) * yScale;

                    return (
                      <CandlestickShape
                        x={x}
                        width={width}
                        payload={payload}
                        openY={openY}
                        closeY={closeY}
                        highY={highY}
                        lowY={lowY}
                      />
                    );
                  }}
                  animationDuration={1000}
                >
                  {candleData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isUp ? '#c8ff00' : '#ff0080'}
                    />
                  ))}
                </Bar>
              </ComposedChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default PriceChart;
