import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileCheck2, Lock, RotateCcw } from 'lucide-react';
import { useAccount } from 'wagmi';
import { ARC_EXPLORER_URL } from '../config/network';
import { useBountyActions } from '../hooks/useBountyActions';
import { useBountyDetail } from '../hooks/useContractData';
import {
  canClaimBounty,
  canReclaimBounty,
  computeMilestoneProgress,
  formatDeadlineDate,
  formatTokenAmount,
  getExplorerAddressUrl,
  truncateAddress,
  ZERO_ADDRESS,
} from '../lib/bountyLogic';
import { MilestoneProgressBar } from '../components/MilestoneProgressBar';
import { StatusChip } from '../components/StatusChip';
import { TxStatusBanner } from '../components/TxStatusBanner';
import { WalletGate } from '../components/WalletGate';

export function BountyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { address, isConnected } = useAccount();
  const { data: bounty, isLoading, refetch } = useBountyDetail(id);
  const {
    txStatus,
    resetTx,
    claimBounty,
    submitMilestoneProof,
    approveMilestone,
    rejectMilestone,
    reclaimFunds,
  } = useBountyActions();

  const [proofInputs, setProofInputs] = useState<Record<number, string>>({});
  const [rejectInputs, setRejectInputs] = useState<Record<number, string>>({});
  const [rejectOpenIdx, setRejectOpenIdx] = useState<number | null>(null);

  const nowSeconds = Math.floor(Date.now() / 1000);
  const isBusy = txStatus.phase === 'pending' || txStatus.phase === 'confirming';

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1100px] space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="blueprint-card h-56 animate-pulse bg-[#FFFFFF]/70" />
        <div className="blueprint-card h-72 animate-pulse bg-[#FFFFFF]/70" />
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="mx-auto max-w-[800px] space-y-6 px-4 py-14 text-center sm:px-6">
        <div className="blueprint-card p-8">
          <h1 className="text-2xl font-bold text-[#2B2F36]">Bounty not found</h1>
          <p className="mt-2 text-sm text-[#2B2F36]/80">
            No bounty with ID <code className="font-mono">{id || '—'}</code> exists on the configured Arc contract.
          </p>
          <div className="mt-6">
            <Link to="/bounties" className="btn-primary px-5 py-2.5 text-sm">
              <ArrowLeft size={16} />
              Back to Bounty Board
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const bountyCode = `BOUNTY-${bounty.id.toString().padStart(3, '0')}`;
  const progress = computeMilestoneProgress(bounty.milestones);
  const hasWorker = bounty.worker.toLowerCase() !== ZERO_ADDRESS;
  const isPoster = Boolean(address && address.toLowerCase() === bounty.poster.toLowerCase());
  const isWorker = Boolean(address && hasWorker && address.toLowerCase() === bounty.worker.toLowerCase());
  const remainingAmount =
    bounty.totalAmount > bounty.releasedAmount ? bounty.totalAmount - bounty.releasedAmount : 0n;

  const showClaim = canClaimBounty(bounty, address, nowSeconds);
  const showReclaim = canReclaimBounty(bounty, address, nowSeconds);

  async function handleClaim() {
    if (!bounty) return;
    resetTx();
    const ok = await claimBounty(bounty.id);
    if (ok) await refetch();
  }

  async function handleReclaim() {
    if (!bounty) return;
    resetTx();
    const ok = await reclaimFunds(bounty.id);
    if (ok) await refetch();
  }

  async function handleSubmitProof(milestoneIdx: number) {
    if (!bounty) return;
    const proof = (proofInputs[milestoneIdx] || '').trim();
    if (!proof) return;
    resetTx();
    const ok = await submitMilestoneProof(bounty.id, BigInt(milestoneIdx), proof);
    if (ok) {
      setProofInputs((prev) => ({ ...prev, [milestoneIdx]: '' }));
      await refetch();
    }
  }

  async function handleApprove(milestoneIdx: number) {
    if (!bounty) return;
    resetTx();
    const ok = await approveMilestone(bounty.id, BigInt(milestoneIdx));
    if (ok) await refetch();
  }

  async function handleReject(milestoneIdx: number) {
    if (!bounty) return;
    const reason = (rejectInputs[milestoneIdx] || '').trim() || 'Deliverable needs revision';
    resetTx();
    const ok = await rejectMilestone(bounty.id, BigInt(milestoneIdx), reason);
    if (ok) {
      setRejectOpenIdx(null);
      setRejectInputs((prev) => ({ ...prev, [milestoneIdx]: '' }));
      await refetch();
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <Link
          to="/bounties"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#2B2F36] hover:underline"
        >
          <ArrowLeft size={14} />
          Back to Bounty Board
        </Link>
      </div>

      <TxStatusBanner status={txStatus} onDismiss={resetTx} />

      {/* Main Blueprint Spec Card */}
      <section className="blueprint-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#2B2F36] bg-[#E7E5E0] px-5 py-3">
          <span className="font-mono text-xs font-bold uppercase text-[#2B2F36]">{bountyCode}</span>
          <StatusChip status={bounty.status} />
        </div>

        <div className="grid grid-cols-1 gap-8 p-5 sm:p-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <h1 className="text-2xl font-bold tracking-tight text-[#2B2F36] sm:text-3xl">
              {bounty.title}
            </h1>
            <p className="whitespace-pre-line text-sm leading-relaxed text-[#2B2F36]/85">
              {bounty.description}
            </p>
            <div className="pt-2">
              <MilestoneProgressBar
                approvedCount={progress.approvedCount}
                totalCount={progress.totalCount}
                percent={progress.percent}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-[4px] border-2 border-[#2B2F36] bg-[#E7E5E0] p-4 lg:col-span-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block font-mono text-[10px] uppercase tracking-wider text-[#7A828C]">
                  Total Locked
                </span>
                <span className="mt-1 block font-mono text-lg font-bold text-[#2B2F36] tabular-nums">
                  {formatTokenAmount(bounty.totalAmount, bounty.tokenDecimals)} {bounty.tokenSymbol}
                </span>
              </div>
              <div>
                <span className="block font-mono text-[10px] uppercase tracking-wider text-[#7A828C]">
                  Released
                </span>
                <span className="mt-1 block font-mono text-lg font-bold text-[#2B2F36] tabular-nums">
                  {formatTokenAmount(bounty.releasedAmount, bounty.tokenDecimals)} {bounty.tokenSymbol}
                </span>
              </div>
              <div>
                <span className="block font-mono text-[10px] uppercase tracking-wider text-[#7A828C]">
                  Remaining
                </span>
                <span className="mt-1 block font-mono text-sm font-semibold text-[#2B2F36] tabular-nums">
                  {formatTokenAmount(remainingAmount, bounty.tokenDecimals)} {bounty.tokenSymbol}
                </span>
              </div>
              <div>
                <span className="block font-mono text-[10px] uppercase tracking-wider text-[#7A828C]">
                  Claim Deadline
                </span>
                <span className="mt-1 block font-mono text-sm font-semibold text-[#2B2F36] tabular-nums">
                  {formatDeadlineDate(bounty.claimDeadline)}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t-2 border-[#2B2F36]/15 pt-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#7A828C]">Poster</span>
                <a
                  href={getExplorerAddressUrl(ARC_EXPLORER_URL, bounty.poster)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#2B2F36] hover:underline"
                >
                  {truncateAddress(bounty.poster)}
                  <ExternalLink size={12} />
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#7A828C]">Worker</span>
                {hasWorker ? (
                  <a
                    href={getExplorerAddressUrl(ARC_EXPLORER_URL, bounty.worker)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#2B2F36] hover:underline"
                  >
                    {truncateAddress(bounty.worker)}
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="text-[#2B2F36]">Unclaimed</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wallet-gated Bounty Actions */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#2B2F36]">Bounty actions</h2>

        {!isConnected ? (
          <WalletGate
            title="Connect wallet to interact"
            description="Claiming bounties, submitting milestone proof, approving payouts, or reclaiming funds requires a connected wallet on Arc."
          >
            <div />
          </WalletGate>
        ) : (
          <div className="blueprint-card flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="text-sm text-[#2B2F36]">
              {showClaim && 'This bounty is open and ready to claim.'}
              {showReclaim && 'The claim deadline has passed with no worker assigned.'}
              {isPoster && !showReclaim && bounty.status === 'Open' &&
                'Awaiting a worker claim before the deadline.'}
              {isPoster && bounty.status === 'In Progress' &&
                'Review submitted milestone proofs below to release staged payouts.'}
              {isWorker && bounty.status === 'In Progress' &&
                'Submit deliverable proof on pending or rejected milestones below.'}
              {!isPoster && !isWorker && !showClaim && bounty.status !== 'Open' &&
                'You are viewing this bounty in read-only mode.'}
              {bounty.status === 'Completed' && 'All milestones have been approved and paid out.'}
              {bounty.status === 'Reclaimed' && 'Escrowed funds were reclaimed by the poster.'}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {showClaim && (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={handleClaim}
                  className="btn-primary px-5 py-2.5 text-sm"
                >
                  <Lock size={15} />
                  Claim Bounty
                </button>
              )}

              {showReclaim && (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={handleReclaim}
                  className="btn-slate px-5 py-2.5 text-sm"
                >
                  <RotateCcw size={15} />
                  Reclaim Unreleased Funds
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Milestones List */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#2B2F36]">Milestone breakdown</h2>

        <div className="space-y-4">
          {bounty.milestones.map((ms) => {
            const canSubmit =
              isConnected &&
              isWorker &&
              bounty.status === 'In Progress' &&
              (ms.status === 'Pending' || ms.status === 'Rejected');

            const canReview =
              isConnected &&
              isPoster &&
              bounty.status === 'In Progress' &&
              ms.status === 'Submitted';

            return (
              <article key={ms.index} className="blueprint-card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#2B2F36] bg-[#E7E5E0] px-5 py-2.5">
                  <span className="font-mono text-xs font-bold uppercase text-[#2B2F36]">
                    Milestone {String(ms.index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-[#2B2F36] tabular-nums">
                      {formatTokenAmount(ms.amount, bounty.tokenDecimals)} {bounty.tokenSymbol}
                    </span>
                    <StatusChip status={ms.status} />
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <h3 className="text-base font-bold text-[#2B2F36]">{ms.title}</h3>

                  {ms.proof && (
                    <div className="rounded-[4px] border-2 border-[#2B2F36]/20 bg-[#F5F3EE] p-3">
                      <span className="block font-mono text-[10px] font-bold uppercase text-[#7A828C]">
                        Submitted Proof
                      </span>
                      <p className="mt-1 break-all font-mono text-xs text-[#2B2F36]">{ms.proof}</p>
                    </div>
                  )}

                  {ms.status === 'Rejected' && ms.rejectionReason && (
                    <div className="rounded-[4px] border-2 border-[#2B2F36] bg-[#2B2F36] p-3 text-[#FFFFFF]">
                      <span className="block font-mono text-[10px] font-bold uppercase text-[#FF6B1A]">
                        Rejection Note
                      </span>
                      <p className="mt-1 text-xs text-[#E7E5E0]">{ms.rejectionReason}</p>
                    </div>
                  )}

                  {canSubmit && (
                    <div className="flex flex-col gap-3 border-t-2 border-[#2B2F36]/15 pt-4 sm:flex-row">
                      <input
                        type="text"
                        aria-label={`Proof URL or summary for milestone ${ms.index + 1}`}
                        value={proofInputs[ms.index] || ''}
                        onChange={(e) =>
                          setProofInputs((prev) => ({ ...prev, [ms.index]: e.target.value }))
                        }
                        placeholder="Paste PR URL, commit hash, or deliverable proof"
                        className="blueprint-input font-mono text-xs"
                      />
                      <button
                        type="button"
                        disabled={isBusy || !(proofInputs[ms.index] || '').trim()}
                        onClick={() => handleSubmitProof(ms.index)}
                        className="btn-primary px-5 py-2.5 text-xs whitespace-nowrap shrink-0"
                      >
                        <FileCheck2 size={15} />
                        Submit Proof
                      </button>
                    </div>
                  )}

                  {canReview && (
                    <div className="space-y-3 border-t-2 border-[#2B2F36]/15 pt-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleApprove(ms.index)}
                          className="btn-primary px-5 py-2 text-xs"
                        >
                          Approve & Pay Worker
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            setRejectOpenIdx(rejectOpenIdx === ms.index ? null : ms.index)
                          }
                          className="btn-secondary px-4 py-2 text-xs"
                        >
                          Reject Submission
                        </button>
                      </div>

                      {rejectOpenIdx === ms.index && (
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            type="text"
                            aria-label={`Rejection reason for milestone ${ms.index + 1}`}
                            value={rejectInputs[ms.index] || ''}
                            onChange={(e) =>
                              setRejectInputs((prev) => ({
                                ...prev,
                                [ms.index]: e.target.value,
                              }))
                            }
                            placeholder="Explain what needs to be fixed"
                            className="blueprint-input text-xs"
                          />
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleReject(ms.index)}
                            className="btn-slate px-4 py-2 text-xs whitespace-nowrap shrink-0"
                          >
                            Confirm Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
