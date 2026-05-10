import type Stripe from "stripe";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { sendBookPurchaseEmail } from "@/lib/send-book-email";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export async function fulfillBookOrderFromStripe(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const order = await prisma.bookOrder.findUnique({
    where: { id: orderId },
    include: { book: true },
  });
  if (!order || order.paymentStatus === "PAID") return;

  await prisma.$transaction(async (tx) => {
    await tx.bookOrder.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        stripePaymentId: paymentIntentId,
        orderStatus: order.book.type === "PHYSICAL" ? "PROCESSING" : "DELIVERED",
      },
    });

    if (order.book.type === "PHYSICAL") {
      await tx.book.update({
        where: { id: order.bookId },
        data: { stock: { decrement: order.quantity } },
      });
    }

    if (order.book.type === "EBOOK" || order.book.type === "FREE") {
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      await tx.bookDownload.create({
        data: {
          orderId: order.id,
          bookId: order.bookId,
          userId: order.userId,
          downloadToken: token,
          expiresAt,
        },
      });
    }

    if (order.userId) {
      const year = new Date().getFullYear();
      const count = await tx.bookReceipt.count({
        where: { createdAt: { gte: new Date(`${year}-01-01`) } },
      });
      const number = `LIV-${year}-${String(count + 1).padStart(5, "0")}`;
      await tx.bookReceipt.create({
        data: {
          number,
          userId: order.userId,
          bookOrderId: order.id,
        },
      });
    }
  });

  const updated = await prisma.bookOrder.findUnique({
    where: { id: orderId },
    include: { book: true, download: true },
  });
  if (!updated) return;

  let downloadUrl: string | undefined;
  if (updated.download) {
    downloadUrl = `${appUrl()}/api/livres/download/${updated.download.downloadToken}`;
  }

  await sendBookPurchaseEmail({
    to: updated.customerEmail,
    subject: `Votre commande — ${updated.book.title}`,
    bookTitle: updated.book.title,
    orderId: updated.id,
    downloadUrl,
  });

  await prisma.adminLog.create({
    data: {
      action: "BOOK_ORDER_PAID",
      details: `Commande ${orderId} — ${updated.book.title} — ${updated.totalPrice / 100} €`,
    },
  });
}
