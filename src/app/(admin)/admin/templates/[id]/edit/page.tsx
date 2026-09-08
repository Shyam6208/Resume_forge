"use client";

import { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, FileCode2, Sparkles, Save,
  CheckCircle2, Loader2, Eye, X, Check, Sliders,
  ZoomIn, ZoomOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { PreviewRenderer } from "@/components/preview/PreviewRenderer";
import { DEFAULT_THEME } from "@/types/resume.types";
import { normalizeTemplateData } from "@/lib/templates/normalize-template-data";

export default function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Developer");
  const [tagsInput, setTagsInput] = useState("");
  const [atsRating, setAtsRating] = useState(95);
  const [sortOrder, setSortOrder] = useState(0);
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isAtsFriendly, setIsAtsFriendly] = useState(true);

  // Optional Preview image (not required)
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewPublicId, setPreviewPublicId] = useState<string>("");

  // JSON String State (Source of Truth)
  const [jsonString, setJsonString] = useState<string>("");
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [modalScale, setModalScale] = useState(0.85);

  // Fetch initial template data
  useEffect(() => {
    async function loadTemplate() {
      try {
        const res = await fetch(`/api/admin/templates/${id}`);
        if (!res.ok) throw new Error("Template not found or load failed.");
        const data = await res.json();
        const t = data.template;

        setName(t.name || "");
        setSlug(t.slug || "");
        setDescription(t.description || "");
        setCategory(t.category || "Developer");
        setTagsInput(Array.isArray(t.tags) ? t.tags.join(", ") : "");
        setAtsRating(t.ats_rating || 95);
        setSortOrder(t.sort_order || 0);
        setStatus(t.status || "draft");
        setIsFeatured(Boolean(t.is_featured));
        setIsPremium(Boolean(t.is_premium));
        setIsAtsFriendly(Boolean(t.is_ats_friendly ?? true));
        setPreviewUrl(t.thumbnail_url || "");
        setPreviewPublicId(t.thumbnail_public_id || "");

        if (t.template_config) {
          setJsonString(JSON.stringify(t.template_config, null, 2));
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to load template.");
      } finally {
        setLoading(false);
      }
    }
    loadTemplate();
  }, [id]);

  // Real-time JSON parse
  const parsedDataAndConfig = useMemo(() => {
    try {
      if (!jsonString.trim()) {
        return { parsed: null, error: "JSON is empty." };
      }
      const parsed = JSON.parse(jsonString);
      return { parsed, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Syntax Error";
      return { parsed: null, error: msg };
    }
  }, [jsonString]);

  const activeConfig = parsedDataAndConfig.parsed || {};
  const activeResumeData = useMemo(() => {
    return normalizeTemplateData(activeConfig);
  }, [activeConfig]);

  const handleJsonChange = (val: string) => {
    setJsonString(val);
    try {
      JSON.parse(val);
      setJsonParseError(null);
    } catch (err: unknown) {
      setJsonParseError(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  const handleSave = async (overrideStatus?: "draft" | "published" | "archived") => {
    if (!name.trim() || !slug.trim()) {
      toast.error("Template Name and Slug are required.");
      return;
    }

    if (parsedDataAndConfig.error || !parsedDataAndConfig.parsed) {
      toast.error(`Invalid JSON: ${parsedDataAndConfig.error || "Please fix JSON syntax."}`);
      return;
    }

    setIsSaving(true);
    const targetStatus = overrideStatus || status;
    const toastId = toast.loading("Saving changes...");

    try {
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);

      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        category,
        tags,
        thumbnail_url: previewUrl || null,
        thumbnail_public_id: previewPublicId || null,
        template_config: parsedDataAndConfig.parsed,
        status: targetStatus,
        is_featured: isFeatured,
        is_premium: isPremium,
        is_ats_friendly: isAtsFriendly,
        ats_rating: atsRating,
        sort_order: sortOrder,
        version: 1,
      };

      const res = await fetch(`/api/admin/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to update template.");
      }

      toast.dismiss(toastId);
      toast.success("Template updated successfully!");
      setStatus(targetStatus);
      router.push("/admin/templates");
    } catch (err: unknown) {
      toast.dismiss(toastId);
      toast.error(err instanceof Error ? err.message : "Failed to update template.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
        <p className="text-xs">Loading template configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/templates"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Edit Template</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  status === "published"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}
              >
                {status}
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Direct JSON editing. Changes to layoutStyle, themeOverrides, and content render in real-time.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
            className="h-10 px-4 text-xs bg-slate-900 border-slate-700 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 rounded-xl shadow-sm"
          >
            <Eye className="w-4 h-4 text-indigo-400" />
            <span>Full A4 Modal</span>
          </Button>

          {status === "published" ? (
            <Button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave("draft")}
              className="h-10 px-4 text-xs bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 font-semibold rounded-xl border border-amber-500/30"
            >
              <span>Unpublish (Draft)</span>
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave("published")}
              className="h-10 px-5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Now</span>
            </Button>
          )}

          <Button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave()}
            className="h-10 px-5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Changes</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Column JSON Editor, Right Column Live A4 Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: JSON Editor & Template Metadata (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: JSON Editor */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <FileCode2 className="w-4 h-4" />
                <span>Resume JSON (Content & Layout Styles)</span>
              </h2>

              <div className="flex items-center gap-2 text-xs">
                {jsonParseError ? (
                  <span className="text-rose-400 text-[11px] font-semibold bg-rose-950/40 px-2.5 py-0.5 rounded-full border border-rose-800/40">
                    Syntax Error: {jsonParseError}
                  </span>
                ) : (
                  <span className="text-emerald-400 text-[11px] font-semibold bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-800/40 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Valid JSON
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Edit <code>layoutStyle</code> (e.g. <code>gridTemplateColumns</code>), <code>themeOverrides</code>, <code>headerConfig</code>, or resume items. The preview updates instantly.
            </p>

            <div className="relative">
              <textarea
                rows={22}
                value={jsonString}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed"
                placeholder="Paste your resume JSON here..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* Section 2: Metadata */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>Template Metadata & Listing</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Template Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full h-10 px-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                >
                  <option value="Developer">Developer</option>
                  <option value="Modern">Modern</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Minimal">Minimal</option>
                  <option value="Fresher">Fresher</option>
                  <option value="Creative">Creative</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">ATS Rating (%)</label>
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={atsRating}
                  onChange={(e) => setAtsRating(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-bold text-emerald-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-5 pt-3 border-t border-slate-800 text-xs font-semibold text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAtsFriendly}
                  onChange={(e) => setIsAtsFriendly(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                />
                <span>ATS Friendly Badge</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                />
                <span>★ Featured</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                />
                <span>Premium Template</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Live A4 Rendering Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 sticky top-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Rendering Preview (A4 Scaled)</span>
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-800/40"
              >
                <span>Fullscreen</span>
                <Eye className="w-3 h-3" />
              </button>
            </div>

            {/* A4 Canvas Container */}
            <div className="w-full h-[620px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative shadow-inner flex items-start justify-center pt-2">
              <div
                className="origin-top transform scale-[0.48] shrink-0"
                style={{
                  width: "210mm",
                  minHeight: "297mm",
                }}
              >
                <PreviewRenderer
                  templateId={slug || "custom-dynamic"}
                  data={activeResumeData}
                  theme={DEFAULT_THEME}
                  templateConfig={activeConfig}
                />
              </div>
            </div>

            <p className="text-[10.5px] text-slate-500 text-center">
              The preview scales the exact 210mm A4 canvas. Layout & styling are computed directly from the JSON.
            </p>
          </div>
        </div>
      </div>

      {/* Fullscreen Live Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-4 sm:p-6 overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 max-w-6xl mx-auto w-full shrink-0">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="font-bold text-white text-sm sm:text-base block">
                  Full-Size A4 Preview: {name}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Exact 210mm × 297mm A4 Paper Document
                </span>
              </div>
            </div>

            {/* Modal Zoom & Close Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setModalScale((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(2))))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-slate-300 px-2.5 min-w-[48px] text-center">
                  {Math.round(modalScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setModalScale((prev) => Math.min(1.4, Number((prev + 0.1).toFixed(2))))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setModalScale(0.85)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Fit
              </button>

              <button
                type="button"
                onClick={() => setModalScale(1.0)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800"
              >
                100% (1:1)
              </button>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 ml-2"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Canvas Container */}
          <div className="flex-1 w-full overflow-auto py-6 flex items-start justify-center">
            <div
              className="shrink-0 shadow-2xl rounded-sm bg-white transition-all my-4"
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
                  templateId={slug || "custom-dynamic"}
                  data={activeResumeData}
                  theme={DEFAULT_THEME}
                  templateConfig={activeConfig}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
