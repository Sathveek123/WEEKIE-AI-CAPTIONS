import { HelpCircle, RefreshCw, Landmark, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Refund Policy | Weekie AI Captions Generator",
  description: "Subscription billing and refund policy rules.",
};

export default function RefundPage() {
  return (
    <section className="min-h-screen bg-[#FFFDF9] py-16 px-6">
      <div className="mx-auto max-w-4xl">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF7ED] border border-[#FED7AA] px-4 py-1.5 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-3">
            <RefreshCw className="h-4 w-4 text-[#F97316]" />
            Billing Transparency
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
            Refund <span className="text-[#F97316]">Policy</span>
          </h1>
          <p className="mt-3 text-sm text-[#64748B]">
            Clear, transparent refund terms for our cloud subscription plans.
          </p>
        </div>

        {/* Content Card */}
        <div className="card-white p-8 sm:p-12 bg-white border border-[#FED7AA]/60 space-y-8 text-xs sm:text-sm text-[#475569] leading-relaxed">
          
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#F1F5F9] pb-2">
              <CheckCircle className="h-5 w-5 text-[#F97316]" />
              1. Free Self-Hosted Tier
            </h2>
            <p>
              Weekie AI Captions Generator is free to use forever on local self-hosted setups. You do not need to enter a credit card or pay anything to use the local processing engine. Therefore, there are no refund concerns for our core local services.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#F1F5F9] pb-2">
              <CheckCircle className="h-5 w-5 text-[#F97316]" />
              2. Cloud Subscriptions (Creator Pro & Agency Studio)
            </h2>
            <p>
              We provide monthly recurring subscriptions for advanced cloud features. Since these resources consume real-time GPUs and cloud processing servers upon generation, our refund boundaries are as follows:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>**7-Day Money-Back Guarantee:** If you are unsatisfied with your upgrade, you can contact support within 7 days of your initial purchase for a full refund.</li>
              <li>**Usage Threshold:** To prevent abuse, refunds will only be granted if you have processed fewer than 3 videos using our cloud render nodes.</li>
              <li>**Renewal Charges:** Monthly renewals are not refundable. You are responsible for cancelling your subscription before your renewal date.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#F1F5F9] pb-2">
              <CheckCircle className="h-5 w-5 text-[#F97316]" />
              3. Processing Issues & Glitches
            </h2>
            <p>
              If a video fails to render or burn-in due to a backend system glitch, the render credit is automatically refunded to your dashboard account within 10 minutes. If the problem persists, please submit a diagnostic ticket containing the log trace from your System Output Console.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#F1F5F9] pb-2">
              <CheckCircle className="h-5 w-5 text-[#F97316]" />
              4. Custom Enterprise Solutions
            </h2>
            <p>
              Enterprise installations and dedicated bulk APIs are governed under custom service contracts (SLAs). Refund policies for these setups will be negotiated and detailed in the signed service agreements.
            </p>
          </div>

          <div className="rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] p-4 flex gap-3.5 items-start">
            <Landmark className="h-6 w-6 text-[#F97316] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-[#0F172A]">Requesting a Refund</p>
              <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
                To request a subscription cancellation or refund, email support@weekieaicaptions.com with your user account email and payment receipt transaction number. Most refunds are processed within 2–5 business days.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
