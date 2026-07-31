"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles, Menu, X, User, ArrowRight, Video } from "lucide-react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("weekie_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-[#F3EADF] bg-[#FFFBF5]/95 shadow-sm backdrop-blur-md py-3"
          : "bg-[#FFFBF5]/80 border-b border-[#F3EADF]/60 backdrop-blur-sm py-4"
      }`}
    >
      <nav className="container mx-auto flex items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5A1F] text-white shadow-md shadow-[#FF5A1F]/20 transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-sans text-xl sm:text-2xl font-black tracking-tight text-[#1A1A2E]">
            Weekie <span className="text-[#FF5A1F]">AI Captions</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-8 md:flex text-xs font-bold uppercase tracking-wider text-[#33334A]">
          <Link
            href="/"
            className="transition-colors hover:text-[#FF5A1F]"
          >
            Home
          </Link>
          <a
            href="#styles"
            className="transition-colors hover:text-[#FF5A1F]"
          >
            Styles
          </a>
          <a
            href="#features"
            className="transition-colors hover:text-[#FF5A1F]"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="transition-colors hover:text-[#FF5A1F]"
          >
            Pricing
          </a>
          <Link
            href="/studio"
            className="transition-colors hover:text-[#FF5A1F] flex items-center gap-1 text-[#FF5A1F]"
          >
            <Video className="h-4 w-4" />
            Studio
          </Link>
        </div>

        {/* Right side: Auth CTA buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2.5 bg-[#FFF8F0] border border-[#FED7AA] px-3 py-1.5 rounded-xl">
                <div className="h-7 w-7 rounded-full bg-[#F97316] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#0F172A] leading-none">{user.name || "Creator"}</p>
                  <p className="text-[10px] text-[#64748B] leading-none mt-0.5">{user.email || "Verified User"}</p>
                </div>
              </div>
              <Link
                href="/studio"
                className="btn-coral text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <Video className="h-3.5 w-3.5" />
                Studio
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("weekie_user");
                    document.cookie = "weekie_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    window.location.href = "/login";
                  }
                }}
                className="text-xs font-semibold text-[#64748B] hover:text-[#EF4444] px-2 py-1 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-[#33334A] hover:text-[#FF5A1F] px-4 py-2 transition-colors"
              >
                <User className="h-4 w-4" />
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn-coral text-xs py-2.5 px-5 flex items-center gap-2"
              >
                Register Free
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="cursor-pointer border border-[#F3EADF] bg-[#FFF8F0] p-2 text-[#1A1A2E] rounded-xl md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-[#FF5A1F]" />
            ) : (
              <Menu className="h-5 w-5 text-[#1A1A2E]" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`overflow-hidden transition-all duration-300 md:hidden ${
          isMobileMenuOpen ? "max-h-80 opacity-100 border-b border-[#F3EADF]" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[#FFFBF5] px-6 py-5 flex flex-col gap-4 font-bold text-xs uppercase tracking-wider text-[#33334A]">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="hover:text-[#FF5A1F]"
          >
            Home
          </Link>
          <a
            href="#styles"
            onClick={() => setIsMobileMenuOpen(false)}
            className="hover:text-[#FF5A1F]"
          >
            Styles
          </a>
          <a
            href="#features"
            onClick={() => setIsMobileMenuOpen(false)}
            className="hover:text-[#FF5A1F]"
          >
            Features
          </a>
          <a
            href="#pricing"
            onClick={() => setIsMobileMenuOpen(false)}
            className="hover:text-[#FF5A1F]"
          >
            Pricing
          </a>
          <Link
            href="/studio"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-[#FF5A1F]"
          >
            Caption Studio
          </Link>
          <div className="pt-3 border-t border-[#F3EADF] flex gap-3">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-coral-ghost text-xs py-2 w-1/2 text-center"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-coral text-xs py-2 w-1/2 text-center"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
