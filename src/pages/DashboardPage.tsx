import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useAccount } from 'wagmi';
import { ADMIN_WALLET } from '../config/contracts';
import { useUserDashboardBounties } from '../hooks/useContractData';
import { truncateAddress } from '../lib/bountyLogic';
import { BountyCard } from '../components/BountyCard';
import { WalletGate } from '../components/WalletGate';

export function DashboardPage() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<'posted' | 'claimed'>('posted');
  const { data, isLoading } = useUserDashboardBounties(address);

  const posted = data?.posted ?? [];
  const claimed = data?.claimed ?? [];
  const isAdmin =
    Boolean(address && ADMIN_WALLET) &&
    address!.toLowerCase() === ADMIN_WALLET!.toLowerCase();

  const totalApprovedMilestones = [...posted, ...claimed].reduce(
    (sum, bounty) =>
      sum + bounty.milestones.filter((m) => m.status === 'Approved').length,
    0,
  );

  const visibleList = activeTab === 'posted' ? posted : claimed;

  return (
    <div className="mx-auto max-w-[1280px] space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[#7A828C]">
          Connected Workspace
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[#2B2F36] sm:text-4xl">
          My dashboard
        </h1>
        <p className="max-w-2xl text-sm text-[#2B2F36]/80">
          Track bounties you posted and scopes you claimed with your connected wallet.
        </p>
      </div>

      <WalletGate
        title="Connect wallet to view your dashboard"
        description="Wallet-specific bounties, milestone reviews, and payout tracking stay hidden until your wallet is connected."
      >
        <div className="space-y-8">
          {/* Connected Wallet Strip */}
          <div className="blueprint-card flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
            <div className="space-y-1">
              <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#7A828C]">
                Active Wallet
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-[#2B2F36]">
                  {address ? truncateAddress(address) : ''}
                </span>
                {isAdmin && (
                  <span className="rounded-[4px] border-2 border-[#2B2F36] bg-[#FF6B1A] px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-[#2B2F36]">
                    Admin
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/bounties" className="btn-secondary px-4 py-2 text-xs">
                <Search size={14} />
                Browse Board
              </Link>
              <Link to="/post" className="btn-primary px-4 py-2 text-xs">
                <Plus size={14} />
                Post a Bounty
              </Link>
            </div>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="blueprint-card p-5">
              <span className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#7A828C]">
                Posted Bounties
              </span>
              <span className="mt-2 block font-mono text-3xl font-bold text-[#2B2F36] tabular-nums">
                {isLoading ? '—' : posted.length}
              </span>
            </div>
            <div className="blueprint-card p-5">
              <span className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#7A828C]">
                Claimed Bounties
              </span>
              <span className="mt-2 block font-mono text-3xl font-bold text-[#2B2F36] tabular-nums">
                {isLoading ? '—' : claimed.length}
              </span>
            </div>
            <div className="blueprint-card p-5">
              <span className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#7A828C]">
                Approved Milestones
              </span>
              <span className="mt-2 block font-mono text-3xl font-bold text-[#2B2F36] tabular-nums">
                {isLoading ? '—' : totalApprovedMilestones}
              </span>
            </div>
          </div>

          {/* Role Tabs */}
          <div className="flex items-center gap-2 border-b-2 border-[#2B2F36] pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('posted')}
              className={`rounded-[4px] border-2 border-[#2B2F36] px-4 py-2 font-mono text-xs font-bold uppercase transition-colors ${
                activeTab === 'posted'
                  ? 'bg-[#FF6B1A] text-[#2B2F36] shadow-[2px_2px_0px_#2B2F36]'
                  : 'bg-[#FFFFFF] text-[#2B2F36] hover:bg-[#E7E5E0]'
              }`}
            >
              Posted by Me ({posted.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('claimed')}
              className={`rounded-[4px] border-2 border-[#2B2F36] px-4 py-2 font-mono text-xs font-bold uppercase transition-colors ${
                activeTab === 'claimed'
                  ? 'bg-[#FF6B1A] text-[#2B2F36] shadow-[2px_2px_0px_#2B2F36]'
                  : 'bg-[#FFFFFF] text-[#2B2F36] hover:bg-[#E7E5E0]'
              }`}
            >
              Claimed by Me ({claimed.length})
            </button>
          </div>

          {/* Bounty List */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2].map((n) => (
                <div key={n} className="blueprint-card h-[280px] animate-pulse bg-[#FFFFFF]/70" />
              ))}
            </div>
          ) : visibleList.length === 0 ? (
            <div className="blueprint-card mx-auto max-w-xl p-8 text-center">
              <h2 className="text-xl font-bold text-[#2B2F36]">
                {activeTab === 'posted'
                  ? 'You have not posted any bounties yet'
                  : 'You have not claimed any bounties yet'}
              </h2>
              <p className="mt-2 text-sm text-[#2B2F36]/80">
                {activeTab === 'posted'
                  ? 'Create a scoped milestone bounty and lock its reward up front in Arc escrow.'
                  : 'Browse open bounties on the board and claim one to start submitting milestone proofs.'}
              </p>
              <div className="mt-6">
                {activeTab === 'posted' ? (
                  <Link to="/post" className="btn-primary px-5 py-2.5 text-xs">
                    Post a Bounty
                  </Link>
                ) : (
                  <Link to="/bounties" className="btn-primary px-5 py-2.5 text-xs">
                    Explore Bounty Board
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleList.map((bounty) => (
                <BountyCard key={bounty.id.toString()} bounty={bounty} />
              ))}
            </div>
          )}
        </div>
      </WalletGate>
    </div>
  );
}
