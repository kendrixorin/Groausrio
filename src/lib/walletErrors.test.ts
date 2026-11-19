import test from 'node:test';
import assert from 'node:assert/strict';
import { formatWalletConnectionError, isEmptyWalletAccountError } from './walletErrors';

test('detects raw EIP-1193 empty wallet account error', () => {
  const raw = { code: 4001, message: 'wallet must has at least one account' };
  assert.equal(isEmptyWalletAccountError(raw), true);
  assert.match(
    formatWalletConnectionError(raw) ?? '',
    /no active account yet/i,
  );
});

test('detects wrapped Wagmi/Viem error with empty wallet cause', () => {
  const wrapped = {
    name: 'UserRejectedRequestError',
    shortMessage: 'User rejected the request.',
    cause: { code: 4001, message: 'wallet must has at least one account' },
  };
  assert.equal(isEmptyWalletAccountError(wrapped), true);
  assert.match(
    formatWalletConnectionError(wrapped) ?? '',
    /create or unlock an account/i,
  );
});

test('ignores normal user rejection or unrelated errors', () => {
  const normalReject = { code: 4001, message: 'User rejected the request.' };
  assert.equal(isEmptyWalletAccountError(normalReject), false);
  assert.equal(formatWalletConnectionError(normalReject), null);
});
