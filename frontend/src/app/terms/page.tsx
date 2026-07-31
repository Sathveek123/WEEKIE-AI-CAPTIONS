import { Shield, FileText, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Weekie AI Captions Generator",
  description: "Terms and conditions of using the Weekie AI Captions Generator platform.",
};

export default function TermsPage() {
  return (
    <section className="min-h-screen bg-[#FFFDF9] py-16 px-6">
      <div className="mx-auto max-w-4xl">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF7ED] border border-[#FED7AA] px-4 py-1.5 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-3">
            <FileText className="h-4 w-4 text-[#F97316]" />
            Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
            Terms of <span className="text-[#F97316]">Service</span>
          </h1>
          <p className="mt-3 text-sm text-[#64748B]">
            Last updated: July 22, 2026. Please read these terms carefully before utilizing our software.
          </p>
        </div>

        {/* Content Card */}
        <div className="card-white p-8 sm:p-12 bg-white border border-[#FED7AA]/60 space-y-8 text-xs sm:text-sm text-[#475569] leading-relaxed">
          
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#F1F5F9] pb-2">
              <CheckCircle className="h-5 w-5 text-[#F97316]" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the Weekie AI Captions Generator application (both our self-hosted software package and cloud-assisted integrations), you agree to be bound by these Terms of Service. If you do not agree, you must immediately terminate use of our application.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#F1F5F9] pb-2">
              <CheckCircle className="h-5 w-5 text-[#F97316]" />
              2. License & Local Self-Hosting
            </h2>
            <p>
              Weekie AI Captions Generator provides a license to run the software on your local machines and servers. 
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>You may use the self-hosted version for personal or commercial projects with zero limitations.</li>
              <li>You are responsible for obtaining the necessary hardware requirements (including compatible CPU/GPU specs) to run the Faster-Whisper and FFmpeg modules.</li>
              <li>You may not modify, repackage, or resell the core engine as a standalone software subscription without explicit written consent.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#F1F5F9] pb-2">
              <CheckCircle className="h-5 w-5 text-[#F97316]" />
              3. Data Ownership & Content Responsibility
            </h2>
            <p>
              Since processing occurs locally, you retain absolute ownership over all uploaded video files, audio tracks, and output files. 
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>We do not store, review, or collect your files on our servers (excluding optional cloud backups configured in Creator Pro/Agency tiers).</li>
              <li>You are solely responsible for ensuring your source content does not violate intellectual property laws, copyright agreements, or local jurisdictions.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#F1F5F9] pb-2">
              <CheckCircle className="h-5 w-5 text-[#F97316]" />
              4. Subscription & Billing
            </h2>
            <p>
              Optional cloud processing tiers (Creator Pro & Agency Studio) are billed in advance on a recurring monthly cycle. You can cancel your subscription at any time via your user dashboard. Failure to pay monthly renewals will result in immediate downgrade to the Free Self-Hosted tier.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#F1F5F9] pb-2">
              <CheckCircle className="h-5 w-5 text-[#F97316]" />
              5. Disclaimer of Warranties
            </h2>
            <p>
              The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability.
            </p>
          </div>

          <div className="rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] p-4 flex gap-3.5 items-start">
            <Shield className="h-6 w-6 text-[#F97316] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-[#0F172A]">Data Integrity Guarantee</p>
              <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
                Because our software is built on local-first processing rules, your data remains fully offline in your own environment. No telemetry is collected during Whisper speech transcription.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
