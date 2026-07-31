"use client";

import { useState } from "react";
import { Cpu, Server, ShieldCheck, Code2, Sparkles, Send, Check } from "lucide-react";

export default function EnterprisePage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    volume: "1000",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API request
    setSubmitted(true);
  };

  return (
    <section className="min-h-screen bg-[#FFFDF9] py-16 px-6">
      <div className="mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF7ED] border border-[#FED7AA] px-4 py-1.5 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-3">
            <Sparkles className="h-4 w-4 text-[#F97316]" />
            Enterprise Infrastructure Solutions
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight">
            High-Performance Subtitle <span className="text-[#F97316]">Rendering at Scale</span>
          </h1>
          <p className="mt-4 text-base text-[#64748B] leading-relaxed">
            Connect your automated video production pipeline directly to our high-throughput Faster-Whisper transcription and FFmpeg burn-in engine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Capabilities Grid */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-2xl font-black text-[#0F172A] mb-4">
              Built For Automated Workflows & Bulk Ingestion
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Card 1 */}
              <div className="card-white p-6 bg-white border border-[#FED7AA]/60 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7ED] text-[#F97316] border border-[#FED7AA]">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">Dedicated Cloud GPUs</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Run subtitle renders on private high-compute Nvidia GPU clusters. Reduces 1-minute transcription processes down to under 3 seconds.
                </p>
              </div>

              {/* Card 2 */}
              <div className="card-white p-6 bg-white border border-[#FED7AA]/60 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7ED] text-[#F97316] border border-[#FED7AA]">
                  <Server className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">Multi-Node Clustering</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Set up distributed rendering endpoints across private servers. Built-in load balancers distribute processing queues dynamically.
                </p>
              </div>

              {/* Card 3 */}
              <div className="card-white p-6 bg-white border border-[#FED7AA]/60 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7ED] text-[#F97316] border border-[#FED7AA]">
                  <Code2 className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">Automated REST API</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Webhook notifications trigger immediately upon job completions. Feed outputs directly into auto-publishing content hooks.
                </p>
              </div>

              {/* Card 4 */}
              <div className="card-white p-6 bg-white border border-[#FED7AA]/60 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7ED] text-[#F97316] border border-[#FED7AA]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">Secure SLA Guarantee</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  99.9% processing uptime commitments with dedicated support managers. All connections run over strict encrypted tunnels.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] p-6">
              <p className="font-bold text-sm text-[#EA580C]">Are you an agency processing 10,000+ videos daily?</p>
              <p className="mt-1.5 text-xs text-[#475569] leading-relaxed">
                Contact our integrations team to set up a private sandbox server. We help configure custom Whisper parameters, fine-tuned speech dictionaries, and custom font mapping fallbacks.
              </p>
            </div>
          </div>

          {/* Right Column: Lead Form */}
          <div className="lg:col-span-5">
            <div className="card-white p-8 bg-white border border-[#FED7AA]">
              {submitted ? (
                <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF7ED] text-[#F97316] border border-[#FED7AA]">
                    <Check className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#0F172A]">Inquiry Submitted Successfully</h3>
                    <p className="mt-1.5 text-xs text-[#64748B] leading-relaxed">
                      Our integrations architect will contact you at <strong>{formData.email}</strong> within 12 business hours.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="btn-orange-ghost text-xs py-2 px-4 mt-2"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="border-b border-[#F1F5F9] pb-3 mb-2">
                    <h3 className="font-bold text-base text-[#0F172A]">Request Enterprise Portal</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">Fill out your requirements below to talk to an integrations engineer.</p>
                  </div>

                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#475569]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full bg-[#FFFDF9] border border-[#FED7AA] text-xs font-semibold rounded-xl px-3 py-2.5 text-[#0F172A] focus:outline-none focus:border-[#F97316]"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#475569]">
                      Work Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@company.com"
                      className="w-full bg-[#FFFDF9] border border-[#FED7AA] text-xs font-semibold rounded-xl px-3 py-2.5 text-[#0F172A] focus:outline-none focus:border-[#F97316]"
                    />
                  </div>

                  {/* Company */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#475569]">
                      Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Acma Corp"
                      className="w-full bg-[#FFFDF9] border border-[#FED7AA] text-xs font-semibold rounded-xl px-3 py-2.5 text-[#0F172A] focus:outline-none focus:border-[#F97316]"
                    />
                  </div>

                  {/* Volume */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#475569]">
                      Monthly Video Volume
                    </label>
                    <select
                      value={formData.volume}
                      onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                      className="w-full bg-[#FFFDF9] border border-[#FED7AA] text-xs font-bold rounded-xl px-3 py-2.5 text-[#0F172A] focus:outline-none focus:border-[#F97316]"
                    >
                      <option value="100">Less than 500 videos/mo</option>
                      <option value="1000">500 - 2,500 videos/mo</option>
                      <option value="5000">2,500 - 10,000 videos/mo</option>
                      <option value="10000">More than 10,000 videos/mo</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#475569]">
                      Describe Your Project / API Needs
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Detail your use-cases or integration architecture here..."
                      className="w-full bg-[#FFFDF9] border border-[#FED7AA] text-xs font-semibold rounded-xl px-3 py-2.5 text-[#0F172A] focus:outline-none focus:border-[#F97316] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-orange w-full py-3 text-xs tracking-wider flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Submit Lead Form
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
