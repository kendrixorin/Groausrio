import type { Abi, AbiFunction } from 'viem';
import { ARC_EXPLORER_URL } from '../config/network';

export const ERC20_ABI = [
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    type: 'function',
    name: 'name',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

export const GROAUSRIO_FALLBACK_ABI = [
  {
    type: 'function',
    name: 'createBounty',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'token', type: 'address' },
      { name: 'claimDeadline', type: 'uint256' },
      { name: 'milestoneTitles', type: 'string[]' },
      { name: 'milestoneAmounts', type: 'uint256[]' },
    ],
    outputs: [{ name: 'bountyId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'claimBounty',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'bountyId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'submitProof',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'bountyId', type: 'uint256' },
      { name: 'milestoneIndex', type: 'uint256' },
      { name: 'proof', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'approveMilestone',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'bountyId', type: 'uint256' },
      { name: 'milestoneIndex', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'rejectMilestone',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'bountyId', type: 'uint256' },
      { name: 'milestoneIndex', type: 'uint256' },
      { name: 'reason', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'reclaimFunds',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'bountyId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getBounty',
    stateMutability: 'view',
    inputs: [{ name: 'bountyId', type: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'poster', type: 'address' },
      { name: 'worker', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'totalAmount', type: 'uint256' },
      { name: 'releasedAmount', type: 'uint256' },
      { name: 'claimDeadline', type: 'uint256' },
      { name: 'status', type: 'uint8' },
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'createdAt', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'getMilestones',
    stateMutability: 'view',
    inputs: [{ name: 'bountyId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'title', type: 'string' },
          { name: 'amount', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'proof', type: 'string' },
          { name: 'rejectionReason', type: 'string' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getBountiesByPoster',
    stateMutability: 'view',
    inputs: [{ name: 'poster', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    type: 'function',
    name: 'getBountiesByWorker',
    stateMutability: 'view',
    inputs: [{ name: 'worker', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    type: 'function',
    name: 'getPlatformStats',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'totalBounties', type: 'uint256' },
      { name: 'activeBounties', type: 'uint256' },
      { name: 'completedBounties', type: 'uint256' },
      { name: 'completedMilestones', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'bountyCount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export interface AbiFetchResult {
  abi: Abi;
  source: 'explorer' | 'fallback';
}

export async function fetchDeployedAbi(contractAddress: `0x${string}`): Promise<AbiFetchResult> {
  try {
    const endpoint = `${ARC_EXPLORER_URL}/api?module=contract&action=getabi&address=${contractAddress}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      return { abi: GROAUSRIO_FALLBACK_ABI as unknown as Abi, source: 'fallback' };
    }
    const payload = (await response.json()) as { status?: string; result?: string };
    if (payload.status === '1' && typeof payload.result === 'string') {
      const parsed = JSON.parse(payload.result) as Abi;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { abi: parsed, source: 'explorer' };
      }
    }
  } catch {
    // Explorer unavailable or contract unverified; keep fallback typed ABI
  }
  return { abi: GROAUSRIO_FALLBACK_ABI as unknown as Abi, source: 'fallback' };
}

export function resolveAbiFunctionName(abi: Abi, candidates: string[]): string | null {
  const fnNames = new Set(
    abi
      .filter((item): item is AbiFunction => item.type === 'function' && typeof item.name === 'string')
      .map((item) => item.name),
  );
  for (const candidate of candidates) {
    if (fnNames.has(candidate)) {
      return candidate;
    }
  }
  return null;
}

export function findAbiFunction(abi: Abi, candidates: string[]): AbiFunction | null {
  const fns = abi.filter(
    (item): item is AbiFunction => item.type === 'function' && typeof item.name === 'string',
  );
  for (const candidate of candidates) {
    const match = fns.find((fn) => fn.name === candidate);
    if (match) return match;
  }
  return null;
}
