import type { ReactNode } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ShieldAlert, Wallet } from 'lucide-react';
import { useAccount } from 'wagmi';
import { arcChain } from '../config/network';

interface WalletGateProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function WalletGate({ title, description, children }: WalletGateProps) {
  const { isConnected, chainId } = useAccount();

  if (!isConnected) {
    return (
      <div className="blueprint-card mx-auto max-w-xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] border-2 border-[#2B2F36] bg-[#FF6B1A] text-[#2B2F36]">
            <Wallet size={20} />
          </div>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[#2B2F36]">{title}</h2>
              <p className="mt-1 text-sm text-[#2B2F36]/80">{description}</p>
            </div>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  type="button"
                  onClick={openConnectModal}
                  className="btn-primary px-5 py-2.5 text-sm"
                >
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    );
  }

  if (chainId !== arcChain.id) {
    return (
      <div className="blueprint-card mx-auto max-w-xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] border-2 border-[#2B2F36] bg-[#FF6B1A] text-[#2B2F36]">
            <ShieldAlert size={20} />
          </div>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[#2B2F36]">Switch network to Arc</h2>
              <p className="mt-1 text-sm text-[#2B2F36]/80">
                Your wallet is connected to another network. Switch to Arc (Chain 5042002) to interact with Groausrio.
              </p>
            </div>
            <ConnectButton.Custom>
              {({ openChainModal }) => (
                <button
                  type="button"
                  onClick={openChainModal}
                  className="btn-primary px-5 py-2.5 text-sm"
                >
                  Switch to Arc
                </button>
              )}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
