"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, Loader2, Upload, Mic, Film, Download, Sparkles, Volume2 } from "lucide-react";
import { getCaptionJobStatus } from "~/actions/captions";
import type { CaptionJob, CaptionPhase } from "~/types/caption";

interface ProcessingViewProps {
  jobId: string | null;
  uploadProgress?: number | null;
  onComplete: (jobId: string) => void;
  onError: (error: string) => void;
}

const PHASES: { id: CaptionPhase; label: string; icon: React.ReactNode }[] = [
  { id: "uploading", label: "Uploading", icon: <Upload className="h-4 w-4" /> },
  { id: "transcribing", label: "Whisper AI", icon: <Mic className="h-4 w-4" /> },
  { id: "burning", label: "ASS Burning", icon: <Film className="h-4 w-4" /> },
  { id: "finalizing", label: "Finalizing HD", icon: <Download className="h-4 w-4" /> },
];

const PHASE_ORDER: CaptionPhase[] = ["uploading", "transcribing", "burning", "finalizing"];

// Rotating tip messages while processing
const PROCESSING_TIPS = [
  "🎯 Hormozi style: Bold cyan words grab attention instantly",
  "🎮 MrBeast style: Yellow on black — proven viral formula",
  "🎵 Karaoke style: Left-to-right wipe keeps viewers engaged",
  "✨ Position captions at 10–20% from bottom for best visibility",
  "🌍 Whisper AI detects 99+ languages automatically",
  "📱 Short-form content with captions gets 40% more engagement",
  "🔤 Word-level timestamps create perfectly synced highlights",
  "🚀 Faster-Whisper processes audio 4× faster than standard Whisper",
];

// Simulated timed words looping to preview caption style animations
const MOCK_WORDS = [
  { word: "THIS", color: "#00FFFF", style: "hormozi" },
  { word: "IS", color: "#00FFFF", style: "hormozi" },
  { word: "HOW", color: "#FFFF00", style: "mrbeast" },
  { word: "WEEKIE", color: "#F97316", style: "mrbeast" },
  { word: "AI", color: "#22C55E", style: "bounce" },
  { word: "GENERATES", color: "#EC4899", style: "hormozi" },
  { word: "VIRAL", color: "#FFFF00", style: "mrbeast" },
  { word: "ANIMATED", color: "#FFFF00", style: "mrbeast" },
  { word: "CAPTIONS", color: "#00FFFF", style: "hormozi" },
  { word: "INSTANTLY!", color: "#22C55E", style: "bounce" },
];

function getPhaseLabel(
  status: string | undefined,
  phase: CaptionPhase | null,
  progress: number,
  hasJobId: boolean,
  uploadProgress: number | null | undefined
): string {
  if (!hasJobId) {
    if (uploadProgress === null || uploadProgress === undefined || uploadProgress === 0) {
      return "Waking up AI engine...";
    }
    return "Uploading video...";
  }

  if (status === "completed") {
    return "Done! Downloading...";
  }
  if (status === "failed") {
    return "Error generating captions";
  }

  switch (phase) {
    case "uploading":
      return "Uploading video...";
    case "transcribing":
      if (progress <= 15) return "Extracting audio...";
      return "AI transcribing...";
    case "burning":
      return "Generating captions...";
    case "finalizing":
      return "Finalizing video...";
    default:
      return "Processing video...";
  }
}

function getPhaseIndex(phase: CaptionPhase | null): number {
  if (!phase) return 0;
  return PHASE_ORDER.indexOf(phase);
}

function getActiveTagline(
  status: string | undefined,
  phase: CaptionPhase | null,
  progress: number,
  hasJobId: boolean,
  uploadProgress: number | null | undefined
): string {
  if (!hasJobId) {
    if (uploadProgress === null || uploadProgress === undefined || uploadProgress === 0) {
      return "Waking up AI engine... (this may take 30 seconds on first use)";
    }
    return `Uploading video... ${Math.round(progress)}% progress`;
  }
  if (status === "completed") {
    return "Done! Downloading completed video...";
  }
  if (status === "failed") {
    return "Processing failed. Please check error message below.";
  }

  switch (phase) {
    case "uploading":
      return "Uploading media bytes to AI engine...";
    case "transcribing":
      if (progress <= 15) {
        return "Extracting audio track & pre-processing voice frequencies...";
      }
      return "AI transcribing: Running Whisper speech-to-text...";
    case "burning":
      return "Generating captions: Aligning style presets & rendering subtitles...";
    case "finalizing":
      return "Finalizing video: Burning ASS subtitles & saving output MP4...";
    default:
      return "Processing media...";
  }
}

