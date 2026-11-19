import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canClaimBounty,
  canReclaimBounty,
  computeMilestoneProgress,
  filterBounties,
  formatTokenAmount,
  needsTokenApproval,
  parseTokenAmountSafe,
  sumMilestoneAmounts,
  truncateAddress,
  validateBountyForm,
  ZERO_ADDRESS,
  type BountyItem,
} from './bountyLogic';

test('parseTokenAmountSafe handles 6-decimal and 18-decimal tokens accurately', () => {
  assert.equal(parseTokenAmountSafe('125.50', 6), 125_500_000n);
  assert.equal(parseTokenAmountSafe('2', 18), 2_000_000_000_000_000_000n);
  assert.equal(parseTokenAmountSafe('0', 6), null);
  assert.equal(parseTokenAmountSafe('-10', 6), null);
  assert.equal(parseTokenAmountSafe('1.1234567', 6), null);
  assert.equal(parseTokenAmountSafe('abc', 6), null);
});

test('formatTokenAmount formats real bigint balances with tabular clarity', () => {
  assert.equal(formatTokenAmount(1_250_500_000n, 6), '1,250.5');
  assert.equal(formatTokenAmount(500_000n, 6), '0.5');
  assert.equal(formatTokenAmount(0n, 6), '0');
  assert.equal(formatTokenAmount(3_000_000_000_000_000_000n, 18), '3');
});

test('sumMilestoneAmounts sums valid rows accurately in token units', () => {
  const total = sumMilestoneAmounts(
    [{ amount: '100' }, { amount: '250.25' }, { amount: 'invalid' }],
    6,
  );
  assert.equal(total, 350_250_000n);
});

test('validateBountyForm catches missing fields and past deadlines', () => {
  const now = 1_750_000_000;
  const futureIso = new Date((now + 7200) * 1000).toISOString();
  const bad = validateBountyForm({
    title: 'Hi',
    description: 'Too short',
    deadlineIso: new Date((now - 60) * 1000).toISOString(),
    milestones: [{ id: '1', title: '', amount: '0' }],
    decimals: 6,
    nowSeconds: now,
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.length >= 4);

  const good = validateBountyForm({
    title: 'Audit escrow invariants',
    description: 'Write full test coverage for milestone payouts and reclaim paths.',
    deadlineIso: futureIso,
    milestones: [
      { id: '1', title: 'Test suite', amount: '400' },
      { id: '2', title: 'Final report', amount: '600' },
    ],
    decimals: 6,
    nowSeconds: now,
  });
  assert.equal(good.valid, true);
  assert.equal(good.totalAmount, 1_000_000_000n);
  assert.deepEqual(good.parsedAmounts, [400_000_000n, 600_000_000n]);
});

test('needsTokenApproval checks allowance strictly against total reward', () => {
  assert.equal(needsTokenApproval(undefined, 100n), true);
  assert.equal(needsTokenApproval(99n, 100n), true);
  assert.equal(needsTokenApproval(100n, 100n), false);
  assert.equal(needsTokenApproval(500n, 100n), false);
  assert.equal(needsTokenApproval(0n, 0n), false);
});

test('computeMilestoneProgress calculates exact completion percentage', () => {
  assert.deepEqual(computeMilestoneProgress([]), { approvedCount: 0, totalCount: 0, percent: 0 });
  assert.deepEqual(
    computeMilestoneProgress([
      { status: 'Approved' },
      { status: 'Submitted' },
      { status: 'Pending' },
      { status: 'Rejected' },
    ]),
    { approvedCount: 1, totalCount: 4, percent: 25 },
  );
});

test('claim and reclaim eligibility enforce poster, worker, and deadline rules', () => {
  const poster = '0x1111111111111111111111111111111111111111';
  const worker = '0x2222222222222222222222222222222222222222';
  const baseBounty = {
    poster: poster as `0x${string}`,
    worker: ZERO_ADDRESS as `0x${string}`,
    status: 'Open' as const,
    claimDeadline: 2000,
    totalAmount: 1000n,
    releasedAmount: 0n,
  };

  assert.equal(canClaimBounty(baseBounty, worker, 1500), true);
  assert.equal(canClaimBounty(baseBounty, poster, 1500), false);
  assert.equal(canClaimBounty(baseBounty, worker, 2500), false);

  assert.equal(canReclaimBounty(baseBounty, poster, 1500), false);
  assert.equal(canReclaimBounty(baseBounty, poster, 2500), true);
  assert.equal(canReclaimBounty(baseBounty, worker, 2500), false);
});

test('filterBounties filters by status, token, and query', () => {
  const sample: BountyItem[] = [
    {
      id: 1n,
      poster: '0x1111111111111111111111111111111111111111',
      worker: ZERO_ADDRESS as `0x${string}`,
      token: '0x3600000000000000000000000000000000000000',
      tokenSymbol: 'USDC',
      tokenDecimals: 6,
      totalAmount: 1000n,
      releasedAmount: 0n,
      claimDeadline: 2000,
      status: 'Open',
      title: 'Indexer optimization',
      description: 'Reduce query latency',
      createdAt: 1000,
      milestones: [],
    },
    {
      id: 2n,
      poster: '0x3333333333333333333333333333333333333333',
      worker: '0x2222222222222222222222222222222222222222',
      token: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a',
      tokenSymbol: 'EURC',
      tokenDecimals: 6,
      totalAmount: 2000n,
      releasedAmount: 1000n,
      claimDeadline: 3000,
      status: 'In Progress',
      title: 'SDK documentation',
      description: 'Document escrow calls',
      createdAt: 1100,
      milestones: [],
    },
  ];

  assert.equal(filterBounties(sample, '', 'All', 'All').length, 2);
  assert.equal(filterBounties(sample, 'indexer', 'All', 'All').length, 1);
  assert.equal(filterBounties(sample, '', 'Open', 'EURC').length, 0);
  assert.equal(filterBounties(sample, '', 'In Progress', 'EURC').length, 1);
  assert.equal(truncateAddress('0x1234567890abcdef1234'), '0x1234...1234');
});
