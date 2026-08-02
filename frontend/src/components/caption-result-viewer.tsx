"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { deleteCaptionJob } from "~/actions/captions";
import { CAPTION_STYLE_CONFIGS } from "~/lib/caption-styles";
import { clientEnv } from "~/lib/env";
import { formatDuration, formatBytes } from "~/lib/utils";
import type { CaptionJob } from "~/types/caption";

interface CaptionResultViewerProps {
  job: CaptionJob;
}

function formatProcessingTime(ms: number): string {
  const seconds = ms / 1000;
  return `${seconds.toFixed(1)}s`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CaptionResultViewer({ job }: CaptionResultViewerProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  const styleConfig = CAPTION_STYLE_CONFIGS[job.captionStyle];
  const backendBaseUrl = clientEnv.NEXT_PUBLIC_BACKEND_URL;
  const downloadUrl = job.backendJobId
    ? `${backendBaseUrl}/api/download/${job.backendJobId}`
    : null;

  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!downloadUrl) return;
    e.preventDefault();
    try {
      const res = await fetch(downloadUrl, { method: "HEAD" });
      if (res.status === 410) {
        setErrorState("Your video was processed but the file expired (free tier servers reset after inactivity). Please generate captions again — it will be faster since the AI model is already loaded.");
        return;
      }
      // Trigger actual download via dynamic link
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `captioned-${job.originalFileName}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.location.href = downloadUrl;
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCaptionJob(job.id);
      router.push("/history");
    } catch {
      setIsDeleting(false);
    }
  };

  if (job.status === "processing" || job.status === "uploading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FFFDF9] p-6 text-[#0F172A]">
        <Loader2 className="h-8 w-8 animate-spin text-[#F97316]" />
        <p className="font-bold text-lg text-[#0F172A]">
          Captions actively processing...
        </p>
        <Link
          href="/studio"
          className="text-xs uppercase tracking-wider font-bold text-[#F97316] hover:underline"
        >
          Return to Studio Workspace
        </Link>
      </div>
    );
  }

  if (job.status === "failed") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FFFDF9] p-6 text-[#0F172A]">
        <div className="card-white border-red-300 bg-white p-8 text-center max-w-md">
          <p className="font-bold text-lg text-red-600 mb-2">
            Caption Burning Failed
          </p>
          <p className="text-xs text-[#64748B]">
            {job.errorMessage ?? "An unexpected error occurred during rendering."}
          </p>
        </div>
        <Link
          href="/history"
          className="btn-orange-ghost text-xs py-2 px-4"
        >
          Back to Saved History
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#0F172A]">
      {/* Top bar */}
      <div className="sticky top-20 z-10 border-b border-[#FED7AA]/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
          <Link
            href="/history"
            className="flex items-center gap-1.5 border border-[#FED7AA] bg-[#FFF7ED] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#F97316] rounded-xl hover:bg-[#F97316] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            History
          </Link>

          <p
            className="flex-1 truncate font-bold text-sm text-[#0F172A]"
            title={job.originalFileName}
          >
            {job.originalFileName}
          </p>

          <div className="flex items-center gap-3">
            {downloadUrl && (
              <a
                href={downloadUrl}
                download={`captioned-${job.originalFileName}`}
                onClick={handleDownload}
                className="btn-orange text-xs py-2 px-4 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Video
              </a>
            )}

            <AlertDialog>
              <AlertDialogTrigger
                disabled={isDeleting}
                className="flex cursor-pointer items-center gap-1.5 border border-red-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-600 rounded-xl transition-colors hover:bg-red-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </AlertDialogTrigger>
              <AlertDialogContent className="border-[#FED7AA] bg-white text-[#0F172A]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-bold text-[#0F172A]">
                    Delete Caption Record?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-xs text-[#64748B]">
                    This action permanently deletes the job metadata and output video file.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC]">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => void handleDelete()}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete Permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Video player */}
          <div className="lg:col-span-8">
            <div className="card-white p-4 bg-white border border-[#FED7AA]/60">
              {errorState && (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800">
                  {errorState}
                </div>
              )}
              {downloadUrl ? (
                <video
                  controls
                  className="w-full bg-black rounded-xl border border-[#E2E8F0]"
                  style={{ maxHeight: "70vh" }}
                  onError={async () => {
                    try {
                      if (!downloadUrl) return;
                      const res = await fetch(downloadUrl, { method: "HEAD" });
                      if (res.status === 410) {
                        setErrorState("Your video was processed but the file expired (free tier servers reset after inactivity). Please generate captions again — it will be faster since the AI model is already loaded.");
                      }
                    } catch {}
                  }}
                >
                  <source src={downloadUrl} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs text-[#64748B]">
                  Video output not found
                </div>
              )}
            </div>
          </div>

          {/* Right: Details Card */}
          <div className="lg:col-span-4">
            <div className="card-white p-6 bg-white border border-[#FED7AA]/60">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#F97316] border-b border-[#F1F5F9] pb-3 mb-4">
                Video Specifications
              </h2>

              <dl className="space-y-4 text-xs">
                {job.durationSeconds !== null && (
                  <div className="border-b border-[#F1F5F9] pb-2">
                    <dt className="text-[#64748B] uppercase tracking-wider font-semibold">Duration</dt>
                    <dd className="mt-1 text-sm font-bold text-[#0F172A]">
                      {formatDuration(job.durationSeconds)}
                    </dd>
                  </div>
                )}

                {job.language && (
                  <div className="border-b border-[#F1F5F9] pb-2">
                    <dt className="text-[#64748B] uppercase tracking-wider font-semibold">Language Detected</dt>
                    <dd className="mt-1 text-sm font-bold text-[#0F172A]">
                      {job.language}
                    </dd>
                  </div>
                )}

                <div className="border-b border-[#F1F5F9] pb-2">
                  <dt className="text-[#64748B] uppercase tracking-wider font-semibold">Caption Style</dt>
                  <dd className="mt-1 flex items-center gap-2 text-sm font-bold text-[#0F172A]">
                    <span
                      className="h-3 w-3 rounded-full border border-black/10"
                      style={{
                        background: `linear-gradient(135deg, ${styleConfig.primaryColor} 50%, ${styleConfig.highlightColor} 50%)`,
                      }}
                    />
                    {styleConfig.name}
                  </dd>
                </div>

                <div className="border-b border-[#F1F5F9] pb-2">
                  <dt className="text-[#64748B] uppercase tracking-wider font-semibold">Vertical Position</dt>
                  <dd className="mt-1 text-sm font-bold text-[#0F172A]">
                    {job.captionPosition}% from bottom
                  </dd>
                </div>

                {job.processingTimeMs !== null && (
                  <div className="border-b border-[#F1F5F9] pb-2">
                    <dt className="text-[#64748B] uppercase tracking-wider font-semibold">Render Duration</dt>
                    <dd className="mt-1 text-sm font-bold text-[#F97316]">
                      {formatProcessingTime(job.processingTimeMs)}
                    </dd>
                  </div>
                )}

                <div className="border-b border-[#F1F5F9] pb-2">
                  <dt className="text-[#64748B] uppercase tracking-wider font-semibold">File Size</dt>
                  <dd className="mt-1 text-sm font-bold text-[#0F172A]">
                    {formatBytes(job.fileSize)}
                  </dd>
                </div>

                <div>
                  <dt className="text-[#64748B] uppercase tracking-wider font-semibold">Created</dt>
                  <dd className="mt-1 text-xs text-[#64748B]">
                    {formatDate(job.createdAt)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
