"use client";

import Link from "next/link";
import { Film, Play, Clock, ArrowUpRight } from "lucide-react";
import { CAPTION_STYLE_CONFIGS } from "~/lib/caption-styles";
import { formatDuration } from "~/lib/utils";
import type { CaptionJob } from "~/types/caption";

interface CaptionJobCardProps {
  job: CaptionJob;
}

function getStatusIndicator(status: CaptionJob["status"]) {
  switch (status) {
    case "completed":
      return { bg: "bg-[#FFF7ED]", border: "border-[#FED7AA]", text: "text-[#EA580C]", dot: "bg-[#F97316]", label: "Completed" };
    case "processing":
    case "uploading":
      return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500 animate-pulse", label: "Rendering" };
    case "failed":
      return { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500", label: "Failed" };
    default:
      return { bg: "bg-slate-100", border: "border-slate-200", text: "text-slate-600", dot: "bg-slate-400", label: "Pending" };
  }
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60)
    return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
  if (diffHours < 24)
    return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7)
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CaptionJobCard({ job }: CaptionJobCardProps) {
  const styleConfig = CAPTION_STYLE_CONFIGS[job.captionStyle];
  const statusIndicator = getStatusIndicator(job.status);

  return (
    <Link
      href={`/captions/${job.id}`}
      className="card-white p-5 bg-white border border-[#FED7AA]/60 flex flex-col justify-between group block"
    >
      <div>
        {/* Media Thumbnail Box */}
        <div className="mb-4 overflow-hidden rounded-xl bg-[#FFF7ED] border border-[#FED7AA]/60 relative">
          <div
            className="flex items-center justify-center text-[#F97316]/60 group-hover:text-[#F97316] transition-colors relative"
            style={{ aspectRatio: "16/9" }}
          >
            {job.status === "completed" && job.backendJobId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8095"}/api/thumbnail/${job.backendJobId}`}
                alt={`Thumbnail for ${job.originalFileName}`}
                className="absolute inset-0 w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  // Fallback to film icon if thumbnail fails
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ display: job.status === "completed" ? "none" : "flex" }}
            >
              <Film className="h-9 w-9 transition-transform group-hover:scale-110" />
            </div>
          </div>

          {/* Play overlay for completed jobs */}
          {job.status === "completed" && job.backendJobId && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-black/50 backdrop-blur-sm text-white">
                <Play className="h-5 w-5 ml-0.5" />
              </div>
            </div>
          )}

          <div className="absolute top-2 right-2 flex items-center justify-center h-7 w-7 rounded-full bg-white/90 shadow-sm border border-[#FED7AA] text-[#F97316] group-hover:bg-[#F97316] group-hover:text-white transition-colors">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        {/* Original File Name */}
        <p
          className="mb-2 truncate font-bold text-sm text-[#0F172A] group-hover:text-[#F97316] transition-colors"
          title={job.originalFileName}
        >
          {job.originalFileName}
        </p>

        {/* Style Badge & Duration */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-2.5 py-0.5 text-[11px] font-bold text-[#EA580C]">
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full border border-black/10 shadow-inner"
              style={{
                background: `linear-gradient(135deg, ${styleConfig.primaryColor} 50%, ${styleConfig.highlightColor} 50%)`,
              }}
            />
            {styleConfig.name}
          </span>

          {job.durationSeconds !== null && (
            <span className="text-[11px] text-[#64748B] flex items-center gap-1 font-semibold">
              <Clock className="h-3 w-3 text-[#94A3B8]" />
              {formatDuration(job.durationSeconds)}
            </span>
          )}
        </div>
      </div>

      {/* Status + Relative Date Footer */}
      <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3 text-[11px]">
        <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 border ${statusIndicator.bg} ${statusIndicator.border}`}>
          <span
            className={`h-2 w-2 rounded-full ${statusIndicator.dot}`}
          />
          <span className={`font-bold uppercase tracking-wider ${statusIndicator.text}`}>
            {statusIndicator.label}
          </span>
        </div>
        <span className="text-[#94A3B8] font-medium">
          {formatRelativeDate(job.createdAt)}
        </span>
      </div>
    </Link>
  );
}
