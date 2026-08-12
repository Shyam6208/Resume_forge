"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  FileCode2,
  Sparkles,
  Save,
  CheckCircle2,
  Loader2,
  Eye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { PreviewRenderer } from "@/components/preview/PreviewRenderer";
import { SAMPLE_RESUME_DATA } from "@/config/sample-resume.config";
import { DEFAULT_THEME } from "@/types/resume.types";
import { DynamicTemplateConfig } from "@/lib/templates/template-validator";

export default function NewTemplatePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Modern");
  const [tagsInput, setTagsInput] = useState("ATS Preferred, Modern, Responsive");
  const [atsRating, setAtsRating] = useState(90);
  const [sortOrder, setSortOrder] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isAtsFriendly, setIsAtsFriendly] = useState(true);

  // Cloudinary Preview Image State
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewPublicId, setPreviewPublicId] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // JSON Config State
  const [jsonString, setJsonString] = useState<string>(
    JSON.stringify(
      {
        version: "1.0",
        layoutStyle: "single-column",
        themeOverrides: {
          primaryColor: "#4f46e5",
          secondaryColor: "#1e293b",
          fontFamily: "inter",
        },
        headerConfig: {
          style: "minimal",
          showPhoto: false,
        },
        sectionStyles: {
          headingStyle: "underlined",
          spacing: "normal",
        },
      },
      null,
      2
    )
  );
  const [configUrl, setConfigUrl] = useState<string>("");
  const [configPublicId, setConfigPublicId] = useState<string>("");
  const [isUploadingConfig, setIsUploadingConfig] = useState(false);
  const [parsedConfig, setParsedConfig] = useState<DynamicTemplateConfig | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, "-")) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  // 1. Upload Preview Image to Cloudinary via server API
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewFile(file);
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/templates/upload-preview", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to upload preview image.");
      }

      setPreviewUrl(data.url);
      setPreviewPublicId(data.publicId);
      toast.success("Preview image uploaded to Cloudinary!");
    } catch (err: unknown) {
      console.error("Image upload error:", err);
      toast.error(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // 2. Validate & Upload JSON Config via server API
  const handleConfigUpload = async () => {
    setIsUploadingConfig(true);
    try {
      const res = await fetch("/api/admin/templates/upload-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: jsonString }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to validate JSON configuration.");
      }

      setConfigUrl(data.url);
      setConfigPublicId(data.publicId);
      setParsedConfig(data.config);
      toast.success("Template JSON validated and uploaded to Cloudinary!");
    } catch (err: unknown) {
      console.error("Config upload error:", err);
      toast.error(err instanceof Error ? err.message : "JSON validation failed.");
    } finally {
      setIsUploadingConfig(false);
    }
  };

  // 3. Save Template (Draft or Published)
  const handleSave = async (status: "draft" | "published") => {
    if (!name.trim() || !slug.trim()) {
      toast.error("Template Name and Slug are required.");
      return;
    }

    setIsSaving(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      let configToSave: DynamicTemplateConfig = parsedConfig || {
        version: "1.0",
        layoutStyle: "single-column",
      };
      if (!parsedConfig) {
        try {
          const parsed = JSON.parse(jsonString);
          configToSave = {
            version: parsed.version || "1.0",
            layoutStyle: parsed.layoutStyle || "single-column",
            themeOverrides: parsed.themeOverrides || {},
            headerConfig: parsed.headerConfig || {},
            sectionStyles: parsed.sectionStyles || {},
          };
        } catch {
          // Use default fallback
        }
      }

      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description,
        category,
        tags,
        thumbnail_url: previewUrl || null,
        thumbnail_public_id: previewPublicId || null,
        template_config_url: configUrl || null,
        template_config_public_id: configPublicId || null,
        template_config: configToSave,
        status,
        is_featured: isFeatured,
        is_premium: isPremium,
        is_ats_friendly: isAtsFriendly,
        ats_rating: atsRating,
        sort_order: sortOrder,
        version: "1.0",
      };

      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to save template.");
      }

      toast.success(
        status === "published"
          ? "Template published successfully!"
          : "Draft template saved!"
      );
      router.push("/admin/templates");
    } catch (err: unknown) {
      console.error("Save template error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save template.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link
          href="/admin/templates"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Templates</span>
        </Link>
        <h1 className="text-xl font-extrabold text-white">Add New Dynamic Template</h1>
      </div>

      {/* Main Form */}
      <div className="space-y-6">
        {/* Basic Info Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400">
            1. Template Metadata
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Template Name *</label>
              <input
                type="text"
                placeholder="e.g. Modern Developer Pro"
                value={name}
                onChange={handleNameChange}
                className="w-full h-11 px-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Slug *</label>
              <input
                type="text"
                placeholder="e.g. modern-developer-pro"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""))}
                className="w-full h-11 px-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Description</label>
            <textarea
              rows={3}
              placeholder="Short description of this template's aesthetic and ideal target job roles..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
              >
                <option value="Modern">Modern</option>
                <option value="Minimal">Minimal</option>
                <option value="Fresher">Fresher</option>
                <option value="Developer">Developer</option>
                <option value="Corporate">Corporate</option>
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
                className="w-full h-11 px-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full h-11 px-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. ATS Preferred, Clean, Tech Stack"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full h-11 px-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
            />
          </div>

          {/* Checkbox Flags */}
          <div className="flex flex-wrap gap-6 pt-2 border-t border-slate-800/80 text-xs font-semibold text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAtsFriendly}
                onChange={(e) => setIsAtsFriendly(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
              />
              <span>ATS Friendly</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
              />
              <span>Featured Template</span>
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

        {/* Cloudinary Preview Image Upload */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
            2. Preview Image (Cloudinary)
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-24 h-32 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
              {previewUrl ? (
                <img src={previewUrl} alt="Uploaded Preview" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-6 h-6 text-slate-600" />
              )}
            </div>

            <div className="space-y-2 flex-1 w-full">
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageUpload}
                disabled={isUploadingImage}
                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-950 file:text-indigo-400 hover:file:bg-slate-800 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                Uploaded to <code className="text-indigo-300">resumeforge/templates/previews/</code> on Cloudinary.
              </p>
              {isUploadingImage && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading to Cloudinary...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* JSON Configuration */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
              3. Template JSON Configuration
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleConfigUpload}
              disabled={isUploadingConfig}
              className="h-8 text-xs bg-slate-950 border-slate-800 text-indigo-400 hover:bg-slate-800"
            >
              {isUploadingConfig ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileCode2 className="w-3.5 h-3.5" />
              )}
              <span>Validate & Upload Config</span>
            </Button>
          </div>

          <textarea
            rows={10}
            value={jsonString}
            onChange={(e) => {
              setJsonString(e.target.value);
              setParsedConfig(null);
            }}
            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <p className="text-[11px] text-slate-500">
            Strict validation ensures no executable script tags or dangerous code are present.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
            className="h-11 px-6 text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-white font-semibold flex items-center gap-2 rounded-xl"
          >
            <Eye className="w-4 h-4 text-indigo-400" />
            <span>Preview Template</span>
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => handleSave("draft")}
              className="h-11 px-6 text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold flex items-center gap-2 rounded-xl"
            >
              <Save className="w-4 h-4" />
              <span>Save as Draft</span>
            </Button>

            <Button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave("published")}
              className="h-11 px-6 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 rounded-xl shadow-lg shadow-indigo-600/30"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Publish Template</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-4 overflow-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span className="font-bold text-white text-base">
                Admin Preview — {name || "Untitled Template"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 max-w-5xl mx-auto w-full py-6 overflow-auto flex items-center justify-center">
            <PreviewRenderer
              templateId={slug || "custom-dynamic"}
              data={SAMPLE_RESUME_DATA}
              theme={DEFAULT_THEME}
              templateConfig={parsedConfig}
            />
          </div>
        </div>
      )}
    </div>
  );
}
