"use client";

import { Upload, Palette, Download, Sparkles } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Media",
    description: "Drag and drop any MP4, MOV, or WebM video file (up to 500MB). Our engine handles pre-processing automatically.",
  },
  {
    number: "02",
    icon: Palette,
    title: "Select Subtitle Style",
    description: "Choose from 6 viral presets — Hormozi, MrBeast, Karaoke, Bounce, Minimal, or Classic — and fine-tune word colors.",
  },
  {
    number: "03",
    icon: Download,
    title: "Render & Download",
    description: "Export high-resolution 1080p MP4 videos with burned-in ASS subtitles ready for TikTok, Instagram Reels, and YouTube Shorts.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative bg-[#FFFBF5] py-24 border-t border-[#F3EADF]">
      <div className="container mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="coral-badge mx-auto">
            <Sparkles className="h-4 w-4 text-[#FF5A1F]" />
            Simple 3-Step Process
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1A1A2E] tracking-tight">
            How Weekie AI Captions <span className="text-[#FF5A1F]">Works</span>
          </h2>
          <p className="text-base text-[#64647A] leading-relaxed">
            Get professional animated captions burned into your videos in under a minute.
          </p>
        </div>

        {/* Horizontal 3-step flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {steps.map((step, i) => (
            <div
              key={i}
              className="card-warm p-8 bg-white border border-[#F3EADF] rounded-3xl relative flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div>
                {/* Numeral and Icon Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF3EB] text-[#FF5A1F] border border-[#FFE0D1]">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="numeral-outline text-4xl sm:text-5xl">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-xl font-black text-[#1A1A2E] mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-[#64647A] leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F3EADF] text-xs font-bold uppercase tracking-wider text-[#FF5A1F]">
                Step {i + 1} of 3
              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
