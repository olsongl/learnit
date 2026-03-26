"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Bold, Italic, List, Heading2, Code, Link as LinkIcon } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content here... (Markdown supported)",
  className,
  minHeight = "200px",
}: RichTextEditorProps) {
  const [mode, setMode] = useState<"write" | "preview">("write");

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.querySelector(
      "[data-rich-editor]"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      prefix +
      (selectedText || "text") +
      suffix +
      value.substring(end);

    onChange(newText);
  };

  return (
    <div className={cn("rounded-md border", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b p-2 flex-wrap">
        <button
          type="button"
          onClick={() => insertMarkdown("**", "**")}
          className="p-1.5 rounded hover:bg-accent"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("*", "*")}
          className="p-1.5 rounded hover:bg-accent"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("## ")}
          className="p-1.5 rounded hover:bg-accent"
          title="Heading"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("- ")}
          className="p-1.5 rounded hover:bg-accent"
          title="List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("`", "`")}
          className="p-1.5 rounded hover:bg-accent"
          title="Code"
        >
          <Code className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("[", "](url)")}
          className="p-1.5 rounded hover:bg-accent"
          title="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>

        <div className="flex-1" />

        <div className="flex rounded-md border text-xs">
          <button
            type="button"
            onClick={() => setMode("write")}
            className={cn(
              "px-3 py-1 rounded-l-md",
              mode === "write" ? "bg-accent" : ""
            )}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={cn(
              "px-3 py-1 rounded-r-md",
              mode === "preview" ? "bg-accent" : ""
            )}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      {mode === "write" ? (
        <textarea
          data-rich-editor
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-4 text-sm resize-y focus:outline-none bg-transparent"
          style={{ minHeight }}
        />
      ) : (
        <div
          className="p-4 prose prose-sm max-w-none dark:prose-invert"
          style={{ minHeight }}
        >
          {value || (
            <span className="text-muted-foreground">Nothing to preview</span>
          )}
        </div>
      )}
    </div>
  );
}