export function ProcessingView({ jobId, uploadProgress, onComplete, onError }: ProcessingViewProps) {
  const [job, setJob] = useState<CaptionJob | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  
  // Custom states for simulated caption player
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [waveHeights, setWaveHeights] = useState<number[]>([30, 45, 20, 60, 40, 15, 50, 35, 25, 45, 15, 60, 30, 20, 40]);

  // Rotate tips every 4 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % PROCESSING_TIPS.length);
    }, 4000);
    return () => clearInterval(tipInterval);
  }, []);

  // Animate mock caption words and soundwaves
  useEffect(() => {
    const wordInterval = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % MOCK_WORDS.length);
      // Randomize audio waveforms slightly
      setWaveHeights((prev) =>
        prev.map(() => Math.floor(Math.random() * 50) + 15)
      );
    }, 380);
    return () => clearInterval(wordInterval);
  }, []);

  useEffect(() => {
    let retryCount = 0;
    const startTime = Date.now();

    async function poll() {
      if (!jobId) return;

      // 10 minute timeout check (600 seconds)
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      if (elapsedSeconds > 600) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onError("Processing timed out after 10 minutes — please try again.");
        return;
      }

      try {
        const result = await getCaptionJobStatus(jobId);
        if (!result) {
          throw new Error("Empty status payload");
        }
        
        // Reset retry count on successful fetch
        retryCount = 0;
        setJob(result);

        if (result.status === "completed") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onComplete(jobId);
        } else if (result.status === "failed") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onError(result.errorMessage ?? "Processing failed. Please try again.");
        }
      } catch (err) {
        retryCount++;
        if (retryCount >= 5) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onError(`Connection failed: ${err instanceof Error ? err.message : String(err)}. Stopped polling after 5 retries.`);
        }
      }
    }

    if (jobId) {
      poll();
      intervalRef.current = setInterval(poll, 2500);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [jobId, onComplete, onError]);

  const currentPhase: CaptionPhase = job?.currentPhase ?? "uploading";
  const progress = job ? job.progress : (uploadProgress ?? 15);
  const currentPhaseIndex = getPhaseIndex(currentPhase);
  const activeTagline = getActiveTagline(job?.status, currentPhase, progress, Boolean(jobId), uploadProgress);

  if (job?.status === "failed") {
    return (
      <div className="card-white p-8 bg-white border border-red-200 flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <Film className="h-7 w-7" />
        </div>
        <div>
          <p className="font-bold text-lg text-[#0F172A]">Caption Burning Failed</p>
          <p className="mt-1 text-xs text-[#64748B]">
            {job.errorMessage ?? "Processing failed. Please try again."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-orange text-xs py-2.5 px-5"
        >
          Retry Caption Job
        </button>
      </div>
    );
  }

  const activeWord = MOCK_WORDS[activeWordIndex]!;

  return (
    <div className="flex flex-col gap-5 text-[#0F172A]">
      
      {/* === SIMULATED DYNAMIC CAPTION PREVIEW PLAYER === */}
      <div 
        className="relative overflow-hidden rounded-2xl border border-[#FED7AA] bg-slate-950 shadow-xl flex flex-col items-center justify-between p-6 select-none" 
        style={{ aspectRatio: "16/9" }}
      >
        {/* Animated fluid sunset mesh background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#EA580C]/20 via-[#0F172A] to-[#F97316]/10 opacity-70 animate-pulse" />
        
        {/* Top bar mockup overlay */}
        <div className="w-full flex items-center justify-between text-[10px] font-bold text-[#94A3B8]/60 z-10">
          <span className="flex items-center gap-1.5 uppercase tracking-widest bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
            <Volume2 className="h-3.5 w-3.5 text-[#F97316]" />
            Audio Wave Sync
          </span>
          <span className="bg-[#F97316]/20 border border-[#F97316]/40 px-2.5 py-1 rounded-full text-[#F97316] uppercase tracking-widest flex items-center gap-1 animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            {progress}% Completed
          </span>
        </div>

        {/* Center: Flashing Kinetic Typography (Viral Caption style popping) */}
        <div className="flex items-center justify-center flex-1 w-full z-10">
          <div 
            className="text-center font-black uppercase text-4xl sm:text-5xl tracking-tighter px-4 py-2 transition-all duration-300 transform scale-110"
            style={{
              color: activeWord.color,
              textShadow: activeWord.style === "mrbeast" 
                ? "3px 3px 0px #000000, -3px -3px 0px #000000, 3px -3px 0px #000000, -3px 3px 0px #000000"
                : `0px 4px 12px ${activeWord.color}50`,
              transform: activeWord.style === "bounce" 
                ? "scale(1.25) translateY(-8px)" 
                : "scale(1.1)",
            }}
          >
            {activeWord.word}
          </div>
        </div>

        {/* Bottom SoundWave EQ Bars + Overlay Info */}
        <div className="w-full flex flex-col items-center gap-3 z-10">
          <div className="flex items-end justify-center gap-1 h-12 w-full">
            {waveHeights.map((h, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-[#EA580C] to-[#F97316] opacity-70 transition-all duration-200"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="h-2.5 w-2.5 rounded-full bg-[#F97316] animate-ping flex-shrink-0" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate">
                {activeTagline}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-[#F97316]/20 border border-[#F97316]/40 px-2.5 py-0.5 text-[9px] font-bold text-[#F97316] uppercase tracking-wider flex-shrink-0 ml-2 animate-pulse">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              Processing
            </div>
          </div>
        </div>
      </div>

      {/* === PROCESSING STATUS CARD === */}
      <div className="card-white p-5 bg-white border border-[#FED7AA]/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF7ED] border border-[#FED7AA] text-[#F97316]">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#0F172A]">
                {getPhaseLabel(job?.status, currentPhase, progress, Boolean(jobId), uploadProgress)}
              </p>
              <p className="text-[11px] text-[#64748B]">Weekie AI Engine pipeline active</p>
            </div>
          </div>
          <span className="font-mono text-sm font-black text-[#F97316]">{progress}%</span>
        </div>

        <div className="mb-4 h-2.5 w-full rounded-full bg-[#FFF7ED] border border-[#FED7AA] overflow-hidden">
          <div
            className="h-full bg-[#F97316] transition-all duration-700 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {PHASES.map((phase, index) => {
            const isCompleted = currentPhaseIndex > index;
            const isActive = currentPhaseIndex === index;

            return (
              <div key={phase.id} className="flex flex-col items-center gap-1.5 text-center">
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-xl border transition-all",
                    isCompleted
                      ? "border-[#F97316] bg-[#F97316] text-white shadow-md shadow-orange-500/20"
                      : isActive
                      ? "border-[#F97316] bg-[#FFF7ED] text-[#F97316] animate-pulse"
                      : "border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8]",
                  ].join(" ")}
                >
                  {isCompleted ? <CheckCircle className="h-4 w-4" /> : phase.icon}
                </div>
                <span
                  className={[
                    "text-[10px] uppercase tracking-wider font-bold",
                    isCompleted ? "text-[#F97316]" : isActive ? "text-[#EA580C]" : "text-[#CBD5E1]",
                  ].join(" ")}
                >
                  {phase.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* === ROTATING TIP CARD === */}
      <div className="card-white p-4 bg-[#FFF7ED] border border-[#FED7AA] flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[#F97316] text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-[#EA580C] uppercase tracking-wider mb-0.5">
            Pro Tip
          </p>
          <p
            key={currentTipIndex}
            className="text-xs text-[#475569] leading-relaxed transition-all duration-500"
          >
            {PROCESSING_TIPS[currentTipIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
