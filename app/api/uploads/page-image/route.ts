import { NextResponse, type NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { auth } from "@clerk/nextjs/server";

const bucket = process.env.R2_BUCKET_NAME;
const endpoint = process.env.R2_ENDPOINT;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

const s3Client =
  bucket && endpoint && accessKeyId && secretAccessKey
    ? new S3Client({
        region: "auto",
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      })
    : null;

const sanitizeHandle = (handle: string) =>
  handle.trim().replace(/^@+/, "").replace(/[^a-zA-Z0-9-_]/g, "-") || "page";

const buildObjectKey = (userId: string, handle: string, fileName: string) => {
  const ext = fileName.includes(".")
    ? fileName.slice(fileName.lastIndexOf("."))
    : "";
  const safeHandle = sanitizeHandle(handle);
  // 동일 키 업로드 시 R2는 기존 객체를 덮어쓴다.
  return `page-images/${userId}/${safeHandle}${ext || ".bin"}`;
};

const buildPublicUrl = (key: string) => {
  if (publicBaseUrl) {
    return `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
  }

  if (endpoint?.startsWith("https://") && bucket) {
    return `${endpoint.replace(/\/$/, "")}/${bucket}/${key}`;
  }

  return key;
};

export async function POST(req: NextRequest) {
  try {
    if (!s3Client || !bucket) {
      return NextResponse.json(
        { error: "Storage not configured" },
        { status: 500 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const handle = formData.get("handle");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }

    if (typeof handle !== "string" || !handle.trim()) {
      return NextResponse.json({ error: "Invalid handle" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const key = buildObjectKey(userId, handle, file.name || "upload");

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from(arrayBuffer),
        ContentType: file.type || "application/octet-stream",
        ACL: "private",
      })
    );

    const url = buildPublicUrl(key);

    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
