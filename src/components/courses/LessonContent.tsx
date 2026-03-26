"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  Video,
  Calendar,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LessonType, QuizQuestion, LessonFile } from "@/types";

/* ---------- sub-renderers ---------- */

function VideoPlayer({ videoUrl }: { videoUrl?: string }) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  function handleTimeUpdate() {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  }

  function handleFullscreen() {
    videoRef.current?.requestFullscreen?.();
  }

  if (!videoUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Play className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Video content will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        className="aspect-video w-full"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setPlaying(false)}
        onClick={togglePlay}
      />

      {/* controls overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        {/* seek bar */}
        <div
          className="mb-3 h-1 w-full cursor-pointer rounded-full bg-white/30"
          onClick={handleSeek}
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="text-white hover:text-primary transition-colors"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={toggleMute}
            className="text-white hover:text-primary transition-colors"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>

          <div className="flex-1" />

          <button
            onClick={handleFullscreen}
            className="text-white hover:text-primary transition-colors"
            aria-label="Fullscreen"
          >
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TextContent({ body }: { body?: string }) {
  if (!body) {
    return (
      <p className="text-muted-foreground">No text content available.</p>
    );
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none sm:prose-base">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
    </div>
  );
}

function QuizPlayer({ questions }: { questions?: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <p className="text-muted-foreground">No quiz questions available.</p>
    );
  }

  const score = questions.reduce((acc, q, i) => {
    return acc + (answers[i] === q.correctAnswer ? 1 : 0);
  }, 0);

  function selectOption(questionIndex: number, optionIndex: number) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  function handleRetry() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <div className="space-y-6">
      {questions.map((q, qi) => (
        <Card key={qi}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Question {qi + 1} of {questions.length}
            </CardTitle>
            <CardDescription className="text-foreground font-medium text-sm">
              {q.question}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {q.options.map((option, oi) => {
              const selected = answers[qi] === oi;
              const isCorrect = q.correctAnswer === oi;

              let optionStyle = "border-border";
              if (submitted) {
                if (isCorrect) optionStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950";
                else if (selected && !isCorrect)
                  optionStyle = "border-destructive bg-destructive/5";
              } else if (selected) {
                optionStyle = "border-primary bg-primary/5";
              }

              return (
                <button
                  key={oi}
                  onClick={() => selectOption(qi, oi)}
                  disabled={submitted}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                    optionStyle,
                    !submitted && "hover:border-primary/50 hover:bg-accent cursor-pointer",
                    submitted && "cursor-default"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                      selected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {selected && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="flex-1">{option}</span>
                  {submitted && isCorrect && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  )}
                  {submitted && selected && !isCorrect && (
                    <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                  )}
                </button>
              );
            })}

            {submitted && q.explanation && (
              <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                <span className="font-medium">Explanation: </span>
                {q.explanation}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {submitted ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-lg font-semibold">
                  Your Score: {score} / {questions.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {score === questions.length
                    ? "Perfect score!"
                    : score >= questions.length * 0.7
                    ? "Great job!"
                    : "Keep studying and try again."}
                </p>
              </div>
              <Badge
                variant={
                  score === questions.length
                    ? "success"
                    : score >= questions.length * 0.7
                    ? "warning"
                    : "destructive"
                }
              >
                {Math.round((score / questions.length) * 100)}%
              </Badge>
            </CardContent>
          </Card>
          <Button variant="outline" onClick={handleRetry}>
            Retry Quiz
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
        >
          Submit Answers
        </Button>
      )}
    </div>
  );
}

function DownloadList({ files }: { files?: LessonFile[] }) {
  if (!files || files.length === 0) {
    return (
      <p className="text-muted-foreground">No files available for download.</p>
    );
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-3">
      {files.map((file, i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatSize(file.size)}
              </p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <a href={file.url} download>
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function LiveSession({
  scheduledAt,
  meetingUrl,
}: {
  scheduledAt?: string | Date;
  meetingUrl?: string;
}) {
  const sessionDate = scheduledAt ? new Date(scheduledAt) : null;
  const now = new Date();
  const isAvailable = sessionDate ? now >= new Date(sessionDate.getTime() - 10 * 60 * 1000) : false;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Live Session</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessionDate ? (
          <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {sessionDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {sessionDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Session time to be announced.
          </p>
        )}

        <Button
          disabled={!isAvailable || !meetingUrl}
          className="w-full"
          asChild={isAvailable && !!meetingUrl ? true : undefined}
        >
          {isAvailable && meetingUrl ? (
            <a href={meetingUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Join Meeting
            </a>
          ) : (
            <span>
              <Video className="mr-2 h-4 w-4" />
              {!meetingUrl ? "Meeting link not available" : "Not yet available"}
            </span>
          )}
        </Button>

        {!isAvailable && sessionDate && (
          <p className="text-center text-xs text-muted-foreground">
            The join button will be enabled 10 minutes before the session.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------- main component ---------- */

interface LessonContentProps {
  type: LessonType;
  content: {
    videoUrl?: string;
    duration?: number;
    body?: string;
    questions?: QuizQuestion[];
    files?: LessonFile[];
    scheduledAt?: string | Date;
    meetingUrl?: string;
  };
}

export function LessonContent({ type, content }: LessonContentProps) {
  switch (type) {
    case "video":
      return <VideoPlayer videoUrl={content.videoUrl} />;
    case "text":
      return <TextContent body={content.body} />;
    case "quiz":
      return <QuizPlayer questions={content.questions} />;
    case "download":
      return <DownloadList files={content.files} />;
    case "live_session":
      return (
        <LiveSession
          scheduledAt={content.scheduledAt}
          meetingUrl={content.meetingUrl}
        />
      );
    default:
      return (
        <p className="text-muted-foreground">
          Unknown lesson type.
        </p>
      );
  }
}
