import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Lock, ShieldCheck, CheckSquare, Zap } from 'lucide-react';
import { usePlatformStats } from '../hooks/useContractData';

const ROADMAP_PHASES = [
  {
    phase: 'Phase 1',
    title: 'Core bounties live',
    status: 'Active',
    description:
      'Upfront ERC20 escrow in USDC or EURC, single-worker bounty claiming, proof submission per milestone, poster approval with instant payout, and deadline reclaim.',
  },
  {
    phase: 'Phase 2',
    title: 'Deadline per milestone',
    status: 'Planned',
    description:
      'Optional per-milestone delivery windows so multi-stage engagements keep predictable schedules and clear handoff expectations.',
  },
  {
    phase: 'Phase 3',
    title: 'Worker reputation',
    status: 'Planned',
    description:
      'Verifiable on-chain track records calculated strictly from completed milestones and settled bounties on Arc.',
  },
  {
    phase: 'Phase 4',
    title: 'Team bounties with shared payouts',
    status: 'Planned',
    description:
      'Multi-recipient milestone splits allowing engineering and design teams to receive automatic proportional payouts on approval.',
  },
];

const FAQ_ITEMS = [
  {
    question: 'What happens if I reject a milestone',
    answer:
      'Rejecting a submitted milestone keeps the allocated funds locked in the escrow contract and returns that milestone to an editable state. The worker can review your rejection note, fix the deliverable, and submit updated proof without losing the bounty.',
  },
  {
    question: 'Can I cancel after someone claims',
    answer:
      'Once a worker claims the bounty before the deadline, the poster cannot unilaterally pull funds out of escrow while work is underway. Staged payouts require either milestone approval to release funds to the worker or an unclaimed deadline expiry to reclaim.',
  },
  {
    question: 'Who holds the funds',
    answer:
      'The Groausrio smart contract deployed on Arc holds the full ERC20 reward in escrow from the moment a bounty is posted. Neither Groausrio maintainers nor external intermediaries have custody or withdrawal access.',
  },
  {
    question: 'What if the worker disappears',
    answer:
      'If nobody claims the bounty before the claim deadline passes, the poster can immediately reclaim 100% of the locked tokens from the contract. Already-approved milestones stay settled with the worker, and remaining unapproved funds stay protected in escrow.',
  },
];

