"use client";
import Link from "next/link";
import { useEffect, useId, useState } from "react";

const navLinks = [
  { name: "Home", href: "/" },
  {
    name: "Services",
    href: "/services",
    items: [
      { name: "Overview", href: "/services" },
      { name: "Pricing", href: "/pricing" },
      { name: "Book", href: "/schedule" },
    ],
  },
  {
    name: "Music",
    href: "/music",
    items: [
      { name: "Lessons", href: "/music/lessons" },
      { name: "Showcase", href: "/music/showcase" },
      { name: "Scholarships", href: "/music/scholarships" },
    ],
  },
  {
    name: "Intelligence",
    href: "/intelligence",
    items: [
      { name: "AI Hub", href: "/ai-hub" },
      { name: "Signals", href: "/intelligence" },
    ],
  },
  { name: "About", href: "/about" },
  { name: "Schedule", href: "/schedule" },
];

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuPanelId = useId();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-white hover:bg-white/5 transition-colors"
        aria-label="Toggle menu"
        aria-controls={menuPanelId}
      >
        <div className="w-6 h-5 flex flex-col justify-between items-end">
          <span className={`h-0.5 bg-white transition-all duration-300 ${isOpen ? "w-6 translate-y-2 -rotate-45" : "w-6"}`} />
          <span className={`h-0.5 bg-white transition-all duration-300 ${isOpen ? "opacity-0" : "w-4"}`} />
          <span className={`h-0.5 bg-white transition-all duration-300 ${isOpen ? "w-6 -translate-y-2 rotate-45" : "w-5"}`} />
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]" onClick={toggleMenu} />
      )}

      <div
        id={menuPanelId}
        className={`fixed top-0 right-0 h-full w-[min(90vw,420px)] z-[70] transform transition-transform duration-500 ease-out bg-[#07090f] border-l border-white/10 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-5 sm:p-6 h-full flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">Site navigation</p>
            </div>
            <button
              onClick={toggleMenu}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/5 transition-colors"
              aria-label="Close menu"
            >
              Close
            </button>
          </div>

          <nav className="flex flex-col gap-4 overflow-y-auto">
            {navLinks.map((link) => (
              <div key={link.name} className="space-y-2">
                <Link
                  href={link.href}
                  onClick={toggleMenu}
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-white/10 transition-colors"
                >
                  {link.name}
                </Link>

                {link.items ? (
                  <div className="space-y-2 pl-4">
                    {link.items.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={toggleMenu}
                        className="block rounded-2xl px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>

          <div className="mt-auto space-y-4 border-t border-white/10 pt-5">
            <Link
              href="/schedule"
              onClick={toggleMenu}
              className="block rounded-2xl bg-cyan-500 px-4 py-3 text-center text-sm font-semibold uppercase text-black hover:bg-cyan-400 transition-colors"
            >
              Book a Session
            </Link>
            <Link
              href="/about"
              onClick={toggleMenu}
              className="block rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-semibold uppercase text-white hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
