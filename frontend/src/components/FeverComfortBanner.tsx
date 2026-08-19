"use client";

import React, { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Flame, Eye, X, Sparkles, CheckCircle2 } from "lucide-react";

export default function FeverComfortBanner() {
  const { isFeverMode, toggleFeverMode } = useTheme();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className={`w-full transition-all duration-300 border-b ${
      isFeverMode 
        ? "bg-amber-950/40 border-amber-800/40 text-amber-200" 
        : "bg-sky-950/30 border-sky-800/30 text-sky-200"
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          {isFeverMode ? (
            <span className="p-1 rounded-md bg-amber-500/20 text-amber-300">
              <Flame className="w-3.5 h-3.5 animate-pulse" />
            </span>
          ) : (
            <span className="p-1 rounded-md bg-sky-500/20 text-sky-300">
              <Eye className="w-3.5 h-3.5" />
            </span>
          )}
          <span>
            {isFeverMode ? (
              <strong>Fever & Eye-Care Mode Active:</strong>
            ) : (
              <span>Feeling unwell or experiencing eye strain?</span>
            )}
            {" "}
            <span className="hidden sm:inline opacity-90">
              {isFeverMode 
                ? "Reduced blue light, warm matte contrast, and high-readability fonts to protect your eyes." 
                : "Switch to gentle warm mode for fever comfort."}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleFeverMode}
            className={`px-3 py-1 rounded-full font-bold text-xs transition-all border ${
              isFeverMode
                ? "bg-amber-500/30 border-amber-400/60 text-amber-100 hover:bg-amber-500/40"
                : "bg-sky-500/20 border-sky-400/40 text-sky-200 hover:bg-sky-500/30"
            }`}
          >
            {isFeverMode ? "Switch to Standard" : "Enable Fever Mode"}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md hover:bg-white/10 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
