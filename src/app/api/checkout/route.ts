import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const schema = z.object({
  projectId: z.string().min(1),
  amountCents: z.number().int().positive().max(1_000_000_00),
  anonymous: z.boolean(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
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
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { projectId, amountCents, anonymous, firstName, lastName, email, phone } = parsed.data;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Projet introuvable." }, { status: 404 });
    }

    const donation = await prisma.donation.create({
      data: {
        amount: amountCents,
        anonymous,
        donorFirstName: firstName.trim(),
        donorLastName: lastName.trim(),
        donorEmail: email.toLowerCase().trim(),
        donorPhone: phone?.trim() || null,
        userId: session?.user?.id ?? null,
        projectId,
        status: "PENDING",
      },
    });

    const stripe = getStripe();
    const base = appUrl();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email.toLowerCase().trim(),
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: {
              name: `Don — ${project.title}`,
              description: "Fondation Hassen Jiagoo — île Maurice",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${base}/don/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/don?annule=1`,
      metadata: {
        donationId: donation.id,
      },
    });

    await prisma.donation.update({
      where: { id: donation.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ error: "Session Stripe invalide." }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error && e.message.includes("STRIPE_SECRET_KEY")
      ? "Paiement non configuré (Stripe)."
      : "Impossible de créer la session de paiement.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
