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
    <div className="space-y-4">
      <div className="border-b border-slate-800 pb-2">
        <h3 className="text-base font-bold text-white">Interests & Hobbies</h3>
        <p className="text-xs text-slate-400">Add personal interests or activities that reflect your personality</p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Add Interest / Hobby</Label>
          <div className="flex gap-2">
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type interest and press Enter or comma (e.g. Open Source, Chess, Blogging)"
              className="text-xs flex-1"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => {
                addInterest(inputVal);
                setInputVal("");
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        <div className="min-h-[60px] p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex flex-wrap gap-1.5 items-center">
          {interests.length === 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 italic mx-auto py-2">
              <Heart className="w-3.5 h-3.5 text-slate-500" />
              <span>No interests added yet (e.g. Competitive Programming, Photography)</span>
            </div>
          ) : (
            interests.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 border border-slate-700 shadow-2xs text-slate-200"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removeInterest(item)}
                  className="text-slate-400 hover:text-rose-400 transition-colors ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
