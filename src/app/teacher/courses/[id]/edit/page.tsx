"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Plus, Trash2, GripVertical, Save, Send } from "lucide-react";

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"content" | "details" | "settings">("content");
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newLessonData, setNewLessonData] = useState<Record<string, { title: string; type: string }>>({});

  useEffect(() => {
    async function load() {
      try {
        // We need to find the course by ID - fetch all teacher courses and find it
        const [modulesRes] = await Promise.all([
          fetch(`/api/courses/${courseId}/modules`),
        ]);
        const modulesData = await modulesRes.json();
        if (modulesData.success) setModules(modulesData.data || []);

        // Fetch course details
        const coursesRes = await fetch(`/api/courses?teacherId=me&limit=50`);
        const coursesData = await coursesRes.json();
        if (coursesData.success) {
          const found = coursesData.data?.items?.find((c: any) => c._id === courseId);
          if (found) setCourse(found);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId]);

  async function addModule() {
    if (!newModuleTitle.trim()) return;
    const res = await fetch(`/api/courses/${courseId}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newModuleTitle }),
    });
    const data = await res.json();
    if (data.success) {
      setModules([...modules, { ...data.data, lessons: [] }]);
      setNewModuleTitle("");
    }
  }

  async function deleteModule(moduleId: string) {
    const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}`, {
      method: "DELETE",
    });
    if ((await res.json()).success) {
      setModules(modules.filter((m) => m._id !== moduleId));
    }
  }

  async function addLesson(moduleId: string) {
    const lessonData = newLessonData[moduleId];
    if (!lessonData?.title) return;
    const res = await fetch(
      `/api/courses/${courseId}/modules/${moduleId}/lessons`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lessonData.title,
          type: lessonData.type || "video",
          content: {},
        }),
      }
    );
    const data = await res.json();
    if (data.success) {
      setModules(
        modules.map((m) =>
          m._id === moduleId
            ? { ...m, lessons: [...(m.lessons || []), data.data] }
            : m
        )
      );
      setNewLessonData({ ...newLessonData, [moduleId]: { title: "", type: "video" } });
    }
  }

  async function deleteLesson(moduleId: string, lessonId: string) {
    const res = await fetch(
      `/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
      { method: "DELETE" }
    );
    if ((await res.json()).success) {
      setModules(
        modules.map((m) =>
          m._id === moduleId
            ? { ...m, lessons: m.lessons.filter((l: any) => l._id !== lessonId) }
            : m
        )
      );
    }
  }

  async function publishCourse() {
    setSaving(true);
    const res = await fetch(`/api/courses/${courseId}/publish`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      setCourse({ ...course, status: "pending_review" });
    }
    setSaving(false);
  }

  if (loading) return <LoadingSpinner />;
  if (!course) return <p className="text-muted-foreground">Course not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <Badge className="mt-1">{course.status}</Badge>
        </div>
        <div className="flex gap-2">
          {(course.status === "draft" || course.status === "archived") && (
            <Button onClick={publishCourse} disabled={saving}>
              <Send className="mr-2 h-4 w-4" />
              Submit for Review
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b">
        {(["content", "details", "settings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "content" && (
        <div className="space-y-4">
          {modules.map((mod) => (
            <Card key={mod._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">{mod.title}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteModule(mod._id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {mod.lessons?.map((lesson: any) => (
                  <div
                    key={lesson._id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {lesson.type}
                      </Badge>
                      <span className="text-sm">{lesson.title}</span>
                      {lesson.isFreePreview && (
                        <Badge variant="secondary" className="text-xs">
                          Preview
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteLesson(mod._id, lesson._id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Input
                    placeholder="Lesson title"
                    value={newLessonData[mod._id]?.title || ""}
                    onChange={(e) =>
                      setNewLessonData({
                        ...newLessonData,
                        [mod._id]: { ...newLessonData[mod._id], title: e.target.value, type: newLessonData[mod._id]?.type || "video" },
                      })
                    }
                    className="flex-1"
                  />
                  <select
                    className="rounded-md border px-2 text-sm"
                    value={newLessonData[mod._id]?.type || "video"}
                    onChange={(e) =>
                      setNewLessonData({
                        ...newLessonData,
                        [mod._id]: { ...newLessonData[mod._id], title: newLessonData[mod._id]?.title || "", type: e.target.value },
                      })
                    }
                  >
                    <option value="video">Video</option>
                    <option value="text">Text</option>
                    <option value="quiz">Quiz</option>
                    <option value="download">Download</option>
                    <option value="live_session">Live</option>
                  </select>
                  <Button size="sm" onClick={() => addLesson(mod._id)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex gap-2">
            <Input
              placeholder="New module title"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
            />
            <Button onClick={addModule}>
              <Plus className="mr-2 h-4 w-4" />
              Add Module
            </Button>
          </div>
        </div>
      )}

      {tab === "details" && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label>Title</Label>
              <Input value={course.title} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={course.description} readOnly className="bg-muted" rows={4} />
            </div>
            <p className="text-sm text-muted-foreground">
              To edit course details, update the course via the API or course creation wizard. Full inline editing coming soon.
            </p>
          </CardContent>
        </Card>
      )}

      {tab === "settings" && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Course Status</p>
                <p className="text-sm text-muted-foreground">{course.status}</p>
              </div>
              {course.status === "published" && (
                <Button variant="destructive" size="sm">
                  Archive Course
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Pricing</p>
                <p className="text-sm text-muted-foreground">
                  {course.pricingModel === "free" ? "Free" : `${course.pricingModel} — ${(course.price / 100).toFixed(2)}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
