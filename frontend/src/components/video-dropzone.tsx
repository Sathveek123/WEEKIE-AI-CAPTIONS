"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, FileVideo, CheckCircle2 } from "lucide-react";
import { cn, formatBytes, formatDuration } from "~/lib/utils";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB
const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const ACCEPT_ATTR = ".mp4,.mov,.webm";

interface VideoDropzoneProps {
  file: File | null;
  onFileSelect: (file: File, duration: number) => void;
  onFileClear: () => void;
  uploadProgress: number | null;
  disabled?: boolean;
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    const url = URL.createObjectURL(file);
    video.src = url;

    // Timeout fallback after 3 seconds if metadata doesn't fire
    const timer = setTimeout(() => {
      URL.revokeObjectURL(url);
      resolve(0);
    }, 3000);

    video.onloadedmetadata = () => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      resolve(video.duration || 0);
    };

    video.onerror = () => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      // Fall back gracefully to 0 — backend ffprobe will determine exact duration
      resolve(0);
    };
  });
}

export function VideoDropzone({
  file,
  onFileSelect,
  onFileClear,
  uploadProgress,
  disabled,
}: VideoDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  const validateAndSelect = useCallback(
    async (selected: File) => {
      setError(null);

      if (!ACCEPTED_TYPES.includes(selected.type)) {
        setError("Unsupported format. Please select an MP4, MOV, or WebM video.");
        return;
      }

      if (selected.size > MAX_FILE_SIZE) {
        setError("File exceeds 500 MB limit.");
        return;
      }

      try {
        const dur = await getVideoDuration(selected);
        setDuration(dur);
        onFileSelect(selected, dur);
      } catch {
        setError("Could not read video metadata. Please select another file.");
      }
    },
    [onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const dropped = e.dataTransfer.files[0];
      if (dropped) {
        void validateAndSelect(dropped);
      }
    },
    [validateAndSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) {
        void validateAndSelect(selected);
      }
      e.target.value = "";
    },
    [validateAndSelect],
  );

  const isUploading = uploadProgress !== null;

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={!file && !disabled ? handleClick : undefined}
        onKeyDown={(e) => {
          if (!file && !disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleClick();
          }
        }}
        onDrop={!file && !disabled ? handleDrop : undefined}
        onDragOver={!file && !disabled ? handleDragOver : undefined}
        onDragLeave={!file && !disabled ? handleDragLeave : undefined}
        className={cn(
          "relative border-2 border-dashed p-6 transition-all duration-300 rounded-2xl bg-[#FFF7ED]/50",
          disabled && "pointer-events-none opacity-50",
          !file && !disabled && "cursor-pointer hover:border-[#F97316] hover:bg-[#FFF7ED]",
          isDragOver
            ? "border-[#F97316] bg-[#FFEDD5]"
            : "border-[#FED7AA]",
          file && "border-solid border-[#F97316] bg-white",
        )}
      >
        {/* Empty state */}
        {!file && (
          <div className="flex flex-col items-center gap-3 text-center py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[#FED7AA] text-[#F97316] shadow-sm">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#0F172A]">
                Select or Drop Video File Here
              </p>
              <p className="mt-1 text-xs text-[#64748B]">
                Supports MP4, MOV, or WebM (Max size: 500MB)
              </p>
            </div>
          </div>
        )}

        {/* File selected state */}
        {file && !isUploading && (
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7ED] text-[#F97316] border border-[#FED7AA]">
              <FileVideo className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-bold text-sm text-[#0F172A]">
                  {file.name}
                </p>
                <CheckCircle2 className="h-4 w-4 text-[#F97316] flex-shrink-0" />
              </div>
              <p className="text-xs text-[#64748B]">
                {formatBytes(file.size)}
                {duration !== null && ` \u00B7 ${formatDuration(duration)}`}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileClear();
                setDuration(null);
                setError(null);
              }}
              className="rounded-full p-1.5 text-[#64748B] transition-colors hover:bg-red-50 hover:text-red-500"
              disabled={disabled}
              aria-label="Remove video file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Uploading state */}
        {file && isUploading && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7ED] text-[#F97316]">
                <FileVideo className="h-5 w-5 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-sm text-[#0F172A]">
                  {file.name}
                </p>
                <p className="text-xs text-[#64748B]">
                  Uploading to caption engine...
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-[#F97316]">
                {Math.round(uploadProgress)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#FFF7ED] border border-[#FED7AA] overflow-hidden">
              <div
                className="h-full bg-[#F97316] transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-xs font-semibold text-red-500">{error}</p>
      )}
    </div>
  );
}
