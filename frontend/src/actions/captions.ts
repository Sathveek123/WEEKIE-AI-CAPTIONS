"use server";

import { db } from "~/lib/db";
import { env } from "~/lib/env";
import type { CaptionJob, CaptionJobStatus, CaptionPhase, CaptionStyle, BackendStatusResponse } from "~/types/caption";

function mapPrismaJobToType(job: {
  id: string;
  displayName: string | null;
  originalFileName: string;
  fileSize: number;
  durationSeconds: number | null;
  captionStyle: string;
  captionPosition: number;
  status: string;
  progress: number;
  currentPhase: string | null;
  language: string | null;
  errorMessage: string | null;
  backendJobId: string | null;
  processingTimeMs: number | null;
  outputFileSize: number | null;
  createdAt: Date;
  updatedAt: Date;
}): CaptionJob {
  return {
    id: job.id,
    displayName: job.displayName,
    originalFileName: job.originalFileName,
    fileSize: job.fileSize,
    durationSeconds: job.durationSeconds,
    captionStyle: job.captionStyle as CaptionStyle,
    captionPosition: job.captionPosition,
    status: job.status as CaptionJobStatus,
    progress: job.progress,
    currentPhase: job.currentPhase as CaptionPhase | null,
    language: job.language,
    errorMessage: job.errorMessage,
    backendJobId: job.backendJobId,
    processingTimeMs: job.processingTimeMs,
    outputFileSize: job.outputFileSize,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

const TERMINAL_STATUSES: CaptionJobStatus[] = ["completed", "failed"];

export async function submitCaptionJob(
  formData: FormData
): Promise<{ jobId: string } | { error: string }> {
  try {
    const file = formData.get("file") as File | null;
    const captionStyle = formData.get("captionStyle") as string | null;
    const captionPosition = formData.get("captionPosition") as string | null;
    const durationSeconds = formData.get("durationSeconds") as string | null;

    const languageSource = formData.get("languageSource") as string | null;
    const translate = formData.get("translate") as string | null;
    const targetLanguage = formData.get("targetLanguage") as string | null;
    const romanize = formData.get("romanize") as string | null;
    const captionMode = formData.get("captionMode") as string | null;
    const vad = formData.get("vad") as string | null;
    const multiSpeaker = formData.get("multiSpeaker") as string | null;
    const fontSize = formData.get("fontSize") as string | null;
    const textColor = formData.get("textColor") as string | null;
    const outlineColor = formData.get("outlineColor") as string | null;
    const boldText = formData.get("boldText") as string | null;

    if (!file) {
      return { error: "No file provided" };
    }
    if (!captionStyle) {
      return { error: "No caption style provided" };
    }
    if (!captionPosition) {
      return { error: "No caption position provided" };
    }

    const backendFormData = new FormData();
    backendFormData.append("file", file);
    backendFormData.append("captionStyle", captionStyle);
    backendFormData.append("captionPosition", captionPosition);
    if (durationSeconds) {
      backendFormData.append("durationSeconds", durationSeconds);
    }
    if (languageSource) backendFormData.append("languageSource", languageSource);
    if (translate) backendFormData.append("translate", translate);
    if (targetLanguage) backendFormData.append("targetLanguage", targetLanguage);
    if (romanize) backendFormData.append("romanize", romanize);
    if (captionMode) backendFormData.append("captionMode", captionMode);
    if (vad) backendFormData.append("vad", vad);
    if (multiSpeaker) backendFormData.append("multiSpeaker", multiSpeaker);
    if (fontSize) backendFormData.append("fontSize", fontSize);
    if (textColor) backendFormData.append("textColor", textColor);
    if (outlineColor) backendFormData.append("outlineColor", outlineColor);
    if (boldText) backendFormData.append("boldText", boldText);

    const response = await fetch(`${env.BACKEND_URL}/api/process`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { error: `Backend processing error (${response.status}): ${errorText}` };
    }

    const data = (await response.json()) as { jobId: string };

    const prismaRecord = await db.captionJob.create({
      data: {
        originalFileName: file.name,
        fileSize: file.size,
        durationSeconds: durationSeconds ? parseFloat(durationSeconds) : null,
        captionStyle,
        captionPosition: parseInt(captionPosition, 10),
        status: "processing",
        backendJobId: data.jobId,
      },
    });

    return { jobId: prismaRecord.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("fetch failed") || message.includes("ECONNREFUSED")) {
      return {
        error:
          `Backend AI Engine (${env.BACKEND_URL}) is unreachable. Please ensure the Python Flask backend is running, or configure NEXT_PUBLIC_BACKEND_URL with your deployed backend URL.`,
      };
    }
    return { error: message };
  }
}

export async function createClientJobRecord(data: {
  originalFileName: string;
  fileSize: number;
  durationSeconds: number | null;
  captionStyle: string;
  captionPosition: number;
  backendJobId: string;
}): Promise<{ jobId: string }> {
  try {
    const prismaRecord = await db.captionJob.create({
      data: {
        originalFileName: data.originalFileName,
        fileSize: data.fileSize,
        durationSeconds: data.durationSeconds,
        captionStyle: data.captionStyle,
        captionPosition: data.captionPosition,
        status: "processing",
        backendJobId: data.backendJobId,
      },
    });
    return { jobId: prismaRecord.id };
  } catch (err) {
    console.error("Resilient DB create fallback active:", err);
    // SQLite write failed on read-only Vercel serverless container.
    // Graceful fallback: return the backendJobId directly to keep the app working.
    return { jobId: data.backendJobId };
  }
}

export async function getCaptionJobStatus(
  jobId: string
): Promise<CaptionJob | null> {
  let job = null;
  try {
    job = await db.captionJob.findUnique({ where: { id: jobId } });
  } catch (err) {
    console.error("Resilient DB read status fallback:", err);
  }

  // If the job record was not saved to SQLite (due to read-only container)
  if (!job) {
    try {
      const response = await fetch(
        `${env.BACKEND_URL}/api/status/${jobId}`
      );
      if (!response.ok) return null;
      const backendData = (await response.json()) as BackendStatusResponse;
      return {
        id: jobId,
        displayName: null,
        originalFileName: "Processing Video",
        fileSize: 0,
        durationSeconds: backendData.durationSeconds ?? null,
        captionStyle: "hormozi",
        captionPosition: 10,
        status: backendData.status as CaptionJobStatus,
        progress: backendData.progress,
        currentPhase: backendData.currentPhase as CaptionPhase | null,
        language: backendData.language,
        errorMessage: backendData.errorMessage,
        backendJobId: jobId,
        processingTimeMs: backendData.processingTimeMs,
        outputFileSize: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  if (TERMINAL_STATUSES.includes(job.status as CaptionJobStatus)) {
    return mapPrismaJobToType(job);
  }

  if (!job.backendJobId) {
    return mapPrismaJobToType(job);
  }

  try {
    const response = await fetch(
      `${env.BACKEND_URL}/api/status/${job.backendJobId}`
    );

    if (!response.ok) {
      return mapPrismaJobToType(job);
    }

    const backendData = (await response.json()) as BackendStatusResponse;

    try {
      const updated = await db.captionJob.update({
        where: { id: jobId },
        data: {
          status: backendData.status as CaptionJobStatus,
          progress: backendData.progress,
          currentPhase: backendData.currentPhase,
          language: backendData.language,
          durationSeconds: backendData.durationSeconds ?? job.durationSeconds,
          errorMessage: backendData.errorMessage,
          processingTimeMs: backendData.processingTimeMs,
        },
      });
      return mapPrismaJobToType(updated);
    } catch {
      // SQLite update failed. Return a transient, updated status representation.
      return {
        ...mapPrismaJobToType(job),
        status: backendData.status as CaptionJobStatus,
        progress: backendData.progress,
        currentPhase: backendData.currentPhase as CaptionPhase | null,
        language: backendData.language,
        durationSeconds: backendData.durationSeconds ?? job.durationSeconds,
        errorMessage: backendData.errorMessage,
        processingTimeMs: backendData.processingTimeMs,
      };
    }
  } catch {
    return mapPrismaJobToType(job);
  }
}

export async function getCaptionJobs(): Promise<CaptionJob[]> {
  try {
    const jobs = await db.captionJob.findMany({
      orderBy: { createdAt: "desc" },
    });
    return jobs.map(mapPrismaJobToType);
  } catch {
    return [];
  }
}

export async function getCaptionJobById(
  jobId: string
): Promise<CaptionJob | null> {
  let job = null;
  try {
    job = await db.captionJob.findUnique({ where: { id: jobId } });
  } catch {
    // Ignore read error
  }
  
  if (job) return mapPrismaJobToType(job);

  // Fallback: fetch transient details directly from backend status
  try {
    const response = await fetch(
      `${env.BACKEND_URL}/api/status/${jobId}`
    );
    if (!response.ok) return null;
    const backendData = (await response.json()) as BackendStatusResponse;
    return {
      id: jobId,
      displayName: null,
      originalFileName: "Generated Video",
      fileSize: 0,
      durationSeconds: backendData.durationSeconds ?? null,
      captionStyle: "hormozi",
      captionPosition: 10,
      status: backendData.status as CaptionJobStatus,
      progress: backendData.progress,
      currentPhase: backendData.currentPhase as CaptionPhase | null,
      language: backendData.language,
      errorMessage: backendData.errorMessage,
      backendJobId: jobId,
      processingTimeMs: backendData.processingTimeMs,
      outputFileSize: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function deleteCaptionJob(jobId: string): Promise<void> {
  let job = null;
  try {
    job = await db.captionJob.findUnique({ where: { id: jobId } });
  } catch {
    // Ignore read errors
  }

  const backendJobId = job?.backendJobId ?? jobId;

  if (backendJobId) {
    try {
      await fetch(`${env.BACKEND_URL}/api/jobs/${backendJobId}`, {
        method: "DELETE",
      });
    } catch {
      // Best-effort delete
    }
  }

  try {
    await db.captionJob.delete({ where: { id: jobId } });
  } catch {
    // Ignore DB errors
  }
}
