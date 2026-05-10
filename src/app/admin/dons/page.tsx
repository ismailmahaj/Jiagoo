import prisma from "@/lib/prisma";
import { formatEuro } from "@/lib/format";

export default async function AdminDonationsPage() {
  const dons = await prisma.donation.findMany({
    orderBy: { createdAt: "desc" },
    include: { project: { select: { title: true } }, user: { select: { email: true, firstName: true, lastName: true } } },
    take: 200,
  });

  return (
    <div>
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy">Dons</h1>
      <p className="mt-1 text-sm text-fhj-navy/65">Liste des dons enregistrés (les plus récents en premier).</p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-fhj-navy/10 bg-white shadow-sm">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="bg-fhj-cream text-xs uppercase tracking-wide text-fhj-navy/55">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Donateur</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Projet</th>
              <th className="px-4 py-3">Statut paiement</th>
            </tr>
          </thead>
          <tbody>
            {dons.map((d) => {
              const name = d.anonymous
                ? "Anonyme"
                : d.user
                  ? `${d.user.firstName} ${d.user.lastName}`
                  : `${d.donorFirstName ?? ""} ${d.donorLastName ?? ""}`.trim() || "—";
              return (
                <tr key={d.id} className="border-t border-fhj-navy/10">
                  <td className="px-4 py-3 whitespace-nowrap text-fhj-navy/75">
                    {d.createdAt.toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">{name}</td>
                  <td className="px-4 py-3 font-medium">{formatEuro(d.amount)}</td>
                  <td className="px-4 py-3">{d.project.title}</td>
                  <td className="px-4 py-3">{d.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
