import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  type BountyItem,
  computeMilestoneProgress,
  formatDeadlineDate,
  formatTokenAmount,
  truncateAddress,
} from '../lib/bountyLogic';
import { MilestoneProgressBar } from './MilestoneProgressBar';
import { StatusChip } from './StatusChip';

interface BountyCardProps {
  bounty: BountyItem;
}

export function BountyCard({ bounty }: BountyCardProps) {
  const progress = computeMilestoneProgress(bounty.milestones);
  const bountyCode = `BOUNTY-${bounty.id.toString().padStart(3, '0')}`;

  return (
    <article className="blueprint-card flex flex-col justify-between overflow-hidden">
      <div>
        <div className="flex items-center justify-between gap-3 border-b-2 border-[#2B2F36] bg-[#E7E5E0] px-4 py-2.5">
          <span className="font-mono text-xs font-bold tracking-wide text-[#2B2F36]">
            {bountyCode}
          </span>
          <StatusChip status={bounty.status} />
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div>
            <h3 className="text-lg font-bold leading-snug text-[#2B2F36]">
              {bounty.title}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-sm text-[#2B2F36]/75">
              {bounty.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 border-y-2 border-[#2B2F36]/15 py-3">
            <div>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-[#7A828C]">
                Total Escrow
              </span>
              <span className="mt-0.5 block font-mono text-base font-bold text-[#2B2F36] tabular-nums">
                {formatTokenAmount(bounty.totalAmount, bounty.tokenDecimals)} {bounty.tokenSymbol}
              </span>
            </div>
            <div>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-[#7A828C]">
                Claim Deadline
              </span>
              <span className="mt-0.5 block font-mono text-xs font-semibold text-[#2B2F36] tabular-nums">
                {formatDeadlineDate(bounty.claimDeadline)}
              </span>
            </div>
          </div>

          <MilestoneProgressBar
            approvedCount={progress.approvedCount}
            totalCount={progress.totalCount}
            percent={progress.percent}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t-2 border-[#2B2F36] bg-[#FFFFFF] px-4 py-3">
        <span className="font-mono text-xs text-[#7A828C]">
          Poster {truncateAddress(bounty.poster)}
        </span>
        <Link
          to={`/bounties/${bounty.id.toString()}`}
          className="btn-secondary px-3 py-1.5 text-xs"
        >
          Inspect
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
