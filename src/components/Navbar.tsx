import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/bounties', label: 'Bounty Board' },
  { to: '/post', label: 'Post a Bounty' },
  { to: '/dashboard', label: 'My Dashboard' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#2B2F36] bg-[#FFFFFF]">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:gap-8 lg:px-8">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-[#2B2F36] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF6B1A]"
        >
          <Logo size={32} />
          <span className="text-xl font-bold tracking-tight">Groausrio</span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 border-b-2 py-1 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'border-[#FF6B1A] text-[#2B2F36]'
                    : 'border-transparent text-[#2B2F36]/75 hover:border-[#2B2F36] hover:text-[#2B2F36]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              if (!ready) {
                return (
                  <button
                    type="button"
                    disabled
                    className="btn-secondary px-4 py-2 text-xs whitespace-nowrap shrink-0"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (!connected) {
                return (
                  <button
                    type="button"
                    onClick={openConnectModal}
                    className="btn-primary px-4 py-2 text-xs whitespace-nowrap shrink-0"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="btn-primary px-4 py-2 text-xs whitespace-nowrap shrink-0"
                  >
                    Switch to Arc
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-[4px] border-2 border-[#2B2F36] bg-[#E7E5E0] px-2.5 py-1.5 font-mono text-xs font-semibold text-[#2B2F36] hover:bg-[#DCD9D2] whitespace-nowrap shrink-0"
                  >
                    Arc
                  </button>
                  <button
                    type="button"
                    onClick={openAccountModal}
                    className="btn-secondary px-3 py-1.5 font-mono text-xs whitespace-nowrap shrink-0"
                  >
                    {account.displayName}
                  </button>
                </div>
              );
            }}
          </ConnectButton.Custom>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[4px] border-2 border-[#2B2F36] bg-[#FFFFFF] text-[#2B2F36] md:hidden"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t-2 border-[#2B2F36] bg-[#FFFFFF] px-4 py-3 md:hidden"
        >
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-[4px] border-2 px-3 py-2.5 text-sm font-semibold ${
                    isActive
                      ? 'border-[#2B2F36] bg-[#FF6B1A] text-[#2B2F36]'
                      : 'border-transparent text-[#2B2F36] hover:border-[#2B2F36] hover:bg-[#E7E5E0]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
