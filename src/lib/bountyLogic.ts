import { formatUnits, parseUnits } from 'viem';

export type BountyStatus = 'Open' | 'In Progress' | 'Completed' | 'Reclaimed';
export type MilestoneStatus = 'Pending' | 'Submitted' | 'Approved' | 'Rejected';

export interface MilestoneItem {
  index: number;
  title: string;
  amount: bigint;
  status: MilestoneStatus;
  proof: string;
  rejectionReason: string;
}

export interface BountyItem {
  id: bigint;
  poster: `0x${string}`;
  worker: `0x${string}`;
  token: `0x${string}`;
  tokenSymbol: string;
  tokenDecimals: number;
  totalAmount: bigint;
  releasedAmount: bigint;
  claimDeadline: number;
  status: BountyStatus;
  title: string;
  description: string;
  createdAt: number;
  milestones: MilestoneItem[];
}

export interface PlatformStats {
  totalBounties: number;
  activeBounties: number;
  completedBounties: number;
  completedMilestones: number;
}

export interface MilestoneDraft {
  id: string;
  title: string;
  amount: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  totalAmount: bigint;
  parsedAmounts: bigint[];
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function mapBountyStatusCode(code: number, hasWorker: boolean): BountyStatus {
  if (code === 2) return 'Completed';
  if (code === 3) return 'Reclaimed';
  if (code === 1 || hasWorker) return 'In Progress';
  return 'Open';
}

export function mapMilestoneStatusCode(code: number): MilestoneStatus {
  if (code === 1) return 'Submitted';
  if (code === 2) return 'Approved';
  if (code === 3) return 'Rejected';
  return 'Pending';
}

export function parseTokenAmountSafe(raw: string, decimals: number): bigint | null {
  const trimmed = raw.trim();
  if (!trimmed || !/^\d+(\.\d+)?$/.test(trimmed)) {
    return null;
  }
  const parts = trimmed.split('.');
  if (parts[1] && parts[1].length > decimals) {
    return null;
  }
  try {
    const val = parseUnits(trimmed, decimals);
    return val > 0n ? val : null;
  } catch {
    return null;
  }
}

export function formatTokenAmount(amount: bigint, decimals: number, maxFractionDigits = 2): string {
  const formatted = formatUnits(amount, decimals);
  const [whole, frac = ''] = formatted.split('.');
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (!frac || maxFractionDigits === 0) {
    return withCommas;
  }
  const sliced = frac.slice(0, maxFractionDigits).replace(/0+$/, '');
  return sliced ? `${withCommas}.${sliced}` : withCommas;
}

export function sumMilestoneAmounts(
  milestones: Pick<MilestoneDraft, 'amount'>[],
  decimals: number,
): bigint {
  return milestones.reduce((acc, item) => {
    const parsed = parseTokenAmountSafe(item.amount, decimals);
    return parsed ? acc + parsed : acc;
  }, 0n);
}

export function validateBountyForm(params: {
  title: string;
  description: string;
  deadlineIso: string;
  milestones: MilestoneDraft[];
  decimals: number;
  nowSeconds?: number;
}): ValidationResult {
  const errors: string[] = [];
  const nowSec = params.nowSeconds ?? Math.floor(Date.now() / 1000);

  if (params.title.trim().length < 4) {
    errors.push('Bounty title must be at least 4 characters.');
  }
  if (params.description.trim().length < 12) {
    errors.push('Specification must be at least 12 characters.');
  }

  const deadlineMs = Date.parse(params.deadlineIso);
  if (!params.deadlineIso || Number.isNaN(deadlineMs)) {
    errors.push('Select a valid claim deadline.');
  } else if (Math.floor(deadlineMs / 1000) <= nowSec + 300) {
    errors.push('Claim deadline must be at least 5 minutes in the future.');
  }

  if (params.milestones.length === 0) {
    errors.push('Add at least one milestone.');
  }

  const parsedAmounts: bigint[] = [];
  let totalAmount = 0n;

  params.milestones.forEach((m, index) => {
    if (!m.title.trim()) {
      errors.push(`Milestone ${index + 1} needs a deliverable title.`);
    }
    const parsed = parseTokenAmountSafe(m.amount, params.decimals);
    if (!parsed) {
      errors.push(`Milestone ${index + 1} needs a valid positive reward amount.`);
    } else {
      parsedAmounts.push(parsed);
      totalAmount += parsed;
    }
  });

  if (totalAmount <= 0n && errors.length === 0) {
    errors.push('Total bounty reward must be greater than zero.');
  }

  return {
    valid: errors.length === 0,
    errors,
    totalAmount,
    parsedAmounts,
  };
}

export function needsTokenApproval(allowance: bigint | undefined, requiredAmount: bigint): boolean {
  if (requiredAmount <= 0n) return false;
  if (allowance === undefined) return true;
  return allowance < requiredAmount;
}

export function computeMilestoneProgress(milestones: Pick<MilestoneItem, 'status'>[]): {
  approvedCount: number;
  totalCount: number;
  percent: number;
} {
  const totalCount = milestones.length;
  if (totalCount === 0) {
    return { approvedCount: 0, totalCount: 0, percent: 0 };
  }
  const approvedCount = milestones.filter((m) => m.status === 'Approved').length;
  const percent = Math.round((approvedCount / totalCount) * 100);
  return { approvedCount, totalCount, percent };
}

export function canClaimBounty(
  bounty: Pick<BountyItem, 'poster' | 'worker' | 'status' | 'claimDeadline'>,
  connectedAddress: string | undefined,
  nowSeconds: number,
): boolean {
  if (!connectedAddress) return false;
  const hasWorker = bounty.worker.toLowerCase() !== ZERO_ADDRESS;
  if (hasWorker || bounty.status !== 'Open') return false;
  if (bounty.poster.toLowerCase() === connectedAddress.toLowerCase()) return false;
  return nowSeconds <= bounty.claimDeadline;
}

export function canReclaimBounty(
  bounty: Pick<BountyItem, 'poster' | 'worker' | 'status' | 'claimDeadline' | 'totalAmount' | 'releasedAmount'>,
  connectedAddress: string | undefined,
  nowSeconds: number,
): boolean {
  if (!connectedAddress) return false;
  if (bounty.poster.toLowerCase() !== connectedAddress.toLowerCase()) return false;
  const hasWorker = bounty.worker.toLowerCase() !== ZERO_ADDRESS;
  if (hasWorker || bounty.status !== 'Open') return false;
  if (bounty.totalAmount <= bounty.releasedAmount) return false;
  return nowSeconds > bounty.claimDeadline;
}

export function filterBounties(
  bounties: BountyItem[],
  query: string,
  statusFilter: 'All' | BountyStatus,
  tokenFilter: 'All' | 'USDC' | 'EURC',
): BountyItem[] {
  const q = query.trim().toLowerCase();
  return bounties.filter((item) => {
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (tokenFilter !== 'All' && item.tokenSymbol !== tokenFilter) return false;
    if (!q) return true;
    const idText = `bounty-${item.id.toString().padStart(3, '0')}`;
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.poster.toLowerCase().includes(q) ||
      idText.includes(q)
    );
  });
}

export function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDeadlineDate(timestampSeconds: number): string {
  if (!timestampSeconds) return 'Not set';
  const d = new Date(timestampSeconds * 1000);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getExplorerTxUrl(explorerBase: string, txHash: string): string {
  return `${explorerBase.replace(/\/$/, '')}/tx/${txHash}`;
}

export function getExplorerAddressUrl(explorerBase: string, address: string): string {
  return `${explorerBase.replace(/\/$/, '')}/address/${address}`;
}
