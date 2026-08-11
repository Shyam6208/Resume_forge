"use client";

import { useState, useMemo } from "react";
import { TARGET_ROLES } from "@/config/target-roles.config";
import type { TargetRole } from "@/config/target-roles.config";
import { Search } from "lucide-react";

interface TargetRoleSelectorProps {
  selectedRole: TargetRole | null;
  onSelect: (role: TargetRole) => void;
}

export function TargetRoleSelector({ selectedRole, onSelect }: TargetRoleSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) return TARGET_ROLES;
    const q = searchQuery.toLowerCase();
    return TARGET_ROLES.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.coreSkills.some((s) => s.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="text-sm font-bold text-white">🎯 Target Job Role</h3>
        <p className="text-[11px] text-slate-400">
          Select your target role to get AI-powered optimization suggestions
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search roles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-8 pl-8 pr-3 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
        />
      </div>

      {/* Role Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
        {filteredRoles.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onSelect(role.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group ${
                isSelected
                  ? "bg-indigo-600/20 border-indigo-500/50 ring-1 ring-indigo-500/30"
                  : "bg-slate-950/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className="text-lg leading-none mt-0.5 shrink-0">{role.emoji}</span>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold truncate ${isSelected ? "text-indigo-300" : "text-white"}`}>
                    {role.label}
                  </p>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                    {role.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filteredRoles.length === 0 && (
        <div className="text-center py-6">
          <p className="text-xs text-slate-500">No roles match your search</p>
        </div>
      )}
    </div>
  );
}
