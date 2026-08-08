"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useResumeStore } from "@/store/resume.store";
import { PreviewRenderer } from "./PreviewRenderer";
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, RotateCcw, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PreviewPanel() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [scale, setScale] = useState(0.65);
  const [modalScale, setModalScale] = useState(0.9);
  const [isAutoFit, setIsAutoFit] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // A4 dimensions in px at 96 DPI: 210mm = ~794px, 297mm = ~1123px
  const scaledWidth = 794 * scale;
  const scaledHeight = 1123 * scale;

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Zoom & Control Bar */}
      <div className="h-10 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur px-3 sm:px-4 flex items-center justify-between text-xs text-slate-400 z-10 shrink-0">
        <span className="font-medium text-slate-300 flex items-center gap-1.5">
          <span>Live A4 Preview</span>
          {isAutoFit && (
            <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
              Auto-Fit
            </span>
          )}
        </span>

        <div className="flex items-center gap-1.5">
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
          className="shrink-0 shadow-2xl transition-all duration-150 rounded-sm bg-white border border-slate-800/80 my-auto"
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
          }}
        >
          <div
            className="origin-top-left"
            style={{
              width: "794px",
              height: "1123px",
              transform: `scale(${scale})`,
            }}
          >
            <PreviewRenderer
              templateId={currentResume.templateId}
              data={currentResume.data}
              theme={currentResume.theme}
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
              className="shrink-0 shadow-2xl transition-all duration-150 rounded-sm bg-white border border-slate-800/80 my-auto"
              style={{
                width: `${794 * modalScale}px`,
                height: `${1123 * modalScale}px`,
              }}
            >
              <div
                className="origin-top-left"
                style={{
                  width: "794px",
                  height: "1123px",
                  transform: `scale(${modalScale})`,
                }}
              >
                <PreviewRenderer
                  templateId={currentResume.templateId}
                  data={currentResume.data}
                  theme={currentResume.theme}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
