import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

const isLocal = process.env.STORAGE_PROVIDER === "local";

const s3Client = isLocal
  ? new S3Client({
      region: "us-east-1",
      endpoint: "http://localhost:9000",
      credentials: {
        accessKeyId: "minioadmin",
        secretAccessKey: "minioadmin",
      },
      forcePathStyle: true,
    })
  : new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });

const BUCKET = process.env.AWS_S3_BUCKET || "cmart-uploads";
const LOCAL_UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR || "./uploads";

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  if (isLocal) {
    // For local dev, return a local API endpoint
    return `/api/uploads/local?key=${encodeURIComponent(key)}`;
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function getPresignedDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  if (isLocal) {
    return `/uploads/${key}`;
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function deleteFile(key: string): Promise<void> {
  if (isLocal) {
    const filePath = path.join(LOCAL_UPLOAD_DIR, key);
    await unlink(filePath).catch(() => {});
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

export async function saveLocalFile(
  key: string,
  buffer: Buffer
): Promise<void> {
  const filePath = path.join(LOCAL_UPLOAD_DIR, key);
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  await writeFile(filePath, buffer);
}

export function getPublicUrl(key: string): string {
  if (isLocal) {
    return `/uploads/${key}`;
  }
  return `https://${BUCKET}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
}

export { s3Client, BUCKET };
