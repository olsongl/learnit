"use client";

import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FilterValues {
  category: string;
  priceRange: string;
  rating: string;
  difficulty: string;
  sortBy: string;
}

interface CourseFiltersProps {
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
  categories: { value: string; label: string }[];
  className?: string;
}

const priceRangeOptions = [
  { value: "", label: "Any Price" },
  { value: "free", label: "Free" },
  { value: "under25", label: "Under $25" },
  { value: "25to50", label: "$25 - $50" },
  { value: "50to100", label: "$50 - $100" },
  { value: "over100", label: "$100+" },
];

const ratingOptions = [
  { value: "", label: "Any Rating" },
  { value: "4", label: "4+ Stars" },
  { value: "3", label: "3+ Stars" },
];

const difficultyOptions = [
  { value: "", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

export function CourseFilters({
  filters,
  onFilterChange,
  categories,
  className,
}: CourseFiltersProps) {
  function updateFilter(key: keyof FilterValues, value: string) {
    onFilterChange({ ...filters, [key]: value });
  }

  function resetFilters() {
    onFilterChange({
      category: "",
      priceRange: "",
      rating: "",
      difficulty: "",
      sortBy: "popular",
    });
  }

  const hasActiveFilters =
    filters.category ||
    filters.priceRange ||
    filters.rating ||
    filters.difficulty;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Mobile: horizontal scroll row, Desktop: wrapped grid */}
      <div className="flex flex-wrap gap-3">
        <div className="w-full sm:w-auto sm:min-w-[160px]">
          <Select
            options={[{ value: "", label: "All Categories" }, ...categories]}
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
          />
        </div>

        <div className="w-[calc(50%-6px)] sm:w-auto sm:min-w-[140px]">
          <Select
            options={priceRangeOptions}
            value={filters.priceRange}
            onChange={(e) => updateFilter("priceRange", e.target.value)}
          />
        </div>

        <div className="w-[calc(50%-6px)] sm:w-auto sm:min-w-[130px]">
          <Select
            options={ratingOptions}
            value={filters.rating}
            onChange={(e) => updateFilter("rating", e.target.value)}
          />
        </div>

        <div className="w-[calc(50%-6px)] sm:w-auto sm:min-w-[140px]">
          <Select
            options={difficultyOptions}
            value={filters.difficulty}
            onChange={(e) => updateFilter("difficulty", e.target.value)}
          />
        </div>

        <div className="w-[calc(50%-6px)] sm:w-auto sm:min-w-[160px]">
          <Select
            options={sortOptions}
            value={filters.sortBy}
            onChange={(e) => updateFilter("sortBy", e.target.value)}
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-muted-foreground"
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
