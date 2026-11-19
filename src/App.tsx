import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from './config/wagmi';
import { arcChain } from './config/network';
import { formatWalletConnectionError, notifyWalletNotice } from './lib/walletErrors';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { WalletNoticeBanner } from './components/WalletNoticeBanner';
import { BountyBoardPage } from './pages/BountyBoardPage';
import { BountyDetailPage } from './pages/BountyDetailPage';
import { DashboardPage } from './pages/DashboardPage';
import { HomePage } from './pages/HomePage';
import { PostBountyPage } from './pages/PostBountyPage';

const blueprintRainbowTheme = lightTheme({
  accentColor: '#FF6B1A',
  accentColorForeground: '#2B2F36',
  borderRadius: 'small',
  fontStack: 'system',
  overlayBlur: 'none',
});

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error) => {
            const formatted = formatWalletConnectionError(error);
            if (formatted) {
              queueMicrotask(() => notifyWalletNotice(formatted));
            }
          },
        }),
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={arcChain} theme={blueprintRainbowTheme} modalSize="compact">
          <BrowserRouter>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <WalletNoticeBanner />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/bounties" element={<BountyBoardPage />} />
                  <Route path="/bounties/:id" element={<BountyDetailPage />} />
                  <Route path="/post" element={<PostBountyPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
