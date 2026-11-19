import { AlertTriangle, CheckSquare, ExternalLink, Loader2, X } from 'lucide-react';
import { ARC_EXPLORER_URL } from '../config/network';
import type { TxStatus } from '../hooks/useBountyActions';
import { getExplorerTxUrl } from '../lib/bountyLogic';

interface TxStatusBannerProps {
  status: TxStatus;
  onDismiss?: () => void;
}

export function TxStatusBanner({ status, onDismiss }: TxStatusBannerProps) {
  if (status.phase === 'idle') return null;

  const isBusy = status.phase === 'pending' || status.phase === 'confirming';
  const isConfirmed = status.phase === 'confirmed';
  const isError = status.phase === 'error';

  const containerStyle = isConfirmed
    ? 'bg-[#FF6B1A] text-[#2B2F36]'
    : isError
      ? 'bg-[#2B2F36] text-[#FFFFFF]'
      : 'bg-[#FFFFFF] text-[#2B2F36]';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-[4px] border-2 border-[#2B2F36] p-4 shadow-[2px_2px_0px_#2B2F36] ${containerStyle}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            {isBusy && <Loader2 size={18} className="animate-spin" />}
            {isConfirmed && <CheckSquare size={18} />}
            {isError && <AlertTriangle size={18} className="text-[#FF6B1A]" />}
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-bold">
              {status.phase === 'pending' && `${status.actionLabel} — Confirm in wallet`}
              {status.phase === 'confirming' && `${status.actionLabel} — Confirming on Arc`}
              {status.phase === 'confirmed' && `${status.actionLabel} — Confirmed on Arc`}
              {status.phase === 'error' && `${status.actionLabel} — Transaction failed`}
            </p>
            {status.error && (
              <p className="text-xs text-[#E7E5E0] break-words">{status.error}</p>
            )}
            {status.hash && (
              <a
                href={getExplorerTxUrl(ARC_EXPLORER_URL, status.hash)}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1 font-mono text-xs underline ${
                  isError ? 'text-[#FF6B1A]' : 'text-[#2B2F36]'
                }`}
              >
                View on ArcScan ({status.hash.slice(0, 10)}...)
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {onDismiss && !isBusy && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss transaction notification"
            className="rounded-[4px] p-1 hover:opacity-75"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
