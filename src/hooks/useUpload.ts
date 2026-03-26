"use client";

import { useState, useCallback } from "react";

interface UploadOptions {
  folder: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export function useUpload({ folder, onSuccess, onError }: UploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(
    async (file: File): Promise<string> => {
      setUploading(true);
      setProgress(0);

      try {
        // Get presigned URL
        const presignRes = await fetch("/api/uploads/presigned-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            folder,
          }),
        });

        if (!presignRes.ok) throw new Error("Failed to get upload URL");

        const { url, key } = await presignRes.json();

        // Upload to S3 / local
        if (url.startsWith("/api/")) {
          // Local upload
          const formData = new FormData();
          formData.append("file", file);
          formData.append("key", key);

          const uploadRes = await fetch(url, {
            method: "POST",
            body: formData,
          });

          if (!uploadRes.ok) throw new Error("Upload failed");
        } else {
          // S3 presigned upload
          await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });
        }

        // Confirm upload
        const confirmRes = await fetch("/api/uploads/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key }),
        });

        if (!confirmRes.ok) throw new Error("Upload confirmation failed");

        const { fileUrl } = await confirmRes.json();

        setProgress(100);
        onSuccess?.(fileUrl);
        return fileUrl;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Upload failed");
        onError?.(error);
        throw error;
      } finally {
        setUploading(false);
      }
    },
    [folder, onSuccess, onError]
  );

  return { upload, uploading, progress };
}
