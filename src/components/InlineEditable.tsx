"use client";

import React, { useState, useRef, useEffect } from "react";

interface InlineEditableProps {
  value: string;
  onSave: (newValue: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  textClassName?: string;
  inputClassName?: string;
  disabled?: boolean;
  autoSelectOnFocus?: boolean;
}

export function InlineEditable({
  value,
  onSave,
  placeholder = "Click to edit...",
  multiline = false,
  className = "",
  textClassName = "",
  inputClassName = "",
  disabled = false,
  autoSelectOnFocus = false,
}: InlineEditableProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync external value updates when not editing
  useEffect(() => {
    if (!isEditing) {
      setDraftValue(value);
    }
  }, [value, isEditing]);

  // Focus and auto-resize when entering edit mode
  useEffect(() => {
    if (isEditing) {
      if (multiline && textareaRef.current) {
        textareaRef.current.focus();
        if (autoSelectOnFocus) {
          textareaRef.current.select();
        } else {
          // Put cursor at end of text
          textareaRef.current.selectionStart = textareaRef.current.value.length;
          textareaRef.current.selectionEnd = textareaRef.current.value.length;
        }
        adjustTextareaHeight(textareaRef.current);
      } else if (inputRef.current) {
        inputRef.current.focus();
        if (autoSelectOnFocus) {
          inputRef.current.select();
        }
      }
    }
  }, [isEditing, multiline, autoSelectOnFocus]);

  const adjustTextareaHeight = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 40)}px`;
  };

  const handleCommit = () => {
    setIsEditing(false);
    const trimmed = draftValue.trim();
    if (trimmed !== value) {
      onSave(trimmed);
    }
  };

  const handleCancel = () => {
    setDraftValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    } else if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleCommit();
    } else if (e.key === "Enter" && multiline && (e.metaKey || e.ctrlKey)) {
      // Ctrl/Cmd + Enter to commit multiline
      e.preventDefault();
      handleCommit();
    }
  };

  if (disabled) {
    return <span className={textClassName}>{value || placeholder}</span>;
  }

  if (isEditing) {
    if (multiline) {
      return (
        <div className={`relative w-full ${className}`}>
          <textarea
            ref={textareaRef}
            value={draftValue}
            onChange={(e) => {
              setDraftValue(e.target.value);
              adjustTextareaHeight(e.target);
            }}
            onBlur={handleCommit}
            onKeyDown={handleKeyDown}
            rows={2}
            className={`w-full bg-white dark:bg-neutral-900 border border-[#EC8601]/60 focus:border-[#EC8601] focus:ring-2 focus:ring-[#EC8601]/20 rounded-md px-2.5 py-1.5 outline-none transition-all resize-none shadow-sm text-neutral-800 dark:text-neutral-100 text-sm leading-relaxed ${inputClassName}`}
            placeholder={placeholder}
          />
          <div className="flex justify-end gap-1.5 mt-1 text-[11px] text-neutral-400">
            <span>Press <kbd className="px-1 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded border text-[10px]">Esc</kbd> to cancel, click outside or <kbd className="px-1 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded border text-[10px]">Ctrl+Enter</kbd> to save</span>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative w-full ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={draftValue}
          onChange={(e) => setDraftValue(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          className={`w-full bg-white dark:bg-neutral-900 border border-[#EC8601]/60 focus:border-[#EC8601] focus:ring-2 focus:ring-[#EC8601]/20 rounded-md px-2 py-1 outline-none transition-all shadow-sm text-neutral-900 dark:text-neutral-50 ${inputClassName}`}
          placeholder={placeholder}
        />
      </div>
    );
  }

  // Display Mode
  const isEmpty = !value || value.trim() === "";

  return (
    <div
      onClick={() => setIsEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
      className={`group cursor-pointer rounded transition-colors duration-150 py-0.5 px-1 -mx-1 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 ${
        isEmpty ? "text-neutral-400 italic" : ""
      } ${className}`}
      title="Click to edit inline"
    >
      {isEmpty ? (
        <span className="text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 text-xs select-none">
          <span className="opacity-70 group-hover:opacity-100 text-[#EC8601] font-medium">+</span>
          <span>{placeholder}</span>
        </span>
      ) : (
        <span className={`block break-words select-text ${textClassName}`}>
          {value}
        </span>
      )}
    </div>
  );
}
