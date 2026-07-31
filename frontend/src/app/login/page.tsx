"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { GoogleAuthButton } from "@/components/google-auth-button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Store user session state locally
    if (typeof window !== "undefined") {
      localStorage.setItem("weekie_user", JSON.stringify({ email, name: email.split("@")[0] || "Creator" }));
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
            <h1 className="text-2xl font-bold text-[#0F172A] mt-2">Welcome Back</h1>
            <p className="text-xs text-[#64748B] mt-1">
              Sign in to access your personal Caption Studio & saved projects
            </p>
          </div>

          {/* Google OAuth Button */}
          <div className="mb-6">
            <GoogleAuthButton label="Continue with Google" redirectUrl="/studio" />
            <div className="relative my-6 flex items-center justify-center">
              <div className="w-full border-t border-[#E2E8F0]" />
              <span className="absolute bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                or sign in with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#334155]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#F97316] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
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

            <button
              type="submit"
              disabled={isLoading}
              className="btn-orange w-full py-3.5 text-sm flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? "Signing In..." : "Sign In to Studio"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Guarantee pill */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#64748B] pt-4 border-t border-[#F1F5F9]">
            <CheckCircle className="h-4 w-4 text-[#F97316]" />
            <span>Secure account & instant access to Caption Studio</span>
          </div>

          <p className="mt-6 text-center text-xs text-[#64748B]">
            New to Weekie AI Captions?{" "}
            <Link href="/register" className="font-bold text-[#F97316] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
