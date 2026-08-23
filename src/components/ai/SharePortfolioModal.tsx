"use client";

import { useState, useEffect, useMemo } from "react";
import { useResumeStore } from "@/store/resume.store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Globe,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Download,
  Eye,
  EyeOff,
  Link2,
  Share2,
  Sparkles,
  Zap,
  Radio,
} from "lucide-react";
import toast from "react-hot-toast";

interface SharePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SharePortfolioModal({ isOpen, onClose }: SharePortfolioModalProps) {
  const currentResume = useResumeStore((s) => s.currentResume);
  const updateIsPublic = useResumeStore((s) => s.updateIsPublic);

  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(currentResume?.isPublic ?? false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showQR, setShowQR] = useState(true);

  // Sync state when currentResume changes or modal opens
  useEffect(() => {
    if (currentResume) {
      setIsPublic(currentResume.isPublic ?? false);
    }
  }, [currentResume, isOpen]);

  const slug = currentResume?.slug || currentResume?.id || "";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const portfolioUrl = `${baseUrl}/r/${slug}`;
  const qrCodeUrl = `/api/portfolio/qr?slug=${encodeURIComponent(slug)}&baseUrl=${encodeURIComponent(baseUrl)}`;

  const candidateName = currentResume?.data?.personalInfo?.fullName || "Professional";
  const roleTitle = currentResume?.targetJob || currentResume?.data?.personalInfo?.professionalTitle || "Portfolio";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      toast.success("📋 Portfolio link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  const handleTogglePublic = async () => {
    if (!currentResume || isUpdating) return;
    const nextState = !isPublic;
    setIsUpdating(true);
    setIsPublic(nextState);
    updateIsPublic(nextState);

    try {
      const res = await fetch(`/api/resume/${currentResume.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: nextState }),
      });

      if (res.ok) {
        toast.success(
          nextState
            ? "🟢 Resume is now LIVE & Public! Anyone with link can view."
            : "🔒 Resume is now Private.",
          { duration: 3500 }
        );
      } else {
        // Revert on error
        setIsPublic(!nextState);
        updateIsPublic(!nextState);
        toast.error("Could not update visibility on server.");
      }
    } catch {
      setIsPublic(!nextState);
      updateIsPublic(!nextState);
      toast.error("Could not update visibility.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const svgText = await response.text();
      const blob = new Blob([svgText], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}-qr-code.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("📥 QR Code downloaded!");
    } catch {
      toast.error("Could not download QR code.");
    }
  };

  // Social Share Handlers
  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Check out my professional resume & portfolio: ${portfolioUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(portfolioUrl)}`, "_blank");
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`Here is my professional portfolio built on ResumeForge:`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(portfolioUrl)}`, "_blank");
  };

  const shareStats = useMemo(() => {
    const data = currentResume?.data;
    return {
      sections: data
        ? Object.keys(data).filter((k) => {
            const val = data[k as keyof typeof data];
            return val && (typeof val === "string" ? val.length > 0 : Array.isArray(val) ? val.length > 0 : true);
          }).length
        : 0,
      hasLinkedIn: !!data?.personalInfo?.linkedin,
      hasGithub: !!data?.personalInfo?.github,
    };
  }, [currentResume]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-slate-950 border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
              <Globe className="w-5 h-5 text-cyan-400" />
            </div>
            Share Live Portfolio
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Real-time hosted web portfolio with live synchronization & QR code
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-3">
          {/* Real-time sync badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
            <span>
              <strong>Real-time Synchronized:</strong> Any edits in the resume editor update this live portfolio instantly.
            </span>
          </div>

          {/* Portfolio Preview Card */}
          <div className="bg-gradient-to-br from-indigo-950/50 to-purple-950/50 rounded-xl p-4 border border-indigo-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {candidateName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{candidateName}</h3>
                  <p className="text-xs text-indigo-300">{roleTitle}</p>
                </div>
              </div>

              {/* Live Status Pill */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                  isPublic
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isPublic ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`}
                />
                <span>{isPublic ? "LIVE" : "DRAFT"}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 border-t border-white/5 pt-2.5">
              <span>{shareStats.sections} active sections</span>
              {shareStats.hasLinkedIn && <span>· LinkedIn ✓</span>}
              {shareStats.hasGithub && <span>· GitHub ✓</span>}
            </div>
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between bg-white/5 rounded-xl p-3.5 border border-white/10">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Eye className="w-4 h-4" />
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                  <EyeOff className="w-4 h-4" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-white">
                  {isPublic ? "Public Portfolio" : "Private Draft"}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isPublic
                    ? "Accessible to anyone with the link / QR code"
                    : "Only visible to you while editing"}
                </p>
              </div>
            </div>
            <button
              onClick={handleTogglePublic}
              disabled={isUpdating}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isPublic ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isPublic ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Live Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-indigo-400" /> Shareable Web URL
            </label>
            <div className="flex gap-2">
              <Input
                value={portfolioUrl}
                readOnly
                className="bg-slate-900 border-slate-700 text-slate-300 text-xs font-mono flex-1"
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className={`shrink-0 ${
                  copied
                    ? "bg-emerald-900 border-emerald-500 text-emerald-300"
                    : "bg-slate-900 border-slate-700 text-slate-300"
                }`}
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                onClick={() => window.open(portfolioUrl, "_blank")}
                size="sm"
                className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1"
              >
                <span>Preview</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* 1-Click Social Share */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-cyan-400" /> Quick Share
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={shareWhatsApp}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-colors"
              >
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={shareLinkedIn}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-semibold transition-colors"
              >
                <span>LinkedIn</span>
              </button>
              <button
                type="button"
                onClick={shareTwitter}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-semibold transition-colors"
              >
                <span>X / Twitter</span>
              </button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="space-y-2 pt-1 border-t border-white/10">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowQR(!showQR)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Downloadable QR Code</span>
                <span className="text-[10px] text-slate-500">({showQR ? "hide" : "show"})</span>
              </button>

              <Button
                onClick={handleDownloadQR}
                variant="outline"
                size="sm"
                className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-300"
              >
                <Download className="w-3 h-3 mr-1" /> SVG
              </Button>
            </div>

            {showQR && (
              <div className="flex flex-col items-center gap-2.5 bg-white rounded-xl p-5 shadow-lg shadow-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeUrl}
                  alt="Portfolio QR Code"
                  className="w-40 h-40 object-contain"
                />
                <p className="text-[11px] text-slate-500 font-mono text-center truncate max-w-full">
                  Scan to view live portfolio
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
