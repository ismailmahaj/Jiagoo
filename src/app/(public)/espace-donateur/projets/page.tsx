import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { formatEuro } from "@/lib/format";

export default async function DonateurProjetsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const grouped = await prisma.donation.groupBy({
    by: ["projectId"],
    where: { userId: session.user.id, status: "COMPLETED" },
    _sum: { amount: true },
  });

  const projects = await prisma.project.findMany({
    where: { id: { in: grouped.map((g) => g.projectId) } },
  });

  const map = new Map(grouped.map((g) => [g.projectId, g._sum.amount ?? 0]));

  return (
    <ul className="space-y-4">
      {projects.map((p) => (
        <li key={p.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-fhj-navy/10 bg-white p-5 shadow-sm">
          <div>
            <p className="font-medium text-fhj-navy">{p.title}</p>
            <p className="text-sm text-fhj-navy/60">Votre contribution cumulée (dons complétés)</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-fhj-gold">
              {formatEuro(map.get(p.id) ?? 0)}
            </span>
            <Link href={`/projets/${p.slug}`} className="text-sm font-medium text-fhj-gold hover:underline">
              Voir le projet
            </Link>
          </div>
        </li>
      ))}
      {projects.length === 0 && (
        <p className="text-sm text-fhj-navy/55">Vous n’avez pas encore de projet soutenu avec un paiement complété.</p>
      )}
    </ul>
  );
}
