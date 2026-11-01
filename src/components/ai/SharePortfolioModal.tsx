"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
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

  const resumeIsPublic = currentResume?.isPublic ?? false;
  const [prevResumeIsPublic, setPrevResumeIsPublic] = useState(resumeIsPublic);
  const [isPublic, setIsPublic] = useState(resumeIsPublic);
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showQR, setShowQR] = useState(true);

  // Sync state when currentResume changes without cascading render
  if (resumeIsPublic !== prevResumeIsPublic) {
    setPrevResumeIsPublic(resumeIsPublic);
    setIsPublic(resumeIsPublic);
  }

  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );

  const slug = currentResume?.slug || currentResume?.id || "";
  const portfolioUrl = origin ? `${origin}/r/${slug}` : `/r/${slug}`;
  const qrCodeUrl = `/api/portfolio/qr?slug=${encodeURIComponent(slug)}${origin ? `&baseUrl=${encodeURIComponent(origin)}` : ""}`;

  const candidateName = currentResume?.data?.personalInfo?.fullName || "Professional";
  const roleTitle = currentResume?.targetJob || currentResume?.data?.personalInfo?.professionalTitle || "Portfolio";

  const getFullPortfolioUrl = () => {
    if (origin) return `${origin}/r/${slug}`;
    if (typeof window !== "undefined") return `${window.location.origin}/r/${slug}`;
    return `/r/${slug}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getFullPortfolioUrl());
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
    const text = encodeURIComponent(`Check out my professional resume & portfolio: ${getFullPortfolioUrl()}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getFullPortfolioUrl())}`, "_blank");
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`Here is my professional portfolio built on ResumeForge:`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(getFullPortfolioUrl())}`, "_blank");
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card/95 border-white/[0.08] text-foreground backdrop-blur-2xl shadow-2xl shadow-cyan-950/20 rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg font-bold">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400 shadow-md shadow-cyan-500/10">
              <Globe className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <span className="text-foreground">Share Live Portfolio</span>
              <p className="text-xs text-muted-foreground font-normal mt-0.5">
                Real-time hosted web portfolio with live synchronization & QR code
              </p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Share your live portfolio and download a QR code
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Real-time sync badge */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
            <span className="leading-relaxed">
              <strong className="text-emerald-200">Real-time Synchronized:</strong> Any edits in the resume editor update this live portfolio instantly.
            </span>
          </div>

          {/* Portfolio Preview Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-950/20 via-card to-emerald-950/10 rounded-2xl p-4 border border-cyan-500/20 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 text-xl font-black shadow-md shadow-cyan-500/20 shrink-0">
                  {candidateName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm tracking-tight">{candidateName}</h3>
                  <p className="text-xs text-cyan-400/90 font-medium">{roleTitle}</p>
                </div>
              </div>

              {/* Live Status Pill */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                  isPublic
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isPublic ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`}
                />
                <span>{isPublic ? "LIVE" : "DRAFT"}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground border-t border-white/[0.06] pt-2.5">
              <span>{shareStats.sections} active sections</span>
              {shareStats.hasLinkedIn && <span className="text-cyan-400/80">· LinkedIn ✓</span>}
              {shareStats.hasGithub && <span className="text-emerald-400/80">· GitHub ✓</span>}
            </div>
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl p-3.5 border border-white/[0.08] transition-colors">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Eye className="w-4 h-4" />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <EyeOff className="w-4 h-4" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isPublic ? "Public Portfolio" : "Private Draft"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isPublic
                    ? "Accessible to anyone with the link / QR code"
                    : "Only visible to you while editing"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleTogglePublic}
              disabled={isUpdating}
              aria-label={isPublic ? "Make portfolio private" : "Make portfolio public"}
              className={`relative w-12 h-6 rounded-full transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                isPublic ? "bg-emerald-500" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  isPublic ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Live Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-cyan-400" /> Shareable Web URL
            </label>
            <div className="flex gap-2">
              <Input
                value={portfolioUrl}
                readOnly
                suppressHydrationWarning
                className="bg-card/80 border-white/[0.08] text-foreground text-xs font-mono flex-1 focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className={`shrink-0 rounded-xl transition-all ${
                  copied
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-white/[0.04] border-white/[0.1] text-foreground hover:bg-white/[0.08]"
                }`}
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                onClick={() => window.open(getFullPortfolioUrl(), "_blank")}
                size="sm"
                className="shrink-0 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 flex items-center gap-1 transition-all"
              >
                <span>Preview</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* 1-Click Social Share */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-cyan-400" /> Quick Share
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={shareWhatsApp}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={shareLinkedIn}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                <span>LinkedIn</span>
              </button>
              <button
                type="button"
                onClick={shareTwitter}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                <span>X / Twitter</span>
              </button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="space-y-2.5 pt-2 border-t border-white/[0.08]">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowQR(!showQR)}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Downloadable QR Code</span>
                <span className="text-[10px] text-muted-foreground">({showQR ? "hide" : "show"})</span>
              </button>

              <Button
                onClick={handleDownloadQR}
                variant="outline"
                size="sm"
                className="h-7 text-xs bg-white/[0.04] border-white/[0.1] text-foreground hover:bg-white/[0.08] rounded-lg"
              >
                <Download className="w-3 h-3 mr-1" /> SVG
              </Button>
            </div>

            {showQR && (
              <div className="flex flex-col items-center gap-2.5 bg-white rounded-2xl p-5 shadow-xl shadow-black/40 border border-white/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeUrl}
                  alt="Portfolio QR Code"
                  className="w-40 h-40 object-contain"
                />
                <p className="text-[11px] text-slate-600 font-mono text-center truncate max-w-full font-medium">
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
