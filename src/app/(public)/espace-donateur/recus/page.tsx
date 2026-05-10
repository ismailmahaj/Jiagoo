import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { formatEuro } from "@/lib/format";

export default async function DonateurRecusPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const recus = await prisma.receipt.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      donation: {
        include: { project: { select: { title: true } } },
      },
    },
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-fhj-navy/10 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-fhj-cream text-xs uppercase tracking-wide text-fhj-navy/60">
          <tr>
            <th className="px-4 py-3">Numéro</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Projet</th>
            <th className="px-4 py-3">Montant</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {recus.map((r) => (
            <tr key={r.id} className="border-t border-fhj-navy/10">
              <td className="px-4 py-3 font-mono text-xs">{r.number}</td>
              <td className="px-4 py-3">{r.createdAt.toLocaleDateString("fr-FR", { dateStyle: "medium" })}</td>
              <td className="px-4 py-3">{r.donation.project.title}</td>
              <td className="px-4 py-3 font-medium">{formatEuro(r.donation.amount)}</td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/api/donateur/recus/${r.id}/telecharger`}
                  className="font-medium text-fhj-gold hover:underline"
                >
                  Télécharger
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {recus.length === 0 && (
        <p className="p-8 text-center text-sm text-fhj-navy/55">
          Les reçus sont générés automatiquement après paiement réussi lorsque vous étiez connecté.
        </p>
      )}
    </div>
  );
}
