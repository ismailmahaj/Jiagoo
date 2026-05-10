import prisma from "@/lib/prisma";

export async function bookSalesStats() {
  const paid = await prisma.bookOrder.findMany({
    where: { paymentStatus: "PAID" },
    select: { quantity: true, totalPrice: true },
  });
  const booksSold = paid.reduce((s, o) => s + o.quantity, 0);
  const revenueCents = paid.reduce((s, o) => s + o.totalPrice, 0);
  const ebookCount = await prisma.bookOrder.count({
    where: { paymentStatus: "PAID", book: { type: "EBOOK" } },
  });
  const physicalCount = await prisma.bookOrder.count({
    where: { paymentStatus: "PAID", book: { type: "PHYSICAL" } },
  });
  return { booksSold, revenueCents, ebookCount, physicalCount };
}
