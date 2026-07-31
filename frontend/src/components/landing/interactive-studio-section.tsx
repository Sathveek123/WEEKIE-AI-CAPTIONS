"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Video, Sparkles, SlidersHorizontal, Layers, Play } from "lucide-react";

export function InteractiveStudioSection() {
  return (
    <section className="relative bg-[#FFFBF5] py-20 border-t border-[#1A1A2E]/[0.08]">
      <div className="container mx-auto px-6">
        
        {/* Large Asymmetric Container (cream-deep bg, organic-lg radius 28px) */}
        <div className="bg-[#FCF3E7] border border-[#1A1A2E]/[0.08] rounded-[28px] p-8 lg:p-14 shadow-soft">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="coral-badge">
                <Sparkles className="h-4 w-4 text-[#FF5A1F]" />
                Interactive Studio Workspace
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-[#1A1A2E] leading-tight">
                Customize Subtitle Placement & Live Preview in <span className="text-[#FF5A1F]">Real-Time</span>
              </h2>

              <p className="text-sm sm:text-base text-[#4A4A5E] leading-relaxed">
                Drag vertical caption positioning on our interactive smartphone mockup. Choose word highlight colors, preview karaoke animation wipes, and render directly to crisp 1080p MP4.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs font-bold text-[#1A1A2E]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFE4D6] text-[#FF5A1F]">
                    <SlidersHorizontal className="h-4 w-4" />
                  </div>
                  <span>Precision Vertical Drag-and-Drop Positioning</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-[#1A1A2E]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFE4D6] text-[#FF5A1F]">
                    <Layers className="h-4 w-4" />
                  </div>
                  <span>6 Animated Typography Preset Wipes</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/studio"
                  className="btn-coral text-xs py-3.5 px-7 flex items-center justify-center lg:inline-flex gap-2"
                >
                  <Video className="h-4 w-4" />
                  Launch Studio Workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Column (7 cols): Realistic Editor UI Frame with soft shadow */}
            <div className="lg:col-span-7">
              <div className="relative rounded-[20px] overflow-hidden border border-[#1A1A2E]/[0.1] bg-white shadow-lift transition-transform hover:scale-[1.01]">
                {/* Browser Frame Header */}
                <div className="bg-[#FFF8F0] px-4 py-3 border-b border-[#1A1A2E]/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#FF5A1F]/40" />
                    <div className="h-3 w-3 rounded-full bg-[#FFD874]" />
                    <div className="h-3 w-3 rounded-full bg-[#8FA98C]" />
                  </div>
                  <div className="text-[11px] font-bold text-[#4A4A5E] tracking-wider uppercase">
                    studio.weekieaicaptions.com
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#FF5A1F]">
                    <Play className="h-3 w-3 fill-current" />
                    <span>Live</span>
                  </div>
                </div>

                {/* Studio Screen Mockup Image */}
                <div className="relative aspect-[16/10] bg-[#FFFBF5]">
                  <Image
                    src="/assets/creator_studio_workspace.png"
                    alt="Weekie AI Captions Interactive Studio Workspace"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
