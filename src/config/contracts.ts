import { isAddress } from 'viem';

export interface TokenSpec {
  symbol: 'USDC' | 'EURC';
  name: string;
  address: `0x${string}`;
}

export const SUPPORTED_TOKENS: TokenSpec[] = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x3600000000000000000000000000000000000000',
  },
  {
    symbol: 'EURC',
    name: 'Euro Coin',
    address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a',
  },
];

const rawContractAddress = (import.meta.env.VITE_CONTRACT_ADDRESS || '').trim();
const rawWalletConnectId = (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '').trim();
const rawAdminWallet = (import.meta.env.VITE_ADMIN_WALLET || '').trim();

export const CONTRACT_ADDRESS: `0x${string}` | null = isAddress(rawContractAddress)
  ? (rawContractAddress as `0x${string}`)
  : null;

export const WALLETCONNECT_PROJECT_ID: string =
  rawWalletConnectId && !rawWalletConnectId.startsWith('[') ? rawWalletConnectId : '';

export const ADMIN_WALLET: `0x${string}` | null = isAddress(rawAdminWallet)
  ? (rawAdminWallet as `0x${string}`)
  : null;

export function findTokenByAddress(address: string | undefined): TokenSpec | undefined {
  if (!address) return undefined;
  const lower = address.toLowerCase();
  return SUPPORTED_TOKENS.find((token) => token.address.toLowerCase() === lower);
}
