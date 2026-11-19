function extractMessageAndCode(err: unknown): { code?: number; message: string } {
  if (!err || typeof err !== 'object') {
    return { message: typeof err === 'string' ? err : '' };
  }

  const record = err as Record<string, unknown>;
  const code = typeof record.code === 'number' ? record.code : undefined;
  const parts: string[] = [];

  if (typeof record.message === 'string') parts.push(record.message);
  if (typeof record.shortMessage === 'string') parts.push(record.shortMessage);
  if (typeof record.details === 'string') parts.push(record.details);

  if (record.cause && typeof record.cause === 'object') {
    const nested = extractMessageAndCode(record.cause);
    if (nested.message) parts.push(nested.message);
    return {
      code: code ?? nested.code,
      message: parts.join(' '),
    };
  }

  return { code, message: parts.join(' ') };
}

export function isEmptyWalletAccountError(err: unknown): boolean {
  const { message } = extractMessageAndCode(err);
  return /wallet must has at least one account|no accounts? found|create an account/i.test(
    message,
  );
}

export function formatWalletConnectionError(err: unknown): string | null {
  if (isEmptyWalletAccountError(err)) {
    return 'Your browser wallet has no active account yet. Open your wallet extension to create or unlock an account, then try connecting again.';
  }
  return null;
}

type WalletNoticeListener = (message: string | null) => void;
const listeners = new Set<WalletNoticeListener>();

export function notifyWalletNotice(message: string | null): void {
  for (const listener of listeners) {
    listener(message);
  }
}

export function subscribeWalletNotice(listener: WalletNoticeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
