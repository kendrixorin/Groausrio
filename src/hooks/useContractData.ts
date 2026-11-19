import { useQuery } from '@tanstack/react-query';
import { type Abi, isAddress } from 'viem';
import { useAccount, usePublicClient, useReadContracts } from 'wagmi';
import { CONTRACT_ADDRESS, findTokenByAddress } from '../config/contracts';
import { arcChain } from '../config/network';
import {
  ERC20_ABI,
  GROAUSRIO_FALLBACK_ABI,
  fetchDeployedAbi,
  resolveAbiFunctionName,
} from '../lib/abi';
import {
  type BountyItem,
  type MilestoneItem,
  type PlatformStats,
  ZERO_ADDRESS,
  mapBountyStatusCode,
  mapMilestoneStatusCode,
} from '../lib/bountyLogic';

export function useDeployedAbi() {
  return useQuery({
    queryKey: ['deployedAbi', CONTRACT_ADDRESS],
    queryFn: async () => {
      if (!CONTRACT_ADDRESS) {
        return {
          abi: GROAUSRIO_FALLBACK_ABI as unknown as Abi,
          source: 'fallback' as const,
        };
      }
      return fetchDeployedAbi(CONTRACT_ADDRESS);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTokenMetadata(tokenAddress: `0x${string}`) {
  const { address: accountAddress } = useAccount();
  const known = findTokenByAddress(tokenAddress);

  const contracts = [
    {
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'decimals' as const,
      chainId: arcChain.id,
    },
    {
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'symbol' as const,
      chainId: arcChain.id,
    },
    ...(accountAddress
      ? [
          {
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'balanceOf' as const,
            args: [accountAddress] as const,
            chainId: arcChain.id,
          },
        ]
      : []),
    ...(accountAddress && CONTRACT_ADDRESS
      ? [
          {
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'allowance' as const,
            args: [accountAddress, CONTRACT_ADDRESS] as const,
            chainId: arcChain.id,
          },
        ]
      : []),
  ];

  const query = useReadContracts({
    contracts,
    query: {
      enabled: isAddress(tokenAddress),
      refetchInterval: 15_000,
    },
  });

  const decimalsRaw = query.data?.[0]?.result;
  const symbolRaw = query.data?.[1]?.result;
  const balanceRaw = accountAddress ? query.data?.[2]?.result : undefined;
  const allowanceRaw =
    accountAddress && CONTRACT_ADDRESS ? query.data?.[3]?.result : undefined;

  return {
    decimals: typeof decimalsRaw === 'number' ? decimalsRaw : undefined,
    symbol: typeof symbolRaw === 'string' ? symbolRaw : known?.symbol || 'TOKEN',
    balance: typeof balanceRaw === 'bigint' ? balanceRaw : undefined,
    allowance: typeof allowanceRaw === 'bigint' ? allowanceRaw : undefined,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

function parseRawBountyTuple(
  raw: unknown,
  fallbackId: bigint,
): {
  id: bigint;
  poster: `0x${string}`;
  worker: `0x${string}`;
  token: `0x${string}`;
  totalAmount: bigint;
  releasedAmount: bigint;
  claimDeadline: number;
  statusCode: number;
  title: string;
  description: string;
  createdAt: number;
} | null {
  if (!raw) return null;

  if (Array.isArray(raw)) {
    const [
      idVal,
      poster,
      worker,
      token,
      totalAmount,
      releasedAmount,
      claimDeadline,
      statusCode,
      title,
      description,
      createdAt,
    ] = raw;

    if (!poster || typeof poster !== 'string' || poster.toLowerCase() === ZERO_ADDRESS) {
      return null;
    }

    return {
      id: typeof idVal === 'bigint' ? idVal : fallbackId,
      poster: poster as `0x${string}`,
      worker: (typeof worker === 'string' ? worker : ZERO_ADDRESS) as `0x${string}`,
      token: (typeof token === 'string' ? token : ZERO_ADDRESS) as `0x${string}`,
      totalAmount: typeof totalAmount === 'bigint' ? totalAmount : 0n,
      releasedAmount: typeof releasedAmount === 'bigint' ? releasedAmount : 0n,
      claimDeadline: Number(claimDeadline ?? 0),
      statusCode: Number(statusCode ?? 0),
      title: typeof title === 'string' ? title : '',
      description: typeof description === 'string' ? description : '',
      createdAt: Number(createdAt ?? 0),
    };
  }

  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const poster = obj.poster as string | undefined;
    if (!poster || poster.toLowerCase() === ZERO_ADDRESS) {
      return null;
    }
    return {
      id: typeof obj.id === 'bigint' ? obj.id : fallbackId,
      poster: poster as `0x${string}`,
      worker: (typeof obj.worker === 'string' ? obj.worker : ZERO_ADDRESS) as `0x${string}`,
      token: (typeof obj.token === 'string' ? obj.token : ZERO_ADDRESS) as `0x${string}`,
      totalAmount: typeof obj.totalAmount === 'bigint' ? obj.totalAmount : 0n,
      releasedAmount: typeof obj.releasedAmount === 'bigint' ? obj.releasedAmount : 0n,
      claimDeadline: Number(obj.claimDeadline ?? 0),
      statusCode: Number(obj.status ?? 0),
      title: typeof obj.title === 'string' ? obj.title : '',
      description: typeof obj.description === 'string' ? obj.description : '',
      createdAt: Number(obj.createdAt ?? 0),
    };
  }

  return null;
}

function parseRawMilestones(raw: unknown): MilestoneItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, idx) => {
    if (Array.isArray(item)) {
      return {
        index: idx,
        title: String(item[0] ?? `Milestone ${idx + 1}`),
        amount: typeof item[1] === 'bigint' ? item[1] : 0n,
        status: mapMilestoneStatusCode(Number(item[2] ?? 0)),
        proof: String(item[3] ?? ''),
        rejectionReason: String(item[4] ?? ''),
      };
    }
    const obj = item as Record<string, unknown>;
    return {
      index: idx,
      title: String(obj.title ?? `Milestone ${idx + 1}`),
      amount: typeof obj.amount === 'bigint' ? obj.amount : 0n,
      status: mapMilestoneStatusCode(Number(obj.status ?? 0)),
      proof: String(obj.proof ?? ''),
      rejectionReason: String(obj.rejectionReason ?? ''),
    };
  });
}

async function readSingleBounty(
  publicClient: ReturnType<typeof usePublicClient>,
  abi: Abi,
  contractAddress: `0x${string}`,
  bountyId: bigint,
): Promise<BountyItem | null> {
  if (!publicClient) return null;

  const getBountyFn = resolveAbiFunctionName(abi, ['getBounty', 'bounties']);
  const getMilestonesFn = resolveAbiFunctionName(abi, ['getMilestones', 'getBountyMilestones']);
  if (!getBountyFn) return null;

  const rawBounty = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: getBountyFn,
    args: [bountyId],
  });

  const parsed = parseRawBountyTuple(rawBounty, bountyId);
  if (!parsed) return null;

  let milestones: MilestoneItem[] = [];
  if (getMilestonesFn) {
    try {
      const rawMilestones = await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: getMilestonesFn,
        args: [bountyId],
      });
      milestones = parseRawMilestones(rawMilestones);
    } catch {
      milestones = [];
    }
  }

  let tokenDecimals = 6;
  let tokenSymbol = findTokenByAddress(parsed.token)?.symbol || 'TOKEN';
  if (isAddress(parsed.token) && parsed.token.toLowerCase() !== ZERO_ADDRESS) {
    try {
      const [dec, sym] = await Promise.all([
        publicClient.readContract({
          address: parsed.token,
          abi: ERC20_ABI,
          functionName: 'decimals',
        }),
        publicClient.readContract({
          address: parsed.token,
          abi: ERC20_ABI,
          functionName: 'symbol',
        }),
      ]);
      if (typeof dec === 'number') tokenDecimals = dec;
      if (typeof sym === 'string') tokenSymbol = sym;
    } catch {
      // keep resolved fallback
    }
  }

  const hasWorker = parsed.worker.toLowerCase() !== ZERO_ADDRESS;
  return {
    id: parsed.id,
    poster: parsed.poster,
    worker: parsed.worker,
    token: parsed.token,
    tokenSymbol,
    tokenDecimals,
    totalAmount: parsed.totalAmount,
    releasedAmount: parsed.releasedAmount,
    claimDeadline: parsed.claimDeadline,
    status: mapBountyStatusCode(parsed.statusCode, hasWorker),
    title: parsed.title,
    description: parsed.description,
    createdAt: parsed.createdAt,
    milestones,
  };
}

