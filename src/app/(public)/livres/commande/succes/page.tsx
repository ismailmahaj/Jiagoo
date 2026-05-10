import Link from "next/link";
import prisma from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export default async function LivreCommandeSuccesPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  let downloadUrl: string | null = null;
  let bookTitle = "";
  let pending = false;

  if (session_id) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const orderId = session.metadata?.orderId;
      if (orderId) {
        const order = await prisma.bookOrder.findUnique({
          where: { id: orderId },
          include: { book: true, download: true },
        });
        if (order) {
          bookTitle = order.book.title;
          if (order.paymentStatus === "PAID" && order.download) {
            const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";
            downloadUrl = `${base}/api/livres/download/${order.download.downloadToken}`;
          } else if (order.paymentStatus === "PENDING") {
            pending = true;
          }
        }
      }
    } catch {
      pending = true;
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center md:px-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
        ✓
      </div>
      <h1 className="mt-6 font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy">Merci !</h1>
      <p className="mt-4 text-fhj-navy/75">
        {bookTitle ? `Votre commande pour « ${bookTitle} » a bien été enregistrée.` : "Votre paiement est en cours de confirmation."}
      </p>
      {pending && (
        <p className="mt-3 text-sm text-fhj-navy/60">
          Le paiement peut prendre quelques secondes. Vous recevrez un e-mail avec le lien de téléchargement pour les eBooks.
        </p>
      )}
      {downloadUrl && (
        <a
          href={downloadUrl}
          className="mt-8 inline-block rounded-full bg-gradient-to-r from-fhj-gold to-fhj-gold-light px-8 py-3 text-sm font-semibold text-fhj-navy"
        >
          Télécharger le PDF
        </a>
      )}
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/espace-donateur/achats" className="text-sm font-medium text-fhj-gold hover:underline">
          Mes achats
        </Link>
        <Link href="/livres" className="text-sm text-fhj-navy/60 hover:underline">
          Retour au catalogue
        </Link>
      </div>
    </div>
  );
}
