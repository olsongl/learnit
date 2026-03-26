"use client";

import { useState, useCallback, useMemo } from "react";
import { SearchBar } from "@/components/shared/SearchBar";
import { Pagination } from "@/components/shared/Pagination";
import { CourseGrid } from "@/components/courses/CourseGrid";
import {
  CourseFilters,
  type FilterValues,
} from "@/components/courses/CourseFilters";
import type { CourseCardData } from "@/components/courses/CourseCard";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_COURSES: CourseCardData[] = [
  {
    id: "1",
    slug: "complete-web-development-bootcamp",
    title: "Complete Web Development Bootcamp 2025",
    shortDescription:
      "Learn HTML, CSS, JavaScript, React, Node.js, and more. Build 20+ real-world projects.",
    teacherName: "Dr. Sarah Chen",
    teacherVerified: true,
    averageRating: 4.8,
    reviewCount: 2341,
    pricingModel: "one_time",
    price: 8999,
    enrollmentCount: 15230,
    difficulty: "beginner",
    category: "technology",
  },
  {
    id: "2",
    slug: "advanced-react-patterns",
    title: "Advanced React Patterns & Performance",
    shortDescription:
      "Master compound components, render props, hooks patterns, and performance optimization.",
    teacherName: "Mike Torres",
    teacherVerified: true,
    averageRating: 4.9,
    reviewCount: 892,
    pricingModel: "one_time",
    price: 5999,
    enrollmentCount: 4820,
    difficulty: "advanced",
    category: "technology",
  },
  {
    id: "3",
    slug: "bench-press-mastery",
    title: "Bench Press Mastery: From Beginner to 315",
    shortDescription:
      "Science-based programming for bench press strength. Includes 12-week periodized program.",
    teacherName: "Coach James Wright",
    teacherVerified: true,
    averageRating: 4.7,
    reviewCount: 567,
    pricingModel: "one_time",
    price: 4999,
    enrollmentCount: 3200,
    difficulty: "all_levels",
    category: "fitness",
  },
  {
    id: "4",
    slug: "holistic-nutrition-fundamentals",
    title: "Holistic Nutrition Fundamentals",
    shortDescription:
      "Explore Eastern and Western nutritional science. Create personalized meal plans for optimal health.",
    teacherName: "Dr. Anika Patel",
    teacherVerified: true,
    averageRating: 4.6,
    reviewCount: 1205,
    pricingModel: "monthly",
    price: 1999,
    enrollmentCount: 8900,
    difficulty: "beginner",
    category: "nutrition",
  },
  {
    id: "5",
    slug: "digital-marketing-complete-guide",
    title: "Digital Marketing: The Complete Guide",
    shortDescription:
      "SEO, social media marketing, email campaigns, Google Ads, and analytics in one course.",
    teacherName: "Rachel Kim",
    teacherVerified: false,
    averageRating: 4.3,
    reviewCount: 432,
    pricingModel: "one_time",
    price: 7999,
    enrollmentCount: 2100,
    difficulty: "intermediate",
    category: "business",
  },
  {
    id: "6",
    slug: "yoga-for-athletes",
    title: "Yoga for Athletes: Flexibility & Recovery",
    shortDescription:
      "Improve mobility, prevent injuries, and recover faster with targeted yoga sequences.",
    teacherName: "Elena Vasquez",
    teacherVerified: true,
    averageRating: 4.9,
    reviewCount: 789,
    pricingModel: "free",
    price: 0,
    enrollmentCount: 12400,
    difficulty: "beginner",
    category: "fitness",
  },
  {
    id: "7",
    slug: "data-science-python",
    title: "Data Science with Python: Zero to Hero",
    shortDescription:
      "Pandas, NumPy, Matplotlib, scikit-learn, and TensorFlow. Real datasets and projects.",
    teacherName: "Prof. David Liu",
    teacherVerified: true,
    averageRating: 4.5,
    reviewCount: 1678,
    pricingModel: "one_time",
    price: 9999,
    enrollmentCount: 9200,
    difficulty: "intermediate",
    category: "technology",
  },
  {
    id: "8",
    slug: "freelancing-six-figures",
    title: "Freelancing to Six Figures",
    shortDescription:
      "Build a sustainable freelance business. Client acquisition, pricing, contracts, and scaling.",
    teacherName: "Alex Morgan",
    teacherVerified: true,
    averageRating: 4.4,
    reviewCount: 321,
    pricingModel: "one_time",
    price: 6999,
    enrollmentCount: 1850,
    difficulty: "all_levels",
    category: "business",
  },
  {
    id: "9",
    slug: "sports-nutrition-for-performance",
    title: "Sports Nutrition for Peak Performance",
    shortDescription:
      "Macronutrient timing, supplementation, hydration strategies for competitive athletes.",
    teacherName: "Dr. Marcus Johnson",
    teacherVerified: true,
    averageRating: 4.7,
    reviewCount: 456,
    pricingModel: "one_time",
    price: 3999,
    enrollmentCount: 2650,
    difficulty: "intermediate",
    category: "nutrition",
  },
  {
    id: "10",
    slug: "cybersecurity-fundamentals",
    title: "Cybersecurity Fundamentals & Ethical Hacking",
    shortDescription:
      "Network security, penetration testing, vulnerability assessment, and incident response.",
    teacherName: "Samantha Reed",
    teacherVerified: true,
    averageRating: 4.6,
    reviewCount: 923,
    pricingModel: "one_time",
    price: 8499,
    enrollmentCount: 5100,
    difficulty: "intermediate",
    category: "technology",
  },
  {
    id: "11",
    slug: "deadlift-technique-masterclass",
    title: "Deadlift Technique Masterclass",
    shortDescription:
      "Perfect your conventional and sumo deadlift form. Avoid injuries and break plateaus.",
    teacherName: "Coach James Wright",
    teacherVerified: true,
    averageRating: 4.8,
    reviewCount: 345,
    pricingModel: "one_time",
    price: 3499,
    enrollmentCount: 1900,
    difficulty: "all_levels",
    category: "fitness",
  },
  {
    id: "12",
    slug: "ecommerce-masterclass",
    title: "E-commerce Masterclass: Build & Scale Your Store",
    shortDescription:
      "Shopify, product sourcing, Facebook ads, email funnels, and scaling strategies.",
    teacherName: "Jordan Blake",
    teacherVerified: false,
    averageRating: 4.2,
    reviewCount: 198,
    pricingModel: "monthly",
    price: 2999,
    enrollmentCount: 980,
    difficulty: "beginner",
    category: "business",
  },
];

