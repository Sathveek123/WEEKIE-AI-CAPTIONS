"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 700);
  };

  return (
    <section className="min-h-[85vh] bg-[#FFFDF9] py-16 px-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card-white p-8 sm:p-10 border border-[#FED7AA]/60 bg-white">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316] text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-sans text-2xl font-black tracking-tight text-[#0F172A]">
                Weekie <span className="text-[#F97316]">AI Captions</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-[#0F172A] mt-2">Reset Password</h1>
            <p className="text-xs text-[#64748B] mt-1">
              Enter your email address and we'll send you a password reset link
            </p>
          </div>

          {isSubmitted ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Reset Link Sent!</h3>
                <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                  We've sent a password reset link to{" "}
                  <span className="font-semibold text-[#0F172A]">{email}</span>. Please check your inbox and follow the instructions.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="btn-orange w-full py-3 text-sm flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#334155] mb-2">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#94A3B8]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="creator@weekie.ai"
                    className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-4 py-3 text-sm text-[#0F172A] focus:border-[#F97316] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-orange w-full py-3.5 text-sm flex items-center justify-center gap-2"
              >
                {isLoading ? "Sending Reset Link..." : "Send Password Reset Link"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="pt-4 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#F97316] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
