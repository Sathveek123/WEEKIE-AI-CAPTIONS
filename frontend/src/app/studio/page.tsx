"use client";

import { useState, useEffect } from "react";
import { Sparkles, History, ShieldCheck, Terminal, Video, Sliders, Palette, HelpCircle, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VideoDropzone } from "~/components/video-dropzone";
import { CaptionStylePicker } from "~/components/caption-style-picker";
import { CaptionPreview } from "~/components/caption-preview";
import { ProcessingView } from "~/components/processing-view";
import { submitCaptionJob } from "~/actions/captions";
import {
  CAPTION_STYLE_CONFIGS,
  DEFAULT_CAPTION_STYLE,
  DEFAULT_CAPTION_POSITION,
} from "~/lib/caption-styles";
import type { CaptionStyle } from "~/types/caption";

import { GoogleAuthButton } from "~/components/google-auth-button";
import { Lock, LogIn, UserPlus } from "lucide-react";

type ViewState = "idle" | "uploading" | "processing" | "complete";

const LANGUAGE_OPTIONS = [
  { code: "auto", label: "Auto Detect Language" },
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi (हिंदी)" },
  { code: "te", label: "Telugu (తెలుగు)" },
  { code: "ta", label: "Tamil (தமிழ்)" },
  { code: "kn", label: "Kannada (ಕನ್ನಡ)" },
  { code: "ml", label: "Malayalam (മലയാളം)" },
  { code: "bn", label: "Bengali (বাংলা)" },
  { code: "gu", label: "Gujarati (ગુજરાતી)" },
  { code: "pa", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "mr", label: "Marathi (मराठी)" },
  { code: "ru", label: "Russian (Русский)" },
  { code: "zh", label: "Chinese (中文)" },
  { code: "ja", label: "Japanese (日本語)" },
  { code: "ko", label: "Korean (한국어)" },
  { code: "ar", label: "Arabic (العربية)" },
];

const TARGET_LANGUAGES = [
  { code: "none", label: "No Translation (Transcribe Native Spoken Language)" },
  { code: "en", label: "English — Direct Whisper AI Translation (task='translate')" },
  { code: "te", label: "Telugu (తెలుగు) — Indian Language Translation Path" },
  { code: "hi", label: "Hindi (हिंदी) — Indian Language Translation Path" },
  { code: "ta", label: "Tamil (தமிழ்) — Indian Language Translation Path" },
  { code: "kn", label: "Kannada (ಕನ್ನಡ) — Indian Language Translation Path" },
  { code: "ml", label: "Malayalam (മലയാളം) — Indian Language Translation Path" },
  { code: "bn", label: "Bengali (বাংলা) — Indian Language Translation Path" },
  { code: "gu", label: "Gujarati (ગુજરાતી) — Indian Language Translation Path" },
  { code: "pa", label: "Punjabi (ਪੰਜਾਬੀ) — Indian Language Translation Path" },
  { code: "mr", label: "Marathi (मराठी) — Indian Language Translation Path" },
];

