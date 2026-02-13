import { Github, Mail, Twitter, Youtube } from "lucide-react";
import Link from "next/link";

export function ShamrockFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[#4f678e]/35 bg-[#03070f]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#00ff41]/45 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-semibold tracking-[0.2em] uppercase text-white">
                TradeHax
              </span>
              <span className="text-sm font-semibold tracking-[0.2em] uppercase text-[#8fffb6]">
                AI
              </span>
            </div>
            <p className="text-[#9cadcc] text-sm leading-relaxed mb-5">
              Matrix-style Web3 platform for trading operations, repair
              services, guitar lessons, and digital project execution.
            </p>
            <div className="flex gap-2.5">
              <a
                href="https://x.com/tradehaxai"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-[#4f678e]/40 bg-[#071222] text-[#9fb2d4] hover:border-[#00ff41]/50 hover:text-[#8fffb6] transition-colors"
                aria-label="X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@tradehaxnet"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-[#4f678e]/40 bg-[#071222] text-[#9fb2d4] hover:border-[#00ff41]/50 hover:text-[#8fffb6] transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/DarkModder33/main"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-[#4f678e]/40 bg-[#071222] text-[#9fb2d4] hover:border-[#00ff41]/50 hover:text-[#8fffb6] transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-[#9cadcc] hover:text-[#8fffb6] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/crypto-project" className="text-[#9cadcc] hover:text-[#8fffb6] transition-colors">
                  Crypto Project
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-[#9cadcc] hover:text-[#8fffb6] transition-colors">
                  Trading Dashboard
                </Link>
              </li>
              <li>
                <Link href="/game" className="text-[#9cadcc] hover:text-[#8fffb6] transition-colors">
                  Hyperborea Game
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/services" className="text-[#9cadcc] hover:text-[#8fffb6] transition-colors">
                  Full Service Catalog
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="text-[#9cadcc] hover:text-[#8fffb6] transition-colors">
                  Booking Schedule
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[#9cadcc] hover:text-[#8fffb6] transition-colors">
                  Pricing Tiers
                </Link>
              </li>
              <li>
                <Link href="/music" className="text-[#9cadcc] hover:text-[#8fffb6] transition-colors">
                  Music Platform
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="text-[#9cadcc] hover:text-[#8fffb6] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-[#9cadcc] hover:text-[#8fffb6] transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@tradehaxai.tech"
                  className="inline-flex items-center gap-1 text-[#9cadcc] hover:text-[#8fffb6] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Contact
                </a>
              </li>
              <li className="text-[#7f8fac]">Serving Greater Philadelphia and remote clients</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#4f678e]/30 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#7f8fac]">
            &copy; {currentYear} TradeHax AI. All rights reserved.
          </p>
          <p className="text-xs text-[#7f8fac]">
            Built on Next.js and Solana with a matrix-green execution theme.
          </p>
        </div>
      </div>
    </footer>
  );
}