export function usePlatformStats() {
  const publicClient = usePublicClient({ chainId: arcChain.id });
  const { data: abiData } = useDeployedAbi();

  return useQuery<PlatformStats>({
    queryKey: ['platformStats', CONTRACT_ADDRESS, abiData?.source],
    queryFn: async () => {
      if (!CONTRACT_ADDRESS || !publicClient || !abiData) {
        return {
          totalBounties: 0,
          activeBounties: 0,
          completedBounties: 0,
          completedMilestones: 0,
        };
      }

      const statsFn = resolveAbiFunctionName(abiData.abi, ['getPlatformStats', 'platformStats']);
      if (statsFn) {
        try {
          const raw = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: abiData.abi,
            functionName: statsFn,
          });
          if (Array.isArray(raw)) {
            return {
              totalBounties: Number(raw[0] ?? 0),
              activeBounties: Number(raw[1] ?? 0),
              completedBounties: Number(raw[2] ?? 0),
              completedMilestones: Number(raw[3] ?? 0),
            };
          }
          if (raw && typeof raw === 'object') {
            const obj = raw as Record<string, unknown>;
            return {
              totalBounties: Number(obj.totalBounties ?? 0),
              activeBounties: Number(obj.activeBounties ?? 0),
              completedBounties: Number(obj.completedBounties ?? 0),
              completedMilestones: Number(obj.completedMilestones ?? 0),
            };
          }
        } catch {
          // Fall back to count scan if stats method is unavailable
        }
      }

      const countFn = resolveAbiFunctionName(abiData.abi, ['bountyCount', 'getBountyCount', 'nextBountyId']);
      if (!countFn) {
        return {
          totalBounties: 0,
          activeBounties: 0,
          completedBounties: 0,
          completedMilestones: 0,
        };
      }

      const rawCount = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: abiData.abi,
        functionName: countFn,
      });
      const count = Number(rawCount ?? 0);
      return {
        totalBounties: count,
        activeBounties: 0,
        completedBounties: 0,
        completedMilestones: 0,
      };
    },
    enabled: Boolean(abiData),
    refetchInterval: 20_000,
  });
}

