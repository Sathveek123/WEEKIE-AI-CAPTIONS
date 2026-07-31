"use client";

import { cn } from "~/lib/utils";
import { CAPTION_STYLES, CAPTION_STYLE_CONFIGS } from "~/lib/caption-styles";
import type { CaptionStyle } from "~/types/caption";

interface CaptionStylePickerProps {
  selectedStyle: CaptionStyle;
  onStyleChange: (style: CaptionStyle) => void;
}

export function CaptionStylePicker({
  selectedStyle,
  onStyleChange,
}: CaptionStylePickerProps) {
  const selectedConfig = CAPTION_STYLE_CONFIGS[selectedStyle];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#334155]">
          Select Subtitle Preset
        </label>
        <span className="text-[11px] font-semibold text-[#F97316]">
          6 Presets Available
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {CAPTION_STYLES.map((style) => {
          const config = CAPTION_STYLE_CONFIGS[style];
          const isSelected = selectedStyle === style;
          return (
            <button
              key={style}
              type="button"
              onClick={() => onStyleChange(style)}
              className={cn(
                "flex items-center gap-2.5 p-3 rounded-xl text-left text-xs font-bold transition-all duration-200 cursor-pointer border shadow-sm",
                isSelected
                  ? "border-[#F97316] bg-[#F97316] text-white shadow-orange-500/20"
                  : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#FED7AA] hover:bg-[#FFF7ED]",
              )}
            >
              <span
                className="h-3.5 w-3.5 flex-shrink-0 rounded-full border border-black/10 shadow-inner"
                style={{
                  background: `linear-gradient(135deg, ${config.primaryColor} 50%, ${config.highlightColor} 50%)`,
                }}
              />
              <span className="truncate">{config.name}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] p-4 text-xs">
        <p className="font-bold text-sm text-[#0F172A]">
          {selectedConfig.name} Style
        </p>
        <p className="mt-1 text-[#64748B] leading-relaxed">
          {selectedConfig.description}
        </p>
        <p className="mt-2 text-xs font-bold text-[#EA580C]">
          Recommended for: {selectedConfig.bestFor}
        </p>
      </div>
    </div>
  );
}
