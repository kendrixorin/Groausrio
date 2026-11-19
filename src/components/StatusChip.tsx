import type { BountyStatus, MilestoneStatus } from '../lib/bountyLogic';

interface StatusChipProps {
  status: BountyStatus | MilestoneStatus;
}

export function StatusChip({ status }: StatusChipProps) {
  let style = 'bg-[#FFFFFF] text-[#2B2F36]';

  if (status === 'Open' || status === 'Approved') {
    style = 'bg-[#FF6B1A] text-[#2B2F36]';
  } else if (status === 'Completed') {
    style = 'bg-[#2B2F36] text-[#FFFFFF]';
  } else if (status === 'Reclaimed' || status === 'Rejected') {
    style = 'bg-[#7A828C] text-[#FFFFFF]';
  }

  return (
    <span
      className={`inline-flex items-center rounded-[4px] border-2 border-[#2B2F36] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 ${style}`}
    >
      {status}
    </span>
  );
}
