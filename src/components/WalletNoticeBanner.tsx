import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useAccount } from 'wagmi';
import { formatWalletConnectionError, subscribeWalletNotice } from '../lib/walletErrors';

export function WalletNoticeBanner() {
  const [message, setMessage] = useState<string | null>(null);
  const { isConnected } = useAccount();

  useEffect(() => {
    return subscribeWalletNotice(setMessage);
  }, []);

  useEffect(() => {
    if (isConnected && message) {
      setMessage(null);
    }
  }, [isConnected, message]);

  useEffect(() => {
    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      const formatted = formatWalletConnectionError(event.reason);
      if (formatted) {
        event.preventDefault();
        setMessage(formatted);
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (!message) return null;

  return (
    <div className="mx-auto mt-4 max-w-[1280px] px-4 sm:px-6 lg:px-8">
      <div
        role="alert"
        className="flex items-start justify-between gap-3 rounded-[4px] border-2 border-[#2B2F36] bg-[#FF6B1A] p-3.5 text-[#2B2F36] shadow-[2px_2px_0px_#2B2F36]"
      >
        <div className="flex items-start gap-2.5 text-sm font-semibold">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>{message}</p>
        </div>
        <button
          type="button"
          onClick={() => setMessage(null)}
          aria-label="Dismiss wallet notice"
          className="rounded-[4px] p-1 hover:bg-[#2B2F36]/10"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
