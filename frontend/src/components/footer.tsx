"use client";

import Link from "next/link";
import { Mail, Sparkles } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FFF5EC] border-t border-[#F3EADF] text-[#1A1A2E]">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2 lg:col-span-1">
            <Link href="/" className="mb-4 inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF5A1F] text-white shadow-md shadow-[#FF5A1F]/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-sans text-xl font-black tracking-tight text-[#1A1A2E]">
                Weekie <span className="text-[#FF5A1F]">AI Captions</span>
              </span>
            </Link>
            <p className="mb-6 text-xs text-[#64647A] leading-relaxed">
              Editorial AI video caption platform. Burn viral animated subtitles into your videos with sub-second Whisper precision and HD exports.
            </p>
            <div className="flex gap-3">
              <a
                href="mailto:support@weekieaicaptions.com"
                className="inline-flex items-center gap-2 rounded-full border border-[#FFE0D1] bg-[#FFF3EB] px-4 py-2 text-xs font-bold text-[#FF5A1F] transition-colors hover:bg-[#FF5A1F] hover:text-white"
              >
                <Mail className="h-4 w-4" />
                Contact Support
              </a>
            </div>
          </div>

          {/* Product & Solutions */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#FF5A1F]">
              Product & Solutions
            </h3>
            <ul className="space-y-3 text-xs font-semibold text-[#33334A]">
              <li>
                <Link href="/" className="hover:text-[#FF5A1F] transition-colors">
                  Home Landing Page
                </Link>
              </li>
              <li>
                <Link href="/studio" className="hover:text-[#FF5A1F] transition-colors">
                  Caption Studio Workspace
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-[#FF5A1F] transition-colors">
                  Saved Caption History
                </Link>
              </li>
              <li>
                <Link href="/enterprise" className="hover:text-[#FF5A1F] transition-colors">
                  Enterprise Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#FF5A1F]">
              Capabilities
            </h3>
            <ul className="space-y-3 text-xs font-semibold text-[#33334A]">
              <li className="hover:text-[#FF5A1F] cursor-default transition-colors">
                Whisper AI Transcription
              </li>
              <li className="hover:text-[#FF5A1F] cursor-default transition-colors">
                6 Subtitle Style Presets
              </li>
              <li className="hover:text-[#FF5A1F] cursor-default transition-colors">
                Multi-Speaker Diarization
              </li>
              <li className="hover:text-[#FF5A1F] cursor-default transition-colors">
                Auto Emoji Highlights
              </li>
            </ul>
          </div>

          {/* Legal Documents */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#FF5A1F]">
              Legal
            </h3>
            <ul className="space-y-3 text-xs font-semibold text-[#33334A]">
              <li>
                <Link href="/terms" className="hover:text-[#FF5A1F] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#FF5A1F] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-[#FF5A1F] transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-[#F3EADF] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row text-xs text-[#64647A]">
            <p>
              &copy; {currentYear} Weekie AI Captions Generator. All rights reserved.
            </p>
            <p className="font-medium text-[#FF5A1F]">
              Crafted for maximum engagement & viral short-form media.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
