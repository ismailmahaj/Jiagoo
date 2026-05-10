import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatEuro } from "@/lib/format";
import { bookSalesStats } from "@/lib/book-queries";
import { AdminBookTable } from "@/components/admin/admin-book-table";

export const dynamic = "force-dynamic";

export default async function AdminBooksPage() {
  const [books, stats, pendingOrders, totalBooks] = await Promise.all([
    prisma.book.findMany({ orderBy: { updatedAt: "desc" } }),
    bookSalesStats(),
    prisma.bookOrder.count({ where: { paymentStatus: "PAID", orderStatus: { in: ["PENDING", "PROCESSING"] } } }),
    prisma.book.count(),
  ]);

  const totalOrders = await prisma.bookOrder.count({ where: { paymentStatus: "PAID" } });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy">Livres</h1>
          <p className="mt-2 text-sm text-fhj-navy/65">Librairie solidaire — catalogue et statistiques.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/books/nouveau"
            className="inline-flex rounded-full bg-gradient-to-r from-fhj-gold to-fhj-gold-light px-6 py-2.5 text-sm font-semibold text-fhj-navy shadow"
          >
            Ajouter un livre
          </Link>
          <Link
            href="/admin/book-orders"
            className="inline-flex rounded-full border border-fhj-navy/20 px-6 py-2.5 text-sm font-semibold text-fhj-navy hover:border-fhj-gold/40"
          >
            Commandes
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Titres au catalogue", value: String(totalBooks) },
          { label: "Commandes payées", value: String(totalOrders) },
          { label: "Revenus (ventes livres)", value: formatEuro(stats.revenueCents) },
          { label: "Exemplaires vendus", value: String(stats.booksSold) },
          { label: "eBooks vendus (lignes)", value: String(stats.ebookCount) },
          { label: "Livres physiques vendus (lignes)", value: String(stats.physicalCount) },
          { label: "Commandes à traiter / expédier", value: String(pendingOrders) },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-fhj-navy/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-fhj-navy/50">{c.label}</p>
            <p className="mt-2 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-fhj-navy">{c.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-14 font-[family-name:var(--font-playfair)] text-xl font-semibold text-fhj-navy">Catalogue</h2>
      <div className="mt-6">
        <AdminBookTable books={books} />
      </div>
    </div>
  );
}
