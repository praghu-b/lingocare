"use client";

import dynamic from "next/dynamic";

const CurriculumEditor = dynamic(
  () =>
    import("@/components/CurriculumEditor").then((mod) => mod.CurriculumEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EC8601]/20 text-[#EC8601] flex items-center justify-center font-bold text-lg animate-pulse">
            L
          </div>
          <p className="text-xs text-neutral-500 font-medium">
            Loading Curriculum Engine...
          </p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return <CurriculumEditor />;
}
