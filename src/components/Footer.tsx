import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { CONTRACT_ADDRESS } from '../config/contracts';
import { ARC_EXPLORER_URL } from '../config/network';
import { getExplorerAddressUrl, truncateAddress } from '../lib/bountyLogic';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-[#2B2F36] bg-[#2B2F36] text-[#FFFFFF]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-start gap-3">
          <Logo size={32} className="shrink-0 border border-white/20 rounded-[4px]" />
          <div>
            <p className="text-base font-bold text-[#FFFFFF]">Built by Kendrix</p>
            <p className="mt-1 text-xs text-[#E7E5E0]">
              Groausrio is an independent project built on Arc.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-[#E7E5E0]">
          <Link to="/" className="hover:text-[#FF6B1A] transition-colors">
            Home
          </Link>
          <Link to="/bounties" className="hover:text-[#FF6B1A] transition-colors">
            Bounty Board
          </Link>
          <Link to="/post" className="hover:text-[#FF6B1A] transition-colors">
            Post a Bounty
          </Link>
          <Link to="/dashboard" className="hover:text-[#FF6B1A] transition-colors">
            My Dashboard
          </Link>
          {CONTRACT_ADDRESS && (
            <a
              href={getExplorerAddressUrl(ARC_EXPLORER_URL, CONTRACT_ADDRESS)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[#FF6B1A] hover:underline"
            >
              Contract {truncateAddress(CONTRACT_ADDRESS)}
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
