"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  PlayCircle,
  FileText,
  HelpCircle,
  Download,
  Radio,
  Lock,
  Eye,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  type: "video" | "text" | "quiz" | "download" | "live_session";
  duration?: number;
  isFreePreview: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface ModuleListProps {
  modules: Module[];
  className?: string;
}

const lessonTypeIcons: Record<Lesson["type"], React.ComponentType<{ className?: string }>> = {
  video: PlayCircle,
  text: FileText,
  quiz: HelpCircle,
  download: Download,
  live_session: Radio,
};

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function ModuleList({ modules, className }: ModuleListProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => new Set(modules.length > 0 ? [modules[0].id] : [])
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalDuration = modules.reduce(
    (sum, m) =>
      sum +
      m.lessons.reduce((ls, l) => ls + (l.duration ?? 0), 0),
    0
  );

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Course Content</h2>
        <span className="text-sm text-muted-foreground">
          {modules.length} {modules.length === 1 ? "module" : "modules"} &middot;{" "}
          {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"} &middot;{" "}
          {formatDuration(totalDuration)}
        </span>
      </div>

      <div className="border rounded-lg overflow-hidden divide-y">
        {modules.map((module) => {
          const isExpanded = expandedModules.has(module.id);
          const moduleDuration = module.lessons.reduce(
            (sum, l) => sum + (l.duration ?? 0),
            0
          );

          return (
            <div key={module.id}>
              {/* Module Header */}
              <button
                type="button"
                className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted/80 transition-colors text-left"
                onClick={() => toggleModule(module.id)}
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-2">
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                  <span className="font-semibold text-sm">{module.title}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {module.lessons.length}{" "}
                  {module.lessons.length === 1 ? "lesson" : "lessons"} &middot;{" "}
                  {formatDuration(moduleDuration)}
                </span>
              </button>

              {/* Lessons */}
              {isExpanded && (
                <div className="divide-y">
                  {module.lessons.map((lesson) => {
                    const Icon = lessonTypeIcons[lesson.type];
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between px-4 py-3 pl-10 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="text-sm truncate">{lesson.title}</span>
                          {lesson.isFreePreview && (
                            <Badge
                              variant="outline"
                              className="text-[10px] shrink-0 gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              Preview
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-2 shrink-0">
                          {lesson.duration && (
                            <span className="text-xs text-muted-foreground">
                              {formatDuration(lesson.duration)}
                            </span>
                          )}
                          {!lesson.isFreePreview && (
                            <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
