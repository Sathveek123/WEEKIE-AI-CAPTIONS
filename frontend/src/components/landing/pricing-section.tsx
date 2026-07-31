"use client";

import { Check, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free Starter",
    description: "Ideal for testing features and generating single caption clips.",
    price: "$0",
    period: "forever free",
    popular: false,
    features: [
      "5 Video Renders per Month",
      "6 Curated Style Presets",
      "Faster-Whisper Base Model",
      "1080p Full HD ASS Export",
      "Community Discord Support",
      "Zero Watermark Limit",
    ],
    ctaText: "Start Free",
    ctaLink: "/studio",
    isPrimary: false,
  },
  {
    name: "Creator Pro",
    description: "Designed for content creators producing daily Reels, Shorts, and TikToks.",
    price: "$19",
    period: "/ month",
    popular: true,
    features: [
      "Unlimited Video Renders",
      "Whisper Medium Indic Model",
      "Auto Emoji Highlights",
      "Multi-Speaker Diarization",
      "AI Dynamic Zoom-Cuts",
      "Priority Rendering Pipeline",
      "Custom Brand Style Presets",
      "Direct SRT / VTT Downloads",
    ],
    ctaText: "Get Creator Pro",
    ctaLink: "/register?plan=creator",
    isPrimary: true,
  },
  {
    name: "Agency Suite",
    description: "For agencies and media teams handling large volume video campaigns.",
    price: "$49",
    period: "/ month",
    popular: false,
    features: [
      "Everything in Creator Pro",
      "Unlimited Concurrent Jobs",
      "Custom ASS Style Import",
      "API & Webhook Access",
      "Batch Video Processing",
      "Dedicated Server Instance",
      "24/7 Priority Support",
    ],
    ctaText: "Start Agency Trial",
    ctaLink: "/register?plan=agency",
    isPrimary: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative bg-[#FFFBF5] py-24 border-t border-[#F3EADF]">
      <div className="container mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="coral-badge mx-auto">
            <Sparkles className="h-4 w-4 text-[#FF5A1F]" />
            Flexible & Honest Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1A1A2E] tracking-tight">
            Choose Your <span className="text-[#FF5A1F]">Caption Studio</span> Plan
          </h2>
          <p className="text-base text-[#64647A] leading-relaxed">
            Start for free. Upgrade when you need unlimited renders and advanced Indic language accuracy.
          </p>
        </div>

        {/* 3-Tier Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`card-warm p-8 bg-white border rounded-3xl flex flex-col justify-between relative transition-all duration-300 ${
                plan.popular
                  ? "border-[#FF5A1F] shadow-2xl lg:-translate-y-3 z-10"
                  : "border-[#F3EADF] shadow-md hover:shadow-xl"
              }`}
            >
              {/* Popular Tag */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF5A1F] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-xl font-black text-[#1A1A2E] mb-2">
                  {plan.name}
                </h3>
                <p className="text-xs text-[#64647A] min-h-[36px] mb-6">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-[#F3EADF]">
                  <span className="text-4xl sm:text-5xl font-black text-[#1A1A2E] tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs font-bold text-[#64647A] uppercase tracking-wider">
                    {plan.period}
                  </span>
                </div>

                {/* Features list */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-xs text-[#33334A] font-medium">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFF3EB] text-[#FF5A1F] shrink-0 border border-[#FFE0D1]">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <Link
                  href={plan.ctaLink}
                  className={`w-full text-xs py-3.5 px-6 flex items-center justify-center gap-2 ${
                    plan.isPrimary
                      ? "btn-coral"
                      : "btn-coral-ghost"
                  }`}
                >
                  {plan.ctaText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise Notice Banner */}
        <div className="mt-16 card-warm p-6 bg-white border border-[#F3EADF] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="text-sm font-black text-[#1A1A2E]">Looking for custom self-hosted enterprise deployments?</div>
            <div className="text-xs text-[#64647A]">Deploy on your own private cloud or local render farm with custom SLA.</div>
          </div>
          <Link href="/enterprise" className="btn-coral-ghost text-xs py-2.5 px-5 shrink-0">
            Contact Enterprise Team
          </Link>
        </div>

      </div>
    </section>
  );
}
