import { cn } from '@/lib/utils';
import { memo } from 'react';

interface DirectionIndicatorProps {
  onToggle: () => void;
  directionLabel: string;
  detectionStatus: string;
  warning?: string;
  toggleTitle: string;
  ariaLabel?: string;
  className?: string;
}

export const DirectionIndicator = memo(function DirectionIndicator({
  onToggle,
  directionLabel,
  detectionStatus,
  warning,
  toggleTitle,
  ariaLabel,
  className,
}: DirectionIndicatorProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center md:items-start justify-center md:pt-0 gap-3 text-center',
        className
      )}
    >
      <button
        onClick={onToggle}
        className="p-1 rounded-full text-gray-600 dark:text-gray-200 hover:bg-primary hover:text-white transition-colors bg-white dark:bg-zinc-700"
        title={toggleTitle}
        aria-label={ariaLabel || toggleTitle}
        type="button"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      </button>
    </div>
  );
});
