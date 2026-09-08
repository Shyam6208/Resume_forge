"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useResumeStore } from "@/store/resume.store";
import { PreviewRenderer } from "./PreviewRenderer";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  ScanLine,
  Printer,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { DEFAULT_THEME } from "@/types/resume.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PreviewPanel() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const updateTheme = useResumeStore((s) => s.updateTheme);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  
  const [scale, setScale] = useState(0.65);
  const [modalScale, setModalScale] = useState(0.9);
  const [isAutoFit, setIsAutoFit] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [contentHeight, setContentHeight] = useState(1123);

  // Measure actual rendered content height for A4 overflow detection
  useEffect(() => {
    const el = contentContainerRef.current;
    if (!el) return;

    const measure = () => {
      if (el.scrollHeight > 0) {
        setContentHeight(el.scrollHeight);
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [currentResume?.data, currentResume?.theme, currentResume?.templateId, currentResume?.sectionOrder]);

  const isOverflowing = contentHeight > 1130;
  const overflowPct = isOverflowing
    ? Math.round(((contentHeight - 1123) / 1123) * 100)
    : 0;

  // Auto-fit calculation based on container width
  const updateFitScale = useCallback(() => {
    if (!containerRef.current) return;
    const padding = 32; // 16px padding on each side
    const availableWidth = containerRef.current.clientWidth - padding;
    if (availableWidth > 0) {
      // 794px is standard A4 page width
      const calculatedScale = Math.min(1.0, Math.max(0.35, availableWidth / 794));
      setScale(Number(calculatedScale.toFixed(2)));
    }
  }, []);

  // Track container resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (isAutoFit) {
      updateFitScale();
    }

    const observer = new ResizeObserver(() => {
      if (isAutoFit) {
        updateFitScale();
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [isAutoFit, updateFitScale]);

  if (!currentResume) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-400 text-xs">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        <span>Loading preview...</span>
      </div>
    );
  }

  const handleZoomIn = () => {
    setIsAutoFit(false);
    setScale((prev) => Math.min(prev + 0.05, 1.3));
  };

  const handleZoomOut = () => {
    setIsAutoFit(false);
    setScale((prev) => Math.max(prev - 0.05, 0.35));
  };

  const handleToggleAutoFit = () => {
    setIsAutoFit(true);
    updateFitScale();
  };

  // Magic 1-Page Auto-Fit Action
  const handleAutoFitToOnePage = () => {
    if (!currentResume) return;
    const theme = currentResume.theme || DEFAULT_THEME;

    const newMargins = "narrow";
    const newSpacing = Math.max(8, Math.min(theme.sectionSpacing || 16, 11));
    const newLineHeight = Math.max(1.3, Math.min(theme.lineHeight || 1.5, 1.36));
    const newFontSize = Math.max(12, Math.min(theme.fontSize || 14, 13));
    const newHeadingSize = Math.max(15, Math.min(theme.headingSize || 18, 16));

    updateTheme({
      pageMargins: newMargins,
      sectionSpacing: newSpacing,
      lineHeight: Number(newLineHeight.toFixed(2)),
      fontSize: newFontSize,
      headingSize: newHeadingSize,
    });

    toast.success("✨ Auto-Fit applied! Margins and spacing condensed to fit 1 page.", {
      icon: "📄",
    });
  };

  // Instant Native Print / PDF Fallback (0.1s)
  const handleQuickPrint = () => {
    toast("Opening instant PDF / Print dialog...", { icon: "🖨️", duration: 1500 });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // A4 dimensions in px at 96 DPI: 210mm = ~794px, 297mm = ~1123px
  const effectiveHeight = Math.max(1123, contentHeight);
  const scaledWidth = 794 * scale;
  const scaledHeight = effectiveHeight * scale;

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Zoom & Control Bar */}
      <div className="preview-control-bar h-10 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur px-3 sm:px-4 flex items-center justify-between text-xs text-slate-400 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-300 flex items-center gap-1.5">
            <span>Live A4 Preview</span>
            {isAutoFit && (
              <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                Auto-Fit
              </span>
            )}
          </span>

          {/* 1-Page Status Indicator */}
          {isOverflowing ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAutoFitToOnePage}
              className="h-6 px-2 text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/40 gap-1 rounded-full animate-pulse hover:animate-none"
              title="Click to automatically condense margins and spacing onto 1 page"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Fit to 1 Page (+{overflowPct}%)</span>
            </Button>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>1 Page Perfect</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Print Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleQuickPrint}
            className="h-7 px-2 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 gap-1 hidden sm:flex"
            title="Instant Print or Save as PDF (0.1s)"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            <span>Quick Print</span>
          </Button>

          {/* Zoom Out */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="h-7 w-7 p-0 text-slate-400 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>

          {/* Scale Display */}
          <span className="text-[11px] font-mono text-slate-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 min-w-[42px] text-center">
            {Math.round(scale * 100)}%
          </span>

          {/* Zoom In */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="h-7 w-7 p-0 text-slate-400 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>

          {/* Reset / Auto-Fit Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleAutoFit}
            className={`h-7 px-2 text-[11px] border-slate-700 ${
              isAutoFit
                ? "bg-indigo-600 text-white border-indigo-500 font-medium"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
            title="Fit to screen width"
          >
            <ScanLine className="w-3.5 h-3.5 mr-1" />
            <span>Fit</span>
          </Button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Fullscreen Preview */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setModalScale(0.9);
              setIsFullscreen(true);
            }}
            className="h-7 px-2 text-xs text-slate-400 hover:text-white flex items-center gap-1"
            title="Full Screen Preview"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Full</span>
          </Button>
        </div>
      </div>

      {/* Main Scrollable Preview Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-start"
      >
        <div
          className="relative shrink-0 shadow-2xl transition-all duration-150 rounded-sm bg-white border border-slate-800/80 my-auto"
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
          }}
        >
          {/* Live Page 1 Cutoff Indicator (renders when content exceeds 1 page) */}
          {isOverflowing && (
            <div
              className="absolute left-0 right-0 border-b-2 border-dashed border-amber-500/80 pointer-events-none z-20 flex items-center justify-between px-2.5"
              style={{ top: `${1123 * scale}px` }}
            >
              <span className="bg-amber-500 text-slate-950 font-bold text-[9px] px-1.5 py-0.5 rounded shadow">
                Page 1 Limit (A4)
              </span>
              <span className="bg-slate-900/90 text-amber-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-amber-500/30">
                Page 2 begins below
              </span>
            </div>
          )}

          <div
            ref={contentContainerRef}
            className="origin-top-left resume-print-target"
            style={{
              width: "794px",
              minHeight: "1123px",
              transform: `scale(${scale})`,
            }}
          >
            <PreviewRenderer
              templateId={currentResume.templateId}
              data={currentResume.data}
              theme={currentResume.theme}
              templateConfig={currentResume.templateConfig}
              sectionOrder={currentResume.sectionOrder}
            />
          </div>
        </div>
      </div>

      {/* Fullscreen Print Preview Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="w-[95vw] max-w-6xl h-[92vh] p-4 sm:p-6 bg-slate-950 text-slate-100 border-slate-800 flex flex-col overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-800/80 shrink-0 pr-8">
            <DialogTitle className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Full Size Print Preview</span>
              <span className="hidden sm:inline text-xs font-normal text-slate-400 ml-2">
                (Standard A4 Page)
              </span>
            </DialogTitle>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setModalScale((prev) => Math.max(0.4, Number((prev - 0.05).toFixed(2))))}
                className="h-8 w-8 p-0 text-slate-300 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>

              <span className="text-xs font-mono text-slate-300 px-2 py-1 rounded bg-slate-900 border border-slate-800 min-w-[48px] text-center">
                {Math.round(modalScale * 100)}%
              </span>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setModalScale((prev) => Math.min(1.3, Number((prev + 0.05).toFixed(2))))}
                className="h-8 w-8 p-0 text-slate-300 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalScale(1.0)}
                className="h-8 px-2.5 text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                100% 1:1
              </Button>
            </div>
          </DialogHeader>

          {/* Modal Preview Canvas */}
          <div className="flex-1 overflow-auto bg-slate-900/60 rounded-xl border border-slate-800/80 p-4 sm:p-6 flex flex-col items-center justify-start mt-3">
            <div
              className="shrink-0 shadow-2xl transition-all duration-150 rounded-sm bg-white border border-slate-800/80 my-4"
              style={{
                width: `${794 * modalScale}px`,
                height: `${effectiveHeight * modalScale}px`,
              }}
            >
              <div
                className="origin-top-left"
                style={{
                  width: "794px",
                  minHeight: "1123px",
                  transform: `scale(${modalScale})`,
                }}
              >
                <PreviewRenderer
                  templateId={currentResume.templateId}
                  data={currentResume.data}
                  theme={currentResume.theme}
                  templateConfig={currentResume.templateConfig}
                  sectionOrder={currentResume.sectionOrder}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
