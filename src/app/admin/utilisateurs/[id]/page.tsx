import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatEuro } from "@/lib/format";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id, role: "USER" },
    include: {
      donations: {
        orderBy: { createdAt: "desc" },
        include: { project: { select: { title: true } } },
      },
    },
  });
  if (!user) notFound();

  return (
    <div>
      <Link href="/admin/utilisateurs" className="text-sm font-medium text-fhj-gold hover:underline">
        ← Tous les donateurs
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy">
        {user.firstName} {user.lastName}
      </h1>
      <p className="mt-1 text-sm text-fhj-navy/65">{user.email}</p>
      {user.phone && <p className="text-sm text-fhj-navy/65">{user.phone}</p>}

      <h2 className="mt-10 text-lg font-semibold text-fhj-navy">Historique des dons</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-fhj-navy/10 bg-white shadow-sm">
        <table className="min-w-[700px] w-full text-left text-sm">
          <thead className="bg-fhj-cream text-xs uppercase tracking-wide text-fhj-navy/55">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Projet</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {user.donations.map((d) => (
              <tr key={d.id} className="border-t border-fhj-navy/10">
                <td className="px-4 py-3 whitespace-nowrap">{d.createdAt.toLocaleString("fr-FR")}</td>
                <td className="px-4 py-3">{d.project.title}</td>
                <td className="px-4 py-3 font-medium">{formatEuro(d.amount)}</td>
                <td className="px-4 py-3">{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {user.donations.length === 0 && (
          <p className="p-6 text-center text-sm text-fhj-navy/55">Aucun don enregistré pour ce compte.</p>
        )}
      </div>
    </div>
  );
}
