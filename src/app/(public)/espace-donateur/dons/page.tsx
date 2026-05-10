import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { formatEuro } from "@/lib/format";

export default async function DonateurDonsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const dons = await prisma.donation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { project: { select: { title: true } } },
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-fhj-navy/10 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-fhj-cream text-xs uppercase tracking-wide text-fhj-navy/60">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Projet</th>
            <th className="px-4 py-3">Montant</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3">Anonyme</th>
          </tr>
        </thead>
        <tbody>
          {dons.map((d) => (
            <tr key={d.id} className="border-t border-fhj-navy/10">
              <td className="px-4 py-3 text-fhj-navy/80">
                {d.createdAt.toLocaleDateString("fr-FR", { dateStyle: "medium" })}
              </td>
              <td className="px-4 py-3">{d.project.title}</td>
              <td className="px-4 py-3 font-medium">{formatEuro(d.amount)}</td>
              <td className="px-4 py-3">
                {d.status === "COMPLETED" ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800">Complété</span>
                ) : d.status === "PENDING" ? (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-900">En attente</span>
                ) : (
                  <span className="text-fhj-navy/60">{d.status}</span>
                )}
              </td>
              <td className="px-4 py-3">{d.anonymous ? "Oui" : "Non"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {dons.length === 0 && <p className="p-8 text-center text-sm text-fhj-navy/55">Aucun don enregistré pour le moment.</p>}
    </div>
  );
}
