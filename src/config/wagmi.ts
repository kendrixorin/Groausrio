import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { ARC_RPC_URL, arcChain } from './network';
import { WALLETCONNECT_PROJECT_ID } from './contracts';

const wallets = WALLETCONNECT_PROJECT_ID
  ? [injectedWallet, metaMaskWallet, coinbaseWallet, rainbowWallet, walletConnectWallet]
  : [injectedWallet];

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Wallets',
      wallets,
    },
  ],
  {
    appName: 'Groausrio',
    projectId: WALLETCONNECT_PROJECT_ID || '00000000000000000000000000000000',
  },
);

export const wagmiConfig = createConfig({
  connectors,
  chains: [arcChain],
  transports: {
    [arcChain.id]: http(ARC_RPC_URL),
  },
  ssr: true,
});
