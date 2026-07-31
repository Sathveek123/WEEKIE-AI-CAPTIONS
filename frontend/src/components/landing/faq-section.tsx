"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

const faqs = [
  {
    question: "How does Weekie AI generate word-level animated captions?",
    answer:
      "We process your audio using OpenAI's Faster-Whisper model. It computes sub-second start and end timestamps for every single spoken word. Our renderer then converts these timestamps into formatted ASS subtitle files.",
  },
  {
    question: "How long does video processing take?",
    answer:
      "For a typical 1-minute video clip, processing takes between 10 to 20 seconds. Long videos are automatically processed using chunked speech threads.",
  },
  {
    question: "Does Weekie AI add a watermark to my exported videos?",
    answer:
      "No. All exported videos are 100% clean and free of watermarks, even on our free starter tier.",
  },
  {
    question: "Can I download raw SRT or VTT subtitle files separately?",
    answer:
      "Yes! You can download both .srt and .vtt caption files directly from the studio workspace or history panel without needing to render video files.",
  },
  {
    question: "Which video formats and aspect ratios are supported?",
    answer:
      "We support MP4, MOV, and WebM video formats in all standard aspect ratios: 9:16 (Vertical Shorts/Reels), 16:9 (Landscape YouTube), and 1:1 (Square).",
  },
  {
    question: "Is my media private and safe?",
    answer:
      "Yes. All uploaded files are stored temporarily in isolated server storage and automatically purged after processing.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative bg-[#FFFBF5] py-24 border-t border-[#F3EADF]">
      <div className="container mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="coral-badge mx-auto">
            <Sparkles className="h-4 w-4 text-[#FF5A1F]" />
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1A1A2E] tracking-tight">
            Got Questions? <span className="text-[#FF5A1F]">We Have Answers</span>
          </h2>
          <p className="text-base text-[#64647A] leading-relaxed">
            Everything you need to know about Weekie AI Captions and our rendering workflow.
          </p>
        </div>

        {/* Two-Column Accordion Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="bg-white border border-[#F3EADF] rounded-2xl p-6 transition-all duration-200"
              >
                <button
                  onClick={() => toggleIndex(i)}
                  className="flex w-full items-center justify-between text-left gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="text-base font-bold text-[#1A1A2E]">
                    {faq.question}
                  </span>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF3EB] text-[#FF5A1F] transition-transform duration-300 shrink-0 ${
                      isOpen ? "rotate-180 bg-[#FF5A1F] text-white" : ""
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-[#F3EADF] text-xs text-[#64647A] leading-relaxed animate-fade-up">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
