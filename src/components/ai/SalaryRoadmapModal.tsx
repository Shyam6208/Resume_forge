"use client";

import { useState, useCallback } from "react";
import { useResumeStore } from "@/store/resume.store";
import type { SalaryEstimateResult } from "@/lib/ai/types";
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
  DollarSign,
  Loader2,
  TrendingUp,
  MapPin,
  Award,
  BookOpen,
  Target,
  Sparkles,
  ChevronRight,
  Lightbulb,
  ArrowUpRight,
} from "lucide-react";
import toast from "react-hot-toast";

interface SalaryRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOCATIONS = [
  "Bangalore",
  "Mumbai",
  "Delhi NCR",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Remote (India)",
  "US — San Francisco",
  "US — New York",
  "US — Remote",
  "UK — London",
  "Singapore",
];

export function SalaryRoadmapModal({ isOpen, onClose }: SalaryRoadmapModalProps) {
  const currentResume = useResumeStore((s) => s.currentResume);

  const [targetRole, setTargetRole] = useState(currentResume?.targetJob || "");
  const [location, setLocation] = useState("Bangalore");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SalaryEstimateResult | null>(null);

  const handleEstimate = useCallback(async () => {
    if (!currentResume || !targetRole.trim()) {
      toast.error("Please enter a target role.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("💰 Estimating salary range & building roadmap...");

    try {
      const res = await fetch("/api/ai/salary-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: currentResume.data,
          targetRole: targetRole.trim(),
          location,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to estimate salary");
      }

      const data: SalaryEstimateResult = await res.json();
      setResult(data);
      toast.dismiss(toastId);
      toast.success("✨ Salary benchmark and roadmap ready!", { duration: 3000 });
    } catch (err: unknown) {
      toast.dismiss(toastId);
      const msg = err instanceof Error ? err.message : "Failed to estimate salary";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [currentResume, targetRole, location]);

  const formatINR = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)} LPA`;
    }
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-rose-500/10 text-rose-300 border-rose-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-300 border-amber-500/20";
      case "low":
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/20";
      default:
        return "bg-slate-500/10 text-slate-300 border-slate-500/20";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0B0F17]/95 border-white/[0.08] backdrop-blur-2xl text-slate-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            Salary Estimate & Growth Roadmap
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            AI-powered salary benchmarking and 6-month skill growth plan
          </DialogDescription>
        </DialogHeader>

        {/* Input Form */}
        {!result && (
          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" /> Target Role *
              </label>
              <Input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="bg-slate-900/80 border-white/[0.08] focus:border-cyan-500 text-slate-100 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Location
              </label>
              <div className="flex flex-wrap gap-1.5">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setLocation(loc)}
                    className={`px-3 py-1.5 rounded-xl text-xs transition-all border ${
                      location === loc
                        ? "bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold shadow-sm"
                        : "bg-white/[0.05] text-slate-300 border-white/[0.08] hover:bg-white/[0.1] hover:text-white"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleEstimate}
              disabled={isLoading || !targetRole.trim()}
              className="w-full h-10 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-90 text-slate-950 font-bold rounded-xl shadow-md shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin text-slate-950" /> Analyzing...</>
              ) : (
                <><DollarSign className="w-4 h-4 mr-2 text-slate-950" /> Estimate Salary & Build Roadmap</>
              )}
            </Button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-5 mt-4">
            {/* Salary Range Card */}
            <div className="bg-slate-900/60 rounded-2xl p-5 border border-white/[0.08] shadow-inner">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">{result.role}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {result.location}
                    </span>
                    <span className="text-xs text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 font-semibold">
                      {result.experienceLevel}
                    </span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-cyan-400/30" />
              </div>

              {/* INR Range */}
              <div className="mb-4">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">India (INR)</span>
                <div className="flex items-end gap-3 mt-1">
                  <span className="text-base font-bold text-slate-400">{formatINR(result.salaryRangeINR.min)}</span>
                  <span className="text-2xl font-black text-emerald-400">{formatINR(result.salaryRangeINR.mid)}</span>
                  <span className="text-base font-bold text-slate-400">{formatINR(result.salaryRangeINR.max)}</span>
                </div>
                <div className="relative h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div className="absolute inset-y-0 left-[20%] right-[20%] bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" />
                  <div className="absolute inset-y-0 left-[45%] w-1 bg-white rounded-full z-10" />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                  <span>Min</span>
                  <span>Market Average</span>
                  <span>Max</span>
                </div>
              </div>

              {/* USD Range */}
              <div className="border-t border-white/[0.06] pt-3">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Global (USD)</span>
                <p className="text-xs text-slate-300 mt-1 font-medium">{result.salaryRangeUSD.label}</p>
              </div>
            </div>

            {/* Competitive Advantages */}
            {result.competitiveAdvantages && result.competitiveAdvantages.length > 0 && (
              <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/[0.06]">
                <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> Your Competitive Advantages
                </h3>
                <div className="space-y-2">
                  {result.competitiveAdvantages.map((adv, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{adv}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Insights */}
            {result.marketInsights && result.marketInsights.length > 0 && (
              <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/[0.06]">
                <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-cyan-400" /> Market Insights
                </h3>
                <div className="space-y-2">
                  {result.marketInsights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6-Month Growth Roadmap */}
            {result.growthRoadmap && result.growthRoadmap.length > 0 && (
              <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/[0.06]">
                <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> 6-Month Career Growth Roadmap
                </h3>
                <div className="space-y-3">
                  {result.growthRoadmap.map((item, i) => (
                    <div key={i} className="bg-slate-950/60 rounded-xl p-3 border border-white/[0.06]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{item.skill}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold capitalize ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{item.timeframe}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[10px] text-slate-500">{item.currentLevel}</div>
                          <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                            <ArrowUpRight className="w-3 h-3" /> {item.targetLevel}
                          </div>
                        </div>
                      </div>
                      {item.resources && item.resources.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.resources.map((resource, j) => (
                            <span key={j} className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-300 rounded-full border border-cyan-500/20">
                              📚 {resource}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Promotion Target */}
            {result.nextPromotion && (
              <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/[0.08]">
                <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Next Career Milestone
                </h3>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-bold text-cyan-300">{result.nextPromotion.targetRole}</p>
                    <p className="text-xs text-slate-400">Estimated: {result.nextPromotion.timeframe}</p>
                  </div>
                </div>
                {result.nextPromotion.requiredSkills && result.nextPromotion.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {result.nextPromotion.requiredSkills.map((skill, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded-full border border-emerald-500/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reset Button */}
            <Button
              onClick={() => setResult(null)}
              variant="outline"
              className="w-full bg-white/[0.05] border-white/[0.08] text-slate-300 hover:text-white rounded-xl"
            >
              🔄 Estimate for Different Role/Location
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
