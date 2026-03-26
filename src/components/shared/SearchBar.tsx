"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  className?: string;
}

export function SearchBar({
  placeholder = "Search...",
  value: controlledValue,
  onSearch,
  debounceMs = 300,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState(controlledValue || "");

  useEffect(() => {
    if (controlledValue !== undefined) {
      setQuery(controlledValue);
    }
  }, [controlledValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, onSearch]);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  );
}
