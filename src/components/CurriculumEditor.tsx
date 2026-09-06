"use client";

import React, { useState } from "react";
import { useCurriculum } from "@/hooks/useCurriculum";
import { CurriculumHeader } from "./CurriculumHeader";
import { ModuleCard } from "./ModuleCard";
import { PdfUploadModal } from "./PdfUploadModal";
import { SettingsModal } from "./SettingsModal";
import { Curriculum } from "@/types/curriculum";
import {
  Plus,
  Sparkles,
  BookOpenCheck,
  CheckCircle2,
  Undo2,
  X,
} from "lucide-react";

export function CurriculumEditor() {
  const {
    curriculum,
    stats,
    lastDeleted,
    updateCurriculumTitle,
    updateCurriculumDescription,
    addModule,
    updateModule,
    deleteModule,
    toggleModuleCollapse,
    addTopic,
    updateTopic,
    deleteTopic,
    toggleTopicCollapse,
    addLesson,
    updateLesson,
    deleteLesson,
    undoLastDelete,
    clearLastDeleted,
    expandAll,
    collapseAll,
    setCurriculum,
    loadSampleCurriculum,
    resetCurriculum,
  } = useCurriculum();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const handleCurriculumGenerated = (
    generatedCurriculum: Curriculum,
    mode: "replace" | "append"
  ) => {
    if (mode === "replace" || curriculum.modules.length === 0) {
      setCurriculum(generatedCurriculum);
      setNotificationToast(
        `Generated ${generatedCurriculum.modules.length} modules from PDF!`
      );
    } else {
      // Append mode: combine modules
      setCurriculum({
        ...curriculum,
        modules: [...curriculum.modules, ...generatedCurriculum.modules],
        source: "ai-generated",
        lastModified: Date.now(),
      });
      setNotificationToast(
        `Appended ${generatedCurriculum.modules.length} new modules from PDF!`
      );
    }

    setTimeout(() => {
      setNotificationToast(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 antialiased selection:bg-[#EC8601]/20 selection:text-[#EC8601]">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <CurriculumHeader
          curriculum={curriculum}
          stats={stats}
          onUpdateTitle={updateCurriculumTitle}
          onUpdateDescription={updateCurriculumDescription}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onLoadSample={loadSampleCurriculum}
          onReset={resetCurriculum}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
        />

        {/* Modules List Container */}
        {curriculum.modules.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-6 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 text-center bg-white/60 dark:bg-neutral-900/40 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-[#EC8601]/10 text-[#EC8601] flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                Your Curriculum is Empty
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Build your nursing education syllabus from scratch, upload an existing PDF outline, or explore our pre-loaded German nursing sample.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => addModule()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#EC8601] hover:bg-[#d67700] text-white transition-all shadow-sm shadow-[#EC8601]/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Module</span>
              </button>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[#EC8601]" />
                <span>Upload PDF</span>
              </button>

              <button
                onClick={loadSampleCurriculum}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <BookOpenCheck className="w-4 h-4" />
                <span>Load Nursing Sample</span>
              </button>
            </div>
          </div>
        ) : (
          /* Populated Modules List */
          <div className="space-y-6">
            {curriculum.modules.map((module, modIdx) => (
              <ModuleCard
                key={module.id}
                module={module}
                moduleIndex={modIdx}
                onUpdateModule={(updates) => updateModule(module.id, updates)}
                onDeleteModule={() => deleteModule(module.id)}
                onToggleCollapse={() => toggleModuleCollapse(module.id)}
                onAddTopic={() => addTopic(module.id)}
                onUpdateTopic={(topicId, updates) =>
                  updateTopic(module.id, topicId, updates)
                }
                onDeleteTopic={(topicId) => deleteTopic(module.id, topicId)}
                onToggleTopicCollapse={(topicId) =>
                  toggleTopicCollapse(module.id, topicId)
                }
                onAddLesson={(topicId) => addLesson(module.id, topicId)}
                onUpdateLesson={(topicId, lessonId, updates) =>
                  updateLesson(module.id, topicId, lessonId, updates)
                }
                onDeleteLesson={(topicId, lessonId) =>
                  deleteLesson(module.id, topicId, lessonId)
                }
              />
            ))}

            {/* Bottom Add Module Button */}
            <div className="pt-2">
              <button
                onClick={() => addModule()}
                className="w-full py-4 px-6 rounded-2xl border-2 border-dashed border-neutral-300/80 hover:border-[#EC8601] dark:border-neutral-800 text-neutral-600 hover:text-[#EC8601] dark:text-neutral-400 dark:hover:text-[#EC8601] font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:bg-[#EC8601]/5"
              >
                <Plus className="w-5 h-5 text-[#EC8601]" />
                <span>Add New Module (Module {curriculum.modules.length + 1})</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Undo Deletion Toast */}
        {lastDeleted && (
          <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 py-3 px-4 rounded-2xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-2xl border border-neutral-800 dark:border-neutral-200 animate-in slide-in-from-bottom-5 duration-200">
            <span className="text-xs font-medium">
              Deleted {lastDeleted.type} ({lastDeleted.item.title.split("—")[0].trim() || lastDeleted.type})
            </span>
            <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-700 dark:border-neutral-300">
              <button
                onClick={undoLastDelete}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#EC8601] text-white hover:bg-[#d67700] transition-colors"
              >
                <Undo2 className="w-3 h-3" />
                <span>Undo</span>
              </button>
              <button
                onClick={clearLastDeleted}
                className="p-1 text-neutral-400 hover:text-white dark:hover:text-neutral-900 transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Generic Success Notification Toast */}
        {notificationToast && (
          <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2.5 py-3 px-4 rounded-2xl bg-emerald-900 text-white shadow-xl border border-emerald-700 animate-in slide-in-from-bottom-5 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium">{notificationToast}</span>
          </div>
        )}

        {/* Modals */}
        <PdfUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          hasExistingContent={curriculum.modules.length > 0}
          onCurriculumGenerated={handleCurriculumGenerated}
        />

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      </main>
    </div>
  );
}
