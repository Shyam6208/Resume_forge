"use client";

import { useState, useEffect } from "react";
import { useResumeStore } from "@/store/resume.store";
import { useUIStore } from "@/store/ui.store";
import { TEMPLATES, TemplateConfig } from "@/config/templates.config";
import type { PageMargins } from "@/types/resume.types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Palette,
  Type,
  MoveVertical,
  Layout,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { DEFAULT_THEME } from "@/types/resume.types";

const FONT_OPTIONS = [
  { label: "Inter (Modern Clean)", value: "Inter" },
  { label: "Roboto (Universal)", value: "Roboto" },
  { label: "Poppins (Friendly)", value: "Poppins" },
  { label: "Outfit (Geometric)", value: "Outfit" },
  { label: "Merriweather (Classic Serif)", value: "Merriweather" },
  { label: "Playfair Display (Elegant)", value: "Playfair Display" },
  { label: "Fira Code (Monospace / Tech)", value: "Fira Code" },
];

const PRESET_PALETTES = [
  { name: "Slate Corporate", primary: "#1e293b", secondary: "#475569", accent: "#3b82f6" },
  { name: "Emerald Navy", primary: "#0f172a", secondary: "#334155", accent: "#10b981" },
  { name: "Indigo Purple", primary: "#1e1b4b", secondary: "#312e81", accent: "#6366f1" },
  { name: "Rose Charcoal", primary: "#18181b", secondary: "#3f3f46", accent: "#f43f5e" },
  { name: "Teal Modern", primary: "#134e4a", secondary: "#115e59", accent: "#14b8a6" },
];

