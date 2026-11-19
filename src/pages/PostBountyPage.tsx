import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, SUPPORTED_TOKENS, type TokenSpec } from '../config/contracts';
import { useBountyActions } from '../hooks/useBountyActions';
import { useTokenMetadata } from '../hooks/useContractData';
import {
  formatTokenAmount,
  type MilestoneDraft,
  needsTokenApproval,
  sumMilestoneAmounts,
  validateBountyForm,
} from '../lib/bountyLogic';
import { TxStatusBanner } from '../components/TxStatusBanner';
import { WalletGate } from '../components/WalletGate';

function defaultDeadlineValue(): string {
  const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function PostBountyPage() {
  const { isConnected } = useAccount();
  const [selectedToken, setSelectedToken] = useState<TokenSpec>(SUPPORTED_TOKENS[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadlineIso, setDeadlineIso] = useState(defaultDeadlineValue);
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([
    { id: 'ms-1', title: '', amount: '' },
  ]);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const tokenMeta = useTokenMetadata(selectedToken.address);
  const { txStatus, resetTx, approveToken, createBounty } = useBountyActions();

  const resolvedDecimals = tokenMeta.decimals ?? 6;
  const totalAmount = useMemo(
    () => sumMilestoneAmounts(milestones, resolvedDecimals),
    [milestones, resolvedDecimals],
  );

  const requiresApproval = useMemo(
    () => needsTokenApproval(tokenMeta.allowance, totalAmount),
    [tokenMeta.allowance, totalAmount],
  );

  const insufficientBalance =
    tokenMeta.balance !== undefined && totalAmount > 0n && tokenMeta.balance < totalAmount;

  const isBusy = txStatus.phase === 'pending' || txStatus.phase === 'confirming';

  function addMilestone() {
    setMilestones((prev) => [
      ...prev,
      { id: `ms-${Date.now()}-${prev.length + 1}`, title: '', amount: '' },
    ]);
  }

  function removeMilestone(id: string) {
    if (milestones.length <= 1) return;
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  }

  function updateMilestone(id: string, field: 'title' | 'amount', value: string) {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  }

  async function handleApprove() {
    resetTx();
    const validation = validateBountyForm({
      title,
      description,
      deadlineIso,
      milestones,
      decimals: resolvedDecimals,
    });
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }
    setFormErrors([]);
    const ok = await approveToken(selectedToken.address, validation.totalAmount);
    if (ok) {
      await tokenMeta.refetch();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    resetTx();

    if (tokenMeta.decimals === undefined) {
      setFormErrors(['Waiting to read token decimals from Arc.']);
      return;
    }

    const validation = validateBountyForm({
      title,
      description,
      deadlineIso,
      milestones,
      decimals: tokenMeta.decimals,
    });

    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    if (insufficientBalance) {
      setFormErrors([`Insufficient ${tokenMeta.symbol} balance for total bounty escrow.`]);
      return;
    }

    if (requiresApproval) {
      setFormErrors([`Approve ${tokenMeta.symbol} allowance before creating this bounty.`]);
      return;
    }

    setFormErrors([]);
    const claimDeadlineSec = BigInt(Math.floor(Date.parse(deadlineIso) / 1000));
    const ok = await createBounty({
      title: title.trim(),
      description: description.trim(),
      token: selectedToken.address,
      claimDeadline: claimDeadlineSec,
      milestoneTitles: milestones.map((m) => m.title.trim()),
      milestoneAmounts: validation.parsedAmounts,
    });

    if (ok) {
      setTitle('');
      setDescription('');
      setMilestones([{ id: `ms-${Date.now()}`, title: '', amount: '' }]);
    }
  }

  return (
    <div className="mx-auto max-w-[1000px] space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[#7A828C]">
          Escrow Creation
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[#2B2F36] sm:text-4xl">
          Post a bounty
        </h1>
        <p className="max-w-2xl text-sm text-[#2B2F36]/80">
          Define deliverables, allocate rewards per milestone, and lock the full total up front in contract escrow.
        </p>
      </div>

      <WalletGate
        title="Connect wallet to post a bounty"
        description="Creating a milestone bounty requires an ERC20 approval and escrow deposit from your wallet on Arc."
      >
        {!CONTRACT_ADDRESS && (
          <div className="blueprint-card flex items-start gap-3 bg-[#FFFFFF] p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#FF6B1A]" />
            <div className="text-sm text-[#2B2F36]">
              <p className="font-bold">Contract address not configured</p>
              <p className="mt-0.5 text-[#2B2F36]/80">
                Set <code className="font-mono text-xs">VITE_CONTRACT_ADDRESS</code> to your deployed Groausrio escrow contract on Arc to submit transactions.
              </p>
            </div>
          </div>
        )}

        <TxStatusBanner status={txStatus} onDismiss={resetTx} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Core Scope Card */}
          <div className="blueprint-card overflow-hidden">
            <div className="flex items-center justify-between border-b-2 border-[#2B2F36] bg-[#E7E5E0] px-5 py-3">
              <span className="font-mono text-xs font-bold uppercase text-[#2B2F36]">
                01. Scope & Settlement Token
              </span>
              <span className="font-mono text-xs text-[#7A828C]">SPEC-INPUT</span>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <label htmlFor="bounty-title" className="mb-1.5 block text-sm font-bold text-[#2B2F36]">
                  Bounty Title
                </label>
                <input
                  id="bounty-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Build sub-second event indexer for escrow payouts"
                  className="blueprint-input"
                  required
                />
              </div>

              <div>
                <label htmlFor="bounty-desc" className="mb-1.5 block text-sm font-bold text-[#2B2F36]">
                  Technical Specification
                </label>
                <textarea
                  id="bounty-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe acceptance criteria, repository access, and how each milestone proof will be reviewed."
                  className="blueprint-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <span className="mb-1.5 block text-sm font-bold text-[#2B2F36]">
                    Reward Token
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {SUPPORTED_TOKENS.map((token) => {
                      const active = selectedToken.address === token.address;
                      return (
                        <button
                          key={token.address}
                          type="button"
                          onClick={() => setSelectedToken(token)}
                          className={`rounded-[4px] border-2 border-[#2B2F36] px-3 py-2.5 text-left transition-colors ${
                            active
                              ? 'bg-[#FF6B1A] text-[#2B2F36] shadow-[2px_2px_0px_#2B2F36]'
                              : 'bg-[#FFFFFF] text-[#2B2F36] hover:bg-[#F5F3EE]'
                          }`}
                        >
                          <span className="block font-mono text-sm font-bold">{token.symbol}</span>
                          <span className="block text-[11px] text-[#2B2F36]/75">{token.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  {isConnected && (
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-[#2B2F36]/80 tabular-nums">
                      <span>
                        Decimals: {tokenMeta.isLoading ? '...' : tokenMeta.decimals ?? 'N/A'}
                      </span>
                      <span>
                        Balance:{' '}
                        {tokenMeta.balance !== undefined && tokenMeta.decimals !== undefined
                          ? `${formatTokenAmount(tokenMeta.balance, tokenMeta.decimals)} ${tokenMeta.symbol}`
                          : '—'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="claim-deadline" className="mb-1.5 block text-sm font-bold text-[#2B2F36]">
                    Claim Deadline
                  </label>
                  <input
                    id="claim-deadline"
                    type="datetime-local"
                    value={deadlineIso}
                    onChange={(e) => setDeadlineIso(e.target.value)}
                    className="blueprint-input font-mono"
                    required
                  />
                  <p className="mt-1.5 text-xs text-[#7A828C]">
                    If unclaimed by this time, you can reclaim the locked escrow.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Milestones Card */}
          <div className="blueprint-card overflow-hidden">
            <div className="flex items-center justify-between border-b-2 border-[#2B2F36] bg-[#E7E5E0] px-5 py-3">
              <span className="font-mono text-xs font-bold uppercase text-[#2B2F36]">
                02. Milestone Schedule
              </span>
              <button
                type="button"
                onClick={addMilestone}
                className="btn-secondary px-3 py-1 text-xs"
              >
                <Plus size={14} />
                Add Milestone
              </button>
            </div>

            <div className="divide-y-2 divide-[#2B2F36]/15 p-5 sm:p-6">
              {milestones.map((ms, index) => (
                <div
                  key={ms.id}
                  className="grid grid-cols-1 gap-4 py-4 first:pt-0 last:pb-0 sm:grid-cols-12 sm:items-end"
                >
                  <div className="sm:col-span-7">
                    <label
                      htmlFor={`ms-title-${ms.id}`}
                      className="mb-1.5 block font-mono text-xs font-bold uppercase text-[#2B2F36]"
                    >
                      Milestone {index + 1} Deliverable
                    </label>
                    <input
                      id={`ms-title-${ms.id}`}
                      type="text"
                      value={ms.title}
                      onChange={(e) => updateMilestone(ms.id, 'title', e.target.value)}
                      placeholder="Deliver tested API endpoints and schema"
                      className="blueprint-input"
                      required
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label
                      htmlFor={`ms-amount-${ms.id}`}
                      className="mb-1.5 block font-mono text-xs font-bold uppercase text-[#2B2F36]"
                    >
                      Reward ({tokenMeta.symbol})
                    </label>
                    <input
                      id={`ms-amount-${ms.id}`}
                      type="text"
                      inputMode="decimal"
                      value={ms.amount}
                      onChange={(e) => updateMilestone(ms.id, 'amount', e.target.value)}
                      placeholder="250.00"
                      className="blueprint-input font-mono tabular-nums"
                      required
                    />
                  </div>

                  <div className="flex justify-end sm:col-span-1">
                    <button
                      type="button"
                      onClick={() => removeMilestone(ms.id)}
                      disabled={milestones.length <= 1}
                      aria-label={`Remove milestone ${index + 1}`}
                      className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-[4px] border-2 border-[#2B2F36] bg-[#FFFFFF] text-[#2B2F36] hover:bg-[#E7E5E0] disabled:opacity-40"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 border-t-2 border-[#2B2F36] bg-[#E7E5E0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="block font-mono text-[11px] uppercase tracking-wider text-[#7A828C]">
                  Total Escrow Lock
                </span>
                <span className="font-mono text-2xl font-bold text-[#2B2F36] tabular-nums">
                  {formatTokenAmount(totalAmount, resolvedDecimals)} {tokenMeta.symbol}
                </span>
              </div>

              <div className="font-mono text-xs text-[#2B2F36]/80 tabular-nums">
                Current Allowance:{' '}
                {tokenMeta.allowance !== undefined && tokenMeta.decimals !== undefined
                  ? `${formatTokenAmount(tokenMeta.allowance, tokenMeta.decimals)} ${tokenMeta.symbol}`
                  : '0'}
              </div>
            </div>
          </div>

          {formErrors.length > 0 && (
            <div
              role="alert"
              className="rounded-[4px] border-2 border-[#2B2F36] bg-[#2B2F36] p-4 text-sm text-[#FFFFFF]"
            >
              <p className="font-bold text-[#FF6B1A]">Review form requirements</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs text-[#E7E5E0]">
                {formErrors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link to="/bounties" className="btn-secondary px-5 py-2.5 text-sm">
              Back to Board
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              {requiresApproval && (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={!CONTRACT_ADDRESS || isBusy || totalAmount <= 0n}
                  className="btn-primary px-6 py-3 text-sm"
                >
                  Approve {tokenMeta.symbol}
                </button>
              )}

              <button
                type="submit"
                disabled={
                  !CONTRACT_ADDRESS ||
                  isBusy ||
                  requiresApproval ||
                  insufficientBalance ||
                  tokenMeta.decimals === undefined
                }
                className={requiresApproval ? 'btn-secondary px-6 py-3 text-sm' : 'btn-primary px-6 py-3 text-sm'}
              >
                Create Bounty
              </button>
            </div>
          </div>
        </form>
      </WalletGate>
    </div>
  );
}
