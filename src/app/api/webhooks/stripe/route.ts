import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { fulfillBookOrderFromStripe } from "@/lib/stripe-book-fulfillment";

export async function POST(req: Request) {
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!whSecret) {
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 500 });
  }

  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, whSecret);
  } catch (err) {
    console.error("Webhook Stripe:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata || {};

    if (meta.checkoutType === "book" && meta.orderId) {
      await fulfillBookOrderFromStripe(session);
      return NextResponse.json({ received: true });
    }

    const donationId = meta.donationId;
    if (!donationId) {
      return NextResponse.json({ received: true });
    }

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: { project: true },
    });
    if (!donation || donation.status === "COMPLETED") {
      return NextResponse.json({ received: true });
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    await prisma.donation.update({
      where: { id: donationId },
      data: {
        status: "COMPLETED",
        stripePaymentId: paymentIntentId,
      },
    });

    if (donation.userId) {
      const already = await prisma.receipt.findUnique({ where: { donationId: donation.id } });
      if (!already) {
        const year = new Date().getFullYear();
        const count = await prisma.receipt.count({
          where: { createdAt: { gte: new Date(`${year}-01-01`) } },
        });
        const number = `REC-${year}-${String(count + 1).padStart(5, "0")}`;
        await prisma.receipt.create({
          data: {
            number,
            userId: donation.userId,
            donationId: donation.id,
          },
        });
      }
    }

    await prisma.adminLog.create({
      data: {
        action: "DON_STRIPE_COMPLET",
        details: `Don ${donationId} — ${donation.amount / 100} € — projet ${donation.project.title}`,
      },
    });
  }

  return NextResponse.json({ received: true });
}
