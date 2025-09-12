import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import fs from "fs";

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

  const updatedData = {
    ...existingData,
    [payload.path]: payload.data,
  };

  fs.writeFileSync(process.env.DB_JSON_PATH, JSON.stringify(updatedData));

  // Purge Next.js cache
  revalidatePath(payload.path);

  return NextResponse.json({ status: "ok" });
}
