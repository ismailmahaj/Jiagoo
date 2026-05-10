import { NextResponse } from "next/server";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { join } from "path";
import prisma from "@/lib/prisma";

function safeBookFilename(url: string): string | null {
  const m = url.match(/^uploads\/books\/([a-zA-Z0-9._-]+)$/);
  return m ? m[1] : null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token || token.length < 32) {
    return NextResponse.json({ error: "Lien invalide." }, { status: 400 });
  }

  const dl = await prisma.bookDownload.findUnique({
    where: { downloadToken: token },
    include: { book: true, order: true },
  });
  if (!dl) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }
  if (dl.order.paymentStatus !== "PAID") {
    return NextResponse.json({ error: "Paiement non confirmé." }, { status: 403 });
  }
  if (dl.expiresAt < new Date()) {
    return NextResponse.json({ error: "Lien expiré." }, { status: 410 });
  }
  if (!dl.book.pdfUrl) {
    return NextResponse.json({ error: "Fichier non configuré." }, { status: 404 });
  }

  const localName = safeBookFilename(dl.book.pdfUrl);
  if (localName) {
    const abs = join(process.cwd(), "uploads", "books", localName);
    if (!existsSync(abs)) {
      return NextResponse.json({ error: "Fichier absent du serveur." }, { status: 404 });
    }
    await prisma.bookDownload.update({
      where: { id: dl.id },
      data: { downloadCount: { increment: 1 } },
    });
    const buf = await readFile(abs);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${localName.replace(/"/g, "")}"`,
      },
    });
  }

  if (dl.book.pdfUrl.startsWith("http://") || dl.book.pdfUrl.startsWith("https://")) {
    await prisma.bookDownload.update({
      where: { id: dl.id },
      data: { downloadCount: { increment: 1 } },
    });
    const res = await fetch(dl.book.pdfUrl);
    if (!res.ok) {
      return NextResponse.json({ error: "Impossible de récupérer le fichier." }, { status: 502 });
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${dl.book.slug}.pdf"`,
      },
    });
  }

  return NextResponse.json({ error: "Format de fichier non supporté." }, { status: 400 });
}
