import React from 'react';

interface ChartDatum {
  label: string;
  value: number;
  frontColor?: string;
}

interface CrimeBarChartProps {
  data: ChartDatum[];
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  onFindOutMore?: () => void;
}

export function CrimeBarChart({
  data,
  isLoading = false,
  title = 'Crime Rate In Your Area',
  subtitle,
  emptyMessage = 'No crime statistics available',
  onFindOutMore,
}: CrimeBarChartProps) {
  // Find max value for scaling
  const maxValue = data.reduce((max, item) => Math.max(max, item.value), 0);
  const paddedMaxValue = Math.max(1, Math.ceil(maxValue * 1.12));

  // Format label for display (keep hyphenated words intact)
  const formatLabel = (text: string): string => {
    return text.replace(/-/g, '\u2011'); // Non-breaking hyphen
  };

  return (
    <div className="bg-brand-inputBackground rounded-2xl p-6 relative">
      {/* Header */}
      <div className="flex justify-end mb-2">
        {onFindOutMore && (
          <button
            onClick={onFindOutMore}
            className="text-brand-primary underline text-sm font-semibold hover:text-brand-secondary transition-colors"
          >
            Find out more
          </button>
        )}
      </div>

      {/* Subtitle (month) */}
      {subtitle && (
        <p className="text-center text-brand-textGrey text-sm mb-4">{subtitle}</p>
      )}

      {/* Chart content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      ) : data.length > 0 ? (
        <div className="h-48 flex items-end justify-center gap-3 px-2">
          {data.map((item, index) => {
            const barHeight = (item.value / paddedMaxValue) * 100;
            return (
              <div
                key={index}
                className="flex flex-col items-center flex-1 max-w-16"
              >
                {/* Value label on top */}
                <span className="text-brand-text font-semibold text-sm mb-1">
                  {item.value}
                </span>
                {/* Bar */}
                <div
                  className="w-full rounded-lg transition-all duration-500 ease-out"
                  style={{
                    height: `${Math.max(barHeight, 4)}%`,
                    backgroundColor: item.frontColor ?? '#1785d1',
                    minHeight: '8px',
                  }}
                />
                {/* Category label */}
                <span
                  className="text-brand-text text-xs mt-2 text-center leading-tight"
                  style={{
                    fontSize: '10px',
                    wordBreak: 'keep-all',
                    maxWidth: '64px',
                  }}
                >
                  {formatLabel(item.label)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-48">
          <p className="text-brand-textGrey text-sm text-center">{emptyMessage}</p>
        </div>
      )}

      {/* Title at bottom */}
      <h3 className="text-center text-2xl font-bold text-brand-text mt-4">{title}</h3>
    </div>
  );
}

export default CrimeBarChart;
