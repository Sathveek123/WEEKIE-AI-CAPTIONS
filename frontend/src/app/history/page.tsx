import Link from "next/link";
import { Film, Sparkles, Video, ArrowRight, FolderOpen } from "lucide-react";
import { getCaptionJobs } from "~/actions/captions";
import { CaptionJobCard } from "~/components/caption-job-card";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const jobs = await getCaptionJobs();

  return (
    <section className="min-h-screen bg-[#FFFDF9] text-[#0F172A] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#FED7AA]/60 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF7ED] border border-[#FED7AA] px-3 py-1 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-2">
              <FolderOpen className="h-3.5 w-3.5 text-[#F97316]" />
              {jobs.length} Saved {jobs.length === 1 ? "Project" : "Projects"}
            </div>
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
              Saved Captions <span className="text-[#F97316]">Archive</span>
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Browse, preview, download, or manage your generated ASS subtitle videos.
            </p>
          </div>

          <div>
            <Link
              href="/studio"
              className="btn-orange text-xs py-3 px-5 flex items-center gap-2"
            >
              <Video className="h-4 w-4" />
              Create New Captions
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {jobs.length === 0 ? (
          /* Empty State */
          <div className="card-white p-12 bg-white border border-[#FED7AA]/60 flex flex-col items-center justify-center gap-4 py-20 text-center max-w-md mx-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] text-[#F97316]">
              <Film className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                No Saved Caption Records
              </h2>
              <p className="mt-1 text-xs text-[#64748B]">
                Upload your first video clip to start burning viral animated subtitles.
              </p>
            </div>
            <Link href="/studio" className="btn-orange text-xs py-3 px-6 mt-2">
              Open Caption Studio
            </Link>
          </div>
        ) : (
          /* Job Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <CaptionJobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
