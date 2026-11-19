interface MilestoneProgressBarProps {
  approvedCount: number;
  totalCount: number;
  percent: number;
}

export function MilestoneProgressBar({
  approvedCount,
  totalCount,
  percent,
}: MilestoneProgressBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between font-mono text-xs text-[#2B2F36] tabular-nums">
        <span>
          Milestones {approvedCount}/{totalCount}
        </span>
        <span className="font-semibold">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="progress-ticks relative h-3 w-full overflow-hidden rounded-[4px] border-2 border-[#2B2F36] bg-[#FFFFFF]"
      >
        <div
          className="h-full bg-[#FF6B1A] transition-[width] duration-200"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}