export function useBountiesList() {
  const publicClient = usePublicClient({ chainId: arcChain.id });
  const { data: abiData } = useDeployedAbi();

  return useQuery<BountyItem[]>({
    queryKey: ['bounties', CONTRACT_ADDRESS, abiData?.source],
    queryFn: async () => {
      if (!CONTRACT_ADDRESS || !publicClient || !abiData) {
        return [];
      }

      const countFn = resolveAbiFunctionName(abiData.abi, [
        'bountyCount',
        'getBountyCount',
        'nextBountyId',
      ]);
      if (!countFn) return [];

      const rawCount = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: abiData.abi,
        functionName: countFn,
      });
      const count = Number(rawCount ?? 0);
      if (count <= 0) return [];

      const ids = Array.from({ length: count }, (_, idx) => BigInt(idx + 1));
      const results = await Promise.all(
        ids.map((id) =>
          readSingleBounty(publicClient, abiData.abi, CONTRACT_ADDRESS!, id).catch(() => null),
        ),
      );

      const valid = results.filter((item): item is BountyItem => item !== null);
      if (valid.length === 0) {
        const zeroIndexBounty = await readSingleBounty(
          publicClient,
          abiData.abi,
          CONTRACT_ADDRESS,
          0n,
        ).catch(() => null);
        if (zeroIndexBounty) valid.push(zeroIndexBounty);
      }

      return valid.sort((a, b) => Number(b.id - a.id));
    },
    enabled: Boolean(abiData),
    refetchInterval: 20_000,
  });
}

