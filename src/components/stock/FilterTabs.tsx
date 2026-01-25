import type { RankingFilter } from '../../types/stock';
import { cn } from '../../utils/cn';

interface FilterTabsProps {
  activeFilter: RankingFilter;
  onFilterChange: (filter: RankingFilter) => void;
}

const filters: { value: RankingFilter; label: string }[] = [
  { value: 'VOLUME', label: '거래량순' },
  { value: 'RISING', label: '급상승' },
  { value: 'FALLING', label: '급하락' },
];

export function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;
        return (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              'px-5 py-2.5 font-semibold text-sm rounded-none transition-all duration-200',
              'border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary',
              isActive
                ? 'bg-lime text-bg-primary border-lime shadow-[4px_4px_0_0_rgba(200,255,0,0.3)] focus:ring-lime'
                : 'bg-transparent text-text-secondary border-border-strong hover:border-lime hover:text-lime'
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

export default FilterTabs;
