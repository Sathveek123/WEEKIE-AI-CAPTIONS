"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, Video, CheckCircle2, Star, ShieldCheck } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-[#FFFBF5] pt-24 pb-20 overflow-hidden">
      {/* Subtle warm ambient gradient mesh */}
      <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-[#FFEAE0]/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 h-[400px] w-[400px] rounded-full bg-[#FFF0E6]/80 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column (7 cols): Asymmetric Headline, CTAs, & Micro-credibility */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Coral Badge */}
            <div className="coral-badge">
              <Sparkles className="h-4 w-4 text-[#FF5A1F]" />
              AI Video Subtitle Engine v2.0
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1A1A2E] tracking-tight leading-[1.12]">
              Add Viral <span className="text-[#FF5A1F]">Animated Captions</span> to Any Video in Seconds
            </h1>

            {/* Subtitle / Body Copy */}
            <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
              Transform standard video clips into high-converting TikToks, Reels, and Shorts. Powered by Whisper AI word-level timestamps with 6 curated subtitle presets.
            </p>

            {/* Dual Pill CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
              <Link
                href="/studio"
                className="btn-coral w-full sm:w-auto text-xs py-4 px-8 flex items-center justify-center gap-2"
              >
                <Video className="h-4 w-4" />
                Launch Caption Studio
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className="btn-coral-ghost w-full sm:w-auto text-xs py-4 px-8 flex items-center justify-center gap-2"
              >
                Create Free Account
              </Link>
            </div>

            {/* Micro-credibility Row */}
            <div className="pt-6 border-t border-[#F3EADF] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#64647A]">
              <div className="flex items-center gap-1.5 font-bold text-[#1A1A2E]">
                <div className="flex text-[#FF5A1F]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#FF5A1F]" />
                <span>100K+ Videos Rendered</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-[#FF5A1F]" />
                <span>Zero Watermark Limits</span>
              </div>
            </div>

          </div>

          {/* Right Column (5 cols): Tangible Product Frame Showcase */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-[#F3EADF] bg-white p-3 shadow-2xl transition-transform hover:scale-[1.01]">
              <div className="overflow-hidden rounded-2xl relative aspect-[4/3] bg-[#FFFBF5]">
                <Image
                  src="/assets/hero_video_captions.png"
                  alt="Weekie AI Captions Generator Product Showcase"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Floating Badge Overlay */}
              <div className="absolute -bottom-5 -left-5 rounded-2xl border border-[#F3EADF] bg-white p-4 shadow-xl flex items-center gap-3.5 hidden sm:flex">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF3EB] text-[#FF5A1F]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-[#1A1A2E] uppercase tracking-wider">Whisper AI Precision</div>
                  <div className="text-xs text-[#64647A]">Sub-second word timestamps</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
