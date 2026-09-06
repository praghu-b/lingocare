"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  TestTube2,
} from "lucide-react";
import { Curriculum } from "@/types/curriculum";
import { getCustomApiKey } from "./SettingsModal";

interface PdfUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasExistingContent: boolean;
  onCurriculumGenerated: (curriculum: Curriculum, mode: "replace" | "append") => void;
}

type StepStatus = "idle" | "uploading" | "extracting" | "structuring" | "done" | "error";

export function PdfUploadModal({
  isOpen,
  onClose,
  hasExistingContent,
  onCurriculumGenerated,
}: PdfUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<StepStatus>("idle");
  const [mergeMode, setMergeMode] = useState<"replace" | "append">("replace");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [diagnosticWarning, setDiagnosticWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setSelectedFile(file);
        setErrorMessage(null);
      } else {
        setErrorMessage("Please upload a valid PDF document (.pdf).");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setSelectedFile(file);
        setErrorMessage(null);
      } else {
        setErrorMessage("Please upload a valid PDF document (.pdf).");
      }
    }
  };

  const handleLoadSamplePdf = async (filename: string) => {
    try {
      const res = await fetch(`/${filename}`);
      if (!res.ok) throw new Error("Could not load sample PDF");
      const blob = await res.blob();
      const file = new File([blob], filename, { type: "application/pdf" });
      setSelectedFile(file);
      setErrorMessage(null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setErrorMessage("Could not fetch test sample: " + message);
    }
  };

  const handleResetModal = () => {
    setSelectedFile(null);
    setStatus("idle");
    setErrorMessage(null);
    setDiagnosticWarning(null);
  };

  const handleStartGeneration = async () => {
    if (!selectedFile) return;

    setStatus("extracting");
    setErrorMessage(null);
    setDiagnosticWarning(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const customKey = getCustomApiKey();
      if (customKey) {
        formData.append("customApiKey", customKey);
      }

      // Step simulation for clear UX feedback
      const stepTimer = setTimeout(() => {
        setStatus("structuring");
      }, 2000);

      const response = await fetch("/api/parse-curriculum", {
        method: "POST",
        body: formData,
      });

      clearTimeout(stepTimer);

      const data = await response.json();

      if (!response.ok || !data.success) {
        setStatus("error");
        setErrorMessage(
          data.error ||
            "Unable to parse the PDF. The file may be empty, image-scanned without selectable text, or corrupted."
        );
        return;
      }

      setStatus("done");
      if (data.warning) {
        setDiagnosticWarning(data.warning);
      }

      setTimeout(() => {
        onCurriculumGenerated(data.curriculum, mergeMode);
        onClose();
        handleResetModal();
      }, 1000);
    } catch (err: unknown) {
      console.error("PDF upload error:", err);
      setStatus("error");
      const message = err instanceof Error ? err.message : "Failed to connect to the curriculum generation engine.";
      setErrorMessage(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EC8601]/10 text-[#EC8601] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#EC8601]" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-neutral-50 text-base">
                AI Curriculum Generator
              </h3>
              <p className="text-xs text-neutral-500">
                Upload a nursing syllabus or curriculum PDF
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (status !== "extracting" && status !== "structuring") {
                onClose();
                handleResetModal();
              }
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Content Prompt */}
        {hasExistingContent && status === "idle" && (
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 text-[#EC8601]" />
              <span>Current Curriculum Detected</span>
            </div>
            <p className="text-xs text-amber-700/90 dark:text-amber-400">
              How would you like to apply the AI-generated modules to your current workspace?
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setMergeMode("replace")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mergeMode === "replace"
                    ? "bg-[#EC8601] text-white shadow-xs"
                    : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                }`}
              >
                Replace current curriculum
              </button>
              <button
                type="button"
                onClick={() => setMergeMode("append")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mergeMode === "append"
                    ? "bg-[#EC8601] text-white shadow-xs"
                    : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                }`}
              >
                Append new modules
              </button>
            </div>
          </div>
        )}

        {/* Upload Dropzone */}
        {status === "idle" && (
          <div className="space-y-3">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                dragActive
                  ? "border-[#EC8601] bg-[#EC8601]/5 scale-[1.01]"
                  : "border-neutral-300 dark:border-neutral-700 hover:border-[#EC8601]/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#EC8601]/10 text-[#EC8601] flex items-center justify-center mx-auto">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB · Ready to process
                  </p>
                  <p className="text-xs text-[#EC8601] hover:underline font-medium pt-1">
                    Click or drop another file to change
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 flex items-center justify-center mx-auto">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                      Drop your curriculum PDF here, or{" "}
                      <span className="text-[#EC8601]">browse</span>
                    </p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Supports course outlines, module lists, and comprehensive nursing syllabi
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Test Sample PDFs Bar */}
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                <TestTube2 className="w-3.5 h-3.5 text-[#EC8601]" />
                <span>Test with Pre-Made German Nursing PDFs:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleLoadSamplePdf("sample-nursing-curriculum.pdf")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-[#EC8601] hover:text-[#EC8601] transition-all"
                  title="Complete German nursing curriculum with all 4 levels"
                >
                  📄 Complete Syllabus
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSamplePdf("sample-incomplete-syllabus.pdf")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-[#EC8601] hover:text-[#EC8601] transition-all"
                  title="Modules only — tests AI inference of missing topics and lessons"
                >
                  ✨ Incomplete (Tests AI Inference)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSamplePdf("sample-unrelated-document.pdf")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-[#EC8601] hover:text-[#EC8601] transition-all"
                  title="Medical invoice receipt — tests edge case handling"
                >
                  🧾 Invoice (Tests Edge Case)
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* Processing State: Multi-step Animation */}
        {(status === "extracting" || status === "structuring" || status === "done") && (
          <div className="py-6 px-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-5 text-center">
            {status === "done" ? (
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#EC8601]/10 text-[#EC8601] flex items-center justify-center mx-auto animate-spin">
                <Loader2 className="w-6 h-6" />
              </div>
            )}

            <div className="space-y-1">
              <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-50">
                {status === "extracting" && "Extracting Document Content..."}
                {status === "structuring" && "Structuring Modules & Synthesizing Lessons..."}
                {status === "done" && "Curriculum Generated Successfully!"}
              </h4>
              <p className="text-xs text-neutral-500">
                {status === "extracting" && "Reading PDF pages and preparing tokens for the AI engine"}
                {status === "structuring" && "Detecting hierarchy levels and inferring missing topics"}
                {status === "done" && (diagnosticWarning || "Injecting directly into your editable workspace...")}
              </p>
            </div>

            {/* Step Indicators */}
            <div className="space-y-2 max-w-xs mx-auto text-left text-xs">
              <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>1. Parse PDF text & pages</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                {status === "extracting" ? (
                  <Loader2 className="w-4 h-4 text-[#EC8601] animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
                <span>2. Extract 4-tier hierarchy</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                {status === "structuring" ? (
                  <Loader2 className="w-4 h-4 text-[#EC8601] animate-spin" />
                ) : status === "done" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-700" />
                )}
                <span>3. Infer missing topics & clinical lessons</span>
              </div>
            </div>
          </div>
        )}

        {/* Error State with Diagnostic Message */}
        {status === "error" && (
          <div className="py-5 px-4 rounded-2xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-800 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">
                  Document Processing Failed
                </h4>
                <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>

            <div className="p-3 bg-white/70 dark:bg-neutral-900/60 rounded-xl text-xs text-neutral-600 dark:text-neutral-400 space-y-1 border border-red-100 dark:border-red-900/30">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                Troubleshooting Tips:
              </span>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Make sure the PDF contains selectable text (not scanned images without OCR).</li>
                <li>Check your Gemini API quota or enter your own key in Settings.</li>
                <li>You can also click &quot;Load Sample&quot; to instantly test with real German nursing data.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={handleResetModal}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
              >
                Try Another File
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        {status === "idle" && (
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartGeneration}
              disabled={!selectedFile}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#EC8601] hover:bg-[#d67700] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-[#EC8601]/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Curriculum</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
