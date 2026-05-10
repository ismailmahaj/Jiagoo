import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("multipart/form-data")) {
    return NextResponse.json({ error: "multipart/form-data requis." }, { status: 400 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "PDF uniquement." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 25 Mo)." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const safeName = `${randomBytes(16).toString("hex")}.pdf`;
  const dir = join(process.cwd(), "uploads", "books");
  await mkdir(dir, { recursive: true });
  const abs = join(dir, safeName);
  await writeFile(abs, buf);

  const relative = `uploads/books/${safeName}`;
  return NextResponse.json({ url: relative });
}
