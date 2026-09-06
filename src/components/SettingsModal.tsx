"use client";

import React, { useState, useEffect } from "react";
import { X, Key, ShieldCheck, ExternalLink } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CUSTOM_API_KEY_STORAGE = "lingocare_custom_gemini_key";

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(CUSTOM_API_KEY_STORAGE) || "";
      setApiKey(stored);
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem(CUSTOM_API_KEY_STORAGE, apiKey.trim());
    } else {
      localStorage.removeItem(CUSTOM_API_KEY_STORAGE);
    }
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleClear = () => {
    localStorage.removeItem(CUSTOM_API_KEY_STORAGE);
    setApiKey("");
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EC8601]/10 text-[#EC8601] flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-neutral-50 text-base">
                AI Engine Settings
              </h3>
              <p className="text-xs text-neutral-500">
                Optional Custom Gemini API Configuration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Box */}
        <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Default Server Key Active</span>
          </div>
          <p>
            By default, the engine connects securely to our serverless Gemini endpoint.
            You only need to enter your own key here if you want to bypass the shared quota or test your own Google AI Studio project.
          </p>
        </div>

        {/* Key Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Custom Google Gemini API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:border-[#EC8601] focus:ring-2 focus:ring-[#EC8601]/20 outline-none transition-all"
          />
          <p className="text-[11px] text-neutral-400">
            Keys are saved strictly to your local browser storage and never stored on third-party databases.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {apiKey ? (
            <button
              onClick={handleClear}
              className="text-xs text-red-600 hover:underline"
            >
              Reset to default server key
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#EC8601] hover:bg-[#d67700] transition-colors shadow-sm"
            >
              {isSaved ? "Saved ✓" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function getCustomApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CUSTOM_API_KEY_STORAGE) || null;
}
