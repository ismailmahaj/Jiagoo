import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatEuro, percent } from "@/lib/format";
import { raisedForProject } from "@/lib/queries";
import { projectStatusLabel } from "@/lib/labels";
import { adminDeleteProjectFromForm } from "@/app/actions/admin";
import { ConfirmSubmitForm } from "@/components/admin/confirm-submit-form";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });

  const byProjectAll = await prisma.donation.groupBy({
    by: ["projectId"],
    _count: { id: true },
  });
  const byProjectDone = await prisma.donation.groupBy({
    by: ["projectId"],
    where: { status: "COMPLETED" },
    _count: { id: true },
  });
  const allMap = Object.fromEntries(byProjectAll.map((r) => [r.projectId, r._count.id]));
  const doneMap = Object.fromEntries(byProjectDone.map((r) => [r.projectId, r._count.id]));

  const withRaised = await Promise.all(
    projects.map(async (p) => ({
      ...p,
      raised: await raisedForProject(p.id),
      donationCount: allMap[p.id] ?? 0,
      donationCompletedCount: doneMap[p.id] ?? 0,
    })),
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-fhj-navy">Projets</h1>
          <p className="mt-1 text-sm text-fhj-navy/65">
            La progression financière suit les dons au statut « Complété ». Ouvrez un projet pour voir et modifier chaque
            don.
          </p>
        </div>
        <Link
          href="/admin/projets/nouveau"
          className="rounded-full bg-fhj-gold px-5 py-2.5 text-sm font-semibold text-fhj-navy hover:bg-fhj-gold-light"
        >
          Ajouter un projet
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-fhj-navy/10 bg-white shadow-sm">
        <table className="min-w-[960px] w-full text-left text-sm">
          <thead className="bg-fhj-cream text-xs uppercase tracking-wide text-fhj-navy/55">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Dons</th>
              <th className="px-4 py-3">Récolté / Objectif</th>
              <th className="px-4 py-3">%</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {withRaised.map((p) => {
              const pct = percent(p.raised, p.goalAmount);
              return (
                <tr key={p.id} className="border-t border-fhj-navy/10">
                  <td className="px-4 py-3 font-medium text-fhj-navy">{p.title}</td>
                  <td className="px-4 py-3">{projectStatusLabel(p.status)}</td>
                  <td className="px-4 py-3 text-fhj-navy/80">
                    <span className="font-semibold text-fhj-navy">{p.donationCount}</span>
                    <span className="text-fhj-navy/55"> dont </span>
                    <span>{p.donationCompletedCount} complétés</span>
                  </td>
                  <td className="px-4 py-3 text-fhj-navy/75">
                    {formatEuro(p.raised)} / {formatEuro(p.goalAmount)}
                  </td>
                  <td className="px-4 py-3">{pct}%</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link href={`/admin/projets/${p.id}`} className="mr-3 text-fhj-navy/80 hover:text-fhj-gold hover:underline">
                      Dons
                    </Link>
                    <Link href={`/admin/projets/${p.id}/modifier`} className="mr-3 text-fhj-gold hover:underline">
                      Modifier
                    </Link>
                    <ConfirmSubmitForm
                      action={adminDeleteProjectFromForm}
                      confirmMessage="Supprimer ce projet et ses dons associés ?"
                      className="inline"
                    >
                      <input type="hidden" name="projectId" value={p.id} />
                      <button type="submit" className="text-red-700 hover:underline">
                        Supprimer
                      </button>
                    </ConfirmSubmitForm>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
