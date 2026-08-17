import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, Briefcase, Check } from "lucide-react";
import { JOB_ROLES, POPULAR_JOB_ROLES, JobRole } from "@/config/jobRoles";
import { Input } from "@/components/ui/input";

interface JobRoleComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function JobRoleCombobox({ value, onChange, placeholder = "e.g. Senior Frontend Developer", className }: JobRoleComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  // Sync internal search state with external value changes
  useEffect(() => {
    setSearch(value);
  }, [value]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return POPULAR_JOB_ROLES.slice(0, 10);
    }

    const scoredRoles = JOB_ROLES.map((role) => {
      let score = 0;
      const titleLower = role.title.toLowerCase();
      
      if (titleLower === query) {
        score += 100;
      } else if (titleLower.startsWith(query)) {
        score += 50;
      } else if (titleLower.includes(query)) {
        score += 30;
      }

      if (role.aliases) {
        for (const alias of role.aliases) {
          const aliasLower = alias.toLowerCase();
          if (aliasLower === query) score += 40;
          else if (aliasLower.startsWith(query)) score += 20;
          else if (aliasLower.includes(query)) score += 10;
        }
      }

      if (role.keywords) {
        for (const keyword of role.keywords) {
          if (keyword.toLowerCase().includes(query) || query.includes(keyword.toLowerCase())) {
            score += 5;
          }
        }
      }

      // Small boost for popular roles
      if (role.popular) {
        score += 2;
      }

      return { role, score };
    });

    return scoredRoles
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((item) => item.role);
  }, [search]);

  // Reset active index when search changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [search]);

  const handleSelect = (roleValue: string) => {
    setSearch(roleValue);
    onChange(roleValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        handleSelect(results[activeIndex].title);
      } else if (search.trim()) {
        handleSelect(search.trim());
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listboxRef.current) {
      const activeElement = listboxRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        const listbox = listboxRef.current;
        const elementTop = activeElement.offsetTop;
        const elementBottom = elementTop + activeElement.offsetHeight;
        const listboxTop = listbox.scrollTop;
        const listboxBottom = listboxTop + listbox.offsetHeight;

        if (elementTop < listboxTop) {
          listbox.scrollTop = elementTop;
        } else if (elementBottom > listboxBottom) {
          listbox.scrollTop = elementBottom - listbox.offsetHeight;
        }
      }
    }
  }, [activeIndex]);

  return (
    <div className={`relative ${className || ""}`} ref={wrapperRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onChange(e.target.value); // Keep parent in sync even for custom input
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9 h-11 text-sm bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 w-full focus-visible:ring-indigo-500"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="job-roles-listbox"
          aria-autocomplete="list"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl shadow-slate-950/50 overflow-hidden flex flex-col max-h-[280px]">
          {/* Custom Role Option (always show if typing something not perfectly matched) */}
          {search.trim() && !results.some(r => r.title.toLowerCase() === search.trim().toLowerCase()) && (
            <div className="p-2 border-b border-slate-800/50 bg-slate-900/50 shrink-0">
              <button
                type="button"
                onClick={() => handleSelect(search.trim())}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                  activeIndex === -1 
                    ? "bg-indigo-600/20 text-indigo-300" 
                    : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 truncate">
                  Use custom role: <span className="font-semibold text-white">"{search.trim()}"</span>
                </div>
              </button>
            </div>
          )}

          <ul
            id="job-roles-listbox"
            ref={listboxRef}
            className="overflow-y-auto flex-1 p-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
            role="listbox"
          >
            {results.length > 0 ? (
              results.map((role, index) => {
                const isActive = index === activeIndex;
                const isSelected = value.toLowerCase() === role.title.toLowerCase();

                return (
                  <li
                    key={role.id}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSelect(role.title)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                      isActive ? "bg-slate-800" : ""
                    } ${isSelected && !isActive ? "bg-indigo-600/10" : ""}`}
                  >
                    <div className={`p-1.5 rounded-md ${
                      isSelected ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-800/80 text-slate-400"
                    }`}>
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className={`text-sm font-medium truncate ${isSelected ? "text-indigo-300" : "text-slate-200"}`}>
                        {role.title}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate">
                        {role.category}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                  </li>
                );
              })
            ) : (
              !search.trim() && (
                <li className="px-4 py-8 text-center text-slate-500 text-sm">
                  Start typing to search for roles...
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
