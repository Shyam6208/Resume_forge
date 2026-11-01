"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resume.store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus, Heart } from "lucide-react";

export function InterestsForm() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const updateSection = useResumeStore((s) => s.updateSection);

  const [inputVal, setInputVal] = useState("");
  const interests: string[] = currentResume?.data.interests || [];

  const addInterest = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || interests.includes(trimmed)) return;
    updateSection("interests", [...interests, trimmed]);
  };

  const removeInterest = (itemToRemove: string) => {
    updateSection(
      "interests",
      interests.filter((i) => i !== itemToRemove)
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addInterest(inputVal);
      setInputVal("");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 border-b border-white/[0.08] pb-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10">
          <Heart className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Interests & Hobbies</h3>
          <p className="text-xs text-muted-foreground">Add personal passions or activities that reflect your personality</p>
        </div>
      </div>

      <div className="space-y-3.5">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">Add Interest / Hobby</Label>
          <div className="flex gap-2">
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type interest and press Enter or comma (e.g. Open Source, Chess, Astronomy)"
              className="text-xs flex-1 bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => {
                addInterest(inputVal);
                setInputVal("");
              }}
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-bold text-xs shrink-0 rounded-xl shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        <div className="min-h-[60px] p-3.5 rounded-2xl border border-white/[0.08] bg-card/70 flex flex-wrap gap-2 items-center backdrop-blur-md">
          {interests.length === 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground italic mx-auto py-2">
              <Heart className="w-3.5 h-3.5 text-muted-foreground" />
              <span>No interests added yet (e.g. Competitive Programming, Marathon Running, Photography)</span>
            </div>
          ) : (
            interests.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 shadow-xs hover:border-cyan-500/40 transition-colors"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removeInterest(item)}
                  className="text-cyan-400/70 hover:text-rose-400 transition-colors ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
