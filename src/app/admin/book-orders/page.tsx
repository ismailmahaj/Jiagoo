import Link from "next/link";
import prisma from "@/lib/prisma";
import { AdminBookOrderRow } from "@/components/admin/admin-book-order-row";

export const dynamic = "force-dynamic";

export default async function AdminBookOrdersPage() {
  const orders = await prisma.bookOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { book: true },
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy">Commandes livres</h1>
          <p className="mt-2 text-sm text-fhj-navy/65">Paiements Stripe et suivi des envois.</p>
        </div>
        <Link href="/admin/books" className="text-sm font-medium text-fhj-gold hover:underline">
          ← Catalogue livres
        </Link>
      </div>

      <div className="mt-10 overflow-x-auto rounded-2xl border border-fhj-navy/10 bg-white shadow-sm">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-fhj-cream text-xs uppercase tracking-wide text-fhj-navy/60">
            <tr>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Client</th>
              <th className="px-3 py-3">Livre</th>
              <th className="px-3 py-3">Qté</th>
              <th className="px-3 py-3">Total</th>
              <th className="px-3 py-3">Paiement</th>
              <th className="px-3 py-3">Livraison & suivi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <AdminBookOrderRow key={o.id} order={o} book={o.book} />
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-8 text-center text-sm text-fhj-navy/55">Aucune commande.</p>}
      </div>
    </div>
  );
}