export function useBountyDetail(bountyIdParam: string | undefined) {
  const publicClient = usePublicClient({ chainId: arcChain.id });
  const { data: abiData } = useDeployedAbi();

  const validNumeric = Boolean(bountyIdParam && /^\d+$/.test(bountyIdParam));

  return useQuery<BountyItem | null>({
    queryKey: ['bounty', CONTRACT_ADDRESS, bountyIdParam, abiData?.source],
    queryFn: async () => {
      if (!CONTRACT_ADDRESS || !publicClient || !abiData || !validNumeric || !bountyIdParam) {
        return null;
      }
      return readSingleBounty(
        publicClient,
        abiData.abi,
        CONTRACT_ADDRESS,
        BigInt(bountyIdParam),
      );
    },
    enabled: Boolean(abiData && validNumeric),
    refetchInterval: 15_000,
  });
}

export function useUserDashboardBounties(userAddress: `0x${string}` | undefined) {
  const publicClient = usePublicClient({ chainId: arcChain.id });
  const { data: abiData } = useDeployedAbi();

  return useQuery<{ posted: BountyItem[]; claimed: BountyItem[] }>({
    queryKey: ['dashboardBounties', CONTRACT_ADDRESS, userAddress, abiData?.source],
    queryFn: async () => {
      if (!CONTRACT_ADDRESS || !publicClient || !abiData || !userAddress) {
        return { posted: [], claimed: [] };
      }

      const byPosterFn = resolveAbiFunctionName(abiData.abi, [
        'getBountiesByPoster',
        'bountiesByPoster',
      ]);
      const byWorkerFn = resolveAbiFunctionName(abiData.abi, [
        'getBountiesByWorker',
        'bountiesByWorker',
      ]);

      const [posterIds, workerIds] = await Promise.all([
        byPosterFn
          ? publicClient
              .readContract({
                address: CONTRACT_ADDRESS,
                abi: abiData.abi,
                functionName: byPosterFn,
                args: [userAddress],
              })
              .catch(() => [] as bigint[])
          : Promise.resolve([] as bigint[]),
        byWorkerFn
          ? publicClient
              .readContract({
                address: CONTRACT_ADDRESS,
                abi: abiData.abi,
                functionName: byWorkerFn,
                args: [userAddress],
              })
              .catch(() => [] as bigint[])
          : Promise.resolve([] as bigint[]),
      ]);

      const safePosterIds = Array.isArray(posterIds) ? (posterIds as bigint[]) : [];
      const safeWorkerIds = Array.isArray(workerIds) ? (workerIds as bigint[]) : [];

      const [postedItems, claimedItems] = await Promise.all([
        Promise.all(
          safePosterIds.map((id) =>
            readSingleBounty(publicClient, abiData.abi, CONTRACT_ADDRESS!, id).catch(() => null),
          ),
        ),
        Promise.all(
          safeWorkerIds.map((id) =>
            readSingleBounty(publicClient, abiData.abi, CONTRACT_ADDRESS!, id).catch(() => null),
          ),
        ),
      ]);

      return {
        posted: postedItems.filter((b): b is BountyItem => b !== null),
        claimed: claimedItems.filter((b): b is BountyItem => b !== null),
      };
    },
    enabled: Boolean(userAddress && abiData),
    refetchInterval: 15_000,
  });
}
