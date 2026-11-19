import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Plus, Search } from 'lucide-react';
import { CONTRACT_ADDRESS } from '../config/contracts';
import { useBountiesList } from '../hooks/useContractData';
import { type BountyStatus, filterBounties } from '../lib/bountyLogic';
import { BountyCard } from '../components/BountyCard';

const STATUS_FILTERS: Array<'All' | BountyStatus> = [
  'All',
  'Open',
  'In Progress',
  'Completed',
  'Reclaimed',
];

const TOKEN_FILTERS: Array<'All' | 'USDC' | 'EURC'> = ['All', 'USDC', 'EURC'];

export function BountyBoardPage() {
  const { data: bounties = [], isLoading, isError } = useBountiesList();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | BountyStatus>('All');
  const [tokenFilter, setTokenFilter] = useState<'All' | 'USDC' | 'EURC'>('All');

  const filtered = useMemo(
    () => filterBounties(bounties, query, statusFilter, tokenFilter),
    [bounties, query, statusFilter, tokenFilter],
  );

  return (
    <div className="mx-auto max-w-[1280px] space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[#7A828C]">
            On-Chain Registry
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#2B2F36] sm:text-4xl">
            Bounty board
          </h1>
          <p className="max-w-xl text-sm text-[#2B2F36]/80">
            Browse funded milestone bounties deployed on Arc. Every reward shown is locked in smart contract escrow.
          </p>
        </div>

        <Link to="/post" className="btn-primary px-5 py-2.5 text-sm whitespace-nowrap shrink-0">
          <Plus size={16} />
          Post a Bounty
        </Link>
      </div>

      {/* Filters Toolbar */}
      <div className="blueprint-card space-y-4 p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="relative lg:col-span-5">
            <label htmlFor="board-search" className="sr-only">
              Search bounties
            </label>
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#7A828C]"
            />
            <input
              id="board-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, ID, or poster address"
              className="blueprint-input pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:col-span-5">
            {STATUS_FILTERS.map((status) => {
              const active = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-[4px] border-2 border-[#2B2F36] px-3 py-1.5 font-mono text-xs font-bold uppercase whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-[#FF6B1A] text-[#2B2F36]'
                      : 'bg-[#FFFFFF] text-[#2B2F36] hover:bg-[#E7E5E0]'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 lg:col-span-2 lg:justify-end">
            {TOKEN_FILTERS.map((tok) => {
              const active = tokenFilter === tok;
              return (
                <button
                  key={tok}
                  type="button"
                  onClick={() => setTokenFilter(tok)}
                  className={`rounded-[4px] border-2 border-[#2B2F36] px-2.5 py-1.5 font-mono text-xs font-bold uppercase whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-[#2B2F36] text-[#FFFFFF]'
                      : 'bg-[#FFFFFF] text-[#2B2F36] hover:bg-[#E7E5E0]'
                  }`}
                >
                  {tok}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results State */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="blueprint-card h-[300px] animate-pulse bg-[#FFFFFF]/70" />
          ))}
        </div>
      ) : isError ? (
        <div className="blueprint-card p-8 text-center">
          <p className="text-base font-bold text-[#2B2F36]">Unable to read bounties from Arc RPC</p>
          <p className="mt-1 text-sm text-[#2B2F36]/75">
            Verify network connectivity to <code className="font-mono">rpc.testnet.arc.network</code> and try again.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="blueprint-card mx-auto max-w-xl p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[4px] border-2 border-[#2B2F36] bg-[#E7E5E0] text-[#2B2F36]">
            <FolderOpen size={22} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-[#2B2F36]">
            {bounties.length === 0 ? 'No bounties posted yet' : 'No matching bounties found'}
          </h2>
          <p className="mt-2 text-sm text-[#2B2F36]/80">
            {!CONTRACT_ADDRESS
              ? 'Contract address is not configured yet. Once deployed and configured, all live bounties on Arc will appear here.'
              : bounties.length === 0
                ? 'The escrow contract currently has zero active bounties. Post the first scoped bounty on Arc.'
                : 'Adjust your search query or status filter to inspect other bounties.'}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {bounties.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setStatusFilter('All');
                  setTokenFilter('All');
                }}
                className="btn-secondary px-4 py-2 text-xs"
              >
                Reset Filters
              </button>
            )}
            <Link to="/post" className="btn-primary px-5 py-2 text-xs">
              Post a Bounty
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((bounty) => (
            <BountyCard key={bounty.id.toString()} bounty={bounty} />
          ))}
        </div>
      )}
    </div>
  );
}