const CATEGORY_OPTIONS = [
  { value: "technology", label: "Technology" },
  { value: "fitness", label: "Fitness" },
  { value: "nutrition", label: "Nutrition" },
  { value: "business", label: "Business" },
];

const ITEMS_PER_PAGE = 9;

// ---------------------------------------------------------------------------
// Filtering helpers
// ---------------------------------------------------------------------------

function matchesPriceRange(
  course: CourseCardData,
  range: string
): boolean {
  if (!range) return true;
  const dollars = course.price / 100;
  switch (range) {
    case "free":
      return course.pricingModel === "free";
    case "under25":
      return course.pricingModel !== "free" && dollars < 25;
    case "25to50":
      return dollars >= 25 && dollars <= 50;
    case "50to100":
      return dollars > 50 && dollars <= 100;
    case "over100":
      return dollars > 100;
    default:
      return true;
  }
}

function sortCourses(
  courses: CourseCardData[],
  sortBy: string
): CourseCardData[] {
  const sorted = [...courses];
  switch (sortBy) {
    case "popular":
      return sorted.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
    case "newest":
      return sorted.sort(
        (a, b) => parseInt(b.id) - parseInt(a.id)
      );
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.averageRating - a.averageRating);
    default:
      return sorted;
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterValues>({
    category: "",
    priceRange: "",
    rating: "",
    difficulty: "",
    sortBy: "popular",
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const filteredCourses = useMemo(() => {
    let result = MOCK_COURSES;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.shortDescription.toLowerCase().includes(q) ||
          c.teacherName.toLowerCase().includes(q)
      );
    }

    // Category
    if (filters.category) {
      result = result.filter((c) => c.category === filters.category);
    }

    // Price range
    result = result.filter((c) => matchesPriceRange(c, filters.priceRange));

    // Rating
    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      result = result.filter((c) => c.averageRating >= minRating);
    }

    // Difficulty
    if (filters.difficulty) {
      result = result.filter((c) => c.difficulty === filters.difficulty);
    }

    // Sort
    result = sortCourses(result, filters.sortBy);

    return result;
  }, [searchQuery, filters]);

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Browse Courses</h1>
        <p className="mt-2 text-muted-foreground">
          Discover courses taught by verified experts across all disciplines.
        </p>
      </div>

      {/* Search */}
      <SearchBar
        placeholder="Search courses, topics, or teachers..."
        onSearch={handleSearch}
        className="mb-6 max-w-xl"
      />

      {/* Filters */}
      <CourseFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        categories={CATEGORY_OPTIONS}
        className="mb-8"
      />

      {/* Result count */}
      <p className="mb-4 text-sm text-muted-foreground">
        {filteredCourses.length}{" "}
        {filteredCourses.length === 1 ? "course" : "courses"} found
      </p>

      {/* Grid */}
      <CourseGrid courses={paginatedCourses} />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="mt-10"
      />
    </div>
  );
}
