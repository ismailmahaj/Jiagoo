import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { sendBookPurchaseEmail } from "@/lib/send-book-email";

const schema = z.object({
  bookId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
});

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const json = await req.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Champs invalides." }, { status: 400 });
    }
    const { bookId, firstName, lastName, email } = parsed.data;

    const book = await prisma.book.findFirst({
      where: { id: bookId, status: "PUBLISHED", type: "FREE" },
    });
    if (!book) {
      return NextResponse.json({ error: "Livre gratuit introuvable." }, { status: 404 });
    }
    if (!book.pdfUrl) {
      return NextResponse.json({ error: "Fichier non disponible pour ce titre." }, { status: 400 });
    }

    const order = await prisma.$transaction(async (tx) => {
      const o = await tx.bookOrder.create({
        data: {
          bookId: book.id,
          userId: session?.user?.id ?? null,
          quantity: 1,
          subtotal: 0,
          shippingCents: 0,
          totalPrice: 0,
          paymentStatus: "PAID",
          orderStatus: "DELIVERED",
          customerFirstName: firstName.trim(),
          customerLastName: lastName.trim(),
          customerEmail: email.toLowerCase().trim(),
        },
      });
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      await tx.bookDownload.create({
        data: {
          orderId: o.id,
          bookId: book.id,
          userId: session?.user?.id ?? null,
          downloadToken: token,
          expiresAt,
        },
      });
      if (session?.user?.id) {
        const year = new Date().getFullYear();
        const count = await tx.bookReceipt.count({
          where: { createdAt: { gte: new Date(`${year}-01-01`) } },
        });
        await tx.bookReceipt.create({
          data: {
            number: `LIV-${year}-${String(count + 1).padStart(5, "0")}`,
            userId: session.user.id,
            bookOrderId: o.id,
          },
        });
      }
      return o;
    });

    const download = await prisma.bookDownload.findUnique({ where: { orderId: order.id } });
    const downloadUrl = download ? `${appUrl()}/api/livres/download/${download.downloadToken}` : undefined;

    await sendBookPurchaseEmail({
      to: email.toLowerCase().trim(),
      subject: `Votre eBook gratuit — ${book.title}`,
      bookTitle: book.title,
      orderId: order.id,
      downloadUrl,
    });

    return NextResponse.json({ ok: true, downloadUrl });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
