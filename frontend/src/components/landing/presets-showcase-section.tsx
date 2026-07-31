"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Video, Flame } from "lucide-react";

const presets = [
  { name: "Hormozi", tag: "Yellow Highlight", color: "bg-[#FFD874] text-[#1A1A2E]" },
  { name: "MrBeast", tag: "Stroke & Pop", color: "bg-[#FF5A1F] text-white" },
  { name: "Karaoke", tag: "Color Wipes", color: "bg-[#7FB8D9] text-[#1A1A2E]" },
  { name: "Minimal", tag: "Clean Subtitles", color: "bg-[#8FA98C] text-white" },
  { name: "Bounce", tag: "Vertical Spring", color: "bg-[#FFD9B8] text-[#1A1A2E]" },
  { name: "Classic", tag: "High Contrast", color: "bg-[#1A1A2E] text-white" },
];

export function PresetsShowcaseSection() {
  return (
    <section id="styles" className="relative bg-[#FFFBF5] py-20 border-t border-[#1A1A2E]/[0.08]">
      <div className="container mx-auto px-6">
        
        {/* Centered Container (cream-deep bg, organic-lg radius 28px) */}
        <div className="bg-[#FCF3E7] border border-[#1A1A2E]/[0.08] rounded-[28px] p-8 lg:p-14 text-center max-w-5xl mx-auto shadow-soft">
          
          <div className="coral-badge mx-auto mb-4">
            <Flame className="h-4 w-4 text-[#FF5A1F]" />
            Subtitle Typography Presets
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1A1A2E] tracking-tight mb-4">
            Popular Creators' <span className="text-[#FF5A1F]">Subtitle Presets</span>
          </h2>

          <p className="text-sm sm:text-base text-[#4A4A5E] leading-relaxed max-w-2xl mx-auto mb-10">
            Select from 6 battle-tested caption styles optimized for high watch-time and maximum social media conversion.
          </p>

          {/* Preset Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {presets.map((preset, i) => (
              <div
                key={i}
                className="bg-white border border-[#1A1A2E]/[0.08] rounded-[20px] p-4 flex flex-col items-center justify-between shadow-soft hover:shadow-lift transition-all duration-250 hover:-translate-y-1 group"
              >
                <div className={`w-full py-2.5 rounded-xl font-black text-sm uppercase tracking-wider mb-3 ${preset.color} transition-transform group-hover:scale-105`}>
                  {preset.name}
                </div>
                <span className="text-[11px] font-bold text-[#4A4A5E] uppercase tracking-wide">
                  {preset.tag}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="pt-2">
            <Link
              href="/studio"
              className="btn-coral text-xs py-3.5 px-8 inline-flex items-center gap-2"
            >
              <Video className="h-4 w-4" />
              Try Presets in Studio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