export function ThemeCustomizer() {
  const isCustomizerOpen = useUIStore((s) => s.isCustomizerOpen);
  const setIsCustomizerOpen = useUIStore((s) => s.setIsCustomizerOpen);

  const theme = useResumeStore((s) => s.currentResume?.theme || DEFAULT_THEME);
  const currentTemplateId = useResumeStore((s) => s.currentResume?.templateId || "minimal-white");
  const updateTheme = useResumeStore((s) => s.updateTheme);
  const updateTemplateId = useResumeStore((s) => s.updateTemplateId);

  const [allTemplates, setAllTemplates] = useState<TemplateConfig[]>(TEMPLATES);

  useEffect(() => {
    if (!isCustomizerOpen) return;
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        if (data.templates && Array.isArray(data.templates)) {
          setAllTemplates(data.templates);
        }
      })
      .catch(() => {});
  }, [isCustomizerOpen]);

  const handleResetTheme = () => {
    updateTheme(DEFAULT_THEME);
  };

  if (!isCustomizerOpen) {
    return null;
  }

  return (
    <Sheet open={isCustomizerOpen} onOpenChange={setIsCustomizerOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-slate-950 text-slate-100 border-l border-slate-800 p-0 flex flex-col h-full"
      >
        {/* Header */}
        <SheetHeader className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-row items-center justify-between space-y-0">
          <div>
            <SheetTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-400" />
              <span>Theme & Layout Customizer</span>
            </SheetTitle>
            <SheetDescription className="text-[11px] text-slate-400">
              Customize colors, fonts, spacing, and templates in real-time
            </SheetDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetTheme}
            className="h-7 text-[10px] bg-slate-900 border-slate-700 text-slate-300 hover:text-white flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </Button>
        </SheetHeader>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* SECTION 1: Colors */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span>1. Color Scheme</span>
            </h3>

            {/* Quick Palettes */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-slate-400">Preset Palettes</span>
              <div className="grid grid-cols-5 gap-1.5">
                {PRESET_PALETTES.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    title={p.name}
                    onClick={() =>
                      updateTheme({
                        primaryColor: p.primary,
                        secondaryColor: p.secondary,
                        accentColor: p.accent,
                      })
                    }
                    className="p-1 rounded-lg border border-slate-800 hover:border-indigo-500 bg-slate-900 flex items-center justify-center gap-0.5 transition-colors"
                  >
                    <span className="w-2.5 h-5 rounded-l" style={{ backgroundColor: p.primary }} />
                    <span className="w-2.5 h-5" style={{ backgroundColor: p.secondary }} />
                    <span className="w-2.5 h-5 rounded-r" style={{ backgroundColor: p.accent }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              {/* Primary Color */}
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-300">Primary</Label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <Input
                    value={theme.primaryColor}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    className="h-7 text-[10px] font-mono bg-slate-900 border-slate-800 uppercase px-1.5"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-300">Secondary</Label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={theme.secondaryColor}
                    onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <Input
                    value={theme.secondaryColor}
                    onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                    className="h-7 text-[10px] font-mono bg-slate-900 border-slate-800 uppercase px-1.5"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-300">Accent</Label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) => updateTheme({ accentColor: e.target.value })}
                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <Input
                    value={theme.accentColor}
                    onChange={(e) => updateTheme({ accentColor: e.target.value })}
                    className="h-7 text-[10px] font-mono bg-slate-900 border-slate-800 uppercase px-1.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Typography */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
              <Type className="w-3.5 h-3.5 text-indigo-400" />
              <span>2. Typography</span>
            </h3>

            {/* Font Family */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Font Family</Label>
              <Select
                value={theme.fontFamily ?? "Inter"}
                onValueChange={(val) => {
                  if (val) updateTheme({ fontFamily: val });
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-slate-900 border-slate-800 text-white">
                  <SelectValue placeholder="Select font family" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  {FONT_OPTIONS.map((f) => (
                    <SelectItem key={f.value} value={f.value} className="text-xs">
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Size Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <Label className="text-slate-300">Base Font Size</Label>
                <span className="text-[11px] font-semibold text-indigo-400">{theme.fontSize}px</span>
              </div>
              <Slider
                value={[theme.fontSize]}
                min={11}
                max={17}
                step={0.5}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  if (typeof val === "number") updateTheme({ fontSize: val });
                }}
                className="py-1"
              />
            </div>
          </div>

          {/* SECTION 3: Spacing */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
              <MoveVertical className="w-3.5 h-3.5 text-indigo-400" />
              <span>3. Spacing & Density</span>
            </h3>

            {/* Line Height Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <Label className="text-slate-300">Line Height</Label>
                <span className="text-[11px] font-semibold text-indigo-400">{theme.lineHeight}</span>
              </div>
              <Slider
                value={[theme.lineHeight]}
                min={1.1}
                max={2.0}
                step={0.05}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  if (typeof val === "number") updateTheme({ lineHeight: val });
                }}
                className="py-1"
              />
            </div>

            {/* Section Spacing Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <Label className="text-slate-300">Section Gap</Label>
                <span className="text-[11px] font-semibold text-indigo-400">{theme.sectionSpacing}px</span>
              </div>
              <Slider
                value={[theme.sectionSpacing]}
                min={8}
                max={32}
                step={2}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  if (typeof val === "number") updateTheme({ sectionSpacing: val });
                }}
                className="py-1"
              />
            </div>
          </div>

          {/* SECTION 4: Layout & Toggles */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
              <Layout className="w-3.5 h-3.5 text-indigo-400" />
              <span>4. Layout Options</span>
            </h3>

            {/* Page Margins Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Page Margins</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["narrow", "normal", "wide"] as PageMargins[]).map((margin) => (
                  <button
                    key={margin}
                    type="button"
                    onClick={() => updateTheme({ pageMargins: margin })}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium capitalize transition-all ${
                      theme.pageMargins === margin
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-xs"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {margin}
                  </button>
                ))}
              </div>
            </div>

            {/* Show Photo Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-900/60">
              <div className="space-y-0.5">
                <Label className="text-xs text-white flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Show Profile Photo</span>
                </Label>
                <p className="text-[10px] text-slate-400">Display uploaded photo in resume header</p>
              </div>
              <Switch
                checked={theme.showPhoto}
                onCheckedChange={(val) => updateTheme({ showPhoto: val })}
              />
            </div>

            {/* Show Icons Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-900/60">
              <div className="space-y-0.5">
                <Label className="text-xs text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Show Section Icons</span>
                </Label>
                <p className="text-[10px] text-slate-400">Display icons next to section headings</p>
              </div>
              <Switch
                checked={theme.showIcons}
                onCheckedChange={(val) => updateTheme({ showIcons: val })}
              />
            </div>
          </div>

          {/* SECTION 5: Template Switcher Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>5. Mini Template Switcher</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {allTemplates.map((tmpl) => {
                const isSelected = currentTemplateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => updateTemplateId(tmpl.id, tmpl.templateConfig || null)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all group relative overflow-hidden ${
                      isSelected
                        ? "bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500 shadow-md"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 p-0.5 rounded-full bg-indigo-500 text-white">
                        <Check className="w-3 h-3" />
                      </span>
                    )}

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        {tmpl.category}
                      </span>
                      <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {tmpl.name}
                      </h4>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                        ATS {tmpl.atsRating}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
