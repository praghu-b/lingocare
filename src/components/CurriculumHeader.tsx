"use client";

import React, { useState } from "react";
import { Curriculum, CurriculumStats } from "@/types/curriculum";
import { InlineEditable } from "./InlineEditable";
import {
  Sparkles,
  Upload,
  Download,
  RotateCcw,
  ChevronsDown,
  ChevronsUp,
  Settings,
  BookOpenCheck,
  FileCode2,
} from "lucide-react";

interface CurriculumHeaderProps {
  curriculum: Curriculum;
  stats: CurriculumStats;
  onUpdateTitle: (title: string) => void;
  onUpdateDescription: (description: string) => void;
  onOpenUploadModal: () => void;
  onOpenSettingsModal: () => void;
  onLoadSample: () => void;
  onReset: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export function CurriculumHeader({
  curriculum,
  stats,
  onUpdateTitle,
  onUpdateDescription,
  onOpenUploadModal,
  onOpenSettingsModal,
  onLoadSample,
  onReset,
  onExpandAll,
  onCollapseAll,
}: CurriculumHeaderProps) {
  const [areAllExpanded, setAreAllExpanded] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleToggleExpandCollapse = () => {
    if (areAllExpanded) {
      onCollapseAll();
      setAreAllExpanded(false);
    } else {
      onExpandAll();
      setAreAllExpanded(true);
    }
  };

  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(curriculum, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `${(curriculum.title || "curriculum").toLowerCase().replace(/\s+/g, "_")}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <header className="mb-8 space-y-6">
      {/* Top Navbar / Branding Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          {/* Lingocare Brand Monogram */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EC8601] to-[#d67700] flex items-center justify-center text-white font-black text-lg shadow-sm shadow-[#EC8601]/25">
            L
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-neutral-900 dark:text-neutral-50">
                Lingocare
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EC8601]/10 text-[#EC8601] border border-[#EC8601]/20">
                Curriculum Engine
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              German Nursing Vocational Education · Single-Page Architecture
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Upload Curriculum (PDF) - Primary Accent Button */}
          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#EC8601] hover:bg-[#d67700] active:scale-[0.98] transition-all shadow-sm shadow-[#EC8601]/25"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Upload Curriculum (PDF)</span>
          </button>

          {/* Load Sample Data Button */}
          <button
            onClick={onLoadSample}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            title="Load authentic German nursing sample curriculum"
          >
            <BookOpenCheck className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden sm:inline">Load Sample</span>
          </button>

          {/* Export JSON Button */}
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            title="Export curriculum as JSON"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* API Key Settings Button */}
          <button
            onClick={onOpenSettingsModal}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            title="Configure Gemini API Key"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Reset button with confirmation */}
          {showResetConfirm ? (
            <div className="flex items-center gap-1 p-1 bg-red-50 dark:bg-red-950/40 border border-red-200 rounded-lg">
              <span className="text-[11px] text-red-700 dark:text-red-300 font-medium px-1">
                Clear all?
              </span>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  onReset();
                }}
                className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-medium"
              >
                Yes
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-1.5 py-0.5 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 text-[11px]"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Reset to empty curriculum"
              aria-label="Reset curriculum"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Curriculum Title & Description Block */}
      <div className="space-y-3">
        {/* Source metadata pill */}
        <div className="flex items-center gap-2">
          {curriculum.source === "ai-generated" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              AI-Generated from {curriculum.fileName || "PDF"}
            </span>
          )}
          {curriculum.source === "sample" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
              <BookOpenCheck className="w-3 h-3 text-blue-500" />
              German Nursing Sample
            </span>
          )}
          {curriculum.source === "manual" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              <FileCode2 className="w-3 h-3 text-neutral-500" />
              Manual Course Draft
            </span>
          )}

          {/* Inferred counter badge if any */}
          {stats.inferredCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60">
              <Sparkles className="w-3 h-3 text-[#EC8601]" />
              {stats.inferredCount} AI-inferred items
            </span>
          )}
        </div>

        {/* Main Curriculum Title (Notion-style) */}
        <InlineEditable
          value={curriculum.title}
          onSave={onUpdateTitle}
          placeholder="Enter Curriculum Title (e.g. Pflegefachfrau / Pflegefachmann)..."
          textClassName="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight"
          inputClassName="text-2xl sm:text-3xl font-extrabold"
        />

        {/* Curriculum Description (Notion-style) */}
        <InlineEditable
          value={curriculum.description}
          onSave={onUpdateDescription}
          placeholder="Click to add curriculum overview, target audience, and accreditation notes..."
          multiline={true}
          textClassName="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed"
          inputClassName="text-sm sm:text-base"
        />
      </div>

      {/* Navigation & Hierarchy Statistics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-dashed border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
            Structure Overview:
          </span>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              {stats.totalModules} {stats.totalModules === 1 ? "Module" : "Modules"}
            </span>
            <span>·</span>
            <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              {stats.totalTopics} {stats.totalTopics === 1 ? "Topic" : "Topics"}
            </span>
            <span>·</span>
            <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              {stats.totalLessons} {stats.totalLessons === 1 ? "Lesson" : "Lessons"}
            </span>
          </div>
        </div>

        {/* Expand / Collapse All Toggle */}
        <button
          onClick={handleToggleExpandCollapse}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {areAllExpanded ? (
            <>
              <ChevronsUp className="w-3.5 h-3.5" />
              <span>Collapse All Modules</span>
            </>
          ) : (
            <>
              <ChevronsDown className="w-3.5 h-3.5" />
              <span>Expand All Modules</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
