"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Curriculum, Module, Topic, Lesson, CurriculumStats } from "@/types/curriculum";
import { SAMPLE_NURSING_CURRICULUM, EMPTY_CURRICULUM } from "@/data/sampleCurriculum";

const STORAGE_KEY = "lingocare_curriculum_v1";

interface DeletedSnapshot {
  type: "module" | "topic" | "lesson";
  item: Module | Topic | Lesson;
  parentId?: string; // moduleId for topic, topicId for lesson
  grandParentId?: string; // moduleId for lesson
  index: number;
}

export function useCurriculum() {
  const [curriculum, setCurriculumState] = useState<Curriculum>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Curriculum;
          if (parsed && Array.isArray(parsed.modules)) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn("Failed to load curriculum from localStorage:", e);
      }
    }
    return SAMPLE_NURSING_CURRICULUM;
  });

  const [lastDeleted, setLastDeleted] = useState<DeletedSnapshot | null>(null);

  // Save to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(curriculum));
    } catch (e) {
      console.warn("Failed to persist curriculum to localStorage:", e);
    }
  }, [curriculum]);

  // Compute live statistics
  const stats: CurriculumStats = useMemo(() => {
    let totalTopics = 0;
    let totalLessons = 0;
    let inferredCount = 0;

    for (const mod of curriculum.modules) {
      if (mod.isInferred) inferredCount++;
      for (const top of mod.topics) {
        totalTopics++;
        if (top.isInferred) inferredCount++;
        for (const les of top.lessons) {
          totalLessons++;
          if (les.isInferred) inferredCount++;
        }
      }
    }

    return {
      totalModules: curriculum.modules.length,
      totalTopics,
      totalLessons,
      inferredCount,
    };
  }, [curriculum]);

  // --- Curriculum Actions ---
  const updateCurriculumTitle = useCallback((title: string) => {
    setCurriculumState((prev) => ({ ...prev, title, lastModified: Date.now() }));
  }, []);

  const updateCurriculumDescription = useCallback((description: string) => {
    setCurriculumState((prev) => ({ ...prev, description, lastModified: Date.now() }));
  }, []);

  // --- Module Actions ---
  const addModule = useCallback((title?: string, description?: string) => {
    const newModuleId = `mod-${Date.now()}`;
    const newModuleNumber = curriculum.modules.length + 1;
    const newModule: Module = {
      id: newModuleId,
      title: title || `MODULE ${newModuleNumber} — New Nursing Module`,
      description: description || "",
      isCollapsed: false,
      topics: [],
    };

    setCurriculumState((prev) => ({
      ...prev,
      modules: [...prev.modules, newModule],
      lastModified: Date.now(),
    }));

    return newModuleId;
  }, [curriculum.modules.length]);

  const updateModule = useCallback(
    (moduleId: string, updates: Partial<Pick<Module, "title" | "description">>) => {
      setCurriculumState((prev) => ({
        ...prev,
        lastModified: Date.now(),
        modules: prev.modules.map((m) =>
          m.id === moduleId ? { ...m, ...updates } : m
        ),
      }));
    },
    []
  );

  const deleteModule = useCallback((moduleId: string) => {
    setCurriculumState((prev) => {
      const index = prev.modules.findIndex((m) => m.id === moduleId);
      if (index === -1) return prev;
      const deletedModule = prev.modules[index];

      setLastDeleted({
        type: "module",
        item: deletedModule,
        index,
      });

      return {
        ...prev,
        lastModified: Date.now(),
        modules: prev.modules.filter((m) => m.id !== moduleId),
      };
    });
  }, []);

  const toggleModuleCollapse = useCallback((moduleId: string) => {
    setCurriculumState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId ? { ...m, isCollapsed: !m.isCollapsed } : m
      ),
    }));
  }, []);

  // --- Topic Actions ---
  const addTopic = useCallback((moduleId: string, title?: string, description?: string) => {
    const newTopicId = `top-${Date.now()}`;

    setCurriculumState((prev) => {
      return {
        ...prev,
        lastModified: Date.now(),
        modules: prev.modules.map((mod) => {
          if (mod.id !== moduleId) return mod;
          const topicNumber = `${mod.topics.length + 1}`;
          const newTopic: Topic = {
            id: newTopicId,
            title: title || `Topic ${topicNumber} — New Topic`,
            description: description || "",
            isCollapsed: false,
            lessons: [],
          };
          return {
            ...mod,
            isCollapsed: false, // Ensure module is expanded when adding child
            topics: [...mod.topics, newTopic],
          };
        }),
      };
    });

    return newTopicId;
  }, []);

  const updateTopic = useCallback(
    (
      moduleId: string,
      topicId: string,
      updates: Partial<Pick<Topic, "title" | "description">>
    ) => {
      setCurriculumState((prev) => ({
        ...prev,
        lastModified: Date.now(),
        modules: prev.modules.map((mod) => {
          if (mod.id !== moduleId) return mod;
          return {
            ...mod,
            topics: mod.topics.map((t) =>
              t.id === topicId ? { ...t, ...updates } : t
            ),
          };
        }),
      }));
    },
    []
  );

  const deleteTopic = useCallback((moduleId: string, topicId: string) => {
    setCurriculumState((prev) => {
      const targetMod = prev.modules.find((m) => m.id === moduleId);
      if (!targetMod) return prev;
      const index = targetMod.topics.findIndex((t) => t.id === topicId);
      if (index === -1) return prev;

      const deletedTopic = targetMod.topics[index];
      setLastDeleted({
        type: "topic",
        item: deletedTopic,
        parentId: moduleId,
        index,
      });

      return {
        ...prev,
        lastModified: Date.now(),
        modules: prev.modules.map((mod) => {
          if (mod.id !== moduleId) return mod;
          return {
            ...mod,
            topics: mod.topics.filter((t) => t.id !== topicId),
          };
        }),
      };
    });
  }, []);

  const toggleTopicCollapse = useCallback((moduleId: string, topicId: string) => {
    setCurriculumState((prev) => ({
      ...prev,
      modules: prev.modules.map((mod) => {
        if (mod.id !== moduleId) return mod;
        return {
          ...mod,
          topics: mod.topics.map((t) =>
            t.id === topicId ? { ...t, isCollapsed: !t.isCollapsed } : t
          ),
        };
      }),
    }));
  }, []);

  // --- Lesson Actions ---
  const addLesson = useCallback(
    (moduleId: string, topicId: string, title?: string, description?: string) => {
      const newLessonId = `les-${Date.now()}`;

      setCurriculumState((prev) => ({
        ...prev,
        lastModified: Date.now(),
        modules: prev.modules.map((mod) => {
          if (mod.id !== moduleId) return mod;
          return {
            ...mod,
            topics: mod.topics.map((top) => {
              if (top.id !== topicId) return top;
              const lessonNumber = `${top.lessons.length + 1}`;
              const newLesson: Lesson = {
                id: newLessonId,
                title: title || `Lesson ${lessonNumber} — New Lesson Title`,
                description: description || "",
              };
              return {
                ...top,
                isCollapsed: false,
                lessons: [...top.lessons, newLesson],
              };
            }),
          };
        }),
      }));

      return newLessonId;
    },
    []
  );

  const updateLesson = useCallback(
    (
      moduleId: string,
      topicId: string,
      lessonId: string,
      updates: Partial<Pick<Lesson, "title" | "description">>
    ) => {
      setCurriculumState((prev) => ({
        ...prev,
        lastModified: Date.now(),
        modules: prev.modules.map((mod) => {
          if (mod.id !== moduleId) return mod;
          return {
            ...mod,
            topics: mod.topics.map((top) => {
              if (top.id !== topicId) return top;
              return {
                ...top,
                lessons: top.lessons.map((l) =>
                  l.id === lessonId ? { ...l, ...updates } : l
                ),
              };
            }),
          };
        }),
      }));
    },
    []
  );

  const deleteLesson = useCallback(
    (moduleId: string, topicId: string, lessonId: string) => {
      setCurriculumState((prev) => {
        const targetMod = prev.modules.find((m) => m.id === moduleId);
        const targetTop = targetMod?.topics.find((t) => t.id === topicId);
        if (!targetTop) return prev;
        const index = targetTop.lessons.findIndex((l) => l.id === lessonId);
        if (index === -1) return prev;

        const deletedLesson = targetTop.lessons[index];
        setLastDeleted({
          type: "lesson",
          item: deletedLesson,
          parentId: topicId,
          grandParentId: moduleId,
          index,
        });

        return {
          ...prev,
          lastModified: Date.now(),
          modules: prev.modules.map((mod) => {
            if (mod.id !== moduleId) return mod;
            return {
              ...mod,
              topics: mod.topics.map((top) => {
                if (top.id !== topicId) return top;
                return {
                  ...top,
                  lessons: top.lessons.filter((l) => l.id !== lessonId),
                };
              }),
            };
          }),
        };
      });
    },
    []
  );

  // --- Undo Action ---
  const undoLastDelete = useCallback(() => {
    if (!lastDeleted) return;

    setCurriculumState((prev) => {
      if (lastDeleted.type === "module") {
        const item = lastDeleted.item as Module;
        const newModules = [...prev.modules];
        newModules.splice(lastDeleted.index, 0, item);
        return { ...prev, modules: newModules };
      } else if (lastDeleted.type === "topic" && lastDeleted.parentId) {
        const item = lastDeleted.item as Topic;
        return {
          ...prev,
          modules: prev.modules.map((mod) => {
            if (mod.id !== lastDeleted.parentId) return mod;
            const newTopics = [...mod.topics];
            newTopics.splice(lastDeleted.index, 0, item);
            return { ...mod, topics: newTopics };
          }),
        };
      } else if (
        lastDeleted.type === "lesson" &&
        lastDeleted.parentId &&
        lastDeleted.grandParentId
      ) {
        const item = lastDeleted.item as Lesson;
        return {
          ...prev,
          modules: prev.modules.map((mod) => {
            if (mod.id !== lastDeleted.grandParentId) return mod;
            return {
              ...mod,
              topics: mod.topics.map((top) => {
                if (top.id !== lastDeleted.parentId) return top;
                const newLessons = [...top.lessons];
                newLessons.splice(lastDeleted.index, 0, item);
                return { ...top, lessons: newLessons };
              }),
            };
          }),
        };
      }
      return prev;
    });

    setLastDeleted(null);
  }, [lastDeleted]);

  const clearLastDeleted = useCallback(() => {
    setLastDeleted(null);
  }, []);

  // --- Global Visibility / Utility ---
  const expandAll = useCallback(() => {
    setCurriculumState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => ({
        ...m,
        isCollapsed: false,
        topics: m.topics.map((t) => ({ ...t, isCollapsed: false })),
      })),
    }));
  }, []);

  const collapseAll = useCallback(() => {
    setCurriculumState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => ({
        ...m,
        isCollapsed: true,
        topics: m.topics.map((t) => ({ ...t, isCollapsed: true })),
      })),
    }));
  }, []);

  const setCurriculum = useCallback((newCurriculum: Curriculum) => {
    setCurriculumState({
      ...newCurriculum,
      lastModified: Date.now(),
    });
  }, []);

  const loadSampleCurriculum = useCallback(() => {
    setCurriculumState(SAMPLE_NURSING_CURRICULUM);
  }, []);

  const resetCurriculum = useCallback(() => {
    setCurriculumState(EMPTY_CURRICULUM);
  }, []);

  return {
    curriculum,
    stats,
    lastDeleted,
    // Actions
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
  };
}
