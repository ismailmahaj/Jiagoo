import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatEuro, percent } from "@/lib/format";
import { raisedForProject } from "@/lib/queries";
import { projectStatusLabel } from "@/lib/labels";
import { AdminDonationEditRow } from "@/components/admin/admin-donation-edit-row";

export default async function AdminProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [project, donations, allProjects] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    prisma.donation.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { firstName: true, lastName: true } } },
    }),
    prisma.project.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);

  if (!project) notFound();

  const raised = await raisedForProject(project.id);
  const pct = percent(raised, project.goalAmount);
  const completedCount = donations.filter((d) => d.status === "COMPLETED").length;

  return (
    <div>
      <Link href="/admin/projets" className="text-sm font-medium text-fhj-gold hover:underline">
        ← Tous les projets
      </Link>

      <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy">{project.title}</h1>
          <p className="mt-2 text-sm text-fhj-navy/65">
            Statut : {projectStatusLabel(project.status)} · Slug : <code className="text-xs">{project.slug}</code>
          </p>
        </div>
        <Link
          href={`/admin/projets/${project.id}/modifier`}
          className="shrink-0 rounded-full bg-fhj-gold px-5 py-2.5 text-center text-sm font-semibold text-fhj-navy hover:bg-fhj-gold-light"
        >
          Modifier le projet
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-fhj-navy/10 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-fhj-navy/50">Dons enregistrés</p>
          <p className="mt-1 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-fhj-navy">{donations.length}</p>
          <p className="text-xs text-fhj-navy/55">dont {completedCount} complétés</p>
        </div>
        <div className="rounded-xl border border-fhj-navy/10 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-fhj-navy/50">Montant récolté (complétés)</p>
          <p className="mt-1 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-fhj-gold-mid">{formatEuro(raised)}</p>
        </div>
        <div className="rounded-xl border border-fhj-navy/10 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-fhj-navy/50">Objectif</p>
          <p className="mt-1 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-fhj-navy">{formatEuro(project.goalAmount)}</p>
        </div>
        <div className="rounded-xl border border-fhj-navy/10 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-fhj-navy/50">Progression</p>
          <p className="mt-1 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-fhj-navy">{pct}%</p>
        </div>
      </div>

      <h2 className="mt-12 text-lg font-semibold text-fhj-navy">Dons liés à ce projet</h2>
      <p className="mt-1 text-sm text-fhj-navy/60">
        Modifiez le montant, le statut, le projet cible ou l’anonymat. Changer le statut hors « Complété » supprime le reçu associé le cas échéant.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-fhj-navy/10 bg-white shadow-sm">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="bg-fhj-cream text-xs uppercase tracking-wide text-fhj-navy/55">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Donateur</th>
              <th className="px-4 py-3" colSpan={5}>
                Modifier le don
              </th>
            </tr>
          </thead>
          <tbody>
            {donations.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-fhj-navy/55">
                  Aucun don pour ce projet.
                </td>
              </tr>
            )}
            {donations.map((d) => (
              <AdminDonationEditRow
                key={d.id}
                donation={d}
                projects={allProjects}
                currentProjectId={d.projectId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
