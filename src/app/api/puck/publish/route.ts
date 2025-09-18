import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import fs from "fs";
import { getUserFromCookie } from "@/lib/utils/auth";
import { notFound } from "next/navigation";
import { Metadata, Payload, RecordData } from "@/app/puck/types";

function createProcMetadata(payload: Payload, record: RecordData, username: string): Metadata {
  const now = new Date().toISOString();
  const incomingMeta = payload.data?.metadata ?? {};
  let meta = record?.metadata ?? {};

  // create metadata otherwise
  if (!record) {
    meta = {
      ...(incomingMeta || {}),
      createdAt: now,
      createdBy: username,
      updatedAt: now,
      updatedBy: username,
      version: 1,
    };
  } else {
    meta = {
      ...meta,
      createdAt: meta.createdAt ?? incomingMeta.createdAt ?? now,
      createdBy: meta.createdBy ?? incomingMeta.createdBy ?? username,
      updatedAt: now,
      updatedBy: username,
      version: (meta.version ?? 0) + 1,
    };
  }

  return meta
}

export async function POST(request: Request) {
  const payload = await request.json();

  if (!process.env.DB_JSON_PATH) {
    throw new Error('Missing DB_JSON_PATH environment variable');
  }

  const existingData = JSON.parse(
    fs.existsSync(process.env.DB_JSON_PATH)
      ? fs.readFileSync(process.env.DB_JSON_PATH, "utf-8")
      : "{}"
  );

  // check user and create metadata
  const user = await getUserFromCookie();
  if (!user) {
    return notFound();
  }

  const existingRecord = existingData[payload.path];
  const metadata = createProcMetadata(payload, existingRecord, user.username)

  const storedData = {
    ...payload.data,
    metadata,
  };

  const updatedData = {
    ...existingData,
    [payload.path]: storedData,
  };

  // fs.writeFileSync(process.env.DB_JSON_PATH, JSON.stringify(updatedData));
  // Try to Atomic write first
  try {
    const tmpPath = `${process.env.DB_JSON_PATH}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(updatedData, null, 2), "utf-8");
    fs.renameSync(tmpPath, process.env.DB_JSON_PATH);
  } catch (err) {
    console.error("Failed to write DB JSON:", err);
    return NextResponse.json({ status: "error", message: "Failed to write DB" }, { status: 500 });
  }

  // Purge Next.js cache
  revalidatePath(payload.path);

  return NextResponse.json({ status: "ok" });
}