export default function StudioPage() {
  const router = useRouter();

  const [viewState, setViewState] = useState<ViewState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [fileDuration, setFileDuration] = useState<number>(0);
  const [selectedStyle, setSelectedStyle] = useState<CaptionStyle>(DEFAULT_CAPTION_STYLE);
  const [captionPosition, setCaptionPosition] = useState(DEFAULT_CAPTION_POSITION);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Custom pipeline options
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("none");
  const [romanize, setRomanize] = useState(false);
  const [vad, setVad] = useState(false);
  const [multiSpeaker, setMultiSpeaker] = useState(false);
  const [captionMode, setCaptionMode] = useState<"word" | "phrase" | "sentence">("phrase");

  // Custom styling overrides
  const [fontSize, setFontSize] = useState("24px");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [outlineColor, setOutlineColor] = useState("#000000");
  const [boldText, setBoldText] = useState(true);

  // Logs Console
  const [logs, setLogs] = useState<string[]>([
    `[SYS] WeekieAI Panel initialized.`,
    `[00:52:03] Running in Web Browser mode`,
  ]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString(undefined, {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setLogs((prev) => [...prev, `[${timestamp}] ${msg}`]);
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("weekie_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUserName(parsed.name || parsed.email);
          setIsAuthenticated(true);
        } catch {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    }
  }, []);

  const handleFileSelect = (selectedFile: File, duration: number) => {
    setFile(selectedFile);
    setFileDuration(duration);
    setError(null);
    addLog(`Loaded source video: ${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)`);
    addLog(`Duration: ${Math.round(duration)} seconds`);
  };

  const handleFileClear = () => {
    setFile(null);
    setFileDuration(0);
    setError(null);
    addLog(`Cleared source video file.`);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setViewState("uploading");
    setUploadProgress(0);
    setError(null);
    addLog(`Initializing caption job request...`);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("captionStyle", selectedStyle);
    formData.append("captionPosition", String(captionPosition));
    formData.append("durationSeconds", String(fileDuration));

    // Custom pipeline variables
    formData.append("languageSource", sourceLanguage);
    formData.append("translate", targetLanguage !== "none" ? "true" : "false");
    formData.append("targetLanguage", targetLanguage !== "none" ? targetLanguage : "en");
    formData.append("romanize", romanize ? "true" : "false");
    formData.append("captionMode", captionMode);
    formData.append("vad", vad ? "true" : "false");
    formData.append("multiSpeaker", multiSpeaker ? "true" : "false");

    // Style overrides
    formData.append("fontSize", fontSize);
    formData.append("textColor", textColor);
    formData.append("outlineColor", outlineColor);
    formData.append("boldText", boldText ? "true" : "false");

    addLog(`Uploading media bytes to Flask backend server...`);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 90) return prev;
        return prev + 10;
      });
    }, 200);

    const result = await submitCaptionJob(formData);
    clearInterval(progressInterval);

    if ("error" in result) {
      setError(result.error);
      setViewState("idle");
      setUploadProgress(null);
      addLog(`[ERROR] Submission failed: ${result.error}`);
      return;
    }

    addLog(`Upload completed. Spawning background Whisper transcription thread...`);
    setUploadProgress(100);
    setJobId(result.jobId);
    setViewState("processing");
    setUploadProgress(null);
  };

  const handleProcessingComplete = (completedJobId: string) => {
    addLog(`Job completed successfully! Redirecting to preview viewer.`);
    setViewState("complete");
    router.push(`/captions/${completedJobId}`);
  };

  const handleProcessingError = (errorMessage: string) => {
    setError(errorMessage);
    setViewState("idle");
    setFile(null);
    setFileDuration(0);
    setUploadProgress(null);
    setJobId(null);
    addLog(`[ERROR] Processing failed: ${errorMessage}`);
  };

  const isUploading = viewState === "uploading";
  const isProcessing = viewState === "processing";
  if (isAuthenticated === false) {
    return (
      <section className="min-h-[85vh] bg-[#FFFDF9] py-20 px-6 flex items-center justify-center">
        <div className="w-full max-w-md text-center">
          <div className="card-white p-8 sm:p-10 border border-[#FED7AA]/60 bg-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF3EB] text-[#FF5A1F] border border-[#FFD8C7] mb-6 shadow-sm">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black text-[#0F172A]">Account Required</h1>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              Please sign in with Google or create an account to access the personal Caption Studio & AI video pipeline.
            </p>

            <div className="mt-8 space-y-4">
              <GoogleAuthButton label="Continue with Google" redirectUrl="/studio" />
              <div className="relative my-4 flex items-center justify-center">
                <div className="w-full border-t border-[#E2E8F0]" />
                <span className="absolute bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  or sign in with credentials
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login?redirect=/studio"
                  className="btn-coral-ghost py-3 text-xs flex items-center justify-center gap-1.5"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn-coral py-3 text-xs flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="h-4 w-4" />
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const styleConfig = CAPTION_STYLE_CONFIGS[selectedStyle];

  return (
    <section className="min-h-screen bg-[#FFFDF9] py-12 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Top Studio Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#FED7AA]/60 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF7ED] border border-[#FED7AA] px-3 py-1 text-xs font-bold text-[#F97316] uppercase tracking-wider mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              {userName ? `${userName}'s Workspace` : "Caption Studio"}
            </div>
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
              Caption Studio <span className="text-[#F97316]">Workspace</span>
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Configure Whisper speech-to-text, translation target, and customize final subtitle styling options.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/history"
              className="btn-orange-ghost text-xs py-2.5 px-4 flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              Saved Captions
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600">
            <strong>Studio Error:</strong> {error}
          </div>
        )}

        {/* Processing & Uploading State — Live Kinetic Preview & Progress Overlay */}
        {(isUploading || isProcessing) ? (
          <div className="card-white p-8 bg-white border border-[#FED7AA]">
            <ProcessingView
              jobId={jobId}
              uploadProgress={uploadProgress}
              onComplete={handleProcessingComplete}
              onError={handleProcessingError}
            />
          </div>
        ) : (
          /* Balanced Two-column Studio Layout */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* === LEFT COLUMN: Video Source & Engine Settings & Logs === */}
            <div className="space-y-6">
              {/* Step 1: Video Dropzone */}
              <div className="card-white p-6 bg-white border border-[#FED7AA]/60">
                <div className="flex items-center justify-between mb-4 border-b border-[#F1F5F9] pb-3">
                  <h2 className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F97316] text-white text-xs">1</span>
                    Upload Source Video
                  </h2>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    MP4, MOV, WebM
                  </span>
                </div>
                <VideoDropzone
                  file={file}
                  onFileSelect={handleFileSelect}
                  onFileClear={handleFileClear}
                  uploadProgress={uploadProgress}
                  disabled={isUploading}
                />
              </div>

              {/* Step 2: Advanced Speech Engine Configuration */}
              <div className="card-white p-6 bg-white border border-[#FED7AA]/60 space-y-5">
                <div className="flex items-center justify-between mb-2 border-b border-[#F1F5F9] pb-3">
                  <h2 className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F97316] text-white text-xs">2</span>
                    Advanced Speech Engine Settings
                  </h2>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#F97316]">
                    Whisper Core
                  </span>
                </div>

                {/* Source Language (Spoken) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                    Source Language (Spoken)
                  </label>
                  <select
                    value={sourceLanguage}
                    onChange={(e) => {
                      setSourceLanguage(e.target.value);
                      addLog(`Source language set to: ${e.target.options[e.target.selectedIndex].text}`);
                    }}
                    className="w-full bg-[#FFFDF9] border border-[#FED7AA] text-xs font-bold rounded-xl px-3.5 py-3 text-[#0F172A] focus:outline-none focus:border-[#F97316]"
                  >
                    {LANGUAGE_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Translate Target Language */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                    Translate Target Language
                  </label>
                  <select
                    value={targetLanguage}
                    onChange={(e) => {
                      setTargetLanguage(e.target.value);
                      addLog(`Translation target set to: ${e.target.options[e.target.selectedIndex].text}`);
                    }}
                    className="w-full bg-[#FFFDF9] border border-[#FED7AA] text-xs font-bold rounded-xl px-3.5 py-3 text-[#0F172A] focus:outline-none focus:border-[#F97316]"
                  >
                    {TARGET_LANGUAGES.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Switches */}
                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center justify-between border-b border-[#F1F5F9]/60 pb-3">
                    <div>
                      <span className="text-xs font-bold text-[#0F172A] block">
                        Romanize Indic Script
                      </span>
                      <span className="text-[10px] text-[#64748B] block mt-0.5">
                        Transliterate native Indian script characters phonetically to English (A-Z)
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={romanize}
                        onChange={(e) => {
                          setRomanize(e.target.checked);
                          addLog(`Romanization toggle set to: ${e.target.checked}`);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#E2E8F0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:height-4 after:h-4 after:w-4 after:transition-all peer-checked:bg-[#F97316]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between border-b border-[#F1F5F9]/60 pb-3">
                    <div>
                      <span className="text-xs font-bold text-[#0F172A] block">
                        VAD Silence Filter
                      </span>
                      <span className="text-[10px] text-[#64748B] block mt-0.5">
                        Use Voice Activity Detection filter to bypass silent audio stretches
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vad}
                        onChange={(e) => {
                          setVad(e.target.checked);
                          addLog(`VAD Silence Filter toggle set to: ${e.target.checked}`);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#E2E8F0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:height-4 after:h-4 after:w-4 after:transition-all peer-checked:bg-[#F97316]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <span className="text-xs font-bold text-[#0F172A] block">
                        Simulated Speaker Labels (Experimental)
                      </span>
                      <span className="text-[10px] text-[#64748B] block mt-0.5">
                        Applies turn-based [Speaker 1] / [Speaker 2] labels based on speech timing gaps (simulated heuristics, not voice recognition).
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={multiSpeaker}
                        onChange={(e) => {
                          setMultiSpeaker(e.target.checked);
                          addLog(`Multi-Speaker Mode toggle set to: ${e.target.checked}`);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#E2E8F0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:height-4 after:h-4 after:w-4 after:transition-all peer-checked:bg-[#F97316]"></div>
                    </label>
                  </div>
                </div>

                {/* Caption granularity mode */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                    Caption Mode (Granularity)
                  </label>
                  <div className="grid grid-cols-3 gap-2 bg-[#FFF7ED] border border-[#FED7AA] p-1 rounded-xl">
                    {(["word", "phrase", "sentence"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setCaptionMode(mode);
                          addLog(`Caption Mode set to: ${mode}`);
                        }}
                        className={`py-2 rounded-lg text-xs font-bold capitalize transition-colors ${
                          captionMode === mode
                            ? "bg-[#F97316] text-white shadow-sm"
                            : "text-[#EA580C] hover:bg-[#FFF7ED]"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 3: System Console log */}
              <div className="card-white p-5 bg-[#0F172A] border border-[#1E293B] text-[#38BDF8] font-mono text-xs rounded-2xl shadow-inner">
                <div className="flex items-center gap-2 mb-3 border-b border-[#1E293B] pb-2 text-[#94A3B8]">
                  <Terminal className="h-4 w-4" />
                  <span>SYSTEM OUTPUT CONSOLE</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                  {logs.map((log, index) => (
                    <div key={index} className="leading-relaxed whitespace-pre-wrap">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* === RIGHT COLUMN: Live Phone Preview & Subtitle Styles & Submit CTA === */}
            <div className="space-y-6">
              {/* Phone Mockup Preview */}
              <div className="card-white p-6 bg-white border border-[#FED7AA]/60 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-4 border-b border-[#F1F5F9] pb-3">
                  <h2 className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F97316] text-white text-xs">3</span>
                    Live Phone Preview
                  </h2>
                  <span className="text-[11px] text-[#64748B]">Drag vertical position</span>
                </div>

                <CaptionPreview
                  style={styleConfig}
                  position={captionPosition}
                  onPositionChange={setCaptionPosition}
                />
              </div>

              {/* Subtitle Style Picker and Font settings overrides */}
              <div className="card-white p-6 bg-white border border-[#FED7AA]/60 space-y-6">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                  <h2 className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F97316] text-white text-xs">4</span>
                    Subtitle Style & Overrides
                  </h2>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#F97316]">
                    Presets & Custom
                  </span>
                </div>

                <CaptionStylePicker
                  selectedStyle={selectedStyle}
                  onStyleChange={(style) => {
                    setSelectedStyle(style);
                    if (style === "mrbeast" || style === "karaoke") {
                      setTextColor("#FFD874");
                    } else if (style === "hormozi") {
                      setTextColor("#00FFFF");
                    } else if (style === "bounce") {
                      setTextColor("#FF00FF");
                    } else {
                      setTextColor("#FFFFFF");
                    }
                  }}
                />

                {/* Subtitle Style Overrides Panel */}
                <div className="border-t border-[#F1F5F9] pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Font Size Selection */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                      Font Size
                    </label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="w-full bg-[#FFFDF9] border border-[#FED7AA] text-xs font-bold rounded-xl px-3.5 py-2.5 text-[#0F172A] focus:outline-none"
                    >
                      <option value="18px">18px (Small)</option>
                      <option value="24px">24px (Normal)</option>
                      <option value="32px">32px (Large)</option>
                      <option value="40px">40px (Extra Large)</option>
                    </select>
                  </div>

                  {/* Position Selection */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                      Position
                    </label>
                    <select
                      value={captionPosition}
                      onChange={(e) => setCaptionPosition(Number(e.target.value))}
                      className="w-full bg-[#FFFDF9] border border-[#FED7AA] text-xs font-bold rounded-xl px-3.5 py-2.5 text-[#0F172A] focus:outline-none"
                    >
                      <option value="10">Bottom Margin (10%)</option>
                      <option value="20">Lower Third (20%)</option>
                      <option value="30">Center Lower (30%)</option>
                      <option value="50">Center (50%)</option>
                    </select>
                  </div>

                  {/* Text Color Picker */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-10 h-10 border border-[#FED7AA] rounded-xl cursor-pointer p-0 overflow-hidden"
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="flex-1 bg-[#FFFDF9] border border-[#FED7AA] text-xs font-bold rounded-xl px-3 py-2 text-[#0F172A] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Outline Color Picker */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                      Outline Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={outlineColor}
                        onChange={(e) => setOutlineColor(e.target.value)}
                        className="w-10 h-10 border border-[#FED7AA] rounded-xl cursor-pointer p-0 overflow-hidden"
                      />
                      <input
                        type="text"
                        value={outlineColor}
                        onChange={(e) => setOutlineColor(e.target.value)}
                        className="flex-1 bg-[#FFFDF9] border border-[#FED7AA] text-xs font-bold rounded-xl px-3 py-2 text-[#0F172A] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Bold Toggle Checkbox */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="boldTextCheckbox"
                      checked={boldText}
                      onChange={(e) => setBoldText(e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-[#FED7AA] text-[#F97316] focus:ring-[#F97316] cursor-pointer"
                    />
                    <label htmlFor="boldTextCheckbox" className="text-xs font-bold uppercase tracking-wider text-[#475569] cursor-pointer">
                      Bold Text styling
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit CTA Card */}
              <div className="card-white p-6 bg-[#FFF7ED] border border-[#FED7AA]">
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={!file || isUploading}
                  className="btn-orange w-full py-4 text-base tracking-widest disabled:opacity-40 disabled:cursor-not-allowed animate-pulse-subtle"
                >
                  {isUploading ? "Uploading Video..." : "Generate Captions"}
                </button>
                <p className="text-[11px] text-center text-[#94A3B8] mt-3 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#F97316]" />
                  100% Private local rendering & instant HD export
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </section>
  );
}
