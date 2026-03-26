"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onUpload: (file: File) => Promise<string>;
  accept?: Record<string, string[]>;
  maxSize?: number;
  className?: string;
  label?: string;
  currentFile?: string;
  onRemove?: () => void;
}

export function FileUploader({
  onUpload,
  accept,
  maxSize = 50 * 1024 * 1024, // 50MB default
  className,
  label = "Upload a file",
  currentFile,
  onRemove,
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(
    currentFile || null
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setError(null);
      setUploading(true);

      try {
        const url = await onUpload(file);
        setUploadedUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  if (uploadedUrl) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-md border p-3",
          className
        )}
      >
        <FileIcon className="h-5 w-5 text-primary" />
        <span className="flex-1 text-sm truncate">{uploadedUrl}</span>
        {onRemove && (
          <button
            onClick={() => {
              setUploadedUrl(null);
              onRemove();
            }}
            className="p-1 hover:bg-accent rounded"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center rounded-md border-2 border-dashed p-8 transition-colors cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              {isDragActive ? "Drop file here" : label}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
