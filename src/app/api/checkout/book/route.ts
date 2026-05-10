import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const SHIPPING_CENTS = 600;

const schema = z.object({
  bookId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  shippingCity: z.string().optional().nullable(),
  shippingPostalCode: z.string().optional().nullable(),
  shippingCountry: z.string().optional().nullable(),
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
    const d = parsed.data;
    const book = await prisma.book.findFirst({
      where: { id: d.bookId, status: "PUBLISHED" },
    });
    if (!book) {
      return NextResponse.json({ error: "Livre introuvable ou non publié." }, { status: 404 });
    }

    if (book.type === "PHYSICAL") {
      if (!d.shippingAddress?.trim() || !d.shippingCity?.trim() || !d.shippingPostalCode?.trim() || !d.shippingCountry?.trim()) {
        return NextResponse.json({ error: "Adresse de livraison complète requise pour un livre physique." }, { status: 400 });
      }
      if (book.stock < d.quantity) {
        return NextResponse.json({ error: "Stock insuffisant." }, { status: 400 });
      }
    }

    const unit = book.type === "FREE" ? 0 : book.price;
    const subtotal = unit * d.quantity;
    const shippingCents = book.type === "PHYSICAL" ? SHIPPING_CENTS : 0;
    const totalPrice = subtotal + shippingCents;

    if (book.type === "FREE") {
      return NextResponse.json({ error: "Utilisez la récupération gratuite pour ce livre." }, { status: 400 });
    }

    if (totalPrice < 50) {
      return NextResponse.json({ error: "Montant minimum Stripe non atteint." }, { status: 400 });
    }

    const order = await prisma.bookOrder.create({
      data: {
        bookId: book.id,
        userId: session?.user?.id ?? null,
        quantity: d.quantity,
        subtotal,
        shippingCents,
        totalPrice,
        customerFirstName: d.firstName.trim(),
        customerLastName: d.lastName.trim(),
        customerEmail: d.email.toLowerCase().trim(),
        customerPhone: d.phone?.trim() || null,
        shippingAddress: d.shippingAddress?.trim() || null,
        shippingCity: d.shippingCity?.trim() || null,
        shippingPostalCode: d.shippingPostalCode?.trim() || null,
        shippingCountry: d.shippingCountry?.trim() || null,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
      },
    });

    const stripe = getStripe();
    const base = appUrl();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: d.email.toLowerCase().trim(),
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: unit,
            product_data: {
              name: `${book.title} — ${book.type === "EBOOK" ? "eBook" : "Livre"}`,
              description: "Fondation Hassen Jiagoo — Librairie solidaire",
            },
          },
          quantity: d.quantity,
        },
        ...(shippingCents > 0
          ? [
              {
                price_data: {
                  currency: "eur",
                  unit_amount: shippingCents,
                  product_data: {
                    name: "Frais de livraison",
                    description: book.title,
                  },
                },
                quantity: 1,
              },
            ]
          : []),
      ],
      success_url: `${base}/livres/commande/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/checkout/book/${book.id}?annule=1`,
      metadata: {
        checkoutType: "book",
        orderId: order.id,
        bookId: book.id,
      },
    });

    await prisma.bookOrder.update({
      where: { id: order.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ error: "Session Stripe invalide." }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Impossible de créer le paiement." }, { status: 500 });
  }
}
