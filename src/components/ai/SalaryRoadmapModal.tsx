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
      toast.success("✨ Salary estimate & roadmap ready!", { duration: 3000 });
    } catch (err: unknown) {
      toast.dismiss(toastId);
      const msg = err instanceof Error ? err.message : "Failed to estimate salary";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [currentResume, targetRole, location]);

  const formatINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "high": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "medium": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950 border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            Salary Estimator & Career Roadmap
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            AI-powered salary benchmarking and 6-month skill growth plan
          </DialogDescription>
        </DialogHeader>

        {/* Input Form */}
        {!result && (
          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Target className="w-3 h-3" /> Target Role *
              </label>
              <Input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="bg-slate-900 border-slate-700 text-slate-200 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Location
              </label>
              <div className="flex flex-wrap gap-1.5">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setLocation(loc)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                      location === loc
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-semibold"
                        : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
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
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><DollarSign className="w-4 h-4 mr-2" /> Estimate Salary & Build Roadmap</>
              )}
            </Button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-5 mt-4">
            {/* Salary Range Card */}
            <div className="bg-gradient-to-br from-emerald-950/50 to-cyan-950/50 rounded-xl p-5 border border-emerald-500/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">{result.role}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {result.location}
                    </span>
                    <span className="text-xs text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      {result.experienceLevel}
                    </span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-emerald-400/30" />
              </div>

              {/* INR Range */}
              <div className="mb-4">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">India (INR)</span>
                <div className="flex items-end gap-3 mt-1">
                  <span className="text-lg font-bold text-slate-400">{formatINR(result.salaryRangeINR.min)}</span>
                  <span className="text-2xl font-extrabold text-emerald-400">{formatINR(result.salaryRangeINR.mid)}</span>
                  <span className="text-lg font-bold text-slate-400">{formatINR(result.salaryRangeINR.max)}</span>
                </div>
                <div className="relative h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div className="absolute inset-y-0 left-[20%] right-[20%] bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
                  <div className="absolute inset-y-0 left-[45%] w-1 bg-white rounded-full z-10" />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                  <span>Min</span>
                  <span>Market Average</span>
                  <span>Max</span>
                </div>
              </div>

              {/* USD Range */}
              <div className="border-t border-white/10 pt-3">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Global (USD)</span>
                <p className="text-sm text-slate-300 mt-1">{result.salaryRangeUSD.label}</p>
              </div>
            </div>

            {/* Competitive Advantages */}
            {result.competitiveAdvantages && result.competitiveAdvantages.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> Your Competitive Advantages
                </h3>
                <div className="space-y-2">
                  {result.competitiveAdvantages.map((adv, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{adv}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Insights */}
            {result.marketInsights && result.marketInsights.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
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
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" /> 6-Month Career Growth Roadmap
                </h3>
                <div className="space-y-3">
                  {result.growthRoadmap.map((item, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
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
                            <span key={j} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded-full border border-purple-500/20">
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
              <div className="bg-gradient-to-r from-indigo-950/50 to-purple-950/50 rounded-xl p-4 border border-indigo-500/20">
                <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Next Career Milestone
                </h3>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-bold text-indigo-300">{result.nextPromotion.targetRole}</p>
                    <p className="text-xs text-slate-400">Estimated: {result.nextPromotion.timeframe}</p>
                  </div>
                </div>
                {result.nextPromotion.requiredSkills && result.nextPromotion.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {result.nextPromotion.requiredSkills.map((skill, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/20">
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
              className="w-full bg-slate-900 border-slate-700 text-slate-300"
            >
              🔄 Estimate for Different Role/Location
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
