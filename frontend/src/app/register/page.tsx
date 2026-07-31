"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { GoogleAuthButton } from "@/components/google-auth-button";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) return;
    setIsLoading(true);

    if (typeof window !== "undefined") {
      localStorage.setItem("weekie_user", JSON.stringify({ email, name: name || "Creator" }));
      document.cookie = "weekie_session=active; path=/; max-age=86400";
    }

    setTimeout(() => {
      setIsLoading(false);
      router.push("/studio");
    }, 600);
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
            <h1 className="text-2xl font-bold text-[#0F172A] mt-2">Create Your Account</h1>
            <p className="text-xs text-[#64748B] mt-1">
              Start generating viral animated captions with full HD exports
            </p>
          </div>

          {/* Google OAuth Button */}
          <div className="mb-6">
            <GoogleAuthButton label="Sign Up with Google" redirectUrl="/studio" />
            <div className="relative my-6 flex items-center justify-center">
              <div className="w-full border-t border-[#E2E8F0]" />
              <span className="absolute bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                or register with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#334155] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#94A3B8]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Creator"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-4 py-3 text-sm text-[#0F172A] focus:border-[#F97316] focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#334155] mb-1.5">
                Email Address
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

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#334155] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#94A3B8]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-4 py-3 text-sm text-[#0F172A] focus:border-[#F97316] focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="h-4 w-4 rounded border-[#CBD5E1] text-[#F97316] focus:ring-[#F97316]"
              />
              <label htmlFor="terms" className="text-xs text-[#64748B]">
                I agree to the{" "}
                <Link href="/terms" className="font-semibold text-[#F97316] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-semibold text-[#F97316] hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !agreedTerms}
              className="btn-orange w-full py-3.5 text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {isLoading ? "Creating Account..." : "Create Free Account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Privacy badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#64748B] pt-4 border-t border-[#F1F5F9]">
            <ShieldCheck className="h-4 w-4 text-[#F97316]" />
            <span>100% Free & Unlimited Caption Rendering</span>
          </div>

          <p className="mt-6 text-center text-xs text-[#64748B]">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#F97316] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
