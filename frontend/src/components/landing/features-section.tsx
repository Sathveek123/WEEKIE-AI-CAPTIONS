"use client";

import Image from "next/image";
import { Mic, Palette, Sparkles, Globe, Shield, Download, ArrowRight, Smile, Maximize, Users } from "lucide-react";
import Link from "next/link";

const mainFeatures = [
  {
    icon: Mic,
    title: "AI Speech-to-Text Engine",
    description:
      "Powered by Faster-Whisper. Automatic transcription with sub-second word timestamps for flawless subtitle synchronicity.",
    accent: "bg-[#FFF3EB] text-[#FF5A1F] border-[#FFE0D1]",
  },
  {
    icon: Palette,
    title: "6 Curated Preset Styles",
    description:
      "Hormozi, MrBeast, Karaoke, Minimal, Bounce, Classic. Distinct typography and color highlights designed to command attention.",
    accent: "bg-[#FEFCE8] text-[#CA8A04] border-[#FEF08A]",
  },
];

const secondaryFeatures = [
  {
    icon: Sparkles,
    title: "Word-Level Karaoke Animation",
    description:
      "Dynamic per-word rendering — yellow highlights, karaoke color sweeps, scale pops, and vertical bounces.",
    accent: "bg-[#FFF3EB] text-[#FF5A1F] border-[#FFE0D1]",
  },
  {
    icon: Globe,
    title: "100+ Global Languages",
    description:
      "Automatic language detection with script-aware font fallback for Latin, CJK, Devanagari, Arabic, and Cyrillic.",
    accent: "bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]",
  },
  {
    icon: Shield,
    title: "Private Local Processing",
    description:
      "Engineered for data independence. Process all media on your own hardware without third-party tracking.",
    accent: "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]",
  },
  {
    icon: Download,
    title: "Full HD 1080p ASS Export",
    description:
      "Direct subtitle burn-in via FFmpeg. Preserves original audio bitrate with crisp 1080p video encoding.",
    accent: "bg-[#FFF3EB] text-[#FF5A1F] border-[#FFE0D1]",
  },
  {
    icon: Smile,
    title: "Auto Emoji Highlights",
    description:
      "Auto-detects high-impact words and contextually overlays corresponding emojis alongside highlight styles to boost engagement.",
    accent: "bg-[#FEFCE8] text-[#CA8A04] border-[#FEF08A]",
  },
  {
    icon: Maximize,
    title: "AI Dynamic Zoom-Cuts",
    description:
      "Automatically applies subtle scale jumps at punctuation transitions and silent sections, creating clean visual pacing.",
    accent: "bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]",
  },
  {
    icon: Users,
    title: "Multi-Speaker Diarization",
    description:
      "Supports multi-voice detection. Colors words dynamically and tags speaker name prefixes to handle interviews and podcasts.",
    accent: "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative bg-[#FFFBF5] py-24 border-t border-[#F3EADF]">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="coral-badge mx-auto">
            <Sparkles className="h-4 w-4 text-[#FF5A1F]" />
            Engineered For Content Creators
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1A1A2E] tracking-tight">
            Everything You Need to Create <span className="text-[#FF5A1F]">Viral Video Captions</span>
          </h2>
          <p className="text-base text-[#64647A] leading-relaxed">
            Stop losing viewers to silent videos. Weekie AI Captions gives you professional subtitle design without complex video editing software.
          </p>
        </div>

        {/* Asymmetric Broken Grid Layout */}
        
        {/* Top Tier: 2 Large Spotlight Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {mainFeatures.map((feature, i) => (
            <div
              key={i}
              className="card-warm p-8 bg-white border border-[#F3EADF] rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.accent} mb-6 border`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black text-[#1A1A2E] mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#64647A] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Tier: Smaller Cards with duotone accent backgrounds */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {secondaryFeatures.map((feature, i) => (
            <div
              key={i}
              className="card-warm p-6 bg-white border border-[#F3EADF] rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${feature.accent} mb-4 border`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h4 className="text-base font-bold text-[#1A1A2E] mb-2">
                  {feature.title}
                </h4>
                <p className="text-xs text-[#64647A] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Visual Showcase Banner */}
        <div className="mt-16 card-warm p-8 sm:p-12 bg-[#FFF3EB] border border-[#FFE0D1] rounded-3xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F]">
              Interactive Caption Studio
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#1A1A2E]">
              Customize Subtitle Placement & Live Preview in Real-Time
            </h3>
            <p className="text-sm text-[#475569] leading-relaxed">
              Drag vertical caption positioning on our interactive smartphone mockup. Choose word colors, preview karaoke animation wipes, and render directly to MP4.
            </p>
            <div className="pt-2">
              <Link href="/studio" className="btn-coral text-xs py-3 px-6 inline-flex items-center gap-2">
                Open Studio Workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#FFE0D1] aspect-[4/3] bg-white">
              <Image
                src="/assets/creator_studio_workspace.png"
                alt="Creator Studio Workspace Showcase"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
