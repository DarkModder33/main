'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface NavItem {
  name: string;
  href: string;
  submenu?: Array<{ name: string; href: string }>;
}

const navigation: NavItem[] = [
  { name: 'Home', href: '/' },
  
  // Portal 1: Music
  { 
    name: 'Music', 
    href: '/music',
    submenu: [
      { name: 'Guitar Lessons', href: '/music#lessons' },
      { name: 'Artist Showcase', href: '/music#artists' },
      { name: 'Token Roadmap', href: '/music#token' },
    ]
  },
  
  // Portal 2: Fintech
  { 
    name: 'Trading', 
    href: '/dashboard',
    submenu: [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Community', href: '/dashboard' },
      { name: 'Livestreams', href: '/dashboard' },
    ]
  },
  
  // Portal 3: Tech Services
  { 
    name: 'Services', 
    href: '/services',
    submenu: [
      { name: 'Web Development', href: '/services' },
      { name: 'Tech Support', href: '/services' },
      { name: 'Marketing', href: '/services' },
      { name: 'All Services', href: '/services' },
    ]
  },
  
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Blog', href: '/blog' },
];

/**
 * Main navigation header with 3-pronged business structure
 * Integrates shamrock theme styling with dropdown menus
 */
export function ShamrockHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutside = Object.values(dropdownRefs.current).every(
        ref => ref && !ref.contains(target)
      );
      if (clickedOutside) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent, itemName: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpenDropdown(openDropdown === itemName ? null : itemName);
    } else if (event.key === 'Escape') {
      setOpenDropdown(null);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-[#00FF41]/30 shadow-lg shadow-[#00FF41]/20">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-[#00FF41] to-[#39FF14] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(0,255,65,0.5)]">
              TradeHax AI
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              if (item.submenu) {
                return (
                  <div
                    key={item.name}
                    ref={(el) => { dropdownRefs.current[item.name] = el; }}
                    className="relative group"
                    onMouseEnter={() => setOpenDropdown(item.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-[#00FF41] drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]'
                          : 'text-gray-300 hover:text-[#39FF14] hover:drop-shadow-[0_0_6px_rgba(0,255,65,0.6)]'
                      }`}
                      onFocus={() => setOpenDropdown(item.name)}
                      onKeyDown={(e) => handleKeyDown(e, item.name)}
                      aria-expanded={openDropdown === item.name}
                      aria-haspopup="true"
                    >
                      {item.name}
                      <ChevronDown className="w-4 h-4" />
                    </Link>
                    
                    {openDropdown === item.name && (
                      <div 
                        className="absolute top-full left-0 mt-2 w-48 bg-black/95 border border-[#00FF41]/50 rounded-lg shadow-2xl shadow-[#00FF41]/30 py-2 animate-slide-up"
                        role="menu"
                      >
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.name}
                            href={subitem.href}
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#003B00] hover:text-[#00FF41] hover:shadow-[0_0_10px_rgba(0,255,65,0.3)] transition-all"
                            role="menuitem"
                          >
                            {subitem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#00FF41] drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]'
                      : 'text-gray-300 hover:text-[#39FF14] hover:drop-shadow-[0_0_6px_rgba(0,255,65,0.6)]'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-[#00FF41]/30 animate-slide-up">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-[#003B00] text-[#00FF41] shadow-[0_0_10px_rgba(0,255,65,0.3)]'
                        : 'text-gray-300 hover:bg-[#003B00] hover:text-[#39FF14]'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {item.submenu && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.name}
                          href={subitem.href}
                          className="block px-3 py-1 text-sm text-gray-400 hover:text-[#00FF41] transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subitem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </nav>
    </header>
  );
}
