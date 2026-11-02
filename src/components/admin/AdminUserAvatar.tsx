"use client";

import { useState } from "react";
import { User } from "lucide-react";

interface AdminUserAvatarProps {
  url?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showIconFallbackOnly?: boolean;
}

export function AdminUserAvatar({
  url,
  name,
  size = "md",
  className = "",
  showIconFallbackOnly = false,
}: AdminUserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const displayName = name || "User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizeStyles = {
    xs: {
      container: "w-6 h-6 rounded-lg text-[9px]",
      icon: "w-3 h-3",
    },
    sm: {
      container: "w-8 h-8 rounded-full text-[10px]",
      icon: "w-4 h-4",
    },
    md: {
      container: "w-10 h-10 rounded-xl text-xs",
      icon: "w-5 h-5",
    },
    lg: {
      container: "w-16 h-16 rounded-2xl text-xl",
      icon: "w-8 h-8",
    },
    xl: {
      container: "w-20 h-20 rounded-3xl text-2xl",
      icon: "w-10 h-10",
    },
  }[size];

  return (
    <div
      className={`${sizeStyles.container} bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-bold shrink-0 overflow-hidden shadow-xs ${className}`}
      title={displayName}
    >
      {url && !imgError ? (
        <img
          src={url}
          alt={displayName}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
        />
      ) : showIconFallbackOnly || !initials ? (
        <User className={`${sizeStyles.icon} text-cyan-400`} />
      ) : (
        <div className="flex items-center justify-center w-full h-full relative group">
          <User className={`${sizeStyles.icon} text-cyan-400`} />
        </div>
      )}
    </div>
  );
}

