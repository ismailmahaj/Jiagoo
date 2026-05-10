import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { formatEuro } from "@/lib/format";
import { bookFulfillmentLabel, bookOrderPaymentLabel, bookTypeLabel } from "@/lib/books-labels";
import { DownloadButton } from "@/components/books/download-button";

export default async function DonateurAchatsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";

  const orders = await prisma.bookOrder.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { book: true, download: true, receipt: true },
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-fhj-navy/10 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-fhj-cream text-xs uppercase tracking-wide text-fhj-navy/60">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Livre</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Montant</th>
            <th className="px-4 py-3">Paiement</th>
            <th className="px-4 py-3">Livraison</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const downloadHref =
              o.paymentStatus === "PAID" && o.download ? `${base}/api/livres/download/${o.download.downloadToken}` : null;
            const isDigital = o.book.type === "EBOOK" || o.book.type === "FREE";
            return (
              <tr key={o.id} className="border-t border-fhj-navy/10">
                <td className="px-4 py-3 text-fhj-navy/80">
                  {o.createdAt.toLocaleDateString("fr-FR", { dateStyle: "medium" })}
                </td>
                <td className="px-4 py-3 font-medium text-fhj-navy">{o.book.title}</td>
                <td className="px-4 py-3 text-fhj-navy/70">{bookTypeLabel(o.book.type)}</td>
                <td className="px-4 py-3 font-medium">{formatEuro(o.totalPrice)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-fhj-navy/5 px-2 py-0.5 text-xs">{bookOrderPaymentLabel(o.paymentStatus)}</span>
                </td>
                <td className="px-4 py-3 text-xs text-fhj-navy/75">
                  {isDigital ? "—" : bookFulfillmentLabel(o.orderStatus)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    {downloadHref && <DownloadButton href={downloadHref} label="Télécharger PDF" className="inline-flex w-fit rounded-full bg-gradient-to-r from-fhj-gold to-fhj-gold-light px-3 py-1.5 text-xs font-semibold text-fhj-navy" />}
                    {o.receipt && (
                      <span className="text-xs text-fhj-navy/55">Reçu {o.receipt.number}</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {orders.length === 0 && (
        <p className="p-8 text-center text-sm text-fhj-navy/55">
          Aucun achat pour le moment. Découvrez notre{" "}
          <a href="/livres" className="font-medium text-fhj-gold hover:underline">
            librairie solidaire
          </a>
          .
        </p>
      )}
    </div>
  );
}