export function HomePage() {
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-[1280px] space-y-16 px-4 py-10 sm:px-6 lg:space-y-20 lg:px-8 lg:py-14">
      {/* Hero Section */}
      <section className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col justify-between space-y-8 lg:col-span-7"
        >
          <div className="space-y-5">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[#2B2F36]">
              Available on Arc
            </p>
            <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-[#2B2F36] sm:text-5xl [text-wrap:balance]">
              Milestone bounties built on Arc
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-[#2B2F36]/85 sm:text-lg">
              A poster locks the full reward up front in smart contract escrow, a worker claims the bounty and submits proof per milestone, and each approved milestone pays out immediately.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link to="/bounties" className="btn-primary px-6 py-3 text-sm whitespace-nowrap">
              Explore Bounty Board
              <ArrowRight size={16} />
            </Link>
            <Link to="/post" className="btn-secondary px-6 py-3 text-sm whitespace-nowrap">
              Post a Bounty
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="blueprint-card-elevated flex flex-col justify-between overflow-hidden lg:col-span-5"
        >
          <div className="flex items-center justify-between border-b-2 border-[#2B2F36] bg-[#2B2F36] px-4 py-3 text-[#FFFFFF]">
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              Escrow Execution Spec
            </span>
            <span className="font-mono text-xs text-[#FF6B1A]">ARC-5042002</span>
          </div>

          <div className="grid flex-1 grid-cols-1 divide-y-2 divide-[#2B2F36]/15 p-5">
            <div className="flex items-start gap-3.5 pb-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border-2 border-[#2B2F36] bg-[#FF6B1A] text-[#2B2F36]">
                <Lock size={15} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#2B2F36]">01. Lock total reward up front</p>
                <p className="mt-0.5 text-xs text-[#2B2F36]/75">
                  Poster approves and deposits 100% of milestone funds in USDC or EURC.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 py-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border-2 border-[#2B2F36] bg-[#E7E5E0] text-[#2B2F36]">
                <ShieldCheck size={15} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#2B2F36]">02. Claim and submit proof</p>
                <p className="mt-0.5 text-xs text-[#2B2F36]/75">
                  Worker locks in the bounty and records deliverable proof on each milestone.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 pt-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border-2 border-[#2B2F36] bg-[#FF6B1A] text-[#2B2F36]">
                <Zap size={15} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#2B2F36]">03. Immediate staged payout</p>
                <p className="mt-0.5 text-xs text-[#2B2F36]/75">
                  Each poster approval transfers that milestone allocation straight to the worker.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Live Contract Telemetry Strip */}
      <section aria-label="Contract metrics" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="blueprint-card p-5">
          <span className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#7A828C]">
            Total Bounties
          </span>
          <span className="mt-2 block font-mono text-3xl font-bold text-[#2B2F36] tabular-nums">
            {statsLoading ? '—' : stats?.totalBounties ?? 0}
          </span>
        </div>
        <div className="blueprint-card p-5">
          <span className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#7A828C]">
            Active Escrows
          </span>
          <span className="mt-2 block font-mono text-3xl font-bold text-[#2B2F36] tabular-nums">
            {statsLoading ? '—' : stats?.activeBounties ?? 0}
          </span>
        </div>
        <div className="blueprint-card p-5">
          <span className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#7A828C]">
            Completed Bounties
          </span>
          <span className="mt-2 block font-mono text-3xl font-bold text-[#2B2F36] tabular-nums">
            {statsLoading ? '—' : stats?.completedBounties ?? 0}
          </span>
        </div>
        <div className="blueprint-card p-5">
          <span className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#7A828C]">
            Milestones Paid
          </span>
          <span className="mt-2 block font-mono text-3xl font-bold text-[#2B2F36] tabular-nums">
            {statsLoading ? '—' : stats?.completedMilestones ?? 0}
          </span>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="space-y-6">
        <div className="space-y-2">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[#7A828C]">
            Escrow Architecture
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-[#2B2F36] sm:text-3xl">
            How staged payouts protect both sides
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="blueprint-card flex flex-col justify-between p-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-[4px] border-2 border-[#2B2F36] bg-[#FF6B1A] px-2.5 py-1 font-mono text-xs font-bold uppercase text-[#2B2F36]">
                <ShieldCheck size={14} />
                For Posters
              </div>
              <h3 className="mt-4 text-xl font-bold text-[#2B2F36]">
                Pay only for verified deliverables
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#2B2F36]/80">
                Your total budget sits safely inside the contract rather than being sent up front to a contractor. You review proof for each milestone individually, approve to release that stage, or reject with revision notes. If nobody claims before the deadline, you reclaim 100% of the locked tokens.
              </p>
            </div>
          </div>

          <div className="blueprint-card flex flex-col justify-between p-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-[4px] border-2 border-[#2B2F36] bg-[#E7E5E0] px-2.5 py-1 font-mono text-xs font-bold uppercase text-[#2B2F36]">
                <CheckSquare size={14} />
                For Workers
              </div>
              <h3 className="mt-4 text-xl font-bold text-[#2B2F36]">
                Guaranteed funds before you start
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#2B2F36]/80">
                Every bounty on the board has already transferred its full USDC or EURC reward into contract escrow before anyone can claim it. As soon as the poster approves a milestone submission, the contract pays out that stage immediately with no invoicing delays.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="space-y-6">
        <div className="space-y-2">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[#7A828C]">
            Delivery Schedule
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-[#2B2F36] sm:text-3xl">
            Protocol roadmap
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ROADMAP_PHASES.map((item) => {
            const isActive = item.status === 'Active';
            return (
              <div key={item.phase} className="blueprint-card flex flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b-2 border-[#2B2F36] bg-[#E7E5E0] px-4 py-2.5">
                  <span className="font-mono text-xs font-bold uppercase text-[#2B2F36]">
                    {item.phase}
                  </span>
                  <span
                    className={`rounded-[4px] border-2 border-[#2B2F36] px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                      isActive ? 'bg-[#FF6B1A] text-[#2B2F36]' : 'bg-[#FFFFFF] text-[#2B2F36]'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="flex-1 p-5">
                  <h3 className="text-base font-bold text-[#2B2F36]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#2B2F36]/80">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="space-y-6">
        <div className="space-y-2">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[#7A828C]">
            Protocol Mechanics
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-[#2B2F36] sm:text-3xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={item.question} className="blueprint-card overflow-hidden">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold text-[#2B2F36] hover:bg-[#F5F3EE]"
                >
                  <span className="text-base">{item.question}?</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 transition-transform duration-150 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t-2 border-[#2B2F36]/15 bg-[#FFFFFF] px-5 py-4 text-sm leading-relaxed text-[#2B2F36]/85">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
