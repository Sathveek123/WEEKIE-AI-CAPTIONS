import { Shield, EyeOff, Lock, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Weekie AI Captions Generator",
  description: "Privacy policy detailing our local-first data isolation rules.",
};

export default function PrivacyPage() {
  return (
    <section className="min-h-screen bg-[#FFFDF9] py-16 px-6">
      <div className="mx-auto max-w-4xl">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF7ED] border border-[#FED7AA] px-4 py-1.5 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-3">
            <Lock className="h-4 w-4 text-[#F97316]" />
            Privacy Safeguards
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
            Privacy <span className="text-[#F97316]">Policy</span>
          </h1>
          <p className="mt-3 text-sm text-[#64748B]">
            Your privacy is our absolute priority. Learn how our local-first processing architecture keeps your media 100% private.
          </p>
        </div>

        {/* Content Card */}
        <div className="card-white p-8 sm:p-12 bg-white border border-[#FED7AA]/60 space-y-8 text-xs sm:text-sm text-[#475569] leading-relaxed">
          
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#F1F5F9] pb-2">
              <CheckCircle className="h-5 w-5 text-[#F97316]" />
              1. 100% Local Processing Model
            </h2>
            <p>
              By default, Weekie AI Captions Generator runs completely offline in your local environment. Video uploads to the Caption Studio are written directly to your local file system, and voice activity transcription is executed on your local CPU or GPU.
            </p>
            <p className="font-bold text-[#0F172A]">
              We do NOT send your media files, transcription logs, or output MP4s to any external server.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#F1F5F9] pb-2">
              <CheckCircle className="h-5 w-5 text-[#F97316]" />
              2. Data Collected in Cloud Tiers
            </h2>
            <p>
              If you choose to register an account or subscribe to our cloud-assisted tiers (Creator Pro / Agency Studio), we collect only the necessary account details:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>**Account Information:** Name, email address, password hashes, and payment details (processed securely via Stripe).</li>
              <li>**Cloud Backups:** If explicitly enabled by you, we backup your captioned outputs securely in encrypted AWS S3 buckets.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#F1F5F9] pb-2">
              <CheckCircle className="h-5 w-5 text-[#F97316]" />
              3. Local Database & Telemetry
            </h2>
            <p>
              Metadata concerning your rendering jobs is stored in a local SQLite database (`data/captions.db`) managed via Prisma. No analytics or tracking tags are injected. 
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#F1F5F9] pb-2">
              <CheckCircle className="h-5 w-5 text-[#F97316]" />
              4. Cookies and Web Storage
            </h2>
            <p>
              We use standard local storage (`localStorage`) in your web browser to persist your workspace UI preferences (such as selected preset styles, custom font sizes, and speaker diarization checkboxes) and session auth credentials.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#F1F5F9] pb-2">
              <CheckCircle className="h-5 w-5 text-[#F97316]" />
              5. Third-Party Integrations
            </h2>
            <p>
              When utilizing translation engines (such as the automatic Google Translate integration for Indic scripts), only the plain subtitle segments text array is sent to Google's translation API. The video media files are never shared.
            </p>
          </div>

          <div className="rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] p-4 flex gap-3.5 items-start">
            <EyeOff className="h-6 w-6 text-[#F97316] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-[#0F172A]">Zero Tracker Policy</p>
              <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
                We believe video editing should be completely private. We do not integrate Google Analytics, Hotjar, or Facebook Pixel trackers into the Caption Studio workspace.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
