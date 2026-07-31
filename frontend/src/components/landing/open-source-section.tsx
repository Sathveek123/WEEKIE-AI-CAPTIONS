"use client";

import { ShieldCheck, Cpu, Lock, Sparkles } from "lucide-react";
import { useIntersectionObserver } from "~/hooks/use-intersection-observer";

export function OpenSourceSection() {
  const { ref, isInView } = useIntersectionObserver({ margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative bg-[#14110F] py-24 border-t border-[#C9962E]/20"
    >
      <div className="container mx-auto px-6">
        <div className="mb-12 flex items-center gap-4">
          <span className="chapter-number">04</span>
          <h2 className="font-serif text-[#F4EDE0] text-2xl sm:text-3xl font-bold tracking-tight">
            Privacy & Processing Guarantee
          </h2>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-[#C9962E]/50 to-transparent" />
        </div>

        <div
          className={`plaque-frame-lg max-w-4xl mx-auto bg-[#1F1B18] transition-all duration-500 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="space-y-3 border-b md:border-b-0 md:border-r border-[#C9962E]/20 pb-6 md:pb-0 md:pr-6">
              <div className="inline-flex h-12 w-12 items-center justify-center border border-[#C9962E]/40 bg-[#14110F] text-[#C9962E]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#F4EDE0]">
                Zero Cloud Uploads
              </h3>
              <p className="text-xs text-[#C9BBA3] leading-relaxed">
                Your private videos remain securely processed on your dedicated server. We do not store or monetize your video content.
              </p>
            </div>

            <div className="space-y-3 border-b md:border-b-0 md:border-r border-[#C9962E]/20 pb-6 md:pb-0 md:pr-6">
              <div className="inline-flex h-12 w-12 items-center justify-center border border-[#C9962E]/40 bg-[#14110F] text-[#C9962E]">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#F4EDE0]">
                Whisper AI Engine
              </h3>
              <p className="text-xs text-[#C9BBA3] leading-relaxed">
                Word-level timestamps are extracted using state-of-the-art Faster-Whisper models for sub-second precision synchronization.
              </p>
            </div>

            <div className="space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center border border-[#C9962E]/40 bg-[#14110F] text-[#C9962E]">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#F4EDE0]">
                Unrestricted Exports
              </h3>
              <p className="text-xs text-[#C9BBA3] leading-relaxed">
                Export full HD 1080p videos with zero watermark logos or artificial duration caps.
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-[#C9962E]/20 pt-6 text-center">
            <span className="font-cormorant italic text-sm text-[#E8C878] flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-[#C9962E]" />
              Engineered exclusively for Weekie AI Captions Generator
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
