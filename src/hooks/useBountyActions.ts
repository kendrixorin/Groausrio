import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BaseError } from 'viem';
import { usePublicClient, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESS } from '../config/contracts';
import { arcChain } from '../config/network';
import { ERC20_ABI, resolveAbiFunctionName } from '../lib/abi';
import { useDeployedAbi } from './useContractData';

export type TxPhase = 'idle' | 'pending' | 'confirming' | 'confirmed' | 'error';

export interface TxStatus {
  phase: TxPhase;
  actionLabel: string;
  hash?: `0x${string}`;
  error?: string;
}

function formatWriteError(err: unknown): string {
  if (err instanceof BaseError) {
    return err.shortMessage || err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Transaction failed.';
}

export function useBountyActions() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: arcChain.id });
  const queryClient = useQueryClient();
  const { data: abiData } = useDeployedAbi();

  const [txStatus, setTxStatus] = useState<TxStatus>({
    phase: 'idle',
    actionLabel: '',
  });

  const resetTx = () => {
    setTxStatus({ phase: 'idle', actionLabel: '' });
  };

  async function executeTx(actionLabel: string, writeFn: () => Promise<`0x${string}`>) {
    setTxStatus({ phase: 'pending', actionLabel });
    try {
      const hash = await writeFn();
      setTxStatus({ phase: 'confirming', actionLabel, hash });

      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (receipt.status === 'reverted') {
          setTxStatus({
            phase: 'error',
            actionLabel,
            hash,
            error: 'Transaction reverted on Arc.',
          });
          return false;
        }
      }

      setTxStatus({ phase: 'confirmed', actionLabel, hash });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bounties'] }),
        queryClient.invalidateQueries({ queryKey: ['bounty'] }),
        queryClient.invalidateQueries({ queryKey: ['platformStats'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboardBounties'] }),
        queryClient.invalidateQueries({ queryKey: ['readContracts'] }),
      ]);
      return true;
    } catch (err) {
      setTxStatus({
        phase: 'error',
        actionLabel,
        error: formatWriteError(err),
      });
      return false;
    }
  }

  function requireContract() {
    if (!CONTRACT_ADDRESS) {
      throw new Error('Contract address is not configured.');
    }
    if (!abiData?.abi) {
      throw new Error('Contract ABI is still loading.');
    }
    return { address: CONTRACT_ADDRESS, abi: abiData.abi };
  }

  async function approveToken(tokenAddress: `0x${string}`, amount: bigint) {
    const spender = CONTRACT_ADDRESS;
    if (!spender) {
      setTxStatus({
        phase: 'error',
        actionLabel: 'Approve token',
        error: 'Contract address is not configured.',
      });
      return false;
    }
    return executeTx('Approve token spend', () =>
      writeContractAsync({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender, amount],
        chainId: arcChain.id,
      }),
    );
  }

  async function createBounty(params: {
    title: string;
    description: string;
    token: `0x${string}`;
    claimDeadline: bigint;
    milestoneTitles: string[];
    milestoneAmounts: bigint[];
  }) {
    const { address, abi } = requireContract();
    const fnName = resolveAbiFunctionName(abi, ['createBounty', 'postBounty']);
    if (!fnName) {
      throw new Error('Create bounty function not found in contract ABI.');
    }
    return executeTx('Create milestone bounty', () =>
      writeContractAsync({
        address,
        abi,
        functionName: fnName,
        args: [
          params.title,
          params.description,
          params.token,
          params.claimDeadline,
          params.milestoneTitles,
          params.milestoneAmounts,
        ],
        chainId: arcChain.id,
      }),
    );
  }

  async function claimBounty(bountyId: bigint) {
    const { address, abi } = requireContract();
    const fnName = resolveAbiFunctionName(abi, ['claimBounty', 'claim']);
    if (!fnName) {
      throw new Error('Claim bounty function not found in contract ABI.');
    }
    return executeTx('Claim bounty', () =>
      writeContractAsync({
        address,
        abi,
        functionName: fnName,
        args: [bountyId],
        chainId: arcChain.id,
      }),
    );
  }

  async function submitMilestoneProof(bountyId: bigint, milestoneIndex: bigint, proof: string) {
    const { address, abi } = requireContract();
    const fnName = resolveAbiFunctionName(abi, ['submitProof', 'submitMilestoneProof']);
    if (!fnName) {
      throw new Error('Submit proof function not found in contract ABI.');
    }
    return executeTx('Submit milestone proof', () =>
      writeContractAsync({
        address,
        abi,
        functionName: fnName,
        args: [bountyId, milestoneIndex, proof],
        chainId: arcChain.id,
      }),
    );
  }

  async function approveMilestone(bountyId: bigint, milestoneIndex: bigint) {
    const { address, abi } = requireContract();
    const fnName = resolveAbiFunctionName(abi, ['approveMilestone', 'approve']);
    if (!fnName) {
      throw new Error('Approve milestone function not found in contract ABI.');
    }
    return executeTx('Approve milestone payout', () =>
      writeContractAsync({
        address,
        abi,
        functionName: fnName,
        args: [bountyId, milestoneIndex],
        chainId: arcChain.id,
      }),
    );
  }

  async function rejectMilestone(bountyId: bigint, milestoneIndex: bigint, reason: string) {
    const { address, abi } = requireContract();
    const fnName = resolveAbiFunctionName(abi, ['rejectMilestone', 'reject']);
    if (!fnName) {
      throw new Error('Reject milestone function not found in contract ABI.');
    }
    return executeTx('Reject milestone submission', () =>
      writeContractAsync({
        address,
        abi,
        functionName: fnName,
        args: [bountyId, milestoneIndex, reason],
        chainId: arcChain.id,
      }),
    );
  }

  async function reclaimFunds(bountyId: bigint) {
    const { address, abi } = requireContract();
    const fnName = resolveAbiFunctionName(abi, ['reclaimFunds', 'reclaim']);
    if (!fnName) {
      throw new Error('Reclaim funds function not found in contract ABI.');
    }
    return executeTx('Reclaim unreleased funds', () =>
      writeContractAsync({
        address,
        abi,
        functionName: fnName,
        args: [bountyId],
        chainId: arcChain.id,
      }),
    );
  }

  return {
    txStatus,
    resetTx,
    approveToken,
    createBounty,
    claimBounty,
    submitMilestoneProof,
    approveMilestone,
    rejectMilestone,
    reclaimFunds,
  };
}
